# Four-pair aggregate — protocol v0.4

**Fixtures:** synthetic-screen-01, synthetic-screen-02, synthetic-solo-01, and synthetic-podcast-01
**Source duration:** 40 minutes total per mode
**Model:** Gemini 3.7 Flash
**Scope:** four synthetic pairs; descriptive only

## Macro means

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.2500 | 0.3333 | −0.0833 |
| Short-event recall | 0.8750 | 0.7500 | +0.1250 |
| Rule-based evidence accuracy | 0.8333 | 0.8958 | −0.0625 |
| Edit-decision macro F1 | 0.6176 | 0.5185 | +0.0991 |
| Per-fixture median boundary error | 1.25 s | 1.25 s | 0.00 s |
| Per-fixture p90 boundary error | 3.75 s | 3.00 s | +0.75 s |
| Automated brief pass rate | 4/4 | 4/4 | tie |

## Totals across all four fixtures

| Measure | Agentic | Static | Agentic vs static |
|---|---:|---:|---:|
| Input + tool-use tokens | 204,507 | 220,018 | −7.05% |
| Total accounted tokens | 236,826 | 230,028 | +2.96% |
| Paid-equivalent cost | $0.264998 | $0.202551 | +30.83% |
| Planning latency | 184.161 s | 109.360 s | +68.40% |

## Readout

Agentic found 14 of 16 short events across the four videos; static found 12. The new podcast pair tied at two each, so the aggregate advantage still does not repeat on every fixture. Agentic's macro edit-decision F1 was higher. Static's macro moment F1 and rule-based evidence accuracy were higher, median boundary error tied, and static's p90 error was lower.

The token result depends on the accounting view. Agentic used 7.05% fewer input-plus-tool tokens but 2.96% more total accounted tokens after output and thought tokens. It cost 30.83% more and took 68.40% longer.

## Limits

- Four synthetic pairs are far too small for significance testing or a winner claim.
- Quality differences remain mixed and the short-event advantage did not occur on every fixture.
- Story coherence and cut-seam defects remain unmeasured because no blinded human review exists.
- Rule-based evidence accuracy is not human semantic accuracy.
- The exploratory six-fixture pilot is two-thirds complete and remains below the twelve-video publication threshold.

The aggregate is reproducible from the eight committed v0.4 result JSON files with `tools/aggregate-gemini-video-results.ts`.
