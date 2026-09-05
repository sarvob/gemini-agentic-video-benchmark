#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

for command_name in python3 ffmpeg ffprobe shasum npm; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

check_hash() {
  expected_hash=$1
  file_path=$2
  actual_hash=$(shasum -a 256 "$file_path" | awk '{print $1}')
  if [ "$actual_hash" != "$expected_hash" ]; then
    echo "Locked file mismatch: $file_path" >&2
    echo "Expected $expected_hash" >&2
    echo "Received $actual_hash" >&2
    exit 1
  fi
  echo "PASS locked file: $file_path"
}

check_hash b1d7a2eb8fbc2d2c2a63535878fca9e20d6bc6c318798286ddb5f05bbbb26bdd tools/generate-gemini-video-fixture.py
check_hash bef76bf7d1fe84e121fe90d97fd2e81e81710d8f8f2d559b25133aa0c462c733 benchmark/ground-truth/synthetic-screen-01.json
check_hash 604941dd4ea9ebbd10807f087d3baee9e8888f08ef0961ce9bd80f82f202f61a benchmark/evidence-rules-synthetic-screen-01.json
check_hash 7af34265df6e2f067f6328c0c8ef98b904a0a77f44f0ce62cd6ed88490b7c6a4 benchmark/testdata/perfect-candidate.json
check_hash 92d63c406c602f5093a0c57e2183562ac8e7f8097b610f8938acc1d8dc7b4661 tools/verify-screen-review-frames.py

video_path=tmp/gemini-benchmark/synthetic-screen-01.mp4
annotated_source_hash=1ed2ef8c8910f188ea6de2714704808dae1bf88d4d6e28237b0855901ff0a54f

python3 tools/generate-gemini-video-fixture.py >/dev/null
generated_hash=$(shasum -a 256 "$video_path" | awk '{print $1}')
echo "INFO annotated source hash: $annotated_source_hash"
echo "INFO locally generated hash: $generated_hash"
if [ "$generated_hash" != "$annotated_source_hash" ]; then
  echo "NOTE whole-file hash differs; macOS system speech and container bytes are not treated as deterministic."
fi

duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$video_path")
if ! awk -v duration="$duration" 'BEGIN { exit !(duration >= 599.95 && duration <= 600.05) }'; then
  echo "Generated duration is outside 600.00 ± 0.05 seconds: $duration" >&2
  exit 1
fi
echo "PASS generated duration: $duration seconds"

review_dir=tmp/gemini-benchmark/synthetic-screen-01-review
mkdir -p "$review_dir"

ffmpeg -hide_banner -loglevel error -y -ss 47.5 -i "$video_path" -frames:v 1 "$review_dir/0047-export-complete.png"
ffmpeg -hide_banner -loglevel error -y -ss 133.1 -i "$video_path" -frames:v 1 "$review_dir/0133-transcript-tone.png"
ffmpeg -hide_banner -loglevel error -y -ss 161.5 -i "$video_path" -frames:v 1 "$review_dir/0161-narration-ended.png"
ffmpeg -hide_banner -loglevel error -y -ss 287.5 -i "$video_path" -frames:v 1 "$review_dir/0287-cursor-misclick.png"
ffmpeg -hide_banner -loglevel error -y -ss 421.5 -i "$video_path" -frames:v 1 "$review_dir/0421-build-passed.png"
ffmpeg -hide_banner -loglevel error -y -ss 510.5 -i "$video_path" -frames:v 1 "$review_dir/0510-final-export.png"
python3 tools/verify-screen-review-frames.py benchmark/reviews/synthetic-screen-01-review-lock.json "$review_dir"
echo "PASS local checkpoint dimensions and decoded RGB hashes: $review_dir"

npm run score -- benchmark/ground-truth/synthetic-screen-01.json benchmark/testdata/perfect-candidate.json > "$review_dir/perfect-candidate-score.json"
echo "PASS perfect reference-candidate score"

npm run verify

echo "Review package ready. Inspect the generated video and frames independently before reading another review."
echo "No media was uploaded and no model or paid service was called."
