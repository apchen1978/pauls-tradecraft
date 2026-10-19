# ROOMVERSE 3D TV wall performance check

**Scope:** 390 CSS px viewport, DPR 2, Chromium headless, CPU throttling 4×, browser cache disabled. Baseline is `main` at `7732a26`; candidate is `codex/roomverse-tv-wall` after the mobile renderer adjustment.

| Measure | Baseline | Candidate |
| --- | ---: | ---: |
| Document load (`load` event) | 1,194 ms | 461 ms |
| Tap “enter” → `window.__room` ready | 12,674 ms | 12,461 ms |
| Animation callbacks during the first five seconds after ready | 12 / 5.03 s = 2.4/s | 9 / 5.01 s = 1.8/s |

The page renders on demand and is intentionally idle after the entry drift, so this five-second callback rate is not a sustained FPS: most of the window is intentionally static. During the candidate's active window-to-TV transition, the renderer produced 35 frames over 1.273 s (27.5 FPS) under the same 4× CPU throttle. These are headless-browser stress proxies, not physical-phone results.

The mobile canvas now caps pixel ratio at 1.25 and disables canvas antialiasing at widths up to 600 CSS px. HTML text remains native-resolution. At DPR 2, the canvas uses about 1.25 backing pixels per CSS pixel.

**Scope note:** the paired click-to-ready time was effectively unchanged (12,674 ms → 12,461 ms). The entry-animation callback sample varied and does not support a reliable FPS comparison; the candidate's active transition is the more relevant interaction measure. Full browser tests cover the TV-wall transition, all six moods and the window-facing postcard.
