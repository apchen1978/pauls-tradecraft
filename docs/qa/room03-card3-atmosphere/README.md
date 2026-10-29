# Room 03 Card 3: curtain, floor lamp, entry details

## Delivered scope

- Replaced the floor reading lamp's globe with a paper drum lantern and slim black tripod at the existing window-side location.
- Added two gathered linen curtain panels, leaving the center of the courtyard opening clear.
- Added one merged entry-wall detail mesh: round low-reflection mirror, three iron hooks, a simple linen coat, and a small oak key shelf/dish.
- No new real light source. Existing floor-lamp point light and halo retain the shade center.

## Measured geometry (1440 CSS viewport, DPR 1.5)

| Measure | Latest main | Card 3 result | Delta |
|---|---:|---:|---:|
| Scene vertices | 50,288 | 52,265 | +1,977 |
| Scene meshes | 107 | 109 | +2 |
| Opening draw calls | 73 | 74 | +1 |
| Floor lamp vertices | 317 | 1,097 | +780 |
| Curtain vertices / meshes | 0 | 494 / 1 | +494 / +1 |
| Entry detail vertices / meshes | 0 | 703 / 1 | +703 / +1 |

Mobile opening draw calls: latest main 74, current 75 (+1).

## Fit checks

- Floor lamp base: 7.4 mm above the floor; shade center, point light and halo center all at y=1.27 m.
- Lamp drum: 0.326 m diameter, 0.46 m tall; total floor-lamp assembly about 1.50 m. The 1.643 m version overlapped the painting by 0.09 m; the measured clearance is now +0.06 m (minimum +0.02 m).
- The floor shade has its own material name. Its emissive intensity is 0 when its lamp is off; the pendant's `warm-opal-glass` mood update no longer overrides it.
- The 1440 px movie-night 180° blown ratio fell from 0.010552 to 0.007146 after shortening the lamp and reducing the lit paper shade's emissive strength (limit 0.01).
- Curtain hems: 2.8 mm above floor. Panels stay outside the central yard view.
- Entry details sit on the measured z=3.74 m wall face, below the Redwood print; x=0.09–0.85 m. The measured robot hit area and right-wall door are clear.

## Verification

- `npm run build`: exit code 0. Vite reports the existing large-chunk advisory.
- The focused lighting sample test passes with its original luminance threshold after excluding the new curtain and entry decor from the legacy light-only camera sample; the threshold itself is unchanged.
- Full Room 03 suite is selected with `tests/roomverse-kitchen tests/roomverse-room03`; do not use shell wildcards on Windows.
- iPhone Safari, device GPU/FPS, and thermal performance: UNKNOWN.

## Screenshots

Before/after screenshots are in this folder. They cover 1440 and 390, daylight and dinner, default view and entry-wall close-up.

## Final verification

- CC's independent full selection on the first Card 3 build found **96 passed / 15 failed (111 total)**. The earlier 20/20 claim was a partial selection and is withdrawn.
- The corrected scene measurement is in `tests/helpers/room03-ledger.js`: 52,265 vertices, 109 meshes, 74 desktop / 75 phone opening draw calls. Tests read the ledger without hardcoded Card 3 offsets; `headroom` is unchanged.
- Final full Room 03 selection: `npx playwright test tests/roomverse-kitchen tests/roomverse-room03 --workers=2 --timeout=180000 --reporter=dot`: **111 passed, 0 failed, 1 skipped measurement helper** (112 selected), exit code 0. The first full correction run had 109 passed, 2 failed, 1 skipped: a concurrent fullscreen wait timed out but passed 1/1 in isolation, and the red-pot spec used a stale October draw-call snapshot. A clean `a4b4840` worktree measured the 90-degree call count as 73 versus 75 in this PR; the updated per-card increment limit is +2 (the old historical limit was +7). The final full run passed without retries.
- Independent `npm run build`: exit code 0; Vite emitted its existing large-chunk advisory.
- Version chain: `kitchen.js?v=72 → v73`; `page.js?v=73 → v74` in `index.html`.
