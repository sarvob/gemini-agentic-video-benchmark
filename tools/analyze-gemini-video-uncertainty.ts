/** Enumerate paired bootstrap intervals and sign-flip tests for the five valid v0.4 pairs. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Result = {
  fixtureId: string;
  mode: 'agentic' | 'static';
  status: string;
  latencyMs: number;
  usage: { paidEquivalentUsd: number };
  metrics: {
    momentRetrieval: { f1: number };
    shortEventRecall: number;
    multimodalEvidenceAccuracy: { overall: number };
    editDecision: { macroF1ObservedClasses: number };
    timestampLocalizationErrorSec: { median: number; p90: number };
  };
};

const fixtures = [
  'synthetic-screen-01',
  'synthetic-screen-02',
  'synthetic-solo-01',
  'synthetic-podcast-01',
  'synthetic-podcast-02',
] as const;

const pairs = fixtures.map((fixtureId) => ({
  fixtureId,
  agentic: read(`benchmark/results/${fixtureId}-agentic-v0.4.json`),
  static: read(`benchmark/results/${fixtureId}-static-v0.4.json`),
}));

for (const pair of pairs) {
  if (pair.agentic.status !== 'valid' || pair.static.status !== 'valid') {
    throw new Error(`${pair.fixtureId} is not a valid pair.`);
  }
  if (pair.agentic.fixtureId !== pair.fixtureId || pair.static.fixtureId !== pair.fixtureId) {
    throw new Error(`${pair.fixtureId} result identity mismatch.`);
  }
}

const metrics = [
  ['momentF1', 'higher', (r: Result) => r.metrics.momentRetrieval.f1],
  ['shortEventRecall', 'higher', (r: Result) => r.metrics.shortEventRecall],
  ['evidenceAccuracy', 'higher', (r: Result) => r.metrics.multimodalEvidenceAccuracy.overall],
  ['editDecisionMacroF1', 'higher', (r: Result) => r.metrics.editDecision.macroF1ObservedClasses],
  ['boundaryMedianSec', 'lower', (r: Result) => r.metrics.timestampLocalizationErrorSec.median],
  ['boundaryP90Sec', 'lower', (r: Result) => r.metrics.timestampLocalizationErrorSec.p90],
  ['latencyMs', 'lower', (r: Result) => r.latencyMs],
  ['paidEquivalentUsd', 'lower', (r: Result) => r.usage.paidEquivalentUsd],
] as const;

const analyses = Object.fromEntries(metrics.map(([name, favorableDirection, select]) => {
  const pairedDifferences = pairs.map((pair) => ({
    fixtureId: pair.fixtureId,
    agentic: select(pair.agentic),
    static: select(pair.static),
    agenticMinusStatic: select(pair.agentic) - select(pair.static),
  }));
  const differences = pairedDifferences.map((row) => row.agenticMinusStatic);
  const bootstrapMeans = enumerateBootstrapMeans(differences).sort((a, b) => a - b);
  const observedMean = mean(differences);
  return [name, {
    favorableDirection,
    observedMeanDifference: observedMean,
    directionCounts: {
      positive: differences.filter((value) => value > 0).length,
      zero: differences.filter((value) => value === 0).length,
      negative: differences.filter((value) => value < 0).length,
    },
    bootstrap: {
      method: 'exact enumeration of all ordered n-out-of-n paired resamples with replacement',
      resampleCount: bootstrapMeans.length,
      percentileInterval95: [quantile(bootstrapMeans, 0.025), quantile(bootstrapMeans, 0.975)],
    },
    signFlipTest: {
      method: 'exact two-sided paired sign-flip test of the mean difference',
      assignmentCount: 2 ** differences.length,
      pValue: exactSignFlipPValue(differences, observedMean),
    },
  }];
}));

console.log(JSON.stringify({
  protocolVersion: '0.4',
  analysisStatus: 'exploratory',
  pairedFixtureCount: pairs.length,
  fixtureOrder: fixtures,
  bootstrapResamplesPerMetric: pairs.length ** pairs.length,
  signFlipAssignmentsPerMetric: 2 ** pairs.length,
  interpretation: 'Intervals and p-values quantify instability in this five-pair synthetic sample; they do not establish general model superiority or practical significance.',
  analyses,
}, null, 2));

function enumerateBootstrapMeans(values: number[]) {
  const output: number[] = [];
  const sample = Array<number>(values.length);
  const visit = (depth: number) => {
    if (depth === values.length) {
      output.push(mean(sample));
      return;
    }
    for (const value of values) {
      sample[depth] = value;
      visit(depth + 1);
    }
  };
  visit(0);
  return output;
}

function exactSignFlipPValue(values: number[], observedMean: number) {
  let extreme = 0;
  const assignments = 2 ** values.length;
  for (let mask = 0; mask < assignments; mask += 1) {
    const signed = values.map((value, index) => value * ((mask >> index) & 1 ? 1 : -1));
    if (Math.abs(mean(signed)) >= Math.abs(observedMean) - 1e-12) extreme += 1;
  }
  return extreme / assignments;
}

function quantile(sortedValues: number[], probability: number) {
  const position = (sortedValues.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower]!;
  return sortedValues[lower]! + (sortedValues[upper]! - sortedValues[lower]!) * (position - lower);
}

function read(filePath: string) {
  return JSON.parse(readFileSync(resolve(filePath), 'utf8')) as Result;
}

function mean(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
