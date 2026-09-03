#!/usr/bin/env python3
"""Generate the deterministic, rights-clear second 10-minute screen fixture."""

from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "tmp" / "gemini-benchmark" / "synthetic-screen-02"
OUT = ROOT / "tmp" / "gemini-benchmark" / "synthetic-screen-02.mp4"
WIDTH, HEIGHT = 960, 540

TIMELINE = [
    (0, 50, "BRIEF AND ASSETS", "Plan a 90–120 second tutorial from local media."),
    (50, 51, "EXPORT COMPLETE", "Visual-only event: one-second confirmation."),
    (51, 115, "ROUGH SELECTS", "Mark useful explanations before trimming."),
    (115, 175, "TRANSCRIPT CLEANUP", "Remove filler without changing the claim."),
    (175, 235, "OPEN WITH RESULT", "Lead with the visible outcome."),
    (235, 295, "PROBLEM DECISION OUTCOME", "Build a three-part narrative."),
    (295, 296, "CURSOR MISCLICK", "Visual-only event: the audio track is muted."),
    (296, 360, "RESTORE AUDIO", "Undo the mistake and verify sync."),
    (360, 419, "VISUAL SUPPORT", "Place proof over the matching spoken claim."),
    (419, 421, "BUILD PASSED", "Cross-modal event: confirmation plus two tones."),
    (421, 515, "REVIEW HOLD", "Long repeated review with no new action."),
    (515, 600, "FINAL EXPORT", "Render the approved vertical deliverable."),
]

NARRATION = """
This synthetic walkthrough shows a second local editing workflow. The finished tutorial should be between ninety and one hundred twenty seconds. Keep the useful explanation, the proof on screen, and the recovery from one editing mistake. The source media stays on the local machine.

Start with rough selects. Mark the lines that explain the editing problem before shortening anything. Transcript cleanup should remove filler and repeated setup without changing the claim. A first cut should still make sense when someone sees the project for the first time.

Open with the result. Show the visible outcome before listing every tool setting. Then arrange the explanation as problem, decision, and outcome. The problem tells the viewer what failed. The decision explains the editing choice. The outcome shows evidence that the choice worked.

During the edit, an accidental cursor action mutes the audio track. Undo the action, restore the track, and verify that speech and picture remain synchronized. This warning is brief but important. A useful editor must notice it even though it lasts one second.

Add visual support only where the screen proves the spoken point. Keep captions away from controls and place them while the matching words are heard. When the build passes, verify both the confirmation screen and the two tones.

Review the cut for clipped words, repeated frames, missing context, and broken synchronization. The long review hold contains no new action after its opening label, so most of it should be removed. Finish with the final export stage and keep the plan editable.
""".strip()


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def font(size: int):
    for candidate in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def make_slide(index: int, title: str, detail: str) -> Path:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#171225")
    draw = ImageDraw.Draw(image)
    draw.rectangle((58, 52, WIDTH - 58, HEIGHT - 52), fill="#261b3c", outline="#b76cff", width=4)
    draw.text((92, 105), f"PASS {index + 1:02d}", font=font(24), fill="#d2a8ff")
    draw.text((92, 165), title, font=font(43), fill="white")
    draw.multiline_text((92, 255), detail, font=font(25), fill="#ddd2ea", spacing=12)
    draw.text((92, HEIGHT - 105), "PAPEREDITS BENCHMARK • SYNTHETIC FIXTURE 02", font=font(17), fill="#a18daf")
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
        "-f", "lavfi", "-i", "sine=frequency=660:duration=0.35",
        "-f", "lavfi", "-i", "sine=frequency=990:duration=0.25",
        "-filter_complex",
        "[1:a]apad,atrim=0:600[n];"
        "[2:a]adelay=149000|149000,volume=0.20[b1];"
        "[2:a]adelay=419000|419000,volume=0.20[b2];"
        "[3:a]adelay=420000|420000,volume=0.20[b3];"
        "[n][b1][b2][b3]amix=inputs=4:duration=longest:normalize=0,atrim=0:600[a]",
        "-map", "0:v", "-map", "[a]", "-t", "600",
        "-r", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "31", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", str(OUT),
    )
    print(OUT)


if __name__ == "__main__":
    main()
