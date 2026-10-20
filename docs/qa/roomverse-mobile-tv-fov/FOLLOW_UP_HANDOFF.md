# ROOMVERSE mobile TV shelf framing — handoff

Base: `origin/main` at `629bed9` (#402). Paul asked on 2026-10-21 for the English and shorter-phone TV views to show both shelves, while leaving desktop pixels, the window view, director, postcard, lighting, rendering and wall defaults unchanged. This PR remains Draft until Paul explicitly approves a merge.

## Measurement

Chrome, device scale factor 1, reduced motion, `mood=tv&view=tv`. Stage aspect is its measured CSS width divided by height. “Visible” means the TV-wall horizontal view reaches the shelf outer edges at ±2.13 m; screenshots provide the visual check. The implementation frames ±2.30 m for a little margin.

| Language / viewport | Stage aspect | Before TV FOV | Before shelves | After TV FOV | After shelves |
| --- | ---: | ---: | --- | ---: | --- |
| zh 390×844 | .731 | 76° | both | 76° | both |
| zh 390×740 | .834 | 44° | clipped | 66.55° | both |
| zh 360×740 | .764 | 76° | both | 76° | both |
| zh 360×640 | .884 | 44° | clipped | 63.55° | both |
| en 390×844 | .806 | 44° | clipped | 68.37° | both |
| en 390×740 | 1.053 | 44° | clipped | 54.96° | both |
| en 360×740 | .965 | 44° | clipped | 59.16° | both |
| en 360×640 | 1.367 | 44° | both | 44° | both |

Full measurements: [before-measurements.json](before-measurements.json) and [after-measurements.json](after-measurements.json). Each case has `before-…-tv.jpg` / `after-…-tv.jpg`; [comparison-contact-sheet.jpg](comparison-contact-sheet.jpg) shows six representative pairs. The 135° checks are `after-en-390x844-135.jpg` and `after-zh-360x640-135.jpg`. At en 390×844 the FOV progresses 44° → 64.80° at 135° → 68.37° at the TV, with no jump during turning.

## What changed

The tall-stage path from #402 remains 66° at the window and 76° at the TV. On other phone stages, the TV FOV is calculated from the actual stage aspect, camera distance and shelf outer edge. The existing cosine blend changes the FOV as the visitor turns. Desktop stays at its existing 44° path.

## Verification

- Desktop 1440×900: window and TV stage screenshots are each **0 pixels different** before/after. Files: `before-desktop-*.jpg`, `after-desktop-*.jpg`.
- Postcard PNG data URL SHA-256 is unchanged: `d0eb68a2c72233fe4d25de548ef7a87d84a37a8829bbdc61dfa05bfef553fa6f`.
- `npx playwright test tests/roomverse`: 71 passed, including director and postcard checks.
- `npm test`: 89 passed. `npm run build`: passed with the existing large-chunk warning.
- `node scripts/verify-export-check.mjs`, `node scripts/check-journey-language.mjs`, `python scripts/check-onepager-sync.py`, `node scripts/check-document-parity.mjs`, `git diff --check`: passed.
- Full-site Playwright suite: **not run**. Physical iPhone: **not tested**.

FACT: the measured browser views and pixel comparisons above. INFERENCE: using the real stage aspect rather than language is the smallest durable fix for this framing issue. UNKNOWN: behavior on a physical phone beyond the tested Chrome viewport/device settings.
