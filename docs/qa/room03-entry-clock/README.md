# Room 03: entry-wall mirror becomes a wall clock

Paul 2026-10-30: the round mirror beside the TV had a flat grey face and read as a strange colour.

- The grey disc (`#9ca7a7`) is now a cream clock face (`#f1e9d8`) inside the same oak rim, with 12 black ticks (quarters longer) and two hands at 10:10 plus a centre cap. Still the one merged entry-wall mesh, so no extra draw call.
- Scene vertices 52,272 -> 52,672 (+400); meshes and draw calls unchanged. Ledger updated.
- Info key `entryWallDetails.mirror` renamed `clock`; the entry spec reads it (diameter 410 mm, wall gap <= 1 mm, unchanged).
- Cache-bust: `kitchen.js?v=77`, `page.js?v=78`.
- Real iPhone Safari: UNKNOWN until Paul checks. Screenshots: `after-390.png`, `after-1440.png`.
