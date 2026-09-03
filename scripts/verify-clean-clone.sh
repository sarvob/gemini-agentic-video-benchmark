#!/usr/bin/env bash
set -euo pipefail

npm ci
npm run build:huggingface
git diff --exit-code -- huggingface/data
npm run verify
