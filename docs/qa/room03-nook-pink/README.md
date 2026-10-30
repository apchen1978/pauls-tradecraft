# Room 03: the small entry room goes dusty pink

Paul 2026-10-31: with mist-blue walls everywhere, the small room (entry hall with the TV and the redwood print) read flat and less real. Outside stays mist blue; inside becomes pink so the two spaces separate and the 3D depth shows.

- The entry hall was one mesh sharing the room's wall material. It is still one mesh named `entry-hall` with the same bounds, now with two materials: the front wall (two piers and the lintel, seen from the dining room) and the floor/ceiling slabs keep the mist blue; the three walls inside the hall (two sides and the back wall with the clock and towel) use `wall-entry-hall-pink`, a clone of the wall material (same plaster texture) with colour `#e9bdb9`.
- Cost: no new geometry (vertices 55,331 unchanged), meshes unchanged, +1 draw call (77 on desktop and phone). Ledger updated.
- Seen in daylight, golden hour and night at 390 and 1440 (`after-*.png`). Warm moods warm the pink toward rose-beige. Real iPhone Safari: UNKNOWN until Paul checks. If the pink is too strong or too faint, it is one hex value.
- Cache-bust `kitchen.js?v=83`, `page.js?v=84`.
- Tests: ledger, P0 lighting, kitchen main, tableware, card-3 atmosphere: 32 passed, 1 skipped. Full Room 03 suite not run.
