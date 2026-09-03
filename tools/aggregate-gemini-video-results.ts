/** Aggregate valid paired Gemini benchmark results without significance claims. */
import { readFileSync } from 'node:fs';

type Result = {
  status: string; fixtureId: string; mode: 'agentic' | 'static'; model: string; protocolVersion: string; latencyMs: number;
  usage: { inputTokens: number; outputTokens: number; thoughtTokens: number; toolUseTokens: number; paidEquivalentUsd: number };
  metrics: {
    momentRetrieval: { f1: number }; shortEventRecall: number;
    timestampLocalizationErrorSec: { median: number; p90: number };
    multimodalEvidenceAccuracy: { overall: number };
    editDecision: { macroF1ObservedClasses: number };
    briefConstraints: { allPass: boolean };
  };
};

const paths = process.argv.slice(2);
if (!paths.length || paths.length % 2 !== 0) {
  console.error('Usage: tsx tools/aggregate-gemini-video-results.ts <agentic.json> <static.json> [<agentic.json> <static.json> ...]');
  process.exit(2);
}

const pairs = Array.from({ length: paths.length / 2 }, (_, index) => ({
  agentic: read(paths[index * 2]!), static: read(paths[index * 2 + 1]!),
}));
for (const pair of pairs) {
  if (pair.agentic.status !== 'valid' || pair.static.status !== 'valid') throw new Error('Every result must be valid.');
  if (pair.agentic.mode !== 'agentic' || pair.static.mode !== 'static') throw new Error('Each pair must be ordered agentic, static.');
  for (const field of ['fixtureId', 'model', 'protocolVersion'] as const) {
    if (pair.agentic[field] !== pair.static[field]) throw new Error(`Pair mismatch in ${field}.`);
  }
}
const protocol = pairs[0]!.agentic.protocolVersion;
if (pairs.some((pair) => pair.agentic.protocolVersion !== protocol)) throw new Error('Protocol versions cannot be merged.');

const macro = (selector: (result: Result) => number) => {
  const agentic = mean(pairs.map((pair) => selector(pair.agentic)));
  const staticValue = mean(pairs.map((pair) => selector(pair.static)));
  return { agentic, static: staticValue, agenticMinusStatic: agentic - staticValue };
};
const summed = (selector: (result: Result) => number) => {
  const agentic = sum(pairs.map((pair) => selector(pair.agentic)));
  const staticValue = sum(pairs.map((pair) => selector(pair.static)));
  return { agentic, static: staticValue, agenticVsStaticPercent: staticValue ? (agentic - staticValue) / staticValue * 100 : null };
};

console.log(JSON.stringify({
  protocolVersion: protocol,
  fixtureCount: pairs.length,
  fixtures: pairs.map((pair) => pair.agentic.fixtureId),
  macroMeans: {
    momentF1: macro((r) => r.metrics.momentRetrieval.f1),
    shortEventRecall: macro((r) => r.metrics.shortEventRecall),
    evidenceAccuracy: macro((r) => r.metrics.multimodalEvidenceAccuracy.overall),
    editDecisionMacroF1: macro((r) => r.metrics.editDecision.macroF1ObservedClasses),
    boundaryMedianSec: macro((r) => r.metrics.timestampLocalizationErrorSec.median),
    boundaryP90Sec: macro((r) => r.metrics.timestampLocalizationErrorSec.p90),
  },
  totals: {
    inputPlusToolTokens: summed((r) => r.usage.inputTokens + r.usage.toolUseTokens),
    totalAccountedTokens: summed((r) => r.usage.inputTokens + r.usage.toolUseTokens + r.usage.outputTokens + r.usage.thoughtTokens),
    paidEquivalentUsd: summed((r) => r.usage.paidEquivalentUsd),
    latencyMs: summed((r) => r.latencyMs),
  },
  briefPasses: {
    agentic: sum(pairs.map((pair) => Number(pair.agentic.metrics.briefConstraints.allPass))),
    static: sum(pairs.map((pair) => Number(pair.static.metrics.briefConstraints.allPass))),
    denominator: pairs.length,
  },
}, null, 2));

function read(path: string) { return JSON.parse(readFileSync(path, 'utf8')) as Result; }
function sum(values: number[]) { return values.reduce((total, value) => total + value, 0); }
function mean(values: number[]) { return sum(values) / values.length; }
