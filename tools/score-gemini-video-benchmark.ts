/** Validate and score one normalized Gemini benchmark candidate. */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

type Range = { startSec: number; endSec: number };
type Gold = {
  source: { durationSec: number };
  brief: {
    targetDurationSec: { min: number; max: number };
    mustKeepEventIds: string[];
    mustCutRanges: Array<Range>;
    requiredOrder: string[];
  };
  events: Array<Range & { id: string; modality: string }>;
  goldMoments: Array<Range & { id: string }>;
  goldMomentsV02?: Array<Range & { id: string }>;
  candidateDecisions: Array<{
    segmentId: string; sourceStartSec: number; sourceEndSec: number;
    decision: Decision; keepStartSec?: number; keepEndSec?: number;
  }>;
  evidenceQuestions: Array<Range & { id: string; answer: string; modality: string }>;
};
type Decision = 'keep' | 'cut' | 'compress' | 'visual-support';
type Candidate = {
  summary: string;
  evidence_answers: Array<{ question_id: string; answer: string; start_sec: number; end_sec: number }>;
  moments: Array<{ id: string; label: string; start_sec: number; end_sec: number }>;
  events: Array<{ id: string; label: string; modality: string; start_sec: number; end_sec: number }>;
  decisions: Array<{ segment_id: string; decision: Decision; keep_start_sec?: number; keep_end_sec?: number }>;
  constraints: { target_duration_sec?: number; required_order: string[]; must_keep_event_ids: string[] };
};
const classes: Decision[] = ['keep', 'cut', 'compress', 'visual-support'];

const goldPath = process.argv[2];
const candidatePath = process.argv[3];
if (!goldPath || !candidatePath) {
  console.error('Usage: npm run benchmark:gemini:score -- <ground-truth.json> <candidate.json>');
  process.exit(2);
}

const gold = JSON.parse(readFileSync(goldPath, 'utf8')) as Gold;
const candidate = JSON.parse(readFileSync(candidatePath, 'utf8')) as Candidate;
const config = JSON.parse(readFileSync(resolve(dirname(goldPath), '..', 'config.json'), 'utf8')) as { protocolVersion: string };
const usesCorrectedProtocol = ['0.2', '0.3', '0.4'].includes(config.protocolVersion);
const evidenceRulesPath = resolve(dirname(goldPath), '..', `evidence-rules-${goldPathFixtureId(goldPath)}.json`);
const rules = usesCorrectedProtocol
  ? JSON.parse(readFileSync(evidenceRulesPath, 'utf8')) as {
      rules: Array<{ questionId: string; allConcepts: string[] }>;
    }
  : undefined;
const errors = validate(candidate, gold, config.protocolVersion);
if (errors.length) {
  console.error(JSON.stringify({ valid: false, errors }, null, 2));
  process.exit(1);
}

const scoredGoldMoments = usesCorrectedProtocol ? gold.goldMomentsV02! : gold.goldMoments;
const predictedMoments = candidate.moments.map((moment) => ({ startSec: moment.start_sec, endSec: moment.end_sec }));
const predictedEvents = candidate.events.map((event) => ({ startSec: event.start_sec, endSec: event.end_sec }));
const momentMatches = greedyMatches(scoredGoldMoments, predictedMoments, 0.5);
const momentPrecision = ratio(momentMatches.length, predictedMoments.length);
const momentRecall = ratio(momentMatches.length, scoredGoldMoments.length);
const shortEvents = gold.events.filter((event) => event.endSec - event.startSec <= 2);
const shortFound = shortEvents.filter((event) => predictedEvents.some((moment) =>
  Math.abs(moment.startSec - event.startSec) <= 1 && Math.abs(moment.endSec - event.endSec) <= 1,
));
const boundaryErrors = momentMatches.flatMap(([goldIndex, predictedIndex]) => {
  const expected = scoredGoldMoments[goldIndex]!;
  const actual = predictedMoments[predictedIndex]!;
  return [Math.abs(expected.startSec - actual.startSec), Math.abs(expected.endSec - actual.endSec)];
}).sort((a, b) => a - b);

const evidenceScores = gold.evidenceQuestions.map((question) => {
  const answer = candidate.evidence_answers.find((item) => item.question_id === question.id);
  const rule = rules?.rules.find((item) => item.questionId === question.id);
  const normalizedAnswer = normalize(answer?.answer ?? '');
  const correct = Boolean(answer)
    && (rule ? rule.allConcepts.every((concept) => normalizedAnswer.includes(normalize(concept)))
      : normalizedAnswer === normalize(question.answer))
    && overlap({ startSec: answer!.start_sec, endSec: answer!.end_sec }, question) > 0;
  return { id: question.id, modality: question.modality, correct };
});

