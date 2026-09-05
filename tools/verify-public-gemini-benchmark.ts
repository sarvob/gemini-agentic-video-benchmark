/** Verify the committed public Gemini benchmark artifacts without network or API calls. */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { validateResultCard } from './result-card-validator.ts';
import { buildFinalResultsCsv } from './build-final-results-csv.ts';

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

const presentationReviewLock = JSON.parse(
  readFileSync(resolve(root, 'proposals', 'synthetic-presentation-01-review-lock.json'), 'utf8'),
);
for (const [path, expectedHash] of Object.entries(presentationReviewLock.lockedFiles)) {
  const actualHash = createHash('sha256').update(readFileSync(resolve(path))).digest('hex');
  if (actualHash !== expectedHash) {
    throw new Error(`Presentation review lock mismatch for ${path}.`);
  }
}
if (
  presentationReviewLock.fixtureId !== 'synthetic-presentation-01' ||
  presentationReviewLock.expectedVideo.sha256 !== '748649e5b7ca64f3c44f5256b283d613469f9c643ef5a5c97d82647c90603e54' ||
  presentationReviewLock.expectedVideo.durationSec !== 600 ||
  presentationReviewLock.lockedFiles['tools/verify-presentation-review-frames.py'] !==
    '489d498ca726dbdb9876af186413669f71043563e492c451cc3f88b6af367ec1' ||
  presentationReviewLock.checkpointFrames.length !== 6 ||
  presentationReviewLock.checkpointFrames.some(
    (checkpoint: Record<string, unknown>) =>
      !Array.isArray(checkpoint.pixelSize) ||
      checkpoint.pixelSize[0] !== 960 ||
      checkpoint.pixelSize[1] !== 540 ||
      typeof checkpoint.rgbSha256 !== 'string' ||
      !/^[a-f0-9]{64}$/.test(checkpoint.rgbSha256),
  )
) {
  throw new Error('Presentation review lock metadata or checkpoint RGB hashes are incomplete.');
}
const presentationReviewHelper = readFileSync(resolve('scripts', 'prepare-presentation-01-review.sh'), 'utf8');
for (const requiredText of [
  'verify-presentation-review-frames.py',
  'decoded RGB hashes',
]) {
  if (!presentationReviewHelper.includes(requiredText)) {
    throw new Error(`Presentation review helper is missing: ${requiredText}`);
  }
}
console.log('PASS locked presentation review snapshot and checkpoint RGB contract');

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

const finalResultsCsv = readFileSync(resolve(root, 'final-results.csv'), 'utf8');
const pagesFinalResultsCsv = readFileSync(resolve('docs', 'final-results.csv'), 'utf8');
if (
  finalResultsCsv !== buildFinalResultsCsv(committedAggregate) ||
  pagesFinalResultsCsv !== finalResultsCsv ||
  finalResultsCsv.trim().split('\n').length !== 12 ||
  !finalResultsCsv.startsWith('section,metric,unit,agentic,static,agentic_minus_static,agentic_vs_static_percent,denominator\n')
) {
  throw new Error('Flat CSV summary does not match the canonical aggregate.');
}
console.log('PASS deterministic flat CSV metric summary');

