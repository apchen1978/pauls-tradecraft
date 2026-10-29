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

- Floor lamp base: 7.4 mm above the floor; shade center, point light and halo center all at y=1.42 m.
- Lamp drum: 0.326 m diameter, 0.46 m tall; total floor-lamp assembly 1.643 m.
- Curtain hems: 2.8 mm above floor. Panels stay outside the central yard view.
- Entry details sit on the measured z=3.74 m wall face, below the Redwood print; x=0.09–0.85 m. The measured robot hit area and right-wall door are clear.

## Verification

- `npm run build`: exit code 0. Vite reports the existing large-chunk advisory.
- The focused lighting sample test passes with its original luminance threshold after excluding the new curtain and entry decor from the legacy light-only camera sample; the threshold itself is unchanged.
- Full Room 03 suite result and final rebased build are recorded in the PR report.
- iPhone Safari, device GPU/FPS, and thermal performance: UNKNOWN.

## Screenshots

Before/after screenshots are in this folder. They cover 1440 and 390, daylight and dinner, default view and entry-wall close-up.
