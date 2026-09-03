#!/usr/bin/env python3
"""Generate a deterministic, rights-clear 10-minute synthetic solo-creator fixture."""

from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "tmp" / "gemini-benchmark" / "synthetic-solo-01"
OUT = ROOT / "tmp" / "gemini-benchmark" / "synthetic-solo-01.mp4"
WIDTH, HEIGHT = 960, 540

TIMELINE = [
    (0, 55, "INTRO BRIEF", "Build a 90–120 second solo tutorial."),
    (55, 56, "TITLE FLASH", "One-second visual title confirmation."),
    (56, 120, "CLAIM • TAKE ONE", "Keep the clear claim and remove the false start."),
    (120, 180, "TRANSCRIPT REVIEW", "Compress filler while preserving the reason."),
    (180, 240, "HOOK • RETAKE", "Use the concrete outcome as the opening."),
    (240, 300, "WORKED EXAMPLE", "Connect the problem, decision, and outcome."),
    (300, 301, "FRAME DROP", "One-second visual defect marker."),
    (301, 360, "RECOVER TAKE", "Resume after the defect without losing context."),
    (360, 430, "CAPTION SAFE ZONE", "Keep text timed and clear of controls."),
    (430, 432, "AUDIO VERIFIED", "Visible confirmation with two tones."),
    (432, 520, "SILENT HOLD", "Long static hold with no new information."),
    (520, 600, "OUTRO EXPORT", "Close with the result and editable export."),
]

NARRATION = """
This is a synthetic solo creator recording. The goal is a short tutorial between ninety and one hundred twenty seconds. Keep the strongest explanation and the visual proof. Remove repeated setup, filler, and the long silent hold. Everything remains on the local machine.

The first take begins with a false start. The speaker repeats the claim and then gives the clear version. Keep the clear claim. Remove the repeated opening without clipping the first useful word. Transcript review should preserve the reason behind the recommendation.

The retake gives a better hook. It starts with the concrete outcome and then explains how the result was produced. Use that as the opening. The worked example should follow problem, decision, and outcome so the viewer can understand what changed and why.

A one-second frame-drop marker appears during the example. It has no spoken narration and should not become part of the final story, but the defect must still be detected. Resume with the recovery take and keep enough context to make the next sentence understandable.

Captions belong inside the safe zone and should appear while the matching words are heard. Do not cover controls. The audio verification is both visible and audible because two tones accompany the confirmation screen.

After verification, a long silent hold adds no new information. Remove it. Close with the outcome, confirm the target duration, and produce an editable export rather than a flattened summary.
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
    image = Image.new("RGB", (WIDTH, HEIGHT), "#0f2022")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((55, 45, WIDTH - 55, HEIGHT - 45), radius=24, fill="#163437", outline="#51d6c2", width=4)
    draw.ellipse((105, 120, 285, 300), fill="#244e52", outline="#7ce8d8", width=5)
    draw.ellipse((160, 165, 185, 190), fill="#d5fff8")
    draw.ellipse((205, 165, 230, 190), fill="#d5fff8")
    draw.arc((155, 180, 235, 250), 20, 160, fill="#d5fff8", width=4)
    for bar in range(7):
        height = 18 + ((index + bar * 3) % 5) * 9
        left = 110 + bar * 24
        draw.rounded_rectangle((left, 350 - height, left + 12, 350 + height), radius=5, fill="#51d6c2")
    draw.text((340, 105), f"SOLO PASS {index + 1:02d}", font=font(22), fill="#7ce8d8")
    draw.text((340, 165), title, font=font(39), fill="white")
    draw.multiline_text((340, 250), detail, font=font(23), fill="#d1eeea", spacing=10)
    draw.rounded_rectangle((95, 430, WIDTH - 95, 478), radius=12, fill="#0b1718")
    draw.text((120, 441), "SYNTHETIC SOLO CREATOR • NO REAL PERSON", font=font(18), fill="#91aaa7")
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
        "-f", "lavfi", "-i", "sine=frequency=740:duration=0.35",
        "-f", "lavfi", "-i", "sine=frequency=1110:duration=0.25",
        "-filter_complex",
        "[1:a]apad,atrim=0:600[n];"
        "[2:a]adelay=151000|151000,volume=0.20[b1];"
        "[2:a]adelay=430000|430000,volume=0.20[b2];"
        "[3:a]adelay=431000|431000,volume=0.20[b3];"
        "[n][b1][b2][b3]amix=inputs=4:duration=longest:normalize=0,atrim=0:600[a]",
        "-map", "0:v", "-map", "[a]", "-t", "600",
        "-r", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "31", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", str(OUT),
    )
    print(OUT)


if __name__ == "__main__":
    main()