const resultCardSchema = JSON.parse(readFileSync(resolve(root, 'result-card-schema-v0.1.json'), 'utf8'));
const resultCard = JSON.parse(readFileSync(resolve(root, 'result-card-example-v0.1.json'), 'utf8'));
const requiredResultCardKeys = [
  'schemaVersion',
  'resultCardId',
  'provenance',
  'benchmark',
  'systemUnderTest',
  'runPolicy',
  'coverage',
  'results',
  'efficiency',
  'evidence',
  'limitations',
];
if (resultCardSchema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
  throw new Error('Result-card schema must declare JSON Schema 2020-12.');
}
for (const key of requiredResultCardKeys) {
  if (!resultCardSchema.required?.includes(key) || !(key in resultCard)) {
    throw new Error(`Result-card contract is missing required key: ${key}`);
  }
}
if (
  resultCard.schemaVersion !== '0.1' ||
  resultCard.benchmark.protocolVersion !== committedAggregate.protocolVersion ||
  resultCard.benchmark.resultsRevision !== '160de2a' ||
  resultCard.provenance.relationship !== 'maintainer-baseline' ||
  resultCard.provenance.countsAsExternalAdoption !== false
) {
  throw new Error('Maintainer result-card provenance or benchmark revision is invalid.');
}
if (
  resultCard.coverage.validPairedFixtures !== committedAggregate.fixtureCount ||
  JSON.stringify(resultCard.results) !==
    JSON.stringify({ ...committedAggregate.macroMeans, briefPasses: committedAggregate.briefPasses }) ||
  JSON.stringify(resultCard.efficiency) !== JSON.stringify(committedAggregate.totals)
) {
  throw new Error('Maintainer result card does not match benchmark/final-results.json.');
}
const validCardErrors = validateResultCard(resultCardSchema, resultCard);
if (validCardErrors.length > 0) {
  throw new Error(`Maintainer result card failed the public validator: ${validCardErrors.join('; ')}`);
}

const invalidCards = [
  (() => {
    const card = structuredClone(resultCard);
    card.provenance.countsAsExternalAdoption = true;
    return card;
  })(),
  (() => {
    const card = structuredClone(resultCard);
    card.coverage.validPairedFixtures = 7;
    return card;
  })(),
  (() => {
    const card = structuredClone(resultCard);
    card.results.briefPasses.denominator = 4;
    return card;
  })(),
  (() => {
    const card = structuredClone(resultCard);
    card.evidence.aggregate = 'https://github.com/sarvob/gemini-agentic-video-benchmark/blob/main/benchmark/final-results.json';
    return card;
  })(),
];
if (invalidCards.some((card) => validateResultCard(resultCardSchema, card).length === 0)) {
  throw new Error('Result-card validator accepted a known invalid card.');
}
console.log('PASS versioned result-card contract and maintainer example');

const communityResults = JSON.parse(readFileSync(resolve(root, 'community-results-v0.1.json'), 'utf8'));
if (
  communityResults.schemaVersion !== '0.1' ||
  communityResults.externalAcceptedCount !== 0 ||
  communityResults.entries.length !== 1 ||
  communityResults.entries[0].resultCardId !== resultCard.resultCardId ||
  communityResults.entries[0].relationship !== 'maintainer-baseline' ||
  communityResults.entries[0].countsAsExternalAdoption !== false
) {
  throw new Error('Static community results index must begin with one non-external maintainer reference.');
}
console.log('PASS static community results index and adoption boundary');

const governance = readFileSync(resolve('GOVERNANCE.md'), 'utf8');
for (const requiredText of [
  'A public GitHub username is sufficient; a full name or email address is not required.',
  'cannot provide an independent review of their own fixture or result card',
  'countsAsExternalAdoption: false',
  'two accepted reviews or comparable merged contributions',
  'PaperEdits remains the final repository maintainer',
]) {
  if (!governance.includes(requiredText)) throw new Error(`Governance is missing: ${requiredText}`);
}
console.log('PASS public governance and external reviewer path');

const readme = readFileSync(resolve('README.md'), 'utf8');
for (const requiredText of [
  'Benchmark reproduction form',
  'A public GitHub username is sufficient; do not post a full name or email address.',
  'An accepted report can count as an external artifact reproduction',
  'while a clone or maintainer-run check cannot.',
]) {
  if (!readme.includes(requiredText)) throw new Error(`README reproduction call to action is missing: ${requiredText}`);
}
console.log('PASS independent reproduction call to action and privacy boundary');

