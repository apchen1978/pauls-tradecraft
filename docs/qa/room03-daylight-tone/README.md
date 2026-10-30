# Room 03: daylight arrival, less orange wood

Paul 2026-10-30 (iPhone photo): ceiling and dining table read too orange for a daylight mood.

- Daylight only (golden hour, night, dinner etc. unchanged): ceiling colour `#cdae80` -> `#d8c6a8`, beam `#9a7a52` -> `#8e765a`.
- Dining table tint: a multiply factor of (1.0, 1.2, 1.6), allowed above 1 so the orange GLB wood is neutralised without going dark. `tintDiningTable` now accepts a `THREE.Color` as well as a hex.
- Measured on the 390 px entry view (average of a screenshot region): ceiling saturation 0.38 -> 0.25; table saturation about 0.73 (default view) -> 0.46.
- Cache-bust: `kitchen.js?v=74 -> v75`, `page.js?v=75 -> v76`.
- Real iPhone Safari: UNKNOWN until Paul checks. Screenshots: `before-*` and `after-*` in this folder.
