"""Confirm the new TV-wall wash has no pixels in the window-facing view."""
from pathlib import Path
from PIL import Image, ImageChops

root = Path("docs/qa/roomverse-tv-wall-light")
failures = []
for width in (1440, 390):
    for mood in ("rain", "family", "tech", "chic", "slow", "tv"):
        views = ("window", "tv") if mood in ("family", "chic", "slow") else ("window",)
        for view in views:
            before = Image.open(root / "baseline" / f"{mood}-{view}-{width}.png").convert("RGB")
            after = Image.open(root / "after" / f"{mood}-{view}-{width}.png").convert("RGB")
            diff = ImageChops.difference(before, after)
            box = diff.getbbox()
            changed = 0 if box is None else sum(1 for px in diff.getdata() if px != (0, 0, 0))
            print(f"{mood:6s} {view:6s} {width:4d}px changed pixels: {changed}")
            if changed:
                failures.append((mood, view, width, changed, box))
if failures:
    raise SystemExit(f"Unchanged view changed: {failures}")
print("PASS: all window views and the three unmodified daytime TV views are pixel-identical.")
