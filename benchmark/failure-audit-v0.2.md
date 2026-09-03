# v0.2 incomplete-response audit

**Audited:** 2026-09-02
**API calls made:** none

## What the provider documentation establishes

- The Interactions API accepts `generation_config.max_output_tokens`; Google defines it as the maximum number of tokens in the response.
- The API defines `incomplete` as a finished interaction with incomplete results and gives hitting the token maximum as an example.
- Usage reports output, thought, and tool-use tokens separately.

Official reference: <https://ai.google.dev/api/interactions-api>

The v0.2 request used the documented snake-case fields:

```json
{
  "generation_config": {
    "thinking_level": "low",
    "max_output_tokens": 4096
  }
}
```

## What this run establishes

The provider returned `status: incomplete` with 73 output tokens, 1,929 thought tokens, and 1,915 tool-use tokens. That is consistent with a response-limit failure, but it does not prove one. The raw response from this attempt was not preserved, and the API reference only says the token limit is one example of an incomplete response.

Therefore the exact failure cause is **unknown**. We will not label it a max-token failure in benchmark results or public progress notes.

## Failure-capture change

Before every future network call, the runner now writes an ignored local request record containing:

- fixture, mode, model, and protocol version;
- the non-sensitive generation settings;
- the prompt SHA-256 and character count.

It does not save the API key, uploaded-file URI, or prompt text in that request record. Failed responses continue to be saved in full under ignored `tmp/gemini-benchmark/`. The committed spend ledger will also retain the provider status and a string `incomplete_details.reason` when supplied.

## Protocol decision

No protocol change is justified by this audit alone. v0.2 remains frozen and invalid. A new call must use a separately frozen v0.3 protocol because increasing the output allowance or shortening the requested response would change the test conditions.

Before v0.3 is frozen, estimate the smallest sufficient response envelope from the v0.2 schema and decide whether to raise the output ceiling or reduce output verbosity. That decision must be explicit in the v0.3 protocol and cost estimate.
