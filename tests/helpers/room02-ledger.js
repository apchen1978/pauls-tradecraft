// Room 02 budget ledger: the ONE place that holds the scene-size baselines the Room 02 specs check.
// Before this file the numbers were typed into tests/roomverse-bedroom.spec.js (a "< 66000" vertex ceiling in seven tests, 64,291 / 304 in one,
// 64,014 / 302 in another, and a "158 +2" draw-call line), so every change meant hunting for them. Same rules as room01-ledger.js / room03-ledger.js.
//
// HOW TO UPDATE after you add or remove something in Room 02:
//   1. Measure:  ROOM02_LEDGER_MEASURE=1 npx playwright test tests/roomverse-room02-ledger.spec.js -g measure   (prints a ready-to-paste block)
//   2. Edit ONLY this file: the numbers in `scene`, `pocket`, `sceneWithoutPocket`, `openingDrawCalls`, `moodDrawCalls`, and add one line to `history`.
//   3. Do not raise `headroom` to make a test pass; a headroom is room for a later small change, not a way around a budget.
// Budgets are QA tools, measured first and never cut to fit: if a change is worth its cost, record it here with a history line.
// The measured numbers below are a RECORD (they must match the newest history line); only the caps (measured + headroom) can fail a run.

export const LEDGER = Object.freeze({
  // Measured settled (everything loaded), desktop 1440 px; the phone shares the same geometry.
  scene: Object.freeze({ vertices: 64291, meshes: 304 }),
  // The bedside pocket set (glasses case, pouch, cable, charge puck) is checked on its own in the bedroom spec; the rest of the room is the difference.
  pocket: Object.freeze({ vertices: 277, meshes: 2 }),
  sceneWithoutPocket: Object.freeze({ vertices: 64014, meshes: 302 }),
  // Draw calls of the last rendered frame after settling, default (focus) mood: desktop 1440 px and phone 390 px.
  openingDrawCalls: Object.freeze({ desktop: 158, phone: 156 }),
  // Draw calls after switching to each mood.
  moodDrawCalls: Object.freeze({
    desktop: Object.freeze({ focus: 158, weekend: 158, golden: 158, night: 158, sunday: 158, series: 160 }),
    phone: Object.freeze({ focus: 156, weekend: 156, golden: 156, night: 156, sunday: 156, series: 158 }),
  }),
  // Polish comes first (Paul, 2026-11-06): the caps are only a "still runs smoothly" guard, about 15% above what is measured, so adding detail
  // does not turn tests red. Going past a cap means: measure FPS and memory first, then raise the numbers here with a history line. Never trim a visual to fit.
  headroom: Object.freeze({ vertices: 9600, meshes: 45, drawCalls: 24 }),
  history: Object.freeze([
    { date: "2026-11-05", change: "(reconstructed from spec comments) premium turntable and printed record wall (#730) and later merges: 64,291 / 312 settled", vertices: 64291, meshes: 312, desktopCalls: 162, phoneCalls: 0 },
    { date: "2026-11-06", change: "first ledger: the nine floor/console footprints are one merged mesh (312 to 304, 162 to 158 draw calls); measured on main fcf4025, nothing changed", vertices: 64291, meshes: 304, desktopCalls: 158, phoneCalls: 157 },
    { date: "2026-11-11", change: "series-night phone (Paul): the bedside phone flips face up in series night and its screen and a soft glow pulse a notification about every 16 s. The screen plane and the glow plane are drawn only in series night (+2 draw calls there, nothing in other moods; the settled vertex and mesh counts are unchanged because the two meshes are hidden). Phone draw calls re-measured at 156 on current main (the ledger said 157).", vertices: 64291, meshes: 304, desktopCalls: 158, phoneCalls: 156 },
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
