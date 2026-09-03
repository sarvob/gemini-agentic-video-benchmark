/** Verify the committed public Gemini benchmark artifacts without network or API calls. */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve('benchmark');
const fixtures = [
  ['synthetic-screen-01', 'perfect-candidate.json'],
  ['synthetic-screen-02', 'perfect-candidate-screen-02.json'],
  ['synthetic-solo-01', 'perfect-candidate-solo-01.json'],
  ['synthetic-podcast-01', 'perfect-candidate-podcast-01.json'],
  ['synthetic-solo-02', 'perfect-candidate-solo-02.json'],
  ['synthetic-podcast-02', 'perfect-candidate-podcast-02.json'],
] as const;

for (const [fixtureId, candidateFile] of fixtures) {
  const score = run('tools/score-gemini-video-benchmark.ts', [
    resolve(root, 'ground-truth', `${fixtureId}.json`),
    resolve(root, 'testdata', candidateFile),
  ]);
  const metrics = JSON.parse(score).metrics;
  const checks = [
    metrics.momentRetrieval.f1,
    metrics.shortEventRecall,
    metrics.multimodalEvidenceAccuracy.overall,
    metrics.editDecision.macroF1ObservedClasses,
  ];
  if (checks.some((value) => value !== 1) || !metrics.briefConstraints.allPass) {
    throw new Error(`${fixtureId} reference candidate did not receive perfect deterministic scores.`);
  }
  console.log(`PASS reference scorer: ${fixtureId}`);
}

const pairedFixtures = ['synthetic-screen-01', 'synthetic-screen-02', 'synthetic-solo-01', 'synthetic-podcast-01', 'synthetic-podcast-02'];
const aggregateArgs = pairedFixtures.flatMap((fixtureId) => [
  resolve(root, 'results', `${fixtureId}-agentic-v0.4.json`),
  resolve(root, 'results', `${fixtureId}-static-v0.4.json`),
]);
const aggregate = JSON.parse(run('tools/aggregate-gemini-video-results.ts', aggregateArgs));
const expected = {
  fixtureCount: 5,
  agenticMomentF1: 0.26666666666666666,
  staticMomentF1: 0.3,
  agenticShortEventRecall: 0.9,
  staticShortEventRecall: 0.75,
  agenticEvidenceAccuracy: 0.8333333333333334,
  staticEvidenceAccuracy: 0.9,
  agenticEditDecisionF1: 0.6807407407407408,
  staticEditDecisionF1: 0.5481481481481482,
  agenticBriefPasses: 4,
  staticBriefPasses: 4,
};
const actual = {
  fixtureCount: aggregate.fixtureCount,
  agenticMomentF1: aggregate.macroMeans.momentF1.agentic,
  staticMomentF1: aggregate.macroMeans.momentF1.static,
  agenticShortEventRecall: aggregate.macroMeans.shortEventRecall.agentic,
  staticShortEventRecall: aggregate.macroMeans.shortEventRecall.static,
  agenticEvidenceAccuracy: aggregate.macroMeans.evidenceAccuracy.agentic,
  staticEvidenceAccuracy: aggregate.macroMeans.evidenceAccuracy.static,
  agenticEditDecisionF1: aggregate.macroMeans.editDecisionMacroF1.agentic,
  staticEditDecisionF1: aggregate.macroMeans.editDecisionMacroF1.static,
  agenticBriefPasses: aggregate.briefPasses.agentic,
  staticBriefPasses: aggregate.briefPasses.static,
};
for (const key of Object.keys(expected) as Array<keyof typeof expected>) {
  if (Math.abs(actual[key] - expected[key]) > 1e-12) {
    throw new Error(`Aggregate mismatch for ${key}: expected ${expected[key]}, received ${actual[key]}.`);
  }
}

console.log('PASS final five-pair aggregate');
console.log('Public benchmark verification passed. No API calls were made.');

function run(script: string, args: string[]) {
  const result = spawnSync('npx', ['--no-install', 'tsx', script, ...args], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${script} failed.\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}
