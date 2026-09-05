# Read the published results

These examples load the committed flat CSV with language built-ins only. They make no network requests, need no API key, upload no data, and incur no model charges.

From the repository root, run either example:

```bash
python3 examples/read-results.py
node examples/read-results.mjs
```

Both commands read `benchmark/final-results.csv` by default and print the same JSON summary for short-event recall and latency. Pass another local CSV path as the first argument to inspect a downloaded copy:

```bash
python3 examples/read-results.py path/to/final-results.csv
node examples/read-results.mjs path/to/final-results.csv
```

The examples preserve the metric direction explicitly: `agenticMinusStatic` is an absolute score or rate difference, while `agenticVsStaticPercent` is a relative efficiency difference. Review the [full report](https://paperedits.com/benchmarking/gemini-agentic-video-understanding-benchmark) and [canonical JSON aggregate](../benchmark/final-results.json) before drawing conclusions. Five valid pairs are exploratory evidence, not proof of a general winner.
