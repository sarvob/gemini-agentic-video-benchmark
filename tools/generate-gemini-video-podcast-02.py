#!/usr/bin/env python3
"""Generate a deterministic, rights-clear second 10-minute synthetic podcast fixture."""

from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "tmp" / "gemini-benchmark" / "synthetic-podcast-02"
OUT = ROOT / "tmp" / "gemini-benchmark" / "synthetic-podcast-02.mp4"
WIDTH, HEIGHT = 960, 540

TIMELINE = [
    (0, 46, "COLD OPEN", "Frame the disagreement and editing goal."),
    (46, 48, "REACTION BEAT", "A two-second visual reaction cue."),
    (48, 110, "CONTEXT", "Keep the premise without the repeated setup."),
    (110, 168, "GUEST • RETAKE", "Use the direct answer after the false start."),
    (168, 238, "DISAGREEMENT", "Preserve both positions and their reason."),
    (238, 239, "CAMERA SWITCH", "A one-second visual transition marker."),
    (239, 310, "CONCRETE EXAMPLE", "Connect the choice to an observable result."),
    (310, 376, "RESOLUTION", "Keep the synthesis, remove the second recap."),
    (376, 378, "MIX LOCKED", "Visible confirmation paired with two tones."),
    (378, 486, "ROOM TONE", "Long static hold without useful dialogue."),
    (486, 548, "TAKEAWAY", "Return to the rule and its tradeoff."),
    (548, 600, "OUTRO", "Close once without repeating the premise."),
]

HOST_A = """
This synthetic podcast asks how to cut a disagreement without flattening it. The target is ninety to one hundred twenty seconds. Keep the premise, the direct answer, both positions, the concrete example, and the final tradeoff. Remove repeated setup, the second recap, and the long room-tone hold.

The context is simple. One host values speed and the other values control. The edit should preserve why they disagree, not manufacture conflict. A short reaction beat can help pacing when it is connected to the spoken exchange.

The disagreement has a useful structure. State the first position, the second position, and the reason each person gives. The resolution should synthesize those reasons without pretending they became the same opinion.

The takeaway is a tradeoff. Automation can accelerate the first cut, while an editable timeline preserves control. End after that point and do not repeat the premise.
""".strip()

HOST_B = """
My first answer is vague, so I will restart. The direct answer is that speed matters most when the source is long, but control matters most when one visual or sound changes the meaning.

Here is the concrete example. A transcript can identify the right sentence while the camera is switching or a reaction is still unfolding. The useful edit keeps the sentence, checks the picture, and checks the sound before making the cut.

The mix-locked confirmation uses two tones with the visible marker. After that point, the room-tone hold adds no information and should be removed.
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


def draw_host(draw: ImageDraw.ImageDraw, left: int, color: str, label: str) -> None:
    draw.rounded_rectangle((left, 126, left + 190, 318), radius=28, fill="#172554", outline=color, width=5)
    draw.ellipse((left + 48, 154, left + 142, 248), fill="#243b73", outline=color, width=4)
    draw.ellipse((left + 72, 184, left + 84, 196), fill="#eff6ff")
    draw.ellipse((left + 106, 184, left + 118, 196), fill="#eff6ff")
    draw.arc((left + 70, 194, left + 120, 232), 20, 160, fill="#eff6ff", width=3)
    draw.text((left + 58, 270), label, font=font(18), fill=color)


def make_slide(index: int, title: str, detail: str) -> Path:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#07152e")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((46, 38, WIDTH - 46, HEIGHT - 38), radius=24, fill="#0d2148", outline="#38bdf8", width=3)
    draw_host(draw, 76, "#38bdf8", "HOST A")
    draw_host(draw, 694, "#fb7185", "HOST B")
    draw.rounded_rectangle((302, 92, 658, 348), radius=20, fill="#091a38", outline="#facc15", width=4)
    draw.text((350, 126), f"PODCAST CUT {index + 1:02d}", font=font(20), fill="#facc15")
    draw.text((342, 183), title, font=font(33), fill="white")
    draw.multiline_text((330, 250), detail, font=font(19), fill="#dbeafe", spacing=8)
    for bar in range(18):
        height = 8 + ((index * 4 + bar * 3) % 7) * 5
        left = 202 + bar * 32
        draw.rounded_rectangle((left, 421 - height, left + 14, 421 + height), radius=4, fill="#38bdf8" if bar % 2 == 0 else "#fb7185")
    draw.text((250, 474), "SYNTHETIC PODCAST • NO REAL PEOPLE OR THIRD-PARTY MEDIA", font=font(16), fill="#93c5fd")
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

    a_text, b_text = OUT_DIR / "host-a.txt", OUT_DIR / "host-b.txt"
    a_audio, b_audio = OUT_DIR / "host-a.aiff", OUT_DIR / "host-b.aiff"
    a_text.write_text(HOST_A + "\n")
    b_text.write_text(HOST_B + "\n")
    run("/usr/bin/say", "-v", "Samantha", "-r", "112", "-f", str(a_text), "-o", str(a_audio))
    run("/usr/bin/say", "-v", "Daniel", "-r", "112", "-f", str(b_text), "-o", str(b_audio))

    run(
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-i", str(a_audio), "-i", str(b_audio),
        "-f", "lavfi", "-i", "sine=frequency=680:duration=0.30",
        "-f", "lavfi", "-i", "sine=frequency=1020:duration=0.25",
        "-filter_complex",
        "[1:a]adelay=0|0,apad,atrim=0:600[a1];"
        "[2:a]adelay=106000|106000,apad,atrim=0:600[a2];"
        "[3:a]adelay=205000|205000,volume=0.20[r];"
        "[3:a]adelay=376000|376000,volume=0.20[m1];"
        "[4:a]adelay=377000|377000,volume=0.20[m2];"
        "[a1][a2][r][m1][m2]amix=inputs=5:duration=longest:normalize=0,atrim=0:600[a]",
        "-map", "0:v", "-map", "[a]", "-t", "600",
        "-r", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "31", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", str(OUT),
    )
    print(OUT)


if __name__ == "__main__":
    main()
