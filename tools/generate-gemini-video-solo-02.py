#!/usr/bin/env python3
"""Generate a deterministic, rights-clear second 10-minute synthetic solo fixture."""

from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "tmp" / "gemini-benchmark" / "synthetic-solo-02"
OUT = ROOT / "tmp" / "gemini-benchmark" / "synthetic-solo-02.mp4"
WIDTH, HEIGHT = 960, 540

TIMELINE = [
    (0, 48, "EDIT BRIEF", "Build a 90–120 second creator lesson."),
    (48, 50, "CURSOR HIGHLIGHT", "A brief visual cue marks the chosen line."),
    (50, 112, "HOOK • TAKE ONE", "Keep the result, remove the vague opening."),
    (112, 170, "SOURCE DEMO", "Show the input before explaining the decision."),
    (170, 171, "NOTIFICATION POP", "One-second visual interruption to detect."),
    (171, 240, "HOOK • RETAKE", "Use the specific outcome and clean delivery."),
    (240, 315, "DIAGRAM REVEAL", "Connect source evidence to the edit choice."),
    (315, 380, "EVIDENCE CHECK", "Verify speech, picture, and sound separately."),
    (380, 382, "PUBLISH READY", "Visible confirmation paired with two tones."),
    (382, 490, "LONG PAUSE", "Static hold with no new information."),
    (490, 548, "FINAL LESSON", "Keep the practical rule and its reason."),
    (548, 600, "EDITABLE EXPORT", "End with an editable timeline handoff."),
]

NARRATION = """
This is a second synthetic solo creator lesson. The requested edit is between ninety and one hundred twenty seconds. Keep the result, the source demonstration, the cleaner retake, and the final practical rule. Remove the vague opening, the interruption, and the long pause.

The first hook says that editing is better, but it does not explain better for whom or why. The useful line is specific: start from raw footage and preserve the moments that prove the point. A cursor highlight marks that line visually.

The source demonstration comes before the explanation. It shows the input, then the selection, then the effect of the decision. A notification briefly covers the frame. Detect it, but do not let it interrupt the final lesson.

The retake is cleaner. It begins with the outcome and avoids repeating the setup. The diagram reveal connects transcript meaning, visual evidence, and audio evidence to one edit choice. None of those signals is enough by itself.

The evidence check asks three separate questions. What was said, what was visible, and whether the sound was usable. A visible publish-ready marker appears with two tones. After that, a long static pause adds nothing and should be removed.

The final lesson is practical: choose the story first, then verify each kept range against the underlying media. End with an editable timeline so a creator can change the cut rather than starting over.
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
    image = Image.new("RGB", (WIDTH, HEIGHT), "#1b1027")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((52, 42, WIDTH - 52, HEIGHT - 42), radius=26, fill="#28163a", outline="#e879f9", width=4)
    draw.ellipse((92, 118, 286, 312), fill="#3b2252", outline="#f0abfc", width=5)
    draw.polygon([(189, 146), (156, 245), (222, 245)], fill="#f0abfc")
    draw.ellipse((174, 180, 204, 210), fill="#28163a")
    draw.text((335, 96), f"CREATOR CUT {index + 1:02d}", font=font(21), fill="#f0abfc")
    draw.text((335, 157), title, font=font(37), fill="white")
    draw.multiline_text((335, 244), detail, font=font(22), fill="#f5d0fe", spacing=9)
    for bar in range(20):
        height = 8 + ((index * 3 + bar * 5) % 8) * 4
        left = 112 + bar * 36
        draw.rounded_rectangle((left, 419 - height, left + 15, 419 + height), radius=4, fill="#c084fc")
    draw.text((275, 472), "SYNTHETIC SOLO CREATOR • NO REAL PERSON", font=font(17), fill="#c4b5fd")
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
    run("/usr/bin/say", "-v", "Samantha", "-r", "116", "-f", str(narration_text), "-o", str(narration_audio))

    run(
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-i", str(narration_audio),
        "-f", "lavfi", "-i", "sine=frequency=720:duration=0.30",
        "-f", "lavfi", "-i", "sine=frequency=1080:duration=0.25",
        "-filter_complex",
        "[1:a]apad,atrim=0:600[n];"
        "[2:a]adelay=209000|209000,volume=0.20[r];"
        "[2:a]adelay=380000|380000,volume=0.20[p1];"
        "[3:a]adelay=381000|381000,volume=0.20[p2];"
        "[n][r][p1][p2]amix=inputs=4:duration=longest:normalize=0,atrim=0:600[a]",
        "-map", "0:v", "-map", "[a]", "-t", "600",
        "-r", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "31", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", str(OUT),
    )
    print(OUT)


if __name__ == "__main__":
    main()
