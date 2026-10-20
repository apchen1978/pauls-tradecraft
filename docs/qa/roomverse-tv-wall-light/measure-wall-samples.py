"""Reproduce the fixed wall-patch RGB / relative-luminance samples.

Run from the repository root after capture-after.mjs has finished:
  python docs/qa/roomverse-tv-wall-light/measure-wall-samples.py
The screen-space projection matches the fixed camera and canvas dimensions used
by the paired baseline/after capture script. This is a rendered-pixel proxy,
not illuminance or physical color-temperature measurement.
"""
from pathlib import Path
import csv
import math
from PIL import Image

ROOT = Path("docs/qa/roomverse-tv-wall-light")
MOODS = ("rain", "family", "tech", "chic", "slow", "tv")
VIEWS = ("window", "tv")
WIDTHS = (1440, 390)
SURFACES = {
    "upper": {
        "window": (1.05, 2.40, -2.20),
        "tv": (1.20, 2.35, 2.235),
    },
    "tv-adjacent": {
        "window": (1.20, 1.75, -2.20),
        "tv": (1.10, 1.75, 2.235),
    },
}


def srgb_linear(value):
    c = value / 255
    return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4


def measure(image, rect):
    x, y, w, h = rect
    pixels = list(image.crop((x, y, x + w, y + h)).convert("RGB").getdata())
    n = len(pixels)
    rgb = [sum(pixel[channel] for pixel in pixels) / n for channel in range(3)]
    lum = sum(.2126 * srgb_linear(pixel[0]) + .7152 * srgb_linear(pixel[1]) + .0722 * srgb_linear(pixel[2]) for pixel in pixels) / n * 100
    return rgb, lum, rgb[0] / max(rgb[2], .001)


def sample_rect(width, view, point):
    canvas_w, canvas_h = ((1360, 649) if width == 1440 else (358, 491))
    fov = math.radians(44 if width == 1440 else 66)
    focal = canvas_h / (2 * math.tan(fov / 2))
    x, y, z = point
    camera_z = ((2 if width == 1440 else 1.92) if view == "window" else (-1.8 if width == 1440 else -1.72))
    scale = focal / abs(z - camera_z)
    screen_x = canvas_w / 2 + (1 if view == "window" else -1) * x * scale
    screen_y = canvas_h / 2 - (y - 1.28) * scale
    side = max(2, round(.14 * scale))
    return (round(screen_x - side / 2), round(screen_y - side / 2), side, side)


rows = []
for phase in ("baseline", "after"):
    folder = ROOT / phase
    for width in WIDTHS:
        for mood in MOODS:
            for view in VIEWS:
                image_path = folder / f"{mood}-{view}-{width}.png"
                image = Image.open(image_path).convert("RGB")
                expected = (1360, 649) if width == 1440 else (358, 491)
                if image.size != expected:
                    raise ValueError(f"Unexpected canvas size for {image_path}: {image.size}; expected {expected}")
                for surface, points in SURFACES.items():
                    rect = sample_rect(width, view, points[view])
                    rgb, lum, rb = measure(image, rect)
                    rows.append({
                        "phase": phase,
                        "mood": mood,
                        "view": view,
                        "viewport": width,
                        "sample": surface,
                        "surface_point_world_m": ",".join(f"{v:.3f}" for v in points[view]),
                        "sample_rect_canvas_px": ",".join(str(v) for v in rect),
                        "mean_r_srgb_0_255": round(rgb[0], 2),
                        "mean_g_srgb_0_255": round(rgb[1], 2),
                        "mean_b_srgb_0_255": round(rgb[2], 2),
                        "mean_relative_luminance_pct": round(lum, 2),
                        "R_over_B": round(rb, 4),
                    })

out = ROOT / "wall-sample-measurements.csv"
with out.open("w", newline="", encoding="utf-8-sig") as file:
    writer = csv.DictWriter(file, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

for surface in SURFACES:
    print(f"\n[{surface}]")
    for width in WIDTHS:
        summaries = []
        for mood in MOODS:
            values = {(row["phase"], row["view"]): row for row in rows if row["sample"] == surface and row["viewport"] == width and row["mood"] == mood}
            base_back = values[("baseline", "window")]
            base_front = values[("baseline", "tv")]
            after_back = values[("after", "window")]
            after_front = values[("after", "tv")]
            rb_gap_before = (base_back["R_over_B"] - base_front["R_over_B"]) / base_back["R_over_B"] * 100
            rb_gap_after = (after_back["R_over_B"] - after_front["R_over_B"]) / after_back["R_over_B"] * 100
            y_ratio_before = base_front["mean_relative_luminance_pct"] / base_back["mean_relative_luminance_pct"]
            y_ratio_after = after_front["mean_relative_luminance_pct"] / after_back["mean_relative_luminance_pct"]
            summaries.append(f"{mood}: R/B gap {rb_gap_before:.1f}%→{rb_gap_after:.1f}%, luminance ratio {y_ratio_before:.3f}→{y_ratio_after:.3f}")
        print(f"{width}px | " + " | ".join(summaries))
print(f"\nWrote {out}")
