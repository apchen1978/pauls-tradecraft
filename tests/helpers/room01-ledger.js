// Room 01 budget ledger: the ONE place that holds the scene-size baselines the Room 01 budget spec checks.
// Room 01 had no budget test at all (GrokBot three-room comparison, 2026-11-04); it is also the heaviest room by geometry, and its
// geometry grows AFTER load (about 196 meshes / 88,574 vertices half a second in, 325 / 113,023 once the idle-time TV-wall and shelf
// decorations arrive), so every check here first waits for the mesh count to settle. Same rules as tests/helpers/room03-ledger.js.
//
// HOW TO UPDATE after you add or remove something in Room 01:
//   1. Measure:  ROOM01_LEDGER_MEASURE=1 npx playwright test tests/roomverse-room01-ledger.spec.js -g measure   (prints a ready-to-paste block)
//   2. Edit ONLY this file: the numbers in `scene`, `openingDrawCalls`, `moodDrawCalls`, and add one line to `history` with the reason.
//   3. Do not raise `headroom` to make a test pass; a headroom is room for a later small change, not a way around a budget.
// Budgets are QA tools, measured first and never cut to fit: if a change is worth its cost, record it here with a history line.

export const LEDGER = Object.freeze({
  // Measured settled, desktop 1440 px (the phone shares the same geometry).
  scene: Object.freeze({ vertices: 113023, meshes: 325 }),
  // Draw calls of the last rendered frame after settling: desktop 1440 px and phone 390 px, default (arrival) mood.
  openingDrawCalls: Object.freeze({ desktop: 82, phone: 63 }),
  // Draw calls after switching to each mood (1.2 s later). The "tech" mood lights one more thing than the others.
  moodDrawCalls: Object.freeze({
    desktop: Object.freeze({ rain: 82, family: 82, tech: 84, chic: 82, slow: 82, golden: 82, tv: 82 }),
    phone: Object.freeze({ rain: 63, family: 63, tech: 65, chic: 63, slow: 63, golden: 63, tv: 63 }),
  }),
    // Polish comes first (Paul, 2026-11-06): the caps are only a "still runs smoothly" guard, about 15% above what is measured, so adding detail
  // does not turn tests red. Going past a cap means: measure FPS and memory first, then raise the numbers here with a history line. Never trim a visual to fit.
  headroom: Object.freeze({ vertices: 17000, meshes: 48, drawCalls: 12 }),
  // Newest last. One line per change; the numbers are the measured totals AFTER the change.
  history: Object.freeze([
    { date: "2026-11-06", change: "first ledger: measured on main 8b474fc (nothing changed)", vertices: 113023, meshes: 325, desktopCalls: 82, phoneCalls: 63 },
  ]),
});

export const CAPS = Object.freeze({
  vertices: LEDGER.scene.vertices + LEDGER.headroom.vertices,
  meshes: LEDGER.scene.meshes + LEDGER.headroom.meshes,
  desktopCalls: LEDGER.openingDrawCalls.desktop + LEDGER.headroom.drawCalls,
  phoneCalls: LEDGER.openingDrawCalls.phone + LEDGER.headroom.drawCalls,
});

// [vertices, meshes, drawCalls] for one viewport width and mood.
export function budgetFor(width, mood) {
  const calls = (width === 390 ? LEDGER.moodDrawCalls.phone : LEDGER.moodDrawCalls.desktop)[mood];
  return [LEDGER.scene.vertices, LEDGER.scene.meshes, calls];
}
