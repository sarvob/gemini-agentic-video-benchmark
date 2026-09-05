#!/usr/bin/env node
/** Read the committed flat benchmark summary with Node.js built-ins. */
import { readFileSync } from 'node:fs';

const csvPath = process.argv[2] ?? 'benchmark/final-results.csv';
const [headerLine, ...dataLines] = readFileSync(csvPath, 'utf8').trim().split('\n');
const headers = headerLine.split(',');
const rows = new Map(
  dataLines.map((line) => {
    const row = Object.fromEntries(headers.map((header, index) => [header, line.split(',')[index]]));
    return [`${row.section}:${row.metric}`, row];
  }),
);

const recall = rows.get('quality:shortEventRecall');
const latency = rows.get('efficiency:latencyMs');
if (!recall || !latency) throw new Error('Expected result rows are missing from the CSV.');

console.log(JSON.stringify({
  source: csvPath,
  shortEventRecall: {
    agentic: Number(recall.agentic),
    static: Number(recall.static),
    agenticMinusStatic: Number(recall.agentic_minus_static),
  },
  latency: {
    agenticMs: Number(latency.agentic),
    staticMs: Number(latency.static),
    agenticVsStaticPercent: Number(latency.agentic_vs_static_percent),
  },
}, null, 2));