const reviewerRegistry = JSON.parse(readFileSync(resolve(root, 'community-reviewers-v0.1.json'), 'utf8'));
const registryTotals = reviewerRegistry.entries.reduce(
  (totals: Record<string, number>, entry: any) => {
    if (
      typeof entry.username !== 'string' ||
      typeof entry.relationshipToPaperEdits !== 'string' ||
      !Number.isInteger(entry.acceptedReviewCount) ||
      !Number.isInteger(entry.unaffiliatedAcceptedReviewCount) ||
      typeof entry.recognizedRecurringReviewer !== 'boolean' ||
      !Number.isInteger(entry.mergedContributionCount) ||
      !Array.isArray(entry.evidenceUrls) ||
      entry.evidenceUrls.length === 0 ||
      entry.evidenceUrls.some((url: unknown) => typeof url !== 'string' || !url.startsWith('https://github.com/')) ||
      entry.unaffiliatedAcceptedReviewCount > entry.acceptedReviewCount ||
      (entry.relationshipToPaperEdits === 'none'
        ? entry.unaffiliatedAcceptedReviewCount !== entry.acceptedReviewCount
        : entry.unaffiliatedAcceptedReviewCount !== 0) ||
      (entry.acceptedReviewCount === 0 && entry.mergedContributionCount === 0 && !entry.recognizedRecurringReviewer)
    ) {
      throw new Error('Community reviewer registry entry is incomplete or lacks public evidence.');
    }
    totals.acceptedReviews += entry.acceptedReviewCount;
    totals.unaffiliatedReviews += entry.unaffiliatedAcceptedReviewCount;
    totals.recurringReviewers += Number(entry.recognizedRecurringReviewer);
    totals.mergedContributors += Number(entry.mergedContributionCount > 0);
    return totals;
  },
  { acceptedReviews: 0, unaffiliatedReviews: 0, recurringReviewers: 0, mergedContributors: 0 },
);
if (
  reviewerRegistry.schemaVersion !== '0.1' ||
  !/^\d{4}-\d{2}-\d{2}$/.test(reviewerRegistry.asOf) ||
  reviewerRegistry.acceptedExternalReviewCount !== registryTotals.acceptedReviews ||
  reviewerRegistry.unaffiliatedAcceptedReviewCount !== registryTotals.unaffiliatedReviews ||
  reviewerRegistry.recognizedRecurringReviewerCount !== registryTotals.recurringReviewers ||
  reviewerRegistry.contributorsWithMergedWorkCount !== registryTotals.mergedContributors ||
  !reviewerRegistry.countingRules.includes('An empty registry and maintainer activity do not count as external adoption.')
) {
  throw new Error('Community reviewer registry must begin at an explicit evidence-backed zero.');
}
console.log('PASS community reviewer registry and zero boundary');

const codeMeta = JSON.parse(readFileSync(resolve('codemeta.json'), 'utf8'));
const pagesCodeMeta = JSON.parse(readFileSync(resolve('docs', 'codemeta.json'), 'utf8'));
if (
  codeMeta['@context'] !== 'https://w3id.org/codemeta/3.1' ||
  codeMeta['@type'] !== 'SoftwareSourceCode' ||
  codeMeta.version !== '0.4-exploratory' ||
  codeMeta.datePublished !== '2026-09-02' ||
  codeMeta.codeRepository !== 'https://github.com/sarvob/gemini-agentic-video-benchmark' ||
  codeMeta.license !== 'https://spdx.org/licenses/MIT' ||
  codeMeta.referencePublication !== 'https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark' ||
  codeMeta.author?.['@type'] !== 'Organization' ||
  codeMeta.author?.name !== 'PaperEdits' ||
  JSON.stringify(codeMeta).toLowerCase().includes('email') ||
  JSON.stringify(pagesCodeMeta) !== JSON.stringify(codeMeta)
) {
  throw new Error('CodeMeta metadata is incomplete, inconsistent, or exposes an email field.');
}
console.log('PASS CodeMeta 3.1 software metadata and privacy boundary');

