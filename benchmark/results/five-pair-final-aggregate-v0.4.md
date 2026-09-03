# Final automated aggregate — protocol v0.4

**Attempted fixtures:** 6 synthetic 10-minute videos
**Valid matched pairs:** 5
**Excluded fixture:** synthetic-solo-02; agentic output was unparseable, so no static arm ran
**Paired source duration:** 50 minutes per mode
**Model:** Gemini 3.7 Flash
**Scope:** exploratory and descriptive only

## Macro means across five valid pairs

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.2667 | 0.3000 | −0.0333 |
| Short-event recall | 0.9000 | 0.7500 | +0.1500 |
| Rule-based evidence accuracy | 0.8333 | 0.9000 | −0.0667 |
| Edit-decision macro F1 | 0.6807 | 0.5481 | +0.1326 |
| Per-fixture median boundary error | 1.20 s | 1.00 s | +0.20 s |
| Per-fixture p90 boundary error | 4.00 s | 2.80 s | +1.20 s |
| Automated brief pass rate | 4/5 | 4/5 | tie |

## Totals across five valid pairs

| Measure | Agentic | Static | Agentic vs static |
|---|---:|---:|---:|
| Input + tool-use tokens | 351,337 | 276,494 | +27.07% |
| Total accounted tokens | 392,902 | 289,108 | +35.90% |
| Paid-equivalent cost | $0.330778 | $0.254673 | +29.88% |
| Planning latency | 243.608 s | 134.352 s | +81.32% |

These efficiency totals include only the five valid matched pairs. They exclude the solo-02 invalid agentic attempt and all earlier protocol versions.

## Readout

Agentic found 18 of 20 short events across the valid pairs; static found 15. Agentic also had higher macro edit-decision F1. Static had higher macro moment F1 and rule-based evidence accuracy, as well as lower median and p90 boundary errors. Each mode passed the automated brief on four of five paired fixtures; both exceeded the duration limit on podcast-02.

The efficiency tradeoff was consistent in the final paired aggregate. Agentic used 35.90% more total accounted tokens, cost 29.88% more, and took 81.32% longer.

## Attrition and protocol accounting

- Six frozen fixtures were attempted under v0.4.
- Five produced structurally valid agentic and static outputs and are included above.
- Solo-02 produced a provider-completed, agentic-verified response whose text began with unstructured reasoning before fenced JSON. The frozen normalizer rejected it, no quality score was computed, no repair or rerun occurred, and the conditional static arm did not run.
- Total paid-equivalent ledger spend across all protocol versions and invalid attempts is $0.826280, below the $4.50 operational stop and $5 absolute ceiling.

## Limits

- Five valid synthetic pairs are far too small for significance testing or a winner claim.
- One of six v0.4 fixtures attrited before pairing, so this is not a complete six-pair comparison.
- Story retention/coherence and cut-seam defects remain unmeasured because no blinded human review exists.
- Rule-based evidence accuracy is not human semantic accuracy.
- The exploratory pilot remains below the parent protocol's twelve-video publication threshold.
- These results compare Gemini 3.7 Flash agentic processing with the same model in static mode, not Gemini with PaperEdits.

The aggregate is reproducible from the ten committed valid v0.4 result JSON files with `tools/aggregate-gemini-video-results.ts`. Solo-02 attrition is recorded in `synthetic-solo-02-agentic-v0.4.json`.
