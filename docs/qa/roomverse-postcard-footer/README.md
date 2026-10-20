# Postcard footer title / domain spacing

Base `dae7f06` (#387), independent of the English-entry layout PR. Only the
postcard footer heading is changed. No canvas-size, image-area, details-wrapping,
page UI, lighting, camera or director changes.

The old heading and domain could overlap at a 358px-wide output. The heading now
measures both texts and reserves a proportional gap. It only reduces the URL's
type size when needed (never below 12 canvas pixels); exceptionally narrow output
can then adjust the title. Normal outputs preserve the original sizes and pixels.
No `maxWidth` text squashing, clipping, truncation or copy changes are used.

## Measured and opened PNG exports

Chrome, DPR 1 / 1.25, mobile emulation 390 × 844; desktop 1440 × 900, DPR 1.
Fixed series-night room and window-facing postcard. Base and current app scripts
are served to separate fresh contexts under the same HTML/viewport. Not a real
phone/Safari check.

| Language / viewport / DPR | Output size before = after | Heading gap after |
| --- | --- | ---: |
| ZH / 390 / 1 | 358 × 583 | 12.00 px |
| EN / 390 / 1 | 358 × 603 | 12.00 px |
| ZH / 390 / 1.25 | 447 × 715 | 42.72 px |
| EN / 390 / 1.25 | 447 × 738 | 42.72 px |
| ZH+EN / 1440 / 1 | 1360 × 752 | 910.43 px |

[Chinese before/after](comparison-zh-390.webp),
[English before/after](comparison-en-390.webp).
Actual PNGs are `before/after-{lang}-{viewport}-dpr{dpr}.png`.

Pixel checks: all six canvas sizes equal baseline; every room-image pixel and
every footer detail pixel below the heading are identical. Desktop and 1.25-DPR
outputs are **entirely pixel-identical**, because their old headings already fit.
Only the narrow output heading changes. [Raw bounding boxes](measurements.json),
[pixel/dimension assertions](comparison.json).

## Regression checks

New browser cases cover both languages and both DPRs, all six moods, measured
title/domain bounds, readable URL size, unchanged source width, and actual PNG
downloads. Existing tests also prove that the desktop one-line output retains
the legacy pixels and wraps details only when needed.

- ROOMVERSE spec: 33 passed (3.0 minutes); npm test: 89 passed. No failures.
- Build performed by the spec's webServer, existing chunk warning only.
- `git diff --check`: passed. Full Playwright suite not run.
- Existing QA screenshots rewritten by the spec are restored.
- Document/PDF closing: N/A, isolated export typography fix, no public copy change.
- Draft only; no merge/deployment or production validation.

Reproduce with Vite at port 4187:

```powershell
node docs/qa/roomverse-postcard-footer/capture.mjs
python docs/qa/roomverse-postcard-footer/compare.py
```

INFERENCE: retaining the main title and giving the URL a smaller supporting role
keeps the narrow footer readable without changing the postcard's composition.
UNKNOWN: physical devices, Safari and all possible third-party canvas/font stacks.