const bibtex = readFileSync(resolve('CITATION.bib'), 'utf8');
const pagesBibtex = readFileSync(resolve('docs', 'CITATION.bib'), 'utf8');
for (const requiredText of [
  '@misc{paperedits2026geminiagenticvideo,',
  'author       = {{PaperEdits}}',
  'version      = {0.4-exploratory}',
  'https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark',
  'https://github.com/sarvob/gemini-agentic-video-benchmark',
]) {
  if (!bibtex.includes(requiredText)) throw new Error(`BibTeX citation is missing: ${requiredText}`);
}
if (pagesBibtex !== bibtex || /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(bibtex)) {
  throw new Error('BibTeX citation copies drifted or include a public email address.');
}
console.log('PASS copy-ready BibTeX citation and privacy boundary');

const dataPackage = JSON.parse(readFileSync(resolve('datapackage.json'), 'utf8'));
const pagesDataPackage = JSON.parse(readFileSync(resolve('docs', 'datapackage.json'), 'utf8'));
if (
  dataPackage.$schema !== 'https://datapackage.org/profiles/2.0/datapackage.json' ||
  dataPackage.name !== 'gemini-agentic-video-understanding-benchmark' ||
  dataPackage.version !== '0.4-exploratory' ||
  dataPackage.homepage !== 'https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark' ||
  dataPackage.licenses?.[0]?.name !== 'MIT' ||
  dataPackage.resources?.length !== 5 ||
  JSON.stringify(pagesDataPackage) !== JSON.stringify(dataPackage) ||
  JSON.stringify(dataPackage).toLowerCase().includes('email')
) {
  throw new Error('Data Package metadata is incomplete, inconsistent, or exposes an email field.');
}
for (const resource of dataPackage.resources) {
  const bytes = readFileSync(resolve(resource.path));
  const hash = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (resource.bytes !== bytes.byteLength || resource.hash !== hash) {
    throw new Error(`Data Package resource integrity mismatch: ${resource.name}`);
  }
}
console.log('PASS Data Package 2.0 descriptor and resource integrity');

const croissant = JSON.parse(readFileSync(resolve('croissant.json'), 'utf8'));
const pagesCroissant = JSON.parse(readFileSync(resolve('docs', 'croissant.json'), 'utf8'));
const croissantArchive = croissant.distribution?.find(
  (item: Record<string, unknown>) => item['@id'] === 'v0.4-release-archive',
);
const croissantGroundTruth = croissant.distribution?.find(
  (item: Record<string, unknown>) => item['@id'] === 'ground-truth-files',
);
const croissantResults = croissant.distribution?.find(
  (item: Record<string, unknown>) => item['@id'] === 'result-files',
);
if (
  croissant['@type'] !== 'sc:Dataset' ||
  croissant.conformsTo !== 'http://mlcommons.org/croissant/1.1' ||
  croissant.version !== '0.4.0-exploratory' ||
  croissant.url !== 'https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark' ||
  croissant.license !== 'https://spdx.org/licenses/MIT' ||
  croissant.creator?.['@type'] !== 'sc:Organization' ||
  croissant.creator?.name !== 'PaperEdits' ||
  croissantArchive?.['@type'] !== 'cr:FileObject' ||
  croissantArchive?.contentUrl !== 'https://github.com/sarvob/gemini-agentic-video-benchmark/releases/download/v0.4-exploratory/gemini-agentic-video-benchmark-v0.4-data.tar.gz' ||
  croissantArchive?.contentSize !== '13493 B' ||
  croissantArchive?.sha256 !== '133a149964ed123296bfe157e5a1cfa47299fca1a9003caac81cdafd99fcb039' ||
  croissantGroundTruth?.['@type'] !== 'cr:FileSet' ||
  croissantGroundTruth?.containedIn?.['@id'] !== 'v0.4-release-archive' ||
  croissantGroundTruth?.includes !== 'gemini-agentic-video-benchmark-v0.4-data/benchmark/ground-truth/*.json' ||
  croissantResults?.['@type'] !== 'cr:FileSet' ||
  croissantResults?.containedIn?.['@id'] !== 'v0.4-release-archive' ||
  croissantResults?.includes !== 'gemini-agentic-video-benchmark-v0.4-data/benchmark/results/*.json' ||
  JSON.stringify(pagesCroissant) !== JSON.stringify(croissant) ||
  JSON.stringify(croissant).toLowerCase().includes('email')
) {
  throw new Error('Croissant metadata is incomplete, inconsistent, or exposes an email field.');
}
console.log('PASS Croissant 1.1 dataset metadata and release integrity');

