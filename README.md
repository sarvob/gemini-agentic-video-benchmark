# Gemini Agentic Video Understanding Benchmark

[![Verify benchmark evidence](https://github.com/sarvob/gemini-agentic-video-benchmark/actions/workflows/verify.yml/badge.svg?branch=main)](https://github.com/sarvob/gemini-agentic-video-benchmark/actions/workflows/verify.yml)

Public evidence package for PaperEdits' exploratory comparison of Gemini 3.7 Flash agentic and static video-understanding modes.

PaperEdits maintains this repository and conducted the evaluation independently. It is not sponsored or endorsed by Google.

## Result in context

Six synthetic 10-minute fixtures were attempted and five produced valid pairs. Agentic processing found 18 of 20 short events versus 15 of 20 for static processing. Other quality results were mixed, one agentic output failed the frozen JSON contract, and agentic processing took 81.32% longer across valid pairs.

This small exploratory sample does not establish statistical significance, a general winner, or a comparison between Gemini and PaperEdits.

- [Read the full report](https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark)
- [Open the reproducibility hub](https://sarvob.github.io/gemini-agentic-video-benchmark/)
- [Choose a no-API-key reuse path](https://sarvob.github.io/gemini-agentic-video-benchmark/reuse.html)
- [Download the frozen v0.4 data bundle](https://github.com/sarvob/gemini-agentic-video-benchmark/releases/download/v0.4-exploratory/gemini-agentic-video-benchmark-v0.4-data.tar.gz) (`sha256:133a149964ed123296bfe157e5a1cfa47299fca1a9003caac81cdafd99fcb039`)
- [Read the canonical machine-readable aggregate](benchmark/final-results.json)
- [Download the flat CSV metric summary](https://sarvob.github.io/gemini-agentic-video-benchmark/final-results.csv)
- [Inspect the CSV Table Schema](https://sarvob.github.io/gemini-agentic-video-benchmark/final-results.schema.json)
- [Run dependency-free Python or Node result examples](examples/README.md)
- [Inspect the deterministic paired uncertainty analysis](benchmark/uncertainty-v0.4.md)
- [Read the output-contract failure analysis](https://sarvob.github.io/gemini-agentic-video-benchmark/output-contract-failure.html)
- [Read the temporal miss analysis](https://sarvob.github.io/gemini-agentic-video-benchmark/temporal-miss-analysis.html)
- [Read the quality and cost tradeoff report](https://sarvob.github.io/gemini-agentic-video-benchmark/quality-cost-tradeoff.html)
- [Publish a comparable result card](benchmark/result-card-v0.1.md)
- [Browse community results](https://sarvob.github.io/gemini-agentic-video-benchmark/community-results.html)
- [Review the publication package](benchmark/publication-package-v0.4.md)
- [Inspect the original protocol](benchmark/original-protocol-v0.1.md)
- [Copy citation metadata](CITATION.cff)
- [Copy the ready-to-use BibTeX citation](CITATION.bib)
- [Inspect machine-readable software metadata](codemeta.json)
- [Inspect the portable Data Package descriptor](datapackage.json)
- [Inspect the MLCommons Croissant 1.1 metadata](croissant.json)
- [Open the agent-oriented project index](llms.txt)
- [Contribute a reproduction or audit](CONTRIBUTING.md)
- [Read the governance and decision rules](GOVERNANCE.md)
- [Inspect the community reviewer registry](benchmark/community-reviewers-v0.1.json)
- [Propose and review a synthetic fixture](benchmark/annotation-review-guide-v0.1.md)
- [Browse the public fixture-expansion queue](https://github.com/sarvob/gemini-agentic-video-benchmark/issues?q=is%3Aissue%20is%3Aopen%20label%3Abenchmark%20label%3Aenhancement)
- [Re-audit the frozen screen-editing fixture](benchmark/reviews/synthetic-screen-01-review-checklist.md)
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

To audit the separate frozen release download, run `npm run verify:release`. This networked check downloads the public asset, verifies its SHA-256, confirms six ground-truth JSON files and eleven result JSON files, and then removes its temporary copy. You can avoid another download by passing an existing archive to `./scripts/verify-v0.4-release.sh path/to/archive.tar.gz`. Release download totals include maintainer verification and do not establish external adoption.

If you are independent of PaperEdits, report the tested commit, environment, command output, and any discrepancy through the [Benchmark reproduction form](https://github.com/sarvob/gemini-agentic-video-benchmark/issues/new?template=benchmark-reproduction.yml). A public GitHub username is sufficient; do not post a full name or email address. An accepted report can count as an external artifact reproduction under the [governance rules](GOVERNANCE.md), while a clone or maintainer-run check cannot.

## Repository map

- `benchmark/ground-truth/` — frozen fixture annotations
- `benchmark/reviews/` — deterministic local review anchors and human re-audit checklists for frozen fixtures
- `benchmark/annotation-review-guide-v0.1.md` — staged two-reviewer workflow for new synthetic fixtures
- `benchmark/proposals/` — machine-readable state for cases that are not yet frozen or counted as validated
- `benchmark/evidence-rules-*.json` — fixture-specific evidence checks
- `benchmark/prompt-v0.4.md` and `benchmark/protocol-v0.4.md` — active frozen protocol
- `benchmark/results/` — committed result artifacts and comparisons
- `benchmark/final-results.json` — canonical machine-readable five-pair aggregate, reproduced by the verifier
- `benchmark/final-results.csv` — deterministic flat metric summary for spreadsheets and lightweight analysis
- `final-results.schema.json` — Data Package Table Schema for the flat result summary
- `examples/` — dependency-free Python and Node examples for reading the flat result summary
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

`CITATION.cff` is the repository's canonical release metadata. Zenodo documents that `.zenodo.json` overrides and causes it to ignore `CITATION.cff`, so this repository intentionally omits `.zenodo.json` until Zenodo-specific fields are actually needed. DOI activation still requires an authorized connected Zenodo account; no deposit or DOI is claimed.

The annotated presentation proposal has a one-command local review package. On macOS with the documented dependencies, run `./scripts/prepare-presentation-01-review.sh`; it verifies locked files, regenerates the exact ignored video, checks its hash and duration, extracts six local checkpoint frames, verifies their dimensions and decoded RGB hashes, scores the reference candidate, and runs the offline verifier without a model call or upload.

The frozen `synthetic-screen-01` fixture also has a $0 re-audit package. Run `./scripts/prepare-screen-01-review.sh` to validate locked annotation inputs, regenerate the ignored video, verify six deterministic visual checkpoints, score the reference candidate, and run the offline verifier. The helper reports the frozen source hash and local hash separately because macOS system-speech audio and container bytes can vary; it does not mislabel a locally regenerated video as byte-identical to the annotated source. Preparing the packet is review readiness, not an accepted external review or adoption event.

## Independent reproduction

Use the **Benchmark reproduction** issue form to report a clean-clone verification, discrepancy, annotation audit, or independent extension. State your relationship to PaperEdits, if any, and whether your work is an artifact reproduction or a new model run.

Do not post API keys, private URLs, personal information, customer footage, or media you do not have the right to share. Issues are public and show the submitting account's public profile.

## License

Code and committed benchmark materials are provided under the [MIT License](LICENSE). The fixtures are synthetic and contain no real person or third-party media.
