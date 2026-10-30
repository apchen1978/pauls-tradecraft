# Room 03: mist-blue walls

Paul 2026-10-30: in daylight the plain walls read grey and flat; use the mist blue from Room 01, or a wallpaper.

- Wall paint `#f0e8da` (cream) -> `#d0deea` (soft mist blue). Room 01's own "Misty blue-grey" is `#c3ccd2`; on Room 03's plaster texture it rendered grey, so this is a slightly bluer, lighter cousin of it. Only `materials.wall` changes; the grasscloth right wall, trim, ceiling and floor are untouched.
- Looked at in daylight, golden hour, night and dinner (390 and 1440). Under the warm moods the blue turns into a soft grey-beige, which is what blue paint does under warm light; daylight carries the blue.
- Not done (an option if Paul prefers a wallpaper): Room 01's botanical wallpaper (`tex/wallpaper-botanical-v1.webp`) could go on the entry wall only; Room 03 already has grasscloth on the right wall, so I kept one change.
- No geometry change: ledger unchanged.
- Cache-bust: `kitchen.js?v=78`, `page.js?v=79`.
- Real iPhone Safari: UNKNOWN until Paul checks. Screenshots: `C-*` in this folder (390 and 1440; daylight, golden, night, dinner).

## Why `#d0deea` and not a deeper blue
Two golden-hour pixel checks sit right at their thresholds (`roomverse-kitchen.spec.js` interior mean luminance >= 104, `roomverse-room03-p0-lighting.spec.js` luminance std-dev >= 44). A deeper blue (`#bfd0dd`) landed at 103.66 and 43.85. Rather than loosen either threshold, the wall was made slightly lighter: `#c8d7e2` gave 103.99, `#d0deea` passes both.
