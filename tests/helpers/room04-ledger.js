// Room 04 (Shanghai, Slowly) budget ledger: the ONE place that holds the scene-size numbers the Room 04 specs check.
// Created on day 1 (look brief, 2026-11-13) so the numbers never spread across spec files the way Room 03's did.
//
// HOW TO UPDATE after you add or remove something in Room 04:
//   1. Measure: open /prototype/roomverse-3d/cafe/ at 1440 px and 390 px and read window.__room04.info() (vertices, meshes, drawCalls).
//   2. Edit ONLY this file: the numbers in `scene` and `openingDrawCalls`, and add one line to `history` with the reason.
//   3. Run the Room 04 specs. A cap is a "still runs smoothly" guard, not a target; never trim a visual to fit without measuring first.

export const LEDGER = Object.freeze({
  // Measured with everything loaded (the phone shares the same geometry).
  scene: Object.freeze({ vertices: 130776, meshes: 77 }),
  // Draw calls in the first frame of the opening (morning) view.
  openingDrawCalls: Object.freeze({ desktop: 82, phone: 72 }),
  // Starting caps from the look brief, set from Room 03's live size (109,111 vertices, 133 meshes, 83 / 80 opening draw calls).
  caps: Object.freeze({ vertices: 150000, meshes: 140, desktopCalls: 96, phoneCalls: 86 }), // raised with a history line on 2026-11-13 (Paul: vertices are not rationed while phones run it); Room 03 opens at 85 / 82
  // Newest last. One line per change; the numbers are the measured totals AFTER the change.
  history: Object.freeze([
    { date: "2026-11-13", change: "blockout: shell, window, counter, back bar, shelves, menus, plain stand-ins for the machine, grinder, pastry case, robot and plant", vertices: 3419, meshes: 51, desktopCalls: 49, phoneCalls: 48 },
    { date: "2026-11-13", change: "section 1 (shell and light): painted brick with height map, plank ceiling, painted floor, plaster bump, window with 22 cm reveal, steel glazing (one merged mesh), sill, apron, painted Xintiandi street, merged skirting, soft reflection map", vertices: 3567, meshes: 49, desktopCalls: 51, phoneCalls: 48 },
    { date: "2026-11-13", change: "section 2 (counter and back bar): stone-topped bullnosed half-round counter with raised-and-fielded oak front, curved end, brushed-steel foot rail; olive shaker back bar with handles; oak shelves on black brackets; framed chalk menus with ledges; contact shadows. All merged by material", vertices: 13919, meshes: 48, desktopCalls: 50, phoneCalls: 47 },
    { date: "2026-11-13", change: "section 3 (hero pieces): two-group espresso machine (steel body, black end caps, cup warmer with guard rail, group heads, portafilters, gauge, steam wand, drip tray, feet), grinder with bean-filled hopper, curved glass pastry case with eight pastries and a warm light, robot barista with scarf, apron band and a cup on a saucer", vertices: 61188, meshes: 58, desktopCalls: 58, phoneCalls: 57 },
    { date: "2026-11-13", change: "section 4 (story corner): window seat (oak table on a cast pedestal, two bentwood chairs with caned seats, a linen coat draped over one), open notebook and pen, poured cup, hydrangea vase, a floor plant, shelf plates, mugs, jars and a trailing pothos, a paper note, steam, and the lettered house plaque. Small things no longer cast shadows; steam is one Points draw", vertices: 130776, meshes: 77, desktopCalls: 82, phoneCalls: 72 },
  ]),
});
