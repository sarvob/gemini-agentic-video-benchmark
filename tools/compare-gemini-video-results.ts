/** Produce deterministic paired deltas from committed agentic/static result artifacts. */
import { readFileSync } from 'node:fs';

type Result = {
  status: string;
  fixtureId: string;
  mode: 'agentic' | 'static';
  model: string;
  protocolVersion: string;
  latencyMs: number;
  usage: {
    inputTokens: number; outputTokens: number; thoughtTokens: number;
    toolUseTokens: number; paidEquivalentUsd: number;
  };
  metrics: {
    momentRetrieval: { f1: number };
    shortEventRecall: number;
    timestampLocalizationErrorSec: { median: number; p90: number };
    multimodalEvidenceAccuracy: { overall: number };
    editDecision: { macroF1ObservedClasses: number };
    briefConstraints: { allPass: boolean; selectedDurationSec: number };
  };
};

const [agenticPath, staticPath] = process.argv.slice(2);
if (!agenticPath || !staticPath) {
  console.error('Usage: tsx tools/compare-gemini-video-results.ts <agentic-result.json> <static-result.json>');
  process.exit(2);
}

const agentic = read(agenticPath);
const staticResult = read(staticPath);
for (const field of ['fixtureId', 'model', 'protocolVersion'] as const) {
  if (agentic[field] !== staticResult[field]) throw new Error(`Pair mismatch in ${field}.`);
}
if (agentic.status !== 'valid' || staticResult.status !== 'valid') throw new Error('Both paired results must be valid.');
if (agentic.mode !== 'agentic' || staticResult.mode !== 'static') throw new Error('Files must be ordered agentic, then static.');

const inputToolAgentic = agentic.usage.inputTokens + agentic.usage.toolUseTokens;
const inputToolStatic = staticResult.usage.inputTokens + staticResult.usage.toolUseTokens;
const totalAgentic = inputToolAgentic + agentic.usage.outputTokens + agentic.usage.thoughtTokens;
const totalStatic = inputToolStatic + staticResult.usage.outputTokens + staticResult.usage.thoughtTokens;

console.log(JSON.stringify({
  fixtureId: agentic.fixtureId,
  model: agentic.model,
  protocolVersion: agentic.protocolVersion,
  agenticMinusStatic: {
    quality: {
      momentF1Absolute: delta(agentic.metrics.momentRetrieval.f1, staticResult.metrics.momentRetrieval.f1),
      shortEventRecallAbsolute: delta(agentic.metrics.shortEventRecall, staticResult.metrics.shortEventRecall),
      evidenceAccuracyAbsolute: delta(agentic.metrics.multimodalEvidenceAccuracy.overall, staticResult.metrics.multimodalEvidenceAccuracy.overall),
      editDecisionMacroF1Absolute: delta(agentic.metrics.editDecision.macroF1ObservedClasses, staticResult.metrics.editDecision.macroF1ObservedClasses),
      boundaryMedianSec: delta(agentic.metrics.timestampLocalizationErrorSec.median, staticResult.metrics.timestampLocalizationErrorSec.median),
      boundaryP90Sec: delta(agentic.metrics.timestampLocalizationErrorSec.p90, staticResult.metrics.timestampLocalizationErrorSec.p90),
    },
    efficiency: {
      inputPlusToolTokens: { agentic: inputToolAgentic, static: inputToolStatic, percent: percentDelta(inputToolAgentic, inputToolStatic) },
      totalAccountedTokens: { agentic: totalAgentic, static: totalStatic, percent: percentDelta(totalAgentic, totalStatic) },
      paidEquivalentUsd: { agentic: agentic.usage.paidEquivalentUsd, static: staticResult.usage.paidEquivalentUsd, percent: percentDelta(agentic.usage.paidEquivalentUsd, staticResult.usage.paidEquivalentUsd) },
      latencyMs: { agentic: agentic.latencyMs, static: staticResult.latencyMs, percent: percentDelta(agentic.latencyMs, staticResult.latencyMs) },
    },
    brief: {
      agenticAllPass: agentic.metrics.briefConstraints.allPass,
      staticAllPass: staticResult.metrics.briefConstraints.allPass,
      selectedDurationSec: { agentic: agentic.metrics.briefConstraints.selectedDurationSec, static: staticResult.metrics.briefConstraints.selectedDurationSec },
    },
  },
}, null, 2));

function read(path: string) { return JSON.parse(readFileSync(path, 'utf8')) as Result; }
function delta(agentic: number, staticValue: number) { return agentic - staticValue; }
function percentDelta(agentic: number, staticValue: number) { return staticValue ? (agentic - staticValue) / staticValue * 100 : null; }
