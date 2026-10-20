"""Build paired baseline/after contact sheets for both views and widths."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path("docs/qa/roomverse-tv-wall-light")
MOODS = ("rain", "family", "tech", "chic", "slow", "tv")
font = ImageFont.truetype("arial.ttf", 18)
small = ImageFont.truetype("arial.ttf", 14)

for width in (1440, 390):
    for view in ("window", "tv"):
        src = Image.open(ROOT / "baseline" / f"rain-{view}-{width}.png")
        iw, ih = src.size
        maxw = 520 if width == 1440 else 245
        scale = maxw / iw
        thumb = (maxw, round(ih * scale))
        gap = 10
        labelw = 84
        titleh = 42
        rowh = thumb[1] + 38
        sheet = Image.new("RGB", (labelw + thumb[0] * 2 + gap * 3, titleh + rowh * len(MOODS)), "#f1ede5")
        draw = ImageDraw.Draw(sheet)
        draw.text((labelw + gap, 10), f"Before | {width}px | {view}", fill="#403b33", font=font)
        draw.text((labelw + thumb[0] + gap * 2, 10), "After", fill="#403b33", font=font)
        for index, mood in enumerate(MOODS):
            y = titleh + index * rowh
            draw.text((8, y + 10), mood, fill="#403b33", font=small)
            for column, phase in enumerate(("baseline", "after")):
                image = Image.open(ROOT / phase / f"{mood}-{view}-{width}.png").convert("RGB")
                image.thumbnail(thumb, Image.Resampling.LANCZOS)
                x = labelw + gap + column * (thumb[0] + gap)
                sheet.paste(image, (x, y))
        path = ROOT / f"comparison-{view}-{width}.png"
        sheet.save(path, optimize=True)
        print(path)
