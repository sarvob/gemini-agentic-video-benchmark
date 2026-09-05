import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function buildFinalResultsCsv(results: any) {
  const rows: Array<Array<string | number>> = [
    ['section', 'metric', 'unit', 'agentic', 'static', 'agentic_minus_static', 'agentic_vs_static_percent', 'denominator'],
  ];

  for (const [metric, unit] of [
  ['momentF1', 'score'],
  ['shortEventRecall', 'rate'],
  ['evidenceAccuracy', 'rate'],
  ['editDecisionMacroF1', 'score'],
  ['boundaryMedianSec', 'seconds'],
  ['boundaryP90Sec', 'seconds'],
] as const) {
    const value = results.macroMeans[metric];
    rows.push(['quality', metric, unit, value.agentic, value.static, value.agenticMinusStatic, '', results.fixtureCount]);
  }

  for (const [metric, unit] of [
  ['inputPlusToolTokens', 'tokens'],
  ['totalAccountedTokens', 'tokens'],
  ['paidEquivalentUsd', 'usd'],
  ['latencyMs', 'milliseconds'],
] as const) {
    const value = results.totals[metric];
    const delta = metric === 'paidEquivalentUsd'
      ? Number((value.agentic - value.static).toFixed(6))
      : value.agentic - value.static;
    rows.push([
      'efficiency',
      metric,
      unit,
      value.agentic,
      value.static,
      delta,
      value.agenticVsStaticPercent,
      results.fixtureCount,
    ]);
  }

  rows.push([
    'constraints',
    'briefPasses',
    'count',
    results.briefPasses.agentic,
    results.briefPasses.static,
    results.briefPasses.agentic - results.briefPasses.static,
    0,
    results.briefPasses.denominator,
  ]);

  return `${rows.map((row) => row.join(',')).join('\n')}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sourcePath = resolve('benchmark', 'final-results.json');
  const outputPaths = [
    resolve('benchmark', 'final-results.csv'),
    resolve('docs', 'final-results.csv'),
  ];
  const results = JSON.parse(await readFile(sourcePath, 'utf8'));
  const csv = buildFinalResultsCsv(results);
  for (const outputPath of outputPaths) await writeFile(outputPath, csv);

  console.log('Wrote 11 metric rows to benchmark/final-results.csv and docs/final-results.csv');
}