const releaseVerifier = readFileSync(resolve('scripts', 'verify-v0.4-release.sh'), 'utf8');
for (const requiredText of [
  'expected_sha256="133a149964ed123296bfe157e5a1cfa47299fca1a9003caac81cdafd99fcb039"',
  'expected_ground_truth=6',
  'expected_results=11',
  'Release download totals include maintainer verification and do not establish external adoption.',
]) {
  const target = requiredText.startsWith('Release download') ? readFileSync(resolve('README.md'), 'utf8') : releaseVerifier;
  if (!target.includes(requiredText)) throw new Error(`Release verification path is missing: ${requiredText}`);
}
console.log('PASS networked release-verification path and adoption boundary');

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
if (
  !hubHtml.includes('<link rel="describedby" href="llms.txt">') ||
  !hubHtml.includes('<link rel="alternate" type="application/ld+json" href="codemeta.json"') ||
  !hubHtml.includes('profile="http://mlcommons.org/croissant/1.1"') ||
  !hubHtml.includes('<a href="CITATION.bib">BibTeX</a>') ||
  !hubHtml.includes('<a href="final-results.csv">CSV results</a>') ||
  !hubHtml.includes('<a href="codemeta.json">CodeMeta 3.1</a>') ||
  !hubHtml.includes('<a href="datapackage.json">Data Package</a>') ||
  !hubHtml.includes('<a href="croissant.json">Croissant 1.1</a>') ||
  !hubHtml.includes('<a href="llms.txt">Agent navigation</a>') ||
  !hubHtml.includes('<a href="reuse.html">Open the no-API-key reuse guide</a>')
) {
  throw new Error('Reproducibility hub is missing its discoverable machine-readable metadata links.');
}
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

const agentIndex = readFileSync(resolve('llms.txt'), 'utf8');
const pagesAgentIndex = readFileSync(resolve('docs', 'llms.txt'), 'utf8');
for (const requiredText of [
  '# PaperEdits Gemini Agentic Video Understanding Benchmark',
  'not sponsored or endorsed by Google',
  'External adoption remains zero',
  'not a Google Search ranking signal',
  'Independent reproduction form',
  'BibTeX citation',
  'Data Package descriptor',
  'Croissant 1.1 metadata',
  'Flat CSV metric summary',
]) {
  if (!agentIndex.includes(requiredText)) throw new Error(`Agent index is missing: ${requiredText}`);
}
if (pagesAgentIndex !== agentIndex || /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(agentIndex)) {
  throw new Error('Agent index copies drifted or include a public email address.');
}
console.log('PASS llms.txt v2 navigation, scope, and privacy boundaries');

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

const tradeoffHtml = readFileSync(resolve('docs', 'quality-cost-tradeoff.html'), 'utf8');
const tradeoffStructuredDataMatch = tradeoffHtml.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
if (!tradeoffStructuredDataMatch) throw new Error('Quality-cost page is missing Article JSON-LD.');
const tradeoffArticle = JSON.parse(tradeoffStructuredDataMatch[1]);
if (
  tradeoffArticle['@type'] !== 'Article' ||
  tradeoffArticle.author?.['@type'] !== 'Organization' ||
  tradeoffArticle.author?.name !== 'PaperEdits'
) {
  throw new Error('Quality-cost page has invalid article or organization authorship metadata.');
}
const v04Ledger = readFileSync(resolve(root, 'spend-ledger.jsonl'), 'utf8')
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line))
  .filter((entry) => entry.protocolVersion === '0.4');