const decisionById = new Map(candidate.decisions.map((decision) => [decision.segment_id, decision]));
const decisionMetrics = Object.fromEntries(classes.map((decisionClass) => {
  const truth = gold.candidateDecisions.filter((item) => item.decision === decisionClass);
  const predicted = candidate.decisions.filter((item) => item.decision === decisionClass);
  const truePositive = truth.filter((item) => decisionById.get(item.segmentId)?.decision === decisionClass).length;
  return [decisionClass, {
    support: truth.length,
    precision: ratio(truePositive, predicted.length),
    recall: ratio(truePositive, truth.length),
    f1: f1(ratio(truePositive, predicted.length), ratio(truePositive, truth.length)),
  }];
}));

const selectedDuration = candidate.decisions.reduce((total, decision) =>
  decision.decision === 'cut' ? total : total + (decision.keep_end_sec! - decision.keep_start_sec!), 0);
const mustKeepPass = gold.brief.mustKeepEventIds.every((id) => {
  const event = gold.events.find((item) => item.id === id)!;
  return predictedEvents.some((moment) => overlap(moment, event) > 0);
});
const mustCutPass = gold.brief.mustCutRanges.every((cut) => candidate.decisions.some((decision) => {
  const expected = gold.candidateDecisions.find((item) => item.segmentId === decision.segment_id)!;
  return decision.decision === 'cut' && overlap({ startSec: expected.sourceStartSec, endSec: expected.sourceEndSec }, cut) > 0;
}));

const observedClassF1 = Object.values(decisionMetrics)
  .filter((metric) => metric.support > 0)
  .map((metric) => metric.f1);
const result = {
  valid: true,
  metrics: {
    momentRetrieval: { precision: momentPrecision, recall: momentRecall, f1: f1(momentPrecision, momentRecall), matches: momentMatches.length },
    shortEventRecall: ratio(shortFound.length, shortEvents.length),
    timestampLocalizationErrorSec: { median: percentile(boundaryErrors, 0.5), p90: percentile(boundaryErrors, 0.9) },
    multimodalEvidenceAccuracy: {
      scoringMethod: rules ? 'frozen-concept-conjunction-plus-time-overlap' : 'normalized-exact-match-plus-time-overlap',
      overall: ratio(evidenceScores.filter((item) => item.correct).length, evidenceScores.length),
      byModality: Object.fromEntries(['transcript', 'audio', 'visual', 'cross-modal'].map((modality) => {
        const subset = evidenceScores.filter((item) => item.modality === modality);
        return [modality, ratio(subset.filter((item) => item.correct).length, subset.length)];
      })),
    },
    editDecision: { byClass: decisionMetrics, macroF1ObservedClasses: average(observedClassF1) },
    briefConstraints: {
      durationPass: selectedDuration >= gold.brief.targetDurationSec.min && selectedDuration <= gold.brief.targetDurationSec.max,
      selectedDurationSec: selectedDuration,
      mustKeepPass,
      mustCutPass,
      allPass: selectedDuration >= gold.brief.targetDurationSec.min && selectedDuration <= gold.brief.targetDurationSec.max && mustKeepPass && mustCutPass,
    },
  },
  notAutomated: ['story retention and coherence', 'cut-seam defect rate'],
};
console.log(JSON.stringify(result, null, 2));

