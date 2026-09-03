# Three-pair aggregate — protocol v0.4

**Fixtures:** synthetic-screen-01, synthetic-screen-02, and synthetic-solo-01
**Source duration:** 30 minutes total per mode
**Model:** Gemini 3.7 Flash
**Scope:** three synthetic pairs; descriptive only

## Macro means

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.1667 | 0.2222 | −0.0556 |
| Short-event recall | 1.0000 | 0.8333 | +0.1667 |
| Rule-based evidence accuracy | 0.8611 | 0.9167 | −0.0556 |
| Edit-decision macro F1 | 0.5457 | 0.3580 | +0.1877 |
| Per-fixture median boundary error | 0.67 s | 1.67 s | −1.00 s |
| Per-fixture p90 boundary error | 3.67 s | 3.00 s | +0.67 s |
| Automated brief pass rate | 3/3 | 3/3 | tie |

## Totals across all three fixtures

| Measure | Agentic | Static | Agentic vs static |
|---|---:|---:|---:|
| Input + tool-use tokens | 169,826 | 163,536 | +3.85% |
| Total accounted tokens | 195,634 | 171,592 | +14.01% |
| Paid-equivalent cost | $0.214571 | $0.152862 | +40.37% |
| Planning latency | 144.960 s | 83.491 s | +73.62% |

## Readout

Agentic found all 12 short events across the three videos; static found 10. The third pair tied at four each, so the earlier recall advantage did not repeat on every fixture. Agentic's macro edit-decision F1 was higher and its average median boundary error was lower. Static's macro moment F1 and rule-based evidence accuracy were higher, and its average p90 boundary error was lower.

The efficiency direction remained stable at the aggregate level. Agentic used 3.85% more input-plus-tool tokens and 14.01% more total accounted tokens, cost 40.37% more, and took 73.62% longer.

## Limits

- Three synthetic pairs are far too small for significance testing or a winner claim.
- Quality differences remain mixed and the short-event advantage did not occur on every fixture.
- Story coherence and cut-seam defects remain unmeasured because no blinded human review exists.
- Rule-based evidence accuracy is not human semantic accuracy.
- The exploratory six-fixture pilot is half complete and remains below the twelve-video publication threshold.

The aggregate is reproducible from the six committed v0.4 result JSON files with `tools/aggregate-gemini-video-results.ts`.
