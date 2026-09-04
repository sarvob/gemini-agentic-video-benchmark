#!/usr/bin/env bash
set -euo pipefail

npm ci --no-audit --no-fund
npm run build:huggingface
git diff --exit-code -- huggingface/data
npm run verify
npm run preflight:result-card -- benchmark/result-card-example-v0.1.json
