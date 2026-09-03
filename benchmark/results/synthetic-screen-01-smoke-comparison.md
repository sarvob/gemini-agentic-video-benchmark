# Synthetic screen fixture 01: smoke-test comparison

**Status:** preliminary, unpublished, one synthetic fixture
**Model:** `gemini-3.7-flash`
**Run date:** 2026-09-02

This smoke test validates the benchmark machinery. It is not evidence that either processing mode is generally better, and it is not part of a publishable twelve-video result.

## Paired result

| Measure | Agentic | Static | Agentic delta vs static |
|---|---:|---:|---:|
| Paid-equivalent cost | $0.046277 | $0.051061 | −$0.004784 (−9.37%) |
| Latency | 39.963 s | 21.057 s | +18.906 s (+89.78%) |
| Billable input/tool tokens | 28,322 | 53,681 | −25,359 (−47.24%) |
| Total accounted tokens | 34,998 | 56,561 | −21,563 (−38.12%) |
| Moment-retrieval F1 | 0.1333 | 0.1333 | tie |
| Short-event recall | 0.75 | 0.75 | tie |
| Edit-decision macro F1, observed classes | 0.9333 | 0.9333 | tie |
| Machine-checkable brief constraints | pass | fail | agentic +1 pass |
| Applied selected duration | 120 s | 121 s | agentic within limit; static +1 s |

Agentic navigation was verified by the presence of `processing_call` steps. It cut billable input/tool tokens nearly in half, but spent more output/thinking tokens and took nearly twice as long. Consequently, the paid-equivalent cost reduction was 9.37%, not the 47.24% input-token reduction.

## What the smoke test exposed

Both modes treated `moments` as broad chapters instead of highlight-sized intervals. Each matched only one of six frozen gold moments at temporal IoU ≥0.5. This is a prompt/schema ambiguity, not enough evidence of an intrinsic model limitation.

Both modes found three of four short events and missed the audio-only 880 Hz event at 02:13. That is a genuine shared miss under the frozen prompt.

The exact normalized-string evidence diagnostic produced 0 for agentic and 1/12 for static. Those numbers must not be described as semantic accuracy: correct paraphrases fail exact matching, while at least one agentic audio answer also contradicted the frozen label. Semantic adjudication needs a predeclared answer rubric before the pilot expands.

## Gate decision

Do not generate or spend on the remaining fixtures yet. First freeze protocol v0.2 with:

1. exactly six highlight-sized moment predictions, each no longer than 20 seconds;
2. a separate `events` collection for brief audio, visual, and cross-modal events;
3. predeclared semantic answer rules written before rerunning either arm;
4. an explicit requirement that `constraints.target_duration_sec` equal the sum of returned kept ranges;
5. the same revised prompt and retry policy for agentic and static.

After local validation, rerun this fixture as a clearly labeled v0.2 smoke-test pair. Do not merge v0.1 and v0.2 quality scores.

## Accounting

Cumulative paid-equivalent spend after both calls is **$0.097338**. The operational budget remaining is **$4.402662**. No private or user media was used, and no result was published externally.