const totalV04Spend = v04Ledger.reduce((sum, entry) => sum + entry.accountedUsd, 0);
const invalidSoloSpend = v04Ledger.find((entry) => entry.fixtureId === 'synthetic-solo-02')?.accountedUsd;
const extraMatchedCost = aggregate.totals.paidEquivalentUsd.agentic - aggregate.totals.paidEquivalentUsd.static;
const extraMatchedTokens = aggregate.totals.totalAccountedTokens.agentic - aggregate.totals.totalAccountedTokens.static;
const extraMatchedLatency = aggregate.totals.latencyMs.agentic - aggregate.totals.latencyMs.static;
if (
  v04Ledger.length !== 11 ||
  Math.abs(totalV04Spend - 0.66092) > 1e-12 ||
  Math.abs(invalidSoloSpend - 0.075469) > 1e-12 ||
  Math.abs(extraMatchedCost - 0.076105) > 1e-12 ||
  extraMatchedTokens !== 103794 ||
  extraMatchedLatency !== 109256
) {
  throw new Error('Quality-cost accounting no longer matches the frozen aggregate and spend ledger.');
}
for (const requiredText of [
  '+103,794',
  '+$0.076105',
  '$0.075469',
  '$0.660920',
  'descriptive ratio, not a causal price or business return',
  'not sponsored or endorsed by Google',
]) {
  if (!tradeoffHtml.includes(requiredText)) throw new Error(`Quality-cost page is missing: ${requiredText}`);
}
if (!sitemap.includes('quality-cost-tradeoff.html')) {
  throw new Error('Sitemap is missing the quality-cost tradeoff page.');
}
console.log('PASS public quality and cost tradeoff report');

const communityHtml = readFileSync(resolve('docs', 'community-results.html'), 'utf8');
for (const requiredText of [
  'External accepted results: 0.',
  'Maintainer baseline',
  'does not count as independent reproduction, community adoption, or endorsement',
  'result-card-submission.yml',
  'No payment, credit, or private identity is required.',
  'Accepted external reviews: 0. Recognized recurring external reviewers: 0.',
  'community-reviewers-v0.1.json',
  'Empty infrastructure and maintainer activity do not count as adoption.',
]) {
  if (!communityHtml.includes(requiredText)) throw new Error(`Community results page is missing: ${requiredText}`);
}
if (!sitemap.includes('community-results.html')) {
  throw new Error('Sitemap is missing the community results page.');
}
console.log('PASS public static community results page');

const reuseHtml = readFileSync(resolve('docs', 'reuse.html'), 'utf8');
for (const requiredText of [
  'Reuse the benchmark without API keys',
  './scripts/verify-clean-clone.sh',
  'npm run verify:release',
  'benchmark/final-results.json',
  'Data Package descriptor',
  'Croissant 1.1 metadata',
  'npm run preflight:result-card -- path/to/result-card.json',
  'A public GitHub username is sufficient; do not post a full name, email address, API key, private URL, or private media.',
  'Owner checks, maintainer downloads, empty listings, and unattributed traffic do not count as external adoption.',
]) {
  if (!reuseHtml.includes(requiredText)) throw new Error(`Reuse guide is missing: ${requiredText}`);
}
if (!sitemap.includes('reuse.html') || !agentIndex.includes('No-API-key reuse guide')) {
  throw new Error('Reuse guide is missing from the sitemap or agent index.');
}
console.log('PASS no-API-key reuse guide and adoption boundary');
console.log('Public benchmark verification passed. No API calls were made.');

function run(script: string, args: string[]) {
  const result = spawnSync('npx', ['--no-install', 'tsx', script, ...args], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${script} failed.\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}
