#!/usr/bin/env python3
"""Generate a deterministic, rights-clear 10-minute synthetic podcast fixture."""

from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "tmp" / "gemini-benchmark" / "synthetic-podcast-01"
OUT = ROOT / "tmp" / "gemini-benchmark" / "synthetic-podcast-01.mp4"
WIDTH, HEIGHT = 960, 540

TIMELINE = [
    (0, 50, "COLD OPEN", "Two hosts frame the editing problem."),
    (50, 52, "REACTION CUT", "Two-second visual reaction worth preserving."),
    (52, 115, "SETUP", "Define the source footage and desired outcome."),
    (115, 175, "FALSE START", "A repeated answer should be compressed."),
    (175, 235, "CORE INSIGHT", "The guest gives the clearest explanation."),
    (235, 236, "CAMERA GLITCH", "One-second visual defect with no speech."),
    (236, 310, "WORKED EXAMPLE", "Turn one raw exchange into a concise scene."),
    (310, 375, "HOST SUMMARY", "Keep the causal link, remove the recap."),
    (375, 377, "SYNC CONFIRMED", "Visible confirmation paired with two tones."),
    (377, 475, "DEAD AIR", "Long hold with no useful dialogue."),
    (475, 540, "TAKEAWAY", "Return to the decision and measurable result."),
    (540, 600, "OUTRO", "Close without repeating the opening."),
]

HOST_A = """
We recorded a synthetic two-host podcast to test long-form editing. The goal is a coherent cut between ninety and one hundred twenty seconds. Keep the strongest exchange, the brief reaction, and the final takeaway. Remove repetition, dead air, and the visual glitch.

The source looks simple, but the useful moments are spread apart. A strong edit needs the setup, the core insight, and enough of the example to preserve cause and effect. It should not keep every sentence just because the transcript is clean.

Here is the host summary. The best cut explains what changed and why, then moves on. The repeated recap adds no new information. Captions should remain inside the safe zone and follow the active speaker.

The takeaway is concrete. Select evidence from speech, sound, and picture separately before deciding what belongs in the story. Close once the result is clear. Do not repeat the opening.
""".strip()

HOST_B = """
The first answer starts badly, so I will restart. The first answer starts badly. The clear version is this: transcript meaning finds the idea, but visual and audio evidence decide whether the take is usable.

The core insight is that editing is not summarization. A summary can mention the right point while choosing the wrong frame, clipping a reaction, or leaving in a long pause. The final sequence has to preserve meaning and also work as media.

In the worked example, the raw exchange contains a useful question, a direct answer, and a short reaction. Keep those in order. Remove the camera glitch and the later dead air. The sync confirmation matters because the two tones line up with the visible marker.
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


def avatar(draw: ImageDraw.ImageDraw, center_x: int, color: str, label: str) -> None:
    draw.ellipse((center_x - 82, 122, center_x + 82, 286), fill="#1d2b45", outline=color, width=5)
    draw.ellipse((center_x - 30, 162, center_x - 10, 182), fill="#eef4ff")
    draw.ellipse((center_x + 10, 162, center_x + 30, 182), fill="#eef4ff")
    draw.arc((center_x - 38, 180, center_x + 38, 242), 20, 160, fill="#eef4ff", width=4)
    draw.text((center_x - 54, 304), label, font=font(19), fill=color)


def make_slide(index: int, title: str, detail: str) -> Path:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#111827")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((42, 36, WIDTH - 42, HEIGHT - 36), radius=24, fill="#17213a", outline="#64748b", width=3)
    avatar(draw, 205, "#60a5fa", "HOST A")
    avatar(draw, 755, "#f59e0b", "HOST B")
    draw.rounded_rectangle((330, 92, 630, 340), radius=20, fill="#0b1220", outline="#a78bfa", width=4)
    draw.text((370, 126), f"PODCAST PASS {index + 1:02d}", font=font(19), fill="#a78bfa")
    draw.text((365, 184), title, font=font(31), fill="white")
    draw.multiline_text((358, 242), detail, font=font(18), fill="#dbeafe", spacing=8)
    for bar in range(18):
        height = 7 + ((index * 5 + bar * 7) % 7) * 4
        left = 200 + bar * 32
        draw.rounded_rectangle((left, 414 - height, left + 14, 414 + height), radius=4, fill="#a78bfa")
    draw.text((265, 468), "SYNTHETIC HOSTS • NO REAL PEOPLE OR THIRD-PARTY MEDIA", font=font(16), fill="#94a3b8")
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

    host_a_text = OUT_DIR / "host-a.txt"
    host_b_text = OUT_DIR / "host-b.txt"
    host_a_audio = OUT_DIR / "host-a.aiff"
    host_b_audio = OUT_DIR / "host-b.aiff"
    host_a_text.write_text(HOST_A + "\n")
    host_b_text.write_text(HOST_B + "\n")
    run("/usr/bin/say", "-v", "Samantha", "-r", "112", "-f", str(host_a_text), "-o", str(host_a_audio))
    run("/usr/bin/say", "-v", "Daniel", "-r", "112", "-f", str(host_b_text), "-o", str(host_b_audio))

    run(
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-i", str(host_a_audio), "-i", str(host_b_audio),
        "-f", "lavfi", "-i", "sine=frequency=660:duration=0.30",
        "-f", "lavfi", "-i", "sine=frequency=990:duration=0.25",
        "-filter_complex",
        "[1:a]adelay=0|0,apad,atrim=0:600[a1];"
        "[2:a]adelay=112000|112000,apad,atrim=0:600[a2];"
        "[3:a]adelay=374000|374000,volume=0.20[t1];"
        "[4:a]adelay=375000|375000,volume=0.20[t2];"
        "[a1][a2][t1][t2]amix=inputs=4:duration=longest:normalize=0,atrim=0:600[a]",
        "-map", "0:v", "-map", "[a]", "-t", "600",
        "-r", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "31", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", str(OUT),
    )
    print(OUT)


if __name__ == "__main__":
    main()
