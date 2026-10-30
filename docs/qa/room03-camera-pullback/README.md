# Room 03: default camera 0.2 m further back

GrokBot and ChatGPT (via Paul, 2026-10-31) both asked for the opening view to step back; Paul's own phone shots showed the table front and the front chairs cropped.

- Desktop preset `[0.22, 1.64, 1.52]` -> `[0.242141, 1.658234, 1.711458]`; phone preset `[0.408432, 1.591908, 1.52429]` -> `[0.459544, 1.605912, 1.715041]`. Same line of sight, same targets, same FOV; the orbit zoom limit goes 1.72 -> 1.92 (range 0.24 -> 0.44) so the default sits inside it. The camera stays inside the room (front wall at z 2.34, camera z 1.71 at most 1.92 from target).
- `before-*.png` / `after-*.png`: 390 and 1440, daylight arrival mood.
- Pinned tests moved with the preset (composition, view limits, kitchen main spec). Two thresholds re-measured: golden-hour frame contrast std-dev 44 -> 43.7 (floor 43), wok-view hood position ndc 0.826 -> 0.78 (floor 0.75). Ledger: one more mesh is inside the desktop opening frustum (78 calls; phone stays 77), no new geometry.
- Cache-bust `kitchen.js?v=85`, `page.js?v=86`. Tests: kitchen main, composition, view limits, inside view, ledger, P0 lighting, P2 contact shadows, mood scroll, exit nav: all passed except as noted above and fixed; 1 skipped. Full Room 03 suite not run. Real iPhone Safari: UNKNOWN.
