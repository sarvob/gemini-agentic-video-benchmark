#!/usr/bin/env python3
"""Generate one deterministic, rights-clear 10-minute screen-demo fixture."""

from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "tmp" / "gemini-benchmark" / "synthetic-screen-01"
OUT = ROOT / "tmp" / "gemini-benchmark" / "synthetic-screen-01.mp4"
WIDTH, HEIGHT = 960, 540

TIMELINE = [
    (0, 47, "PROJECT SETUP", "Create a 90-second tutorial from this recording."),
    (47, 48, "EXPORT COMPLETE", "Visual-only event: green confirmation toast."),
    (48, 120, "IMPORT MEDIA", "Bring the recording into the local workspace."),
    (120, 180, "TRANSCRIPT CLEANUP", "Remove repetition while preserving meaning."),
    (180, 240, "SELECT THE HOOK", "Keep the concrete result before the setup."),
    (240, 287, "BUILD THE STORY", "Arrange problem, decision, and outcome."),
    (287, 288, "CURSOR MISCLICK", "Visual-only event: accidental destructive action."),
    (288, 360, "RESTORE AND CONTINUE", "Undo the mistake and verify the timeline."),
    (360, 421, "CAPTIONS", "Correct timing and keep text away from controls."),
    (421, 423, "BUILD PASSED", "Cross-modal event: confirmation plus two tones."),
    (423, 510, "QUALITY CHECK", "Inspect cut seams, frozen frames, and clipped words."),
    (510, 600, "FINAL EXPORT", "Render the approved vertical version locally."),
]

NARRATION = """
This synthetic tutorial demonstrates a local video editing workflow. The goal is to create a short, clear tutorial from a longer screen recording. First, create the project and state the output constraint. The finished edit should be between ninety and one hundred twenty seconds. It should retain the main explanation and remove repeated setup.

Next, import the source recording. The source remains on the local machine. Inspect the transcript before changing the timeline. Repeated phrases are candidates for compression, but context needed to understand the result must stay. A good first cut is not simply the shortest version. It preserves the problem, the decision, and the outcome.

Now select the hook. The strongest opening shows the useful result before explaining every configuration detail. Keep the sentence that says what changed. Remove the false start immediately before it. Do not cut through the final consonant of the retained sentence. Leave a small amount of room tone at the join.

Build the story in three parts. Begin with the editing problem. Continue with the choice that solved it. End with evidence that the workflow succeeded. If a section repeats the same point without adding evidence, compress it. If a screen action proves a spoken claim, mark it as visual support.

During the timeline edit, an accidental cursor action removes a selected block. Undo the mistake, restore the block, and verify that the surrounding clips remain in their original order. This brief visual event is important even though it lasts only one second.

Add captions after the narrative order is stable. Captions should appear while the words are spoken, remain readable, and avoid covering important controls. The build confirmation is both visible and audible. It is a useful checkpoint because it requires evidence from more than one modality.

Finally, inspect every cut seam. Check for clipped words, fused sentences, frozen frames, black frames, and duplicated syllables. Confirm the target duration and required ordering. Export the approved vertical version. The result is a first cut that remains editable rather than a flattened summary.
""".strip()


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def font(size: int):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def make_slide(index: int, title: str, detail: str) -> Path:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#101827")
    draw = ImageDraw.Draw(image)
    draw.rectangle((58, 52, WIDTH - 58, HEIGHT - 52), fill="#17243a", outline="#4f8cff", width=4)
    draw.text((92, 105), f"STEP {index + 1:02d}", font=font(24), fill="#78a9ff")
    draw.text((92, 165), title, font=font(46), fill="white")
    draw.multiline_text((92, 255), detail, font=font(26), fill="#c9d6eb", spacing=12)
    draw.text((92, HEIGHT - 105), "PAPEREDITS BENCHMARK • SYNTHETIC FIXTURE", font=font(17), fill="#8291aa")
    path = OUT_DIR / f"slide-{index:02d}.png"
    image.save(path)
    return path


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    slides = [make_slide(i, title, detail) for i, (_, _, title, detail) in enumerate(TIMELINE)]
    concat = OUT_DIR / "slides.txt"
    lines = []
    for slide, (start, end, _, _) in zip(slides, TIMELINE):
        lines.extend([f"file '{slide}'", f"duration {end - start}"])
    lines.append(f"file '{slides[-1]}'")
    concat.write_text("\n".join(lines) + "\n")

    narration_text = OUT_DIR / "narration.txt"
    narration_audio = OUT_DIR / "narration.aiff"
    narration_text.write_text(NARRATION + "\n")
    run("/usr/bin/say", "-v", "Samantha", "-r", "115", "-f", str(narration_text), "-o", str(narration_audio))

    run(
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-i", str(narration_audio),
        "-f", "lavfi", "-i", "sine=frequency=880:duration=0.35",
        "-f", "lavfi", "-i", "sine=frequency=1320:duration=0.25",
        "-filter_complex",
        "[1:a]apad,atrim=0:600[n];"
        "[2:a]adelay=133000|133000,volume=0.20[b1];"
        "[2:a]adelay=421000|421000,volume=0.20[b2];"
        "[3:a]adelay=422000|422000,volume=0.20[b3];"
        "[n][b1][b2][b3]amix=inputs=4:duration=longest:normalize=0,atrim=0:600[a]",
        "-map", "0:v", "-map", "[a]", "-t", "600",
        "-r", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "31", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", str(OUT),
    )
    print(OUT)


if __name__ == "__main__":
    main()
