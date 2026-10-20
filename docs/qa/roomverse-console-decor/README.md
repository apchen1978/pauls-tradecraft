# ROOMVERSE console accessories — review handoff

Base: `dae7f06`. Scope: console top only; shelves, camera, UI, MOODS and existing light mappings are unchanged. Draft only, no merge or deployment.

## What changed

- A backed tabletop picture frame with a small stand and original quiet river painting.
- Two offset blank cloth-bound books, using existing painted backing texture.
- A shallow oval ceramic tray holding an unbranded remote, built as real geometry.
- Existing oak/backing images are reused from already-loaded materials; no additional model or service. The only new image is `console-art-river-v1.webp`, 256×320, opaque, **27,462 bytes**. PNG source is retained on the Desktop in `ROOMVERSE_房門_2026-10-20/原稿/`; generation brief is in [PROMPTS.md](PROMPTS.md).
- Geometry and the image load after entry in the existing idle task, or on an explicit TV-view click. Even direct `view=tv` does not request the new picture before interaction is ready. A failed picture request leaves solid fallback accessories.

## Visual checks

- [Desktop before/after, front and side](before-after-1440.webp), [phone before/after](before-after-390.webp).
- [Rain/day/TV night desktop](lighting-1440.webp), [phone](lighting-390.webp).
- [Four wall choices desktop](walls-1440.webp), [phone](walls-390.webp).
- [Native console detail](console-native-crop.webp).
- All three groups touch tabletop y=0.59. Frame top=0.8174, books top=0.6360, tray top=0.6125; all below the existing TV lower strip at y=1.285. Bounding-box checks found no intersections with existing vase/book/laptop or one another; all remain inside the console top. Actual bounds are in [visual-checks.json](visual-checks.json).
- Six existing lights; no added light. No overflow or page errors in captured cases.
- [Pixel comparison](comparison.json): the default sofa/window view and downloaded postcards are **pixel-identical before/after** at both viewports; postcard canvas dimensions are unchanged.

## Entry timing

Same machine/day, installed Chrome headless, cache disabled, CPU 4× slowdown, five alternating fresh contexts for each version/viewport. Time is actual entry click until interactive canvas and controls; this is not production networking or a physical-phone measurement.

| Viewport | Before median | After median | Difference |
| --- | --- | --- | --- |
| 1440×900 | 1.649 s | 1.710 s | +0.061 s |
| 390×844 | 1.456 s | 1.511 s | +0.055 s |

Every current-version run had zero new picture requests and zero constructed accessory groups before ready. Raw runs and GPU identification: [loading.json](loading.json); repeat with `node docs/qa/roomverse-console-decor/measure.mjs` against local Vite on 4188. Baseline/current scripts are route-fulfilled consistently. Cold-run variance is retained, not discarded.

## Validation

- `npm test`: 89 passed.
- `npx playwright test tests/roomverse-3d.spec.js`: **32 passed (2.6m)**; includes two viewport tests for deferred loading, tabletop contact, bounds, collisions, unchanged light count and working postcard, plus a failed-art fallback test.
- The targeted Playwright command builds the app. Existing bundle-size warning is outside this change.
- `git diff --check`: run before commit.
- **全套未跑**. Physical iPhone/Safari, production network and deployment are not verified. New original painting and prop selection remain subject to Paul/CC visual review. No public wording added.

## Reproduce screenshots

`node docs/qa/roomverse-console-decor/capture.mjs`, then `python docs/qa/roomverse-console-decor/compare.py`. Vite must be available on 4188. Source scripts and per-case captures are retained here; before/after app versions use base `dae7f06` and current disk source.
