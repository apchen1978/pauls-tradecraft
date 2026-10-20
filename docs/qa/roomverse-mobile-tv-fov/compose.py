"""Contact sheets and pixel diffs for the mobile TV-wall fov captures."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path("docs/qa/roomverse-mobile-tv-fov")
font = ImageFont.load_default()


def load(name):
    return Image.open(root / name).convert("RGB")


def save(image, name):
    image.save(root / name, "WEBP", quality=86, method=6)


def diff_count(a, b):
    if a.size != b.size:
        return {"pixels": None, "sameSize": False, "a": a.size, "b": b.size}
    pa, pb = a.tobytes(), b.tobytes()
    changed = sum(1 for i in range(0, len(pa), 3) if pa[i:i + 3] != pb[i:i + 3])
    return {"pixels": changed, "sameSize": True, "size": list(a.size)}


def labeled(image, text):
    bar = 22
    canvas = Image.new("RGB", (image.width, image.height + bar), "#fbfaf6")
    canvas.paste(image, (0, bar))
    draw = ImageDraw.Draw(canvas)
    draw.text((6, 4), text, fill="#24302c", font=font)
    return canvas


def row(items, name):
    tiles = [labeled(image, text) for image, text in items]
    height = max(tile.height for tile in tiles)
    width = sum(tile.width for tile in tiles) + 8 * (len(tiles) - 1)
    sheet = Image.new("RGB", (width, height), "#dedad2")
    x = 0
    for tile in tiles:
        sheet.paste(tile, (x, 0))
        x += tile.width + 8
    save(sheet, name)
    return name


report = json.loads((root / "measurements.json").read_text())
diffs = []
for entry in report["report"]:
    if entry["mode"] != "after":
        continue
    for view in ("window", "mid", "tv"):
        stem = f"{entry['lang']}-{entry['name']}-{view}"
        before, after = load(f"before-{stem}.png"), load(f"after-{stem}.png")
        stats = diff_count(before, after)
        stats.update({"file": stem, "aspect": entry["aspect"], "fov": (entry.get("fov") or {}).get(view)})
        diffs.append(stats)
        save(before, f"before-{stem}.webp")
        save(after, f"after-{stem}.webp")

# Smoothness strips: window, 135°, TV wall, after only, every requested size.
for lang in ("zh", "en"):
    for name in ("390x844", "390x740", "360x740", "1440x900"):
        after = next(item for item in report["report"] if item["mode"] == "after" and item["lang"] == lang and item["name"] == name)
        fov = after.get("fov") or {}
        row([
            (load(f"after-{lang}-{name}-window.png"), f"{name} {lang} window fov {fov.get('window', '?'):.1f}"),
            (load(f"after-{lang}-{name}-mid.png"), f"{name} {lang} 135° fov {fov.get('mid', '?'):.1f}"),
            (load(f"after-{lang}-{name}-tv.png"), f"{name} {lang} TV fov {fov.get('tv', '?'):.1f}"),
        ], f"sheet-{lang}-{name}-yaw.webp")
        row([
            (load(f"before-{lang}-{name}-tv.png"), f"before {name} {lang} TV"),
            (load(f"after-{lang}-{name}-tv.png"), f"after {name} {lang} TV fov {fov.get('tv', '?'):.1f}"),
        ], f"sheet-{lang}-{name}-tv-before-after.webp")

# 74 vs 76 at the TV wall, only where the canvas is in the mobile branch.
for path in sorted(root.glob("compare-*-fov74.png")):
    stem = path.name.replace("compare-", "").replace("-fov74.png", "")
    wide = root / f"compare-{stem}-fov76.png"
    if not wide.exists():
        continue
    row([
        (load(path.name), f"{stem} forced fov 74"),
        (load(wide.name), f"{stem} forced fov 76"),
    ], f"sheet-{stem}-fov74-vs-76.webp")

for path in sorted(root.glob("full-*.png")):
    save(load(path.name), path.name.replace(".png", ".webp"))

(root / "diffs.json").write_text(json.dumps(diffs, indent=2) + "\n")
for path in root.glob("*.png"):
    path.unlink()
print(f"sheets written, {sum(1 for item in diffs if item.get('pixels') == 0)} identical, {sum(1 for item in diffs if item.get('pixels'))} changed")
