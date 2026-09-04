# Gemini Agentic Video Understanding Benchmark

[![Verify benchmark evidence](https://github.com/sarvob/gemini-agentic-video-benchmark/actions/workflows/verify.yml/badge.svg?branch=main)](https://github.com/sarvob/gemini-agentic-video-benchmark/actions/workflows/verify.yml)

Public evidence package for PaperEdits' exploratory comparison of Gemini 3.7 Flash agentic and static video-understanding modes.

PaperEdits maintains this repository and conducted the evaluation independently. It is not sponsored or endorsed by Google.

## Result in context

Six synthetic 10-minute fixtures were attempted and five produced valid pairs. Agentic processing found 18 of 20 short events versus 15 of 20 for static processing. Other quality results were mixed, one agentic output failed the frozen JSON contract, and agentic processing took 81.32% longer across valid pairs.

This small exploratory sample does not establish statistical significance, a general winner, or a comparison between Gemini and PaperEdits.

- [Read the full report](https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark)
- [Open the reproducibility hub](https://sarvob.github.io/gemini-agentic-video-benchmark/)
- [Download the frozen v0.4 data bundle](https://github.com/sarvob/gemini-agentic-video-benchmark/releases/download/v0.4-exploratory/gemini-agentic-video-benchmark-v0.4-data.tar.gz) (`sha256:133a149964ed123296bfe157e5a1cfa47299fca1a9003caac81cdafd99fcb039`)
- [Read the canonical machine-readable aggregate](benchmark/final-results.json)
- [Inspect the deterministic paired uncertainty analysis](benchmark/uncertainty-v0.4.md)
- [Read the output-contract failure analysis](https://sarvob.github.io/gemini-agentic-video-benchmark/output-contract-failure.html)
- [Read the temporal miss analysis](https://sarvob.github.io/gemini-agentic-video-benchmark/temporal-miss-analysis.html)
- [Read the quality and cost tradeoff report](https://sarvob.github.io/gemini-agentic-video-benchmark/quality-cost-tradeoff.html)
- [Publish a comparable result card](benchmark/result-card-v0.1.md)
- [Browse community results](https://sarvob.github.io/gemini-agentic-video-benchmark/community-results.html)
- [Review the publication package](benchmark/publication-package-v0.4.md)
- [Inspect the original protocol](benchmark/original-protocol-v0.1.md)
- [Copy citation metadata](CITATION.cff)
- [Contribute a reproduction or audit](CONTRIBUTING.md)
- [Read the governance and decision rules](GOVERNANCE.md)
- [Inspect the community reviewer registry](benchmark/community-reviewers-v0.1.json)
- [Propose and review a synthetic fixture](benchmark/annotation-review-guide-v0.1.md)
- [Browse the public fixture-expansion queue](https://github.com/sarvob/gemini-agentic-video-benchmark/issues?q=is%3Aissue%20is%3Aopen%20label%3Abenchmark%20label%3Aenhancement)
- [Review the annotated presentation fixture](benchmark/proposals/synthetic-presentation-01-review-checklist.md)
- [Review the release history](CHANGELOG.md)

## Verify the committed evidence for $0

The verifier reads committed JSON only. It makes no network requests, uploads no media, needs no API key, and incurs no model charges.

```bash
./scripts/verify-clean-clone.sh
```

A successful run installs the pinned dependencies, checks that the dataset manifests reproduce without a diff, scores all six frozen perfect candidates, recomputes the five-pair aggregate, and ends with:

```text
Public benchmark verification passed. No API calls were made.
```

## Repository map

- `benchmark/ground-truth/` — frozen fixture annotations
- `benchmark/annotation-review-guide-v0.1.md` — staged two-reviewer workflow for new synthetic fixtures
- `benchmark/proposals/` — machine-readable state for cases that are not yet frozen or counted as validated
- `benchmark/evidence-rules-*.json` — fixture-specific evidence checks
- `benchmark/prompt-v0.4.md` and `benchmark/protocol-v0.4.md` — active frozen protocol
- `benchmark/results/` — committed result artifacts and comparisons
- `benchmark/final-results.json` — canonical machine-readable five-pair aggregate, reproduced by the verifier
- `benchmark/result-card-schema-v0.1.json` and example — portable, provenance-aware aggregate reporting contract
- `benchmark/community-results-v0.1.json` — machine-readable index behind the static community results table
- `benchmark/community-reviewers-v0.1.json` — machine-readable external review and contribution counts
- `benchmark/uncertainty-v0.4.json` and `.md` — exhaustive paired bootstrap intervals and sign-flip diagnostics
- `benchmark/testdata/` — perfect deterministic scorer fixtures
- `benchmark/spend-ledger.jsonl` — append-only historical cost accounting
- `huggingface/` — dataset card and viewer-compatible JSONL manifests staged for future Hugging Face publication
- `tools/` — deterministic scorers, aggregate script, verifier, and synthetic media generators
- `GOVERNANCE.md` — public roles, acceptance rules, conflicts, and external reviewer path

The generated videos are not committed. Their paths, durations, rights declarations, and hashes are documented in the benchmark artifacts; generator scripts require local media tooling and macOS system speech voices. The $0 artifact verifier does not require the videos.

Validate a proposed public result card locally with `npm run validate:result-card -- path/to/result-card.json`. The command checks the JSON Schema 2020-12 contract, provenance/adoption relationship, coverage reconciliation, brief-pass counts, and immutable GitHub evidence links.

Before opening a submission, run `npm run preflight:result-card -- path/to/result-card.json`. It reruns the benchmark and card checks and prints a privacy-safe, copy-ready validation record containing the tested commit and card hash.

The Hugging Face package is publication-ready but not yet published. Rebuild its deterministic metadata and result tables with `npm run build:huggingface`; publishing requires an authorized Hugging Face session.

The annotated presentation proposal has a one-command local review package. On macOS with the documented dependencies, run `./scripts/prepare-presentation-01-review.sh`; it verifies locked files, regenerates the exact ignored video, checks its hash and duration, extracts local checkpoint frames, scores the reference candidate, and runs the offline verifier without a model call or upload.

## Independent reproduction

Use the **Benchmark reproduction** issue form to report a clean-clone verification, discrepancy, annotation audit, or independent extension. State your relationship to PaperEdits, if any, and whether your work is an artifact reproduction or a new model run.

Do not post API keys, private URLs, personal information, customer footage, or media you do not have the right to share. Issues are public and show the submitting account's public profile.

## License

Code and committed benchmark materials are provided under the [MIT License](LICENSE). The fixtures are synthetic and contain no real person or third-party media.
