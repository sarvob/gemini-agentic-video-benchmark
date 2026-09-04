# Result card v0.1

Use a result card to publish a comparable aggregate without stripping away the protocol, configuration, exclusions, cost, or provenance needed to interpret it.

## Files

- [`result-card-schema-v0.1.json`](result-card-schema-v0.1.json) defines the portable contract.
- [`result-card-example-v0.1.json`](result-card-example-v0.1.json) records PaperEdits' frozen v0.4 maintainer baseline.

The example is deliberately marked `maintainer-baseline` and `countsAsExternalAdoption: false`. It is documentation, not evidence that another person or organization adopted the benchmark.

## Create a comparable card

1. Fork or clone the repository and pin the benchmark revision you used.
2. Keep protocol versions separate. Do not mix v0.1–v0.4 scores.
3. Record the exact provider, model, modes, run policy, attempted fixtures, valid pairs, and every excluded attempt.
4. Report the paired quality and efficiency fields in the schema. Do not omit an unfavorable metric or invalid attempt.
5. Link immutable aggregate, protocol, and result-artifact URLs.
6. State your relationship to PaperEdits. Use `independent-reproduction` only when you independently repeated the same protocol; use `independent-extension` for a changed model, fixture set, or method.
7. Run `npm run verify`, then validate your JSON before publishing it:

   ```bash
   npm run validate:result-card -- path/to/result-card.json
   ```

The validator applies the JSON Schema 2020-12 contract plus cross-field checks: valid pairs cannot exceed attempts, brief-pass counts must reconcile to valid pairs, and GitHub evidence links cannot point to a mutable `main` or `master` branch.

An external result counts as adoption only when its public card uses an independent relationship, sets `countsAsExternalAdoption` to `true`, links auditable evidence, and passes review. A GitHub star, page visit, maintainer test, unverifiable claim, or paid placement does not count.

## Submit a result

Open the [Result card submission form](https://github.com/sarvob/gemini-agentic-video-benchmark/issues/new?template=result-card-submission.yml) and link your public result card and evidence. Do not post API keys, email addresses, customer footage, private URLs, or media you do not have the right to share.

Acceptance means the card is structurally comparable and evidence-linked. It does not mean PaperEdits endorses the model, result, submitter, or conclusions.
