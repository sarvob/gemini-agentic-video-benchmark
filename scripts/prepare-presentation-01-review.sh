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

check_hash 3862445b43f8fbafb42e27644cba4073798f67ccd07be71d2839c0d8f2c11037 tools/generate-gemini-video-presentation-01.py
check_hash fccba4787b5f9ab7a280732b3f80b1952c9ec83b0ba8dc131b3d21d2601ba75c benchmark/proposals/synthetic-presentation-01-ground-truth.json
check_hash 5e4ee206411d48de3e9e27b46bc38b2150731113c1e93bcf152d3b4b1113282e benchmark/evidence-rules-synthetic-presentation-01.json
check_hash 57c206046bea9680ddadf4bb473e129f47382387f230b8ce14c15ceb6ed33d8b benchmark/proposals/synthetic-presentation-01-perfect-candidate.json
check_hash 489d498ca726dbdb9876af186413669f71043563e492c451cc3f88b6af367ec1 tools/verify-presentation-review-frames.py

video_path=tmp/gemini-benchmark/synthetic-presentation-01.mp4
expected_video_hash=748649e5b7ca64f3c44f5256b283d613469f9c643ef5a5c97d82647c90603e54

generate_and_hash() {
  python3 tools/generate-gemini-video-presentation-01.py >/dev/null
  shasum -a 256 "$video_path" | awk '{print $1}'
}

first_video_hash=$(generate_and_hash)
if [ "$first_video_hash" != "$expected_video_hash" ]; then
  echo "First generated hash differed; retrying once before classifying the environment." >&2
  echo "Expected $expected_video_hash" >&2
  echo "Received $first_video_hash" >&2
fi

second_video_hash=$(generate_and_hash)
if [ "$second_video_hash" != "$expected_video_hash" ]; then
  echo "Generated video hash mismatch after retry." >&2
  echo "Expected $expected_video_hash" >&2
  echo "Received $second_video_hash" >&2
  exit 1
fi

third_video_hash=$(generate_and_hash)
if [ "$third_video_hash" != "$expected_video_hash" ]; then
  echo "Generated video did not remain stable on the confirmation run." >&2
  echo "Expected $expected_video_hash" >&2
  echo "Received $third_video_hash" >&2
  exit 1
fi
echo "PASS generated video hash on two consecutive runs"

duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$video_path")
if ! awk -v duration="$duration" 'BEGIN { exit !(duration >= 599.95 && duration <= 600.05) }'; then
  echo "Generated duration is outside 600.00 ± 0.05 seconds: $duration" >&2
  exit 1
fi
echo "PASS generated duration: $duration seconds"

review_dir=tmp/gemini-benchmark/synthetic-presentation-01-review
mkdir -p "$review_dir"

ffmpeg -hide_banner -loglevel error -y -ss 53 -i "$video_path" -frames:v 1 "$review_dir/0053-q2-result.png"
ffmpeg -hide_banner -loglevel error -y -ss 99.5 -i "$video_path" -frames:v 1 "$review_dir/0099-narration-end.png"
ffmpeg -hide_banner -loglevel error -y -ss 176.15 -i "$video_path" -frames:v 1 "$review_dir/0176-method-tone.png"
ffmpeg -hide_banner -loglevel error -y -ss 249 -i "$video_path" -frames:v 1 "$review_dir/0249-label-corrected.png"
ffmpeg -hide_banner -loglevel error -y -ss 401 -i "$video_path" -frames:v 1 "$review_dir/0401-finding-verified.png"
ffmpeg -hide_banner -loglevel error -y -ss 450 -i "$video_path" -frames:v 1 "$review_dir/0450-appendix-hold.png"
python3 tools/verify-presentation-review-frames.py \
  benchmark/proposals/synthetic-presentation-01-review-lock.json \
  "$review_dir"
echo "PASS local checkpoint dimensions and decoded RGB hashes: $review_dir"

npm run score -- \
  benchmark/proposals/synthetic-presentation-01-ground-truth.json \
  benchmark/proposals/synthetic-presentation-01-perfect-candidate.json \
  > "$review_dir/perfect-candidate-score.json"
echo "PASS perfect reference-candidate score"

npm run verify

echo "Review package ready. Inspect the generated video and frames independently before reading another review."
echo "No media was uploaded and no model or paid service was called."
