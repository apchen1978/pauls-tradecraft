"""Create same-size before/after dark-paint comparisons and exact pixel-diff data."""
from pathlib import Path
import csv
from PIL import Image, ImageDraw, ImageFont, ImageChops

ROOT = Path("docs/qa/roomverse-tv-wall-light")
WALLS = ("wine", "dusk", "pine")
MOODS = ("rain", "tech", "tv")
WIDTHS = (1440, 390)
LABELS = {"wine": "Deep wine", "dusk": "Dusk navy", "pine": "Deep pine"}
font = ImageFont.load_default()
rows = []

for wall in WALLS:
    for viewport in WIDTHS:
        sample = Image.open(ROOT / "dark-walls-before" / f"{wall}-rain-{viewport}.png").convert("RGB")
        source_w, source_h = sample.size
        tile_w = 600 if viewport == 1440 else 358
        tile_h = round(source_h * tile_w / source_w)
        label_h, row_gap = 24, 12
        margin = 16
        sheet = Image.new("RGB", (margin * 2 + tile_w * 2 + 12, margin * 2 + 3 * (label_h + tile_h + row_gap)), "#f4f0e8")
        draw = ImageDraw.Draw(sheet)
        draw.text((margin, 6), f"{LABELS[wall]} wall | {viewport}px | TV-wall view | before / after", fill="#25332d", font=font)
        for index, mood in enumerate(MOODS):
            y = margin + label_h + index * (label_h + tile_h + row_gap)
            draw.text((margin, y - label_h + 2), mood, fill="#25332d", font=font)
            pair = []
            for phase in ("before", "after"):
                image = Image.open(ROOT / f"dark-walls-{phase}" / f"{wall}-{mood}-{viewport}.png").convert("RGB")
                if image.size != (source_w, source_h):
                    raise ValueError(f"Size mismatch: {wall}/{mood}/{viewport}/{phase}: {image.size}")
                pair.append(image)
                scaled = image.resize((tile_w, tile_h), Image.Resampling.LANCZOS)
                x = margin + (0 if phase == "before" else tile_w + 12)
                sheet.paste(scaled, (x, y))
                draw.text((x + 4, y + 4), phase, fill="#ffffff", stroke_width=1, stroke_fill="#1f2924", font=font)
            diff = ImageChops.difference(pair[0], pair[1])
            changed = sum(1 for pixel in diff.getdata() if pixel != (0, 0, 0))
            total = source_w * source_h
            mean_abs = sum(sum(pixel) for pixel in diff.getdata()) / (total * 3)
            rows.append({"wall": wall, "mood": mood, "viewport": viewport, "width_px": source_w, "height_px": source_h,
                         "changed_pixels": changed, "total_pixels": total, "changed_pct": round(changed / total * 100, 6),
                         "mean_absolute_channel_delta": round(mean_abs, 6)})
        sheet.save(ROOT / f"dark-wall-{wall}-{viewport}-comparison.png", optimize=True)

with (ROOT / "dark-wall-pixel-diff.csv").open("w", newline="", encoding="utf-8-sig") as file:
    writer = csv.DictWriter(file, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

print("wall mood viewport changed_pixels / total_pixels changed_pct mean_abs_channel_delta")
for row in rows:
    print(f"{row['wall']} {row['mood']} {row['viewport']} {row['changed_pixels']} / {row['total_pixels']} {row['changed_pct']:.6f}% {row['mean_absolute_channel_delta']:.6f}")
