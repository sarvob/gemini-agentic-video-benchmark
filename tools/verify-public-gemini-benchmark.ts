/** Verify the committed public Gemini benchmark artifacts without network or API calls. */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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

const proposalScore = run('tools/score-gemini-video-benchmark.ts', [
  resolve(root, 'proposals', 'synthetic-presentation-01-ground-truth.json'),
  resolve(root, 'proposals', 'synthetic-presentation-01-perfect-candidate.json'),
]);
const proposalMetrics = JSON.parse(proposalScore).metrics;
const proposalChecks = [
  proposalMetrics.momentRetrieval.f1,
  proposalMetrics.shortEventRecall,
  proposalMetrics.multimodalEvidenceAccuracy.overall,
  proposalMetrics.editDecision.macroF1ObservedClasses,
];
if (proposalChecks.some((value) => value !== 1) || !proposalMetrics.briefConstraints.allPass) {
  throw new Error('synthetic-presentation-01 annotated proposal did not receive perfect deterministic scores.');
}
console.log('PASS annotated proposal scorer: synthetic-presentation-01 (not in frozen aggregate)');

const pairedFixtures = ['synthetic-screen-01', 'synthetic-screen-02', 'synthetic-solo-01', 'synthetic-podcast-01', 'synthetic-podcast-02'];
const aggregateArgs = pairedFixtures.flatMap((fixtureId) => [
  resolve(root, 'results', `${fixtureId}-agentic-v0.4.json`),
  resolve(root, 'results', `${fixtureId}-static-v0.4.json`),
]);
const aggregate = JSON.parse(run('tools/aggregate-gemini-video-results.ts', aggregateArgs));
const committedAggregate = JSON.parse(readFileSync(resolve(root, 'final-results.json'), 'utf8'));
if (JSON.stringify(committedAggregate) !== JSON.stringify(aggregate)) {
  throw new Error('benchmark/final-results.json does not match the deterministic five-pair aggregate.');
}
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

console.log('PASS final five-pair aggregate and canonical JSON');

const uncertainty = JSON.parse(run('tools/analyze-gemini-video-uncertainty.ts', []));
const committedUncertainty = JSON.parse(readFileSync(resolve(root, 'uncertainty-v0.4.json'), 'utf8'));
if (JSON.stringify(committedUncertainty) !== JSON.stringify(uncertainty)) {
  throw new Error('benchmark/uncertainty-v0.4.json does not match the deterministic paired analysis.');
}
if (Object.values(uncertainty.analyses).some((analysis: any) => analysis.signFlipTest.pValue < 0.05)) {
  throw new Error('Publication guard failed: an uncertainty result requires manual claim review.');
}
console.log('PASS deterministic paired uncertainty analysis');

const hubHtml = readFileSync(resolve('docs', 'index.html'), 'utf8');
const structuredDataMatch = hubHtml.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
if (!structuredDataMatch) {
  throw new Error('Reproducibility hub is missing JSON-LD structured data.');
}
const structuredData = JSON.parse(structuredDataMatch[1]);
const graph = Array.isArray(structuredData['@graph']) ? structuredData['@graph'] : [structuredData];
const dataset = graph.find((node: Record<string, unknown>) => node['@type'] === 'Dataset');
if (!dataset || typeof dataset.name !== 'string' || typeof dataset.description !== 'string') {
  throw new Error('Reproducibility hub JSON-LD is missing the required Dataset name or description.');
}
if (dataset.description.length < 50 || dataset.description.length > 5000) {
  throw new Error('Dataset description must remain between 50 and 5,000 characters.');
}
const distribution = dataset.distribution as Record<string, unknown> | undefined;
if (
  distribution?.['@type'] !== 'DataDownload' ||
  distribution.contentUrl !== 'https://github.com/sarvob/gemini-agentic-video-benchmark/releases/download/v0.4-exploratory/gemini-agentic-video-benchmark-v0.4-data.tar.gz' ||
  distribution.encodingFormat !== 'application/gzip'
) {
  throw new Error('Dataset JSON-LD is missing the frozen v0.4 DataDownload distribution.');
}
console.log('PASS reproducibility hub Dataset structured data');

const failureHtml = readFileSync(resolve('docs', 'output-contract-failure.html'), 'utf8');
const failureStructuredDataMatch = failureHtml.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
if (!failureStructuredDataMatch) throw new Error('Output-contract failure page is missing Article JSON-LD.');
const failureArticle = JSON.parse(failureStructuredDataMatch[1]);
if (
  failureArticle['@type'] !== 'Article' ||
  failureArticle.author?.['@type'] !== 'Organization' ||
  failureArticle.author?.name !== 'PaperEdits'
) {
  throw new Error('Output-contract failure page has invalid article or organization authorship metadata.');
}
for (const requiredText of [
  'quality metrics were not computed',
  'does not prove why the model produced leading reasoning',
  'not sponsored or endorsed by Google',
  'synthetic-solo-02-agentic-v0.4.json',
]) {
  if (!failureHtml.includes(requiredText)) throw new Error(`Output-contract failure page is missing: ${requiredText}`);
}
const sitemap = readFileSync(resolve('docs', 'sitemap.xml'), 'utf8');
if (!sitemap.includes('output-contract-failure.html')) {
  throw new Error('Sitemap is missing the output-contract failure page.');
}
console.log('PASS public output-contract failure analysis');

const temporalHtml = readFileSync(resolve('docs', 'temporal-miss-analysis.html'), 'utf8');
const temporalStructuredDataMatch = temporalHtml.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
if (!temporalStructuredDataMatch) throw new Error('Temporal miss page is missing Article JSON-LD.');
const temporalArticle = JSON.parse(temporalStructuredDataMatch[1]);
if (
  temporalArticle['@type'] !== 'Article' ||
  temporalArticle.author?.['@type'] !== 'Organization' ||
  temporalArticle.author?.name !== 'PaperEdits'
) {
  throw new Error('Temporal miss page has invalid article or organization authorship metadata.');
}
for (const requiredText of [
  '18 / 20',
  'Both modes missed half the brief events',
  'not a public event-by-event match ledger',
  'No metric has a two-sided exact sign-flip p-value below 0.05',
  'not sponsored or endorsed by Google',
]) {
  if (!temporalHtml.includes(requiredText)) throw new Error(`Temporal miss page is missing: ${requiredText}`);
}
if (!sitemap.includes('temporal-miss-analysis.html')) {
  throw new Error('Sitemap is missing the temporal miss analysis page.');
}
console.log('PASS public temporal miss analysis');
console.log('Public benchmark verification passed. No API calls were made.');

function run(script: string, args: string[]) {
  const result = spawnSync('npx', ['--no-install', 'tsx', script, ...args], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${script} failed.\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}
