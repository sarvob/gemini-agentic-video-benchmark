# Two-pair aggregate — protocol v0.4

**Fixtures:** synthetic-screen-01 and synthetic-screen-02
**Source duration:** 20 minutes total per mode
**Model:** Gemini 3.7 Flash
**Scope:** two synthetic pairs; descriptive only

## Macro means

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.1667 | 0.2500 | −0.0833 |
| Short-event recall | 1.0000 | 0.7500 | +0.2500 |
| Rule-based evidence accuracy | 0.8333 | 0.8750 | −0.0417 |
| Edit-decision macro F1 | 0.4481 | 0.3333 | +0.1148 |
| Per-fixture median boundary error | 1.0 s | 2.5 s | −1.5 s |
| Per-fixture p90 boundary error | 4.5 s | 3.5 s | +1.0 s |
| Automated brief pass rate | 2/2 | 2/2 | tie |

## Totals across both fixtures

| Measure | Agentic | Static | Agentic vs static |
|---|---:|---:|---:|
| Input + tool-use tokens | 110,792 | 107,966 | +2.62% |
| Total accounted tokens | 129,125 | 114,027 | +13.24% |
| Paid-equivalent cost | $0.142264 | $0.103703 | +37.18% |
| Planning latency | 96.795 s | 60.010 s | +61.30% |

## Readout

The only consistent quality gain across both fixtures was short-event recall: agentic found all four brief events in each video, while static found three in each. Other quality differences changed direction by fixture. In the two-pair macro, agentic was higher on edit-decision F1 and lower on moment F1 and evidence accuracy; median boundary error favored agentic while p90 favored static.

The efficiency result does not support a broad “fewer tokens” claim at this sample size. Across the two valid pairs, agentic used 2.62% more input-plus-tool tokens and 13.24% more total accounted tokens, cost 37.18% more, and took 61.30% longer.

## Limits

- Two synthetic pairs are far too small for significance testing or a winner claim.
- Per-fixture reversals show that the first pair was not stable evidence by itself.
- Story coherence and cut-seam defects remain unmeasured because no blinded human review exists.
- Rule-based evidence accuracy is not human semantic accuracy.
- The exploratory six-fixture pilot is incomplete and remains below the twelve-video publication threshold.

The aggregate is reproducible from the four committed v0.4 result JSON files with `tools/aggregate-gemini-video-results.ts`.