function validate(value: Candidate, gold: Gold, protocolVersion: string) {
  const failures: string[] = [];
  const durationSec = gold.source.durationSec;
  if (!value || typeof value !== 'object') return ['Candidate must be an object.'];
  if (typeof value.summary !== 'string') failures.push('summary must be a string.');
  for (const key of ['evidence_answers', 'moments', 'events', 'decisions'] as const) {
    if (!Array.isArray(value[key])) failures.push(`${key} must be an array.`);
  }
  if (!value.constraints || typeof value.constraints !== 'object') failures.push('constraints must be an object.');
  for (const [index, range] of [...(value.evidence_answers ?? []), ...(value.moments ?? []), ...(value.events ?? [])].entries()) {
    const start = 'start_sec' in range ? range.start_sec : undefined;
    const end = 'end_sec' in range ? range.end_sec : undefined;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start! < 0 || end! <= start! || end! > durationSec) failures.push(`range ${index} is invalid.`);
  }
  for (const [index, decision] of (value.decisions ?? []).entries()) {
    if (!classes.includes(decision.decision)) failures.push(`decision ${index} has an invalid class.`);
    if (decision.decision !== 'cut' && (!Number.isFinite(decision.keep_start_sec) || !Number.isFinite(decision.keep_end_sec) || decision.keep_end_sec! <= decision.keep_start_sec!)) {
      failures.push(`decision ${index} requires a valid kept range.`);
    }
    const segment = gold.candidateDecisions.find((item) => item.segmentId === decision.segment_id);
    if (!segment) failures.push(`decision ${index} has unknown segment_id ${decision.segment_id}.`);
    else if (decision.decision !== 'cut' && (decision.keep_start_sec! < segment.sourceStartSec || decision.keep_end_sec! > segment.sourceEndSec)) {
      failures.push(`decision ${index} kept range is outside ${decision.segment_id}.`);
    }
    if (decision.decision === 'cut' && (decision.keep_start_sec !== undefined || decision.keep_end_sec !== undefined)) {
      failures.push(`decision ${index} must omit kept range for cut.`);
    }
  }
  if (['0.2', '0.3', '0.4'].includes(protocolVersion)) {
    if (!gold.goldMomentsV02 || gold.goldMomentsV02.length !== 6) failures.push('ground truth must define six v0.2 moments.');
    if (value.moments.length !== 6) failures.push(`${protocolVersion} requires exactly six moments.`);
    for (const [index, moment] of value.moments.entries()) {
      const length = moment.end_sec - moment.start_sec;
      if (length < 2 || length > 20) failures.push(`moment ${index} must last 2 to 20 seconds.`);
    }
    checkExactIds('evidence question', value.evidence_answers.map((item) => item.question_id), gold.evidenceQuestions.map((item) => item.id), failures);
    checkExactIds('decision segment', value.decisions.map((item) => item.segment_id), gold.candidateDecisions.map((item) => item.segmentId), failures);
    checkUniqueIds('moment', value.moments.map((item) => item.id), failures);
    checkUniqueIds('event', value.events.map((item) => item.id), failures);
    const selected = value.decisions.reduce((total, decision) => decision.decision === 'cut'
      ? total : total + (decision.keep_end_sec! - decision.keep_start_sec!), 0);
    if (protocolVersion === '0.2' || protocolVersion === '0.3') {
      if (!Number.isFinite(value.constraints?.target_duration_sec) || Math.abs(value.constraints.target_duration_sec! - selected) > 0.001) {
        failures.push('constraints.target_duration_sec must equal the sum of kept ranges.');
      }
    } else if ('target_duration_sec' in value.constraints) {
      failures.push('v0.4 must not return constraints.target_duration_sec.');
    }
    if (JSON.stringify(value.constraints?.required_order) !== JSON.stringify(gold.brief.requiredOrder)) failures.push('constraints.required_order must match the brief.');
    if (!sameSet(value.constraints?.must_keep_event_ids ?? [], gold.brief.mustKeepEventIds)) failures.push('constraints.must_keep_event_ids must match the brief.');
    if (protocolVersion === '0.3' || protocolVersion === '0.4') {
      if (wordCount(value.summary) > 30) failures.push('v0.3 summary must be at most 30 words.');
      for (const [index, answer] of value.evidence_answers.entries()) {
        if (wordCount(answer.answer) > 20) failures.push(`v0.3 evidence answer ${index} must be at most 20 words.`);
      }
      for (const [index, item] of [...value.moments, ...value.events].entries()) {
        if (wordCount(item.label) > 8) failures.push(`v0.3 moment/event label ${index} must be at most 8 words.`);
      }
    }
  }
  return failures;
}

function checkExactIds(label: string, actual: string[], expected: string[], failures: string[]) {
  if (actual.length !== expected.length || !sameSet(actual, expected) || new Set(actual).size !== actual.length) {
    failures.push(`${label} IDs must contain every supplied ID exactly once.`);
  }
}
function checkUniqueIds(label: string, ids: string[], failures: string[]) {
  if (new Set(ids).size !== ids.length) failures.push(`${label} IDs must be unique.`);
}
function sameSet(actual: string[], expected: string[]) {
  return actual.length === expected.length && actual.every((item) => expected.includes(item));
}

function iou(a: Range, b: Range) {
  const intersection = overlap(a, b);
  return ratio(intersection, (a.endSec - a.startSec) + (b.endSec - b.startSec) - intersection);
}
function overlap(a: Range, b: Range) { return Math.max(0, Math.min(a.endSec, b.endSec) - Math.max(a.startSec, b.startSec)); }
function greedyMatches(goldRanges: Range[], predicted: Range[], threshold: number): Array<[number, number]> {
  const candidates = goldRanges.flatMap((gold, goldIndex) => predicted.map((actual, predictedIndex) => ({ goldIndex, predictedIndex, score: iou(gold, actual) })))
    .filter((item) => item.score >= threshold).sort((a, b) => b.score - a.score);
  const usedGold = new Set<number>(); const usedPredicted = new Set<number>(); const matches: Array<[number, number]> = [];
  for (const item of candidates) if (!usedGold.has(item.goldIndex) && !usedPredicted.has(item.predictedIndex)) {
    usedGold.add(item.goldIndex); usedPredicted.add(item.predictedIndex); matches.push([item.goldIndex, item.predictedIndex]);
  }
  return matches;
}
function ratio(numerator: number, denominator: number) { return denominator ? numerator / denominator : 0; }
function f1(precision: number, recall: number) { return precision + recall ? 2 * precision * recall / (precision + recall) : 0; }
function average(values: number[]) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
function percentile(values: number[], quantile: number) { return values.length ? values[Math.ceil(quantile * values.length) - 1] : null; }
function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function wordCount(value: string) { return value.trim() ? value.trim().split(/\s+/).length : 0; }
function goldPathFixtureId(path: string) {
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as { fixtureId?: unknown };
  if (typeof parsed.fixtureId !== 'string' || !parsed.fixtureId) throw new Error('Ground truth must include fixtureId.');
  return parsed.fixtureId;
}
