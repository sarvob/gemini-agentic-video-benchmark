# Paired uncertainty analysis — protocol v0.4

**Status:** exploratory; five valid synthetic pairs

This analysis quantifies how unstable the observed paired differences are. It does not establish statistical significance, practical significance, or general model superiority.

For each metric, the script enumerates all 3,125 ordered five-out-of-five paired bootstrap resamples with replacement and reports the 2.5th and 97.5th percentiles. It also enumerates all 32 paired sign assignments for an exact two-sided sign-flip test of the mean difference. Positive differences mean agentic minus static; whether positive is favorable depends on the metric.

## Results

| Metric | Better direction | Mean difference | 95% bootstrap percentile interval | Direction count + / 0 / − | Exact sign-flip p |
|---|---|---:|---:|---:|---:|
| Moment-retrieval F1 | Higher | −0.0333 | [−0.1333, +0.0667] | 1 / 2 / 2 | 1.0000 |
| Short-event recall | Higher | +0.1500 | [+0.0500, +0.2500] | 3 / 2 / 0 | 0.2500 |
| Rule-based evidence accuracy | Higher | −0.0667 | [−0.0833, −0.0333] | 0 / 1 / 4 | 0.1250 |
| Edit-decision macro F1 | Higher | +0.1326 | [−0.0578, +0.3230] | 3 / 0 / 2 | 0.3125 |
| Median boundary error | Lower | +0.20 s | [−1.60 s, +1.80 s] | 2 / 2 / 1 | 1.0000 |
| P90 boundary error | Lower | +1.20 s | [+0.20 s, +2.20 s] | 3 / 2 / 0 | 0.2500 |
| Planning latency | Lower | +21.851 s | [+14.715 s, +28.741 s] | 5 / 0 / 0 | 0.0625 |
| Paid-equivalent cost | Lower | +$0.015221 | [+$0.007664, +$0.022583] | 5 / 0 / 0 | 0.0625 |

## Readout

- Moment retrieval, edit-decision F1, and median boundary error have intervals that cross zero.
- Short-event recall favors agentic in three pairs and ties in two; the bootstrap interval is positive, but the exact sign-flip p-value is 0.25.
- Rule-based evidence accuracy favors static in four pairs and ties in one; its bootstrap interval is negative, but the exact sign-flip p-value is 0.125.
- Agentic latency and paid-equivalent cost are higher in all five pairs. With only five pairs, the smallest attainable two-sided sign-flip p-value is 0.0625.
- No metric meets a conventional two-sided 0.05 threshold in this analysis.

## Limits

- Exhaustively enumerating resamples removes Monte Carlo randomness; it does not overcome the sample size of five.
- Percentile bootstrap intervals can be unstable and discrete at this sample size.
- The sign-flip test relies on exchangeability under the null and evaluates the paired mean, not business usefulness.
- Metrics are correlated and no multiple-comparison adjustment was applied; p-values are descriptive diagnostics, not publication claims.
- The five pairs are synthetic and one frozen fixture attrited before pairing.
- Rule-based evidence accuracy is not blinded human semantic judgment; story coherence and cut-seam quality remain unmeasured.

Reproduce the JSON with `npm run analyze:uncertainty`. The public verifier recomputes the analysis and requires exact equality with `benchmark/uncertainty-v0.4.json`.
