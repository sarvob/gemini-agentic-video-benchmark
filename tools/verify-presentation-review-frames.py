#!/usr/bin/env python3
"""Verify decoded checkpoint pixels without depending on PNG encoder bytes."""

import hashlib
import json
import sys
from pathlib import Path

from PIL import Image


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: verify-presentation-review-frames.py REVIEW_LOCK REVIEW_DIR", file=sys.stderr)
        return 2

    lock_path = Path(sys.argv[1])
    review_dir = Path(sys.argv[2])
    lock = json.loads(lock_path.read_text(encoding="utf-8"))

    for checkpoint in lock["checkpointFrames"]:
        frame_path = review_dir / checkpoint["file"]
        with Image.open(frame_path) as image:
            rgb = image.convert("RGB")
            actual_size = [rgb.width, rgb.height]
            actual_hash = hashlib.sha256(rgb.tobytes()).hexdigest()

        if actual_size != checkpoint["pixelSize"]:
            raise SystemExit(
                f"Checkpoint size mismatch for {frame_path}: "
                f"expected {checkpoint['pixelSize']}, received {actual_size}"
            )
        if actual_hash != checkpoint["rgbSha256"]:
            raise SystemExit(
                f"Checkpoint RGB hash mismatch for {frame_path}: "
                f"expected {checkpoint['rgbSha256']}, received {actual_hash}"
            )
        print(f"PASS checkpoint RGB: {checkpoint['file']}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
