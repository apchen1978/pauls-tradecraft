// Room 04 (Shanghai, Slowly) budget ledger: the ONE place that holds the scene-size numbers the Room 04 specs check.
// Created on day 1 (look brief, 2026-11-13) so the numbers never spread across spec files the way Room 03's did.
//
// HOW TO UPDATE after you add or remove something in Room 04:
//   1. Measure: open /prototype/roomverse-3d/cafe/ at 1440 px and 390 px and read window.__room04.info() (vertices, meshes, drawCalls).
//   2. Edit ONLY this file: the numbers in `scene` and `openingDrawCalls`, and add one line to `history` with the reason.
//   3. Run the Room 04 specs. A cap is a "still runs smoothly" guard, not a target; never trim a visual to fit without measuring first.

export const LEDGER = Object.freeze({
  // Measured with everything loaded (the phone shares the same geometry).
  scene: Object.freeze({ vertices: 3419, meshes: 51 }),
  // Draw calls in the first frame of the opening (morning) view.
  openingDrawCalls: Object.freeze({ desktop: 49, phone: 48 }),
  // Starting caps from the look brief, set from Room 03's live size (109,111 vertices, 133 meshes, 83 / 80 opening draw calls).
  caps: Object.freeze({ vertices: 90000, meshes: 140, desktopCalls: 80, phoneCalls: 75 }),
  // Newest last. One line per change; the numbers are the measured totals AFTER the change.
  history: Object.freeze([
    { date: "2026-11-13", change: "blockout: shell, window, counter, back bar, shelves, menus, plain stand-ins for the machine, grinder, pastry case, robot and plant", vertices: 3419, meshes: 51, desktopCalls: 49, phoneCalls: 48 },
  ]),
});
