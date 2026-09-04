# Contributing

PaperEdits welcomes independent checks that make this exploratory benchmark more reproducible, better scoped, or easier to audit.

Read [GOVERNANCE.md](GOVERNANCE.md) for roles, public decision records, result-card acceptance, fixture-freeze rules, conflicts, and the path to recurring reviewer status.

## Useful contributions

- run `./scripts/verify-clean-clone.sh` from a clean clone, then report any divergence;
- audit a frozen annotation or evidence rule and explain the proposed correction;
- add deterministic scorer tests or improve documentation;
- propose a rights-clear synthetic fixture without uploading personal or third-party media; or
- publish an independent extension with its protocol, configuration, outputs, and limitations.

Start with the **Benchmark reproduction** issue form for an audit or reproduction, the **Synthetic fixture proposal** form for a new case, or the **Fixture review** form for a human review of an annotated case. State whether you are independent or have a relationship with PaperEdits, and distinguish a proposal from a frozen case.

For a new run or extension, publish a [result card](benchmark/result-card-v0.1.md) with immutable evidence links. The example is a maintainer baseline and does not count as external adoption.

New fixtures follow [Annotation and Review Guide v0.1](benchmark/annotation-review-guide-v0.1.md). A fixture counts as human-validated only after two human reviews, including at least one unaffiliated reviewer, and a versioned freeze. Automated checks do not replace either review.

Browse the [public fixture-expansion queue](https://github.com/sarvob/gemini-agentic-video-benchmark/issues?q=is%3Aissue%20is%3Aopen%20label%3Abenchmark%20label%3Aenhancement) before opening a duplicate. The first scoped case is [synthetic-presentation-01](https://github.com/sarvob/gemini-agentic-video-benchmark/issues/1); it is annotated but awaits two human reviews and does not count toward validated breadth. Use its [fixture-specific review checklist](benchmark/proposals/synthetic-presentation-01-review-checklist.md) if you can reproduce it on macOS.

## Safety and privacy

- Never commit API keys, credentials, email addresses, private URLs, customer footage, or personal information.
- Do not upload media unless you created it or have documented permission and a compatible license.
- Do not make new paid model calls on behalf of PaperEdits. The supported verification path costs $0 and uses committed artifacts only.
- Do not present this exploratory sample as statistically significant or as a Gemini-versus-PaperEdits comparison.

## Pull requests

Keep changes narrowly scoped. Include the tested commit, environment, commands, results, and any changed assumptions. Run:

```bash
./scripts/verify-clean-clone.sh
```

By submitting a contribution, you agree that it may be distributed under this repository's MIT License. Accepted contributors are credited through Git history and release notes where appropriate; no payment or reward is promised.
