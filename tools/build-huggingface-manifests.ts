import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const benchmarkDir = path.join(root, "benchmark");
const outputDir = path.join(root, "huggingface", "data");

async function readJson(filePath: string) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function jsonLine(value: unknown) {
  return `${JSON.stringify(value)}\n`;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

const fixtures = await readJson(path.join(benchmarkDir, "fixtures.json"));
const fixtureRows = [];

for (const fixture of fixtures) {
  const groundTruthPath = `benchmark/ground-truth/${fixture.id}.json`;
  const groundTruth = await readJson(path.join(root, groundTruthPath));
  fixtureRows.push({
    fixture_id: fixture.id,
    fixture_family: fixture.id.split("-")[1],
    duration_sec: fixture.durationSec,
    rights: fixture.rights,
    license_evidence: fixture.licenseEvidence,
    status: fixture.status,
    source_sha256: groundTruth.source.sha256,
    ground_truth_path: groundTruthPath,
    evidence_rules_path: `benchmark/evidence-rules-${fixture.id}.json`,
    generator: groundTruth.source.generator,
    media_included: false,
  });
}

fixtureRows.sort((a, b) => a.fixture_id.localeCompare(b.fixture_id));

const resultNames = (await readdir(path.join(benchmarkDir, "results")))
  .filter((name) => /-(agentic|static)-v0\.4\.json$/.test(name))
  .sort();
const resultRows = [];

for (const name of resultNames) {
  const sourcePath = `benchmark/results/${name}`;
  const result = await readJson(path.join(root, sourcePath));
  const metrics = result.metrics ?? null;
  resultRows.push({
    fixture_id: result.fixtureId,
    mode: result.mode,
    status: result.status,
    protocol_version: result.protocolVersion,
    model: result.model,
    provider_status: result.providerStatus,
    agentic_verified: result.agenticVerified,
    latency_ms: result.latencyMs,
    input_tokens: result.usage?.inputTokens ?? null,
    output_tokens: result.usage?.outputTokens ?? null,
    thought_tokens: result.usage?.thoughtTokens ?? null,
    tool_use_tokens: result.usage?.toolUseTokens ?? null,
    paid_equivalent_usd: result.usage?.paidEquivalentUsd ?? null,
    moment_f1: metrics?.momentRetrieval?.f1 ?? null,
    short_event_recall: metrics?.shortEventRecall ?? null,
    evidence_accuracy: metrics?.multimodalEvidenceAccuracy?.overall ?? null,
    edit_decision_macro_f1: metrics?.editDecision?.macroF1ObservedClasses ?? null,
    boundary_median_sec: metrics?.timestampLocalizationErrorSec?.median ?? null,
    boundary_p90_sec: metrics?.timestampLocalizationErrorSec?.p90 ?? null,
    brief_all_pass: metrics?.briefConstraints?.allPass ?? null,
    selected_duration_sec: metrics?.briefConstraints?.selectedDurationSec ?? null,
    limitations: result.limitations ?? [],
    source_path: sourcePath,
  });
}

const fixturesJsonl = fixtureRows.map(jsonLine).join("");
const resultsJsonl = resultRows.map(jsonLine).join("");

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "fixtures.jsonl"), fixturesJsonl);
await writeFile(path.join(outputDir, "results.jsonl"), resultsJsonl);

console.log(
  JSON.stringify(
    {
      fixtures: fixtureRows.length,
      results: resultRows.length,
      fixturesSha256: sha256(fixturesJsonl),
      resultsSha256: sha256(resultsJsonl),
    },
    null,
    2,
  ),
);
