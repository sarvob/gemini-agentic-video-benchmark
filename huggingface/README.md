---
license: mit
task_categories:
- video-classification
tags:
- video
- benchmark
- agentic-ai
- reproducibility
pretty_name: Gemini Agentic Video Understanding Benchmark
size_categories:
- n<1K
configs:
- config_name: fixtures
  default: true
  data_files:
  - split: test
    path: data/fixtures.jsonl
- config_name: results
  data_files:
  - split: test
    path: data/results.jsonl
---

# Gemini Agentic Video Understanding Benchmark

Viewer-ready metadata and result tables for PaperEdits' exploratory comparison of Gemini 3.7 Flash agentic and static video-understanding modes.

PaperEdits maintains this package and conducted the evaluation independently. It is not sponsored or endorsed by Google. The package is staged for a future Hugging Face dataset repository; it has not yet been published there.

## Contents

- `fixtures` contains one row for each of the six synthetic 10-minute fixtures, including rights declarations, source hashes, and paths to frozen annotations.
- `results` contains the eleven committed v0.4 attempts: five valid agentic/static pairs and one invalid agentic output. Null metrics mean the output did not pass the frozen JSON contract.

The generated videos are not distributed in this package. The fixture table sets `media_included` to `false`; the public repository includes deterministic generators and all committed evidence needed for the $0 verifier.

## Intended use

Use these tables to inspect the exploratory results, audit the protocol, or locate the corresponding source artifacts in the public repository. Do not treat this small synthetic sample as statistically significant, as a general model ranking, or as a comparison between Gemini and PaperEdits.

## Rebuild and verify

From the public repository root:

```bash
npm ci
npm run build:huggingface
npm run verify
```

The manifest builder reads only committed JSON and writes deterministic JSONL. It does not call a model, upload data, or require credentials.

## Source and citation

- Full evidence repository: https://github.com/sarvob/gemini-agentic-video-benchmark
- Public report: https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark
- Citation metadata: https://github.com/sarvob/gemini-agentic-video-benchmark/blob/main/CITATION.cff

## Limitations and privacy

All fixtures are synthetic and contain no real people or third-party media. Result rows include the model name and token accounting but no API keys, private URLs, user email addresses, or raw model responses. See the source artifacts for per-run limitations.
