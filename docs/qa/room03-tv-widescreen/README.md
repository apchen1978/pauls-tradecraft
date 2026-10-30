# Room 03: the hall TV looks like a TV

Paul 2026-10-31: the TV in the small room could not be told from a picture frame; make it feel like a TV, and assume a wide set partly hidden by the doorway.

- Before: a 0.94 x 0.53 m screen (about 42 in) in a thin oak frame, the same as the paintings.
- Now: a 55 in wall-mounted panel, 1.20 x 0.675 m (16:9), with a thin black glossy bezel (one black slab mesh, 12 mm margin around the picture) and no wood. Its bottom edge stays at 0.795 m, so the things on the console still stand below it, and its right edge keeps 0.12 m from the redwood print. The left quarter sits inside the hall's side wall, so from the dining room the set reads as a wider TV cut off by the wall and doorway. The mood pictures (movie night, Thanksgiving parade) cover the same 16:9 screen.
- Cost: -72 vertices (the four oak frame bars are gone, one slab is added), +1 mesh (113); draw calls unchanged at 79 / 78 in the opening view. Ledger updated.
- `tests/roomverse-human-touch-r1.spec.js` pinned the old 0.94 m screen width; it now expects 1.2 m.
- Cache-bust `kitchen.js?v=92`, `page.js?v=93`. Full Room 03 set plus the human-touch spec (119 tests): 118 passed, 1 skipped after the pinned width was updated. Real iPhone Safari: UNKNOWN.
- Screenshots: `entry-daylight.png` (powered off) and `entry-movie.png` (movie night), entry-wall view at 2x.
