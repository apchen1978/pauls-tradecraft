// Room 03 budget ledger: the ONE place that holds the scene-size baselines the Room 03 specs check
// (vertices, meshes, opening draw calls, and the per-mood draw calls). Before this file, the same numbers were typed into ~12 spec files, so
// every new object meant editing 3 to 12 test files (git history, 2026-10-30: 3.2 test files per Room 03 commit vs 1.1 for Rooms 01 and 02).
//
// HOW TO UPDATE after you add or remove something in Room 03:
//   1. Measure:  ROOM03_LEDGER_MEASURE=1 npx playwright test tests/roomverse-room03-ledger-measure.spec.js   (prints a ready-to-paste block)
//   2. Edit ONLY this file: the numbers in `scene`, `openingDrawCalls`, `moodDrawCalls`, and add one line to `history` with the reason.
//   3. Run the Room 03 specs. Do not raise `headroom` to make a test pass; a headroom is room for a later small change, not a way around a budget.
// Exact checks (toBe) use the measured values; cap checks use `CAPS` (measured value + headroom, never looser than the strictest cap the specs had before).

export const LEDGER = Object.freeze({
  // Measured with everything loaded, desktop 1440 px (the phone shares the same geometry).
  scene: Object.freeze({ vertices: 50288, meshes: 107 }),
  // Draw calls in the first frame (desktop 1440 px, phone 390 px), golden/daylight opening view.
  openingDrawCalls: Object.freeze({ desktop: 73, phone: 74 }),
  // Draw calls per mood (first frame after the mood is set). For dinner and Thanksgiving the entry is the BASE scene without the tableware layer
  // (the tableware spec checks that layer by its own vertex count); the measuring tool prints the real numbers (dinner 80/81, Thanksgiving 81/84).
  moodDrawCalls: Object.freeze({
    desktop: Object.freeze({ daylight: 73, golden: 73, movie: 71, night: 73, dinner: 73, sunday: 73, thanksgiving: 73 }),
    phone: Object.freeze({ daylight: 74, golden: 74, movie: 72, night: 74, dinner: 74, sunday: 74, thanksgiving: 74 }),
  }),
  // Room above the measured value that cap checks allow. Kept at the strictest of the caps the specs used before the ledger existed
  // (vertices: the red-pot spec's 39,105 + 11,300 = 50,405). A resized desktop page is not a real phone, so it has its own cap.
  headroom: Object.freeze({ vertices: 117, meshes: 0, desktopCalls: 0, phoneCalls: 0 }),
  resizedPhoneCalls: 75,
  // Newest last. One line per change; the numbers are the measured totals AFTER the change.
  history: Object.freeze([
    { date: "2026-10-29", change: "(reconstructed from spec comments) main 261fbc4 plus living details", vertices: 47680, meshes: 99, desktopCalls: 68, phoneCalls: 70 },
    { date: "2026-10-29", change: "(reconstructed) dish dryer, credenza, TV glass, robot (one merged mesh)", vertices: 47680, meshes: 105, desktopCalls: 72, phoneCalls: 73 },
    { date: "2026-10-30", change: "door beside the cable-car painting (#627): leaf and doorway light; frame joins the trim mesh", vertices: 50368, meshes: 107, desktopCalls: 73, phoneCalls: 74 },
    { date: "2026-10-30", change: "daylight arrival mood (#628): no geometry change", vertices: 50368, meshes: 107, desktopCalls: 73, phoneCalls: 74 },
    { date: "2026-10-30", change: "three-tier paper pendant replaces the opal-globe model (#629)", vertices: 50288, meshes: 107, desktopCalls: 73, phoneCalls: 74 },
  ]),
});

export const CAPS = Object.freeze({
  vertices: LEDGER.scene.vertices + LEDGER.headroom.vertices,
  meshes: LEDGER.scene.meshes + LEDGER.headroom.meshes,
  desktopCalls: LEDGER.openingDrawCalls.desktop + LEDGER.headroom.desktopCalls,
  phoneCalls: LEDGER.openingDrawCalls.phone + LEDGER.headroom.phoneCalls,
  resizedPhoneCalls: LEDGER.resizedPhoneCalls,
});

// [vertices, meshes, draw calls] for a viewport width and a mood.
export function budgetFor(width, mood) {
  const calls = (width === 390 ? LEDGER.moodDrawCalls.phone : LEDGER.moodDrawCalls.desktop)[mood];
  return [LEDGER.scene.vertices, LEDGER.scene.meshes, calls];
}
