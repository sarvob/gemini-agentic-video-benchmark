# Gemini agentic video benchmark — exploratory results package

**Publication status:** approved for publication as an exploratory lab note; not cleared for a canonical benchmark claim
**Public report:** https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark
**Run date:** 2026-09-02
**Protocol:** v0.4
**Model:** Gemini 3.7 Flash
**Comparison:** Gemini agentic video processing versus the same model in static mode
**Dataset:** six generated 10-minute videos; five valid matched pairs and one agentic-output attrition
**Independence:** an independent PaperEdits evaluation, not sponsored or endorsed by Google

## Plain-English finding

On five valid synthetic pairs, agentic processing found more brief audio/visual events and produced better edit-decision classifications. Static processing found broad highlight moments slightly more often, answered more frozen evidence checks correctly, localized matched boundaries more tightly, and was substantially faster. Agentic used more total tokens and cost more in this pilot. The evidence is mixed and does not support a winner claim.

The strongest observed difference was short-event recall: agentic found 18 of 20 events lasting two seconds or less; static found 15. Agentic took 81.32% longer across the valid pairs. One of six agentic outputs violated the JSON-only contract and was excluded without repair or retry.

## Automated scorecard

| Metric | Agentic | Static | Readout |
|---|---:|---:|---|
| 1. Moment-retrieval F1 | 0.2667 | 0.3000 | Static +0.0333 |
| 2. Short-event recall | 0.9000 | 0.7500 | Agentic +0.1500; 18/20 vs 15/20 |
| 3. Boundary error, median | 1.20 s | 1.00 s | Static lower by 0.20 s |
| 3. Boundary error, p90 | 4.00 s | 2.80 s | Static lower by 1.20 s |
| 4. Frozen-rule evidence accuracy | 0.8333 | 0.9000 | Static +0.0667 |
| 5. Edit-decision macro F1 | 0.6807 | 0.5481 | Agentic +0.1326 |
| 7. Full automated brief pass rate | 4/5 | 4/5 | Tie; both failed duration on podcast-02 |
| 9. Total accounted tokens | 392,902 | 289,108 | Agentic +35.90% |
| 9. Paid-equivalent API cost | $0.330778 | $0.254673 | Agentic +29.88% |
| 10. Total planning latency | 243.608 s | 134.352 s | Agentic +81.32% |

Metric 4 is a frozen concept-conjunction and time-overlap score, not a blinded human semantic judgment. Economic and latency totals include only valid matched pairs.

## Metrics not measured

| Metric | Status | What is required |
|---|---|---|
| 6. Story retention and coherence | Not measured | Rendered randomized cuts and three blinded editor ratings |
| 8. Cut-seam defect rate | Not measured | Shared rendered output, automatic QA, and blinded review per 100 applied cuts |
| PaperEdits comparison arm | Not run | Frozen PaperEdits commit/configuration and the identical six-fixture adapter |

No score is imputed for these missing measurements. This package must not be presented as Gemini versus PaperEdits.

## Per-fixture automated results

| Fixture | Mode | Moment F1 | Short-event recall | Evidence | Edit F1 | Brief | Latency |
|---|---|---:|---:|---:|---:|---|---:|
| screen-01 | Agentic | 0.1667 | 1.00 | 0.8333 | 0.6741 | pass | 45.016 s |
| screen-01 | Static | 0.1667 | 0.75 | 0.8333 | 0.3333 | pass | 33.286 s |
| screen-02 | Agentic | 0.1667 | 1.00 | 0.8333 | 0.2222 | pass | 51.779 s |
| screen-02 | Static | 0.3333 | 0.75 | 0.9167 | 0.3333 | pass | 26.724 s |
| solo-01 | Agentic | 0.1667 | 1.00 | 0.9167 | 0.7407 | pass | 48.165 s |
| solo-01 | Static | 0.1667 | 1.00 | 1.0000 | 0.4074 | pass | 23.481 s |
| podcast-01 | Agentic | 0.5000 | 0.50 | 0.7500 | 0.8333 | pass | 39.201 s |
| podcast-01 | Static | 0.6667 | 0.50 | 0.8333 | 1.0000 | pass | 25.869 s |
| podcast-02 | Agentic | 0.3333 | 1.00 | 0.8333 | 0.9333 | fail: 126 s | 59.447 s |
| podcast-02 | Static | 0.1667 | 0.75 | 0.9167 | 0.6667 | fail: 130 s | 24.992 s |
| solo-02 | Agentic | — | — | — | — | invalid output | 102.614 s |
| solo-02 | Static | — | — | — | — | not run by gate | — |

## Attrition and spend

- Six v0.4 fixtures were frozen before model calls.
- Five produced a valid agentic/static pair.
- Solo-02 returned provider status `completed` and verified agentic processing, but the text began with unstructured reasoning before fenced JSON. The frozen normalizer rejected it. It was not repaired or rerun, and the conditional static arm did not run.
- Total paid-equivalent ledger spend across every protocol version, including invalid attempts, was $0.826280.
- This remained below the $4.50 operational stop and the user's $5 absolute ceiling.

## Method summary

- All media was generated locally from programmatic graphics, system-synthesized voices, and generated tones. No real person, customer footage, or third-party media was uploaded.
- Every fixture was exactly 600 seconds at 960×540 and was hashed before upload.
- Ground truth, evidence rules, prompts, schema, and per-fixture briefs were frozen before each request.
- Gemini requests used `store: false`, model `gemini-3.7-flash`, low thinking, an 8,192-token output ceiling, and either agentic or static processing.
- Agentic status required a provider `processing_call` in the response.
- No output repair or unequal retry was permitted.
- Earlier protocol versions are excluded from quality aggregation.

## Reproducibility map

- Protocol and intended ten metrics: `original-protocol-v0.1.md`
- Frozen v0.4 prompt: `prompt-v0.4.md`
- Fixtures and rights evidence: `fixtures.json`
- Ground truth: `ground-truth/`
- Frozen evidence rules: `evidence-rules-synthetic-*.json`
- Deterministic scorers: `../tools/score-gemini-video-benchmark.ts`, `../tools/compare-gemini-video-results.ts`, and `../tools/aggregate-gemini-video-results.ts`
- Valid result artifacts and pair reports: `results/`
- Final automated aggregate: `results/five-pair-final-aggregate-v0.4.md`
- Append-only cost accounting: `spend-ledger.jsonl`
- Invalid solo-02 record: `results/synthetic-solo-02-agentic-v0.4.json`

## Publication guard

This package is useful as an exploratory lab note, not as the canonical benchmark described in the parent protocol. Do not publish a winner headline, statistical claim, Gemini-versus-PaperEdits claim, or “professional editor” replacement claim. A canonical report still requires at least twelve completed videos, the PaperEdits arm, rendered outputs, blinded human review, and cut-seam QA.

## Cleared progress reply for X

This reply may be posted to the supplied Grok thread after X authentication is confirmed. It is a progress result, not the canonical report.

> six tests attempted. five paired.
>
> Gemini agentic found 18 of 20 short events. static found 15.
>
> other quality results were mixed. one agentic output failed the JSON contract. agentic took 81% longer.
>
> same model. synthetic 10-minute videos. exploratory.

The social-posting history is intentionally outside this public evidence snapshot.
