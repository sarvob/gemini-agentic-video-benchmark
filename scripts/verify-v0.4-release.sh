#!/usr/bin/env sh
set -eu

release_url="https://github.com/sarvob/gemini-agentic-video-benchmark/releases/download/v0.4-exploratory/gemini-agentic-video-benchmark-v0.4-data.tar.gz"
expected_sha256="133a149964ed123296bfe157e5a1cfa47299fca1a9003caac81cdafd99fcb039"
expected_ground_truth=6
expected_results=11
temporary_directory=""

cleanup() {
  if [ -n "$temporary_directory" ]; then
    case "$temporary_directory" in
      */gavb-release.*) rm -rf -- "$temporary_directory" ;;
      *) printf '%s\n' "Refusing to remove unexpected temporary path: $temporary_directory" >&2 ;;
    esac
  fi
}
trap cleanup EXIT HUP INT TERM

if [ "$#" -gt 1 ]; then
  printf '%s\n' "Usage: $0 [existing-release-archive]" >&2
  exit 2
fi

if [ "$#" -eq 1 ]; then
  archive_path=$1
else
  command -v curl >/dev/null 2>&1 || { printf '%s\n' "Missing required command: curl" >&2; exit 1; }
  temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/gavb-release.XXXXXX")
  archive_path="$temporary_directory/gemini-agentic-video-benchmark-v0.4-data.tar.gz"
  printf '%s\n' "Downloading the frozen v0.4 release asset for verification..."
  curl -fsSL --retry 3 "$release_url" -o "$archive_path"
fi

[ -f "$archive_path" ] || { printf '%s\n' "Archive not found: $archive_path" >&2; exit 1; }
command -v tar >/dev/null 2>&1 || { printf '%s\n' "Missing required command: tar" >&2; exit 1; }

if command -v sha256sum >/dev/null 2>&1; then
  actual_sha256=$(sha256sum "$archive_path" | awk '{print $1}')
elif command -v shasum >/dev/null 2>&1; then
  actual_sha256=$(shasum -a 256 "$archive_path" | awk '{print $1}')
else
  printf '%s\n' "Missing required command: sha256sum or shasum" >&2
  exit 1
fi

if [ "$actual_sha256" != "$expected_sha256" ]; then
  printf '%s\n' "Release archive SHA-256 mismatch." >&2
  exit 1
fi

member_list=$(tar -tzf "$archive_path")
ground_truth_count=$(printf '%s\n' "$member_list" | grep -Ec '/benchmark/ground-truth/[^/]+\.json$' || true)
result_count=$(printf '%s\n' "$member_list" | grep -Ec '/benchmark/results/[^/]+\.json$' || true)

if [ "$ground_truth_count" -ne "$expected_ground_truth" ] || [ "$result_count" -ne "$expected_results" ]; then
  printf '%s\n' "Release member count mismatch: ground_truth=$ground_truth_count results=$result_count" >&2
  exit 1
fi

for required_member in \
  "gemini-agentic-video-benchmark-v0.4-data/CITATION.cff" \
  "gemini-agentic-video-benchmark-v0.4-data/LICENSE" \
  "gemini-agentic-video-benchmark-v0.4-data/benchmark/config.json" \
  "gemini-agentic-video-benchmark-v0.4-data/benchmark/fixtures.json" \
  "gemini-agentic-video-benchmark-v0.4-data/benchmark/results/five-pair-final-aggregate-v0.4.md"
do
  printf '%s\n' "$member_list" | grep -Fx "$required_member" >/dev/null || {
    printf '%s\n' "Release archive is missing: $required_member" >&2
    exit 1
  }
done

printf '%s\n' "PASS frozen v0.4 release archive"
printf '%s\n' "SHA-256: $actual_sha256"
printf '%s\n' "Ground-truth JSON files: $ground_truth_count"
printf '%s\n' "Result JSON files: $result_count"
