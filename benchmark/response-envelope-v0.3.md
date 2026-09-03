# Proposed v0.3 response envelope

**Estimated:** 2026-09-02
**API calls made:** none
**Status:** recommendation only; v0.3 is not frozen

## Evidence

The frozen response shape for one fixture contains:

- 1 summary;
- 12 evidence answers;
- 6 moments;
- 4 detected events in the current synthetic fixture;
- 12 edit decisions;
- 1 constraint object.

The representative fully populated JSON in `testdata/perfect-candidate.json` is 3,327 characters when minified and 3,876 characters when formatted. This is a structural size reference, not a provider token count. Google documents token counting as model-specific, so character division is not treated as an exact measurement.

The successful v0.1 agentic response used 2,479 visible output tokens. The failed v0.2 agentic response used only 73 visible output tokens before returning `incomplete`. Its precise incomplete reason was not preserved. The official Interactions API documentation says `incomplete` can result from hitting the response-token maximum, but does not establish that this happened here.

Gemini 3.7 Flash supports up to 65,536 output tokens. The benchmark's 4,096-token setting is therefore a local test choice, not the model ceiling.

Official references:

- <https://ai.google.dev/api/interactions-api>
- <https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash>
- <https://ai.google.dev/gemini-api/docs/tokens>

## Recommendation for v0.3

Use an 8,192-token response ceiling while keeping `thinking_level: low`.

This is the smallest power-of-two ceiling above the failed 4,096 setting and gives 3.30× headroom over the largest observed successful visible output. It remains one eighth of the model's documented output limit. This does not guarantee completion because the v0.2 failure cause is unknown; it makes the next attempt diagnostic rather than silently assuming that 4,096 was adequate.

Also constrain avoidable prose in the v0.3 prompt:

- summary: at most 30 words;
- each evidence answer: at most 20 words;
- each moment or event label: at most 8 words;
- return no explanation outside the JSON object.

The array cardinalities and scoring fields remain unchanged. These wording caps reduce unscored output without changing the evidence, retrieval, event, decision, or brief metrics.

## Cost impact

At the pinned promotional output rate, increasing the ceiling from 4,096 to 8,192 adds at most $0.015360 to the conservative estimate for one request.

For the current 600-second fixture:

- current estimate per request: $0.172860;
- proposed v0.3 estimate per request: $0.188220;
- proposed paired agentic/static maximum: $0.376440;
- projected cumulative paid-equivalent after that maximum: $0.484139.

This remains below the $4.50 operational stop. Actual returned usage must still be ledgered, and no call may bypass the runner.

## Freeze gate

Before any new API call:

1. freeze a separate `protocol-v0.3.md` with the 8,192 ceiling and wording caps;
2. update the validator to enforce the caps locally;
3. create a v0.3 reference candidate that passes every invariant;
4. update the runner estimate from the committed config and verify the budget guard.

Scores from v0.1, v0.2, and v0.3 must remain separate.
