# ROOMVERSE mobile rendering quality comparison

Baseline scene: `origin/main` at `e9e43b5`. The `pre97` candidate reconstructs only the former renderer settings (antialias on, DPR cap 2) on this same current scene. It is not a historical screenshot or a checkout of the old scene; this isolates renderer settings while preserving the current TV wall.

## Compared settings

- Pre-TV reconstructed settings: antialias on, cap 2.
- Current: mobile antialias off, pixel-ratio cap 1.25.
- A1: antialias on, cap 1.5.
- A2: antialias on, cap 1.75.
- B: start at 1.75, lower by 0.25 after sustained render FPS below 47, recover by 0.25 after stable FPS above 58; bounds 1.25–1.75, with a 900 ms change cooldown.

Chrome at 390×844, DPR 2 and 3; CPU normal and CDP 4× throttled. Each cell ran once, so treat FPS as a controlled comparison rather than a device benchmark. During each run we sampled settled static, actual pointer rotation, and the middle of the 8-second room tour. Static is on-demand: after the scene settles it issues no continuous WebGL draws, so sustained static FPS is correctly reported as N/A. Raw frame samples and canvas sizes are in `measurements.json`; `fps-table.md` lists median and minimum rendered FPS.

## Visual comparison

Each contact sheet places reconstructed pre-TV settings, current, A1, A2 and B side by side, with a magnified crop below each scene. The files are `contact-dpr{2,3}-{window,tv,tour-mid}.webp`. A1's render buffer is 537×735 versus current 447×612; A2 starts at 626×857, while B may step down under load. Anti-aliasing softens stair-stepped furniture and frame edges; A2 adds more pixels but the full room shows little additional benefit over A1.

The 1440 desktop canvas was captured before and after at the same angle: `desktop-before-1440.webp` and `desktop-after-1440.webp`. Both are 1360×648 and pixel-identical. The desktop branch remains antialias on and pixel ratio 2.

## Choice

Recommend A1: it restores edge smoothing and raises the mobile render buffer to 1.5× while keeping a fixed, easy-to-reason-about cost. In this emulated machine, median FPS during activity was near the browser's 60 FPS cap for most cells; CPU 4× had lower medians in some DPR 3 startup/input samples. Minimum FPS varies widely because one long frame during startup, input, or asset preparation dominates the minimum; inspect the full samples before treating that number as representative. A2 and B do not show a stable performance advantage over A1. B adds monitoring and ratio changes without improving the measured median.

This is Chrome device emulation, not a physical iPhone or Android measurement. The browser reports its GPU and all results in `measurements.json`; do not present them as real-device evidence.

## Reproduction

Start Vite on port 4189, then run `node docs/qa/roomverse-mobile-quality/measure.mjs`; it reads fixed baseline commit `e9e43b5`, temporarily serves each renderer variant from disk, and restores the working branch source in `finally`. The script captures the phone contact-sheet sources and raw frame samples. Run `python docs/qa/roomverse-mobile-quality/build-review.py` to recreate contact sheets and `fps-table.md`. Run `node docs/qa/roomverse-mobile-quality/desktop-compare.mjs` for the desktop pixel check. The Playwright spec independently checks the shipped DPR 2 and 3 buffer and antialias settings.

## Validation

- `npx playwright test tests/roomverse-3d.spec.js`: 40 passed (2.6m), including new DPR 2/3 checks.
- `npm test`: 89 passed.
- `git diff --check`: passed.
- Full Playwright suite: not run. Existing Vite bundle-size warning remains. No real phone, production network, merge or deployment was tested.
