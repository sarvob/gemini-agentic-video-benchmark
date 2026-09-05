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

check_hash d81a037a651b2b9eed5d0c64f5c52dd54b21c7099c31f1befcc6484ad8dde16c tools/generate-gemini-video-fixture-02.py
check_hash 3ef2adce6458fceef32b2f662e6146ea370366fcc474e7c1059e3cca0657d6ab benchmark/ground-truth/synthetic-screen-02.json
check_hash a6f9b0b268f4c4b982e9569a951238b01d028d9dd18b7e28695fb869ff5431e0 benchmark/evidence-rules-synthetic-screen-02.json
check_hash cb548f5317c27d74ba6ee288d365f0488526c36c6c15883dbaf6c7797c0ed7b2 benchmark/testdata/perfect-candidate-screen-02.json
check_hash 92d63c406c602f5093a0c57e2183562ac8e7f8097b610f8938acc1d8dc7b4661 tools/verify-screen-review-frames.py

video_path=tmp/gemini-benchmark/synthetic-screen-02.mp4
annotated_source_hash=4e932f158ea54303d80c2719d7d7a8f2ebdb2a0456239803fe785b2a89989904

python3 tools/generate-gemini-video-fixture-02.py >/dev/null
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

review_dir=tmp/gemini-benchmark/synthetic-screen-02-review
mkdir -p "$review_dir"

ffmpeg -hide_banner -loglevel error -y -ss 50.5 -i "$video_path" -frames:v 1 "$review_dir/0050-export-complete.png"
ffmpeg -hide_banner -loglevel error -y -ss 117.9 -i "$video_path" -frames:v 1 "$review_dir/0117-narration-ended.png"
ffmpeg -hide_banner -loglevel error -y -ss 149.1 -i "$video_path" -frames:v 1 "$review_dir/0149-cleanup-tone.png"
ffmpeg -hide_banner -loglevel error -y -ss 295.5 -i "$video_path" -frames:v 1 "$review_dir/0295-cursor-misclick.png"
ffmpeg -hide_banner -loglevel error -y -ss 419.5 -i "$video_path" -frames:v 1 "$review_dir/0419-build-passed.png"
ffmpeg -hide_banner -loglevel error -y -ss 515.5 -i "$video_path" -frames:v 1 "$review_dir/0515-final-export.png"
python3 tools/verify-screen-review-frames.py benchmark/reviews/synthetic-screen-02-review-lock.json "$review_dir"
echo "PASS local checkpoint dimensions and decoded RGB hashes: $review_dir"

npm run score -- benchmark/ground-truth/synthetic-screen-02.json benchmark/testdata/perfect-candidate-screen-02.json > "$review_dir/perfect-candidate-score.json"
echo "PASS perfect reference-candidate score"

npm run verify

echo "Review package ready. Inspect the generated video and frames independently before reading another review."
echo "No media was uploaded and no model or paid service was called."
