#!/usr/bin/env python3
"""Generate a rights-clear 10-minute synthetic presentation fixture."""

from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "tmp" / "gemini-benchmark" / "synthetic-presentation-01"
OUT = ROOT / "tmp" / "gemini-benchmark" / "synthetic-presentation-01.mp4"
INTERMEDIATE = OUT_DIR / "encoded-intermediate.mp4"
WIDTH, HEIGHT = 960, 540

TIMELINE = [
    (0, 52, "RESEARCH QUESTION", "Can a first cut preserve the finding and its caveat?"),
    (52, 54, "Q2 RESULT • 42%", "Visual-only event: the headline result appears."),
    (54, 120, "BASELINE", "Define the comparison before showing the method."),
    (120, 178, "METHOD", "Keep the sample definition and measurement window."),
    (178, 248, "RESULT CHART", "Compare 42% observed with the 35% baseline."),
    (248, 250, "LABEL CORRECTED", "Visual-only event: Q1 changes to Q2."),
    (250, 330, "TRADEOFF", "Speed improved, but review time did not."),
    (330, 400, "DECISION", "Keep the result, method, caveat, and next step."),
    (400, 402, "FINDING VERIFIED", "Cross-modal event: marker plus two tones."),
    (402, 510, "APPENDIX HOLD", "Long static reference slide adds no new evidence."),
    (510, 560, "SUMMARY", "Restate the finding once with its limitation."),
    (560, 600, "Q&A", "Stop after the final next-step sentence."),
]

NARRATION = """
This synthetic presentation tests whether an edit can preserve a finding without dropping its limitation. The target first cut is between ninety and one hundred twenty seconds. Keep the research question, the comparison, the method, the caveat, and the next step. Remove repeated framing and the long appendix hold.

The baseline is thirty-five percent. The observed second-quarter result is forty-two percent. That difference matters only inside the stated measurement window, so the edit must keep the method slide before interpreting the chart.

The sample is synthetic and the period is fixed. The first spoken label says quarter one, but that is a deliberate correction point. The chart and the later spoken sentence establish quarter two as the correct label. A useful edit preserves the correction without making the earlier mistake look like the final claim.

The tradeoff is important. Completion speed improved, but review time did not. The result should not be summarized as an overall productivity gain. Keep the caveat beside the headline number.

The decision is to retain the question, baseline, method, result, correction, tradeoff, and verified finding. The appendix hold adds no evidence and should be cut. End with one summary and the next step: repeat the measurement with a larger frozen sample before making a general claim.
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
    image = Image.new("RGB", (WIDTH, HEIGHT), "#071a26")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((50, 42, WIDTH - 50, HEIGHT - 42), radius=22, fill="#0e2b3c", outline="#22d3ee", width=3)
    draw.text((82, 72), f"PRESENTATION {index + 1:02d}", font=font(19), fill="#67e8f9")
    draw.text((82, 118), title, font=font(39), fill="white")
    draw.multiline_text((82, 180), detail, font=font(22), fill="#c8e7ef", spacing=10)

    baseline = 430
    for bar_index, value in enumerate([35, 42, 29]):
        left = 600 + bar_index * 88
        height = value * 3
        color = "#fbbf24" if bar_index == 1 else "#38bdf8"
        draw.rounded_rectangle((left, baseline - height, left + 52, baseline), radius=7, fill=color)
        draw.text((left + 5, baseline + 10), f"{value}%", font=font(16), fill="#e0f2fe")

    draw.text((82, 465), "PAPEREDITS BENCHMARK • SYNTHETIC • NO REAL PEOPLE", font=font(16), fill="#94a3b8")
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
    run("/usr/bin/say", "-v", "Samantha", "-r", "112", "-f", str(narration_text), "-o", str(narration_audio))

    run(
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-i", str(narration_audio),
        "-f", "lavfi", "-i", "sine=frequency=740:duration=0.30",
        "-f", "lavfi", "-i", "sine=frequency=1110:duration=0.25",
        "-filter_complex",
        "[1:a]apad,atrim=0:600[n];"
        "[2:a]adelay=176000|176000,volume=0.18[c];"
        "[2:a]adelay=400000|400000,volume=0.18[v1];"
        "[3:a]adelay=401000|401000,volume=0.18[v2];"
        "[n][c][v1][v2]amix=inputs=4:duration=longest:normalize=0,atrim=0:600[a]",
        "-map", "0:v", "-map", "[a]", "-map_metadata", "-1", "-t", "600",
        "-r", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "31", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k", "-threads", "1", "-fflags", "+bitexact",
        "-flags:v", "+bitexact", "-flags:a", "+bitexact", str(INTERMEDIATE),
    )
    # Normalize packet interleaving in a second copy-only mux. The encoded audio
    # and video streams are stable, while a combined one-pass mux may order
    # equally timestamped packets differently across runs.
    run(
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(INTERMEDIATE), "-map", "0:v:0", "-map", "0:a:0",
        "-c", "copy", "-map_metadata", "-1", "-movflags", "+faststart", str(OUT),
    )
    print(OUT)


if __name__ == "__main__":
    main()
