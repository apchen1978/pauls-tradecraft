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
  scene: Object.freeze({ vertices: 132250, meshes: 356 }),
  // Draw calls of the last rendered frame after settling: desktop 1440 px and phone 390 px, default (arrival) mood.
  openingDrawCalls: Object.freeze({ desktop: 93, phone: 73 }),
  // Draw calls after switching to each mood (1.2 s later). The "tech" mood lights one more thing than the others; the sunny moods (family, chic, slow, golden) draw the dust motes and the sunbeam (two more calls: the beam is double-sided, so it is drawn in two passes).
  moodDrawCalls: Object.freeze({
    desktop: Object.freeze({ rain: 93, family: 90, tech: 95, chic: 90, slow: 93, golden: 93, tv: 93 }),
    phone: Object.freeze({ rain: 70, family: 73, tech: 72, chic: 73, slow: 73, golden: 73, tv: 70 }),
  }),
    // Polish comes first (Paul, 2026-11-06): the caps are only a "still runs smoothly" guard, about 15% above what is measured, so adding detail
  // does not turn tests red. Going past a cap means: measure FPS and memory first, then raise the numbers here with a history line. Never trim a visual to fit.
  headroom: Object.freeze({ vertices: 17000, meshes: 48, drawCalls: 12 }),
  // Newest last. One line per change; the numbers are the measured totals AFTER the change.
  history: Object.freeze([
    { date: "2026-11-06", change: "first ledger: measured on main 8b474fc (nothing changed)", vertices: 113023, meshes: 325, desktopCalls: 82, phoneCalls: 63 },
    { date: "2026-11-11", change: "the ledger had fallen behind main: measured on main 860b507 it was already 115,431 / 327 meshes / 82 desktop 64 phone (the sofa cushions, curtains and later merges, #750-#758, were never recorded). The two scatter pillows now conform to the sofa (a denser 25 x 23 grid per sheet and baked shape offsets, no new mesh or draw call): +1,280 vertices", vertices: 116711, meshes: 327, desktopCalls: 82, phoneCalls: 64 },
    { date: "2026-11-11", change: "sofa pillows, second pass (Paul: from the side the backrest showed a white fold and the single pillow looked huge and fake): the old cushions leaning on the backrest are pressed almost flat (62 percent, seat part unchanged), the coloured pillows shrink from 48 to 40 cm, and a larger plain pillow (oat, dusty blue) sits behind each, as on many American sofas. Two more meshes (+2 draw calls) and +2,300 vertices", vertices: 119011, meshes: 329, desktopCalls: 84, phoneCalls: 66 },
    { date: "2026-11-11", change: "note 1/3 of the three-room note set (Paul): a yellow sticky note on the plant pot, tappable within 34 px (4 vertices, +1 mesh, +1 desktop draw call; phone unchanged because the note is outside the default 390 px view)", vertices: 119015, meshes: 330, desktopCalls: 85, phoneCalls: 66 },
    { date: "2026-11-16", change: "dust motes drifting in the window light (one Points draw, 84 motes, 44 on a phone; only in the sunny moods, fading out as the sun dims) and a slow 4 percent breathing of the sun; the speakers by the TV play two quiet original piano pieces (sound.js, browser synthesis) when tapped. The sunny moods cost one more draw call; meshes and vertices are unchanged (Points are not counted)", vertices: 119015, meshes: 330, desktopCalls: 85, phoneCalls: 66 },
    { date: "2026-11-16", change: "the living room gets its main light fixture (Paul: the ceiling had light but nothing it came from): a round washi-paper lantern on a short cord after Codex card 69 drawing A2, built in code (paper globe with fibre texture, bamboo rings, canopy, cord and cap; three meshes, about 2,500 vertices); its glow follows the main light, bright by day and dim at night", vertices: 121528, meshes: 333, desktopCalls: 88, phoneCalls: 69 },
    { date: "2026-11-17", change: "Room 01 opens in golden hour (Paul: the drifting light motes and the bright music suit it best), also from the home cover; the dust layer is drawn in the opening view, so the opening draw calls rise by one (89 desktop, 70 phone); no geometry change", vertices: 121528, meshes: 333, desktopCalls: 89, phoneCalls: 70 },
    { date: "2026-11-17", change: "golden hour looks like the sun comes in (Paul): brighter light (hemisphere 0.95 to 1.3, window sun 4.8 to 8, lantern fill 1.2 to 1.8, exposure 1.08 to 1.2, a slightly higher sun) and a soft beam of sunlight from the window (two crossed additive planes in one mesh, 8 vertices) that the dust motes drift through; the sunny moods draw it, so their calls rise by two (91 desktop, 72 phone in the opening view)", vertices: 121536, meshes: 334, desktopCalls: 91, phoneCalls: 72 },
    { date: "2026-11-18", change: "a second campus backpack (Room 02's model at 1.15x, mustard and olive, one vertex-coloured mesh) on the floor under the 福杯滿溢 scroll and the home board, with a mint bear charm (9 small meshes), and a soil disc with six pebbles in the big-leaf plant's pot (one mesh): +11 meshes, +7,099 vertices; desktop draw calls re-measured (the mood numbers moved by up to 4 in both directions, so part of that is measurement spread, not only the new meshes)", vertices: 128635, meshes: 345, desktopCalls: 92, phoneCalls: 72 },
    { date: "2026-11-18", change: "a record player on the left sideboard (a copy of Room 03's turntable: body, gold trim, platter and tonearm, 4 meshes, 2,304 vertices; a tap switches the room music, the platter turns while it plays) and the napkin pack moved from the sideboard to the coffee table as its own indexed mesh (+1 mesh, 3,026 fewer vertices than its old unindexed copy inside the sideboard props): +5 meshes, -722 vertices, opening draw calls +1", vertices: 127913, meshes: 350, desktopCalls: 93, phoneCalls: 73 },
    { date: "2026-11-18", change: "a record-player view (看唱片機 / The record player) and a close-up polish of the player: nine finer record grooves, a counterweight and arm tube detail, walnut plinth, three finishes (satin wood, glossier vinyl, brushed metal arm) on the meshes it already had, and a soft contact shadow plane under the deck (+1 mesh, +1,494 vertices). Phone opening calls measured 69 this time (73 before): measurement spread, the change adds no draw call to that view", vertices: 129407, meshes: 351, desktopCalls: 93, phoneCalls: 69 },
    { date: "2026-11-18", change: "sideboard mug (Paul: it looked badly moulded): the lathe profile now runs bottom-up on the outside so its faces are no longer inside out, the green lining stops at the rim on a duplicate ring, and the outside is light blue; one more profile ring in the unindexed props mesh (+192 vertices), no new mesh or draw call", vertices: 129599, meshes: 351, desktopCalls: 93, phoneCalls: 69 },
    { date: "2026-11-18", change: "a thin black power cord from the record player across the sideboard top and up into a small white wall outlet just above it (2 meshes), and Room 03's water bottle at 0.8 scale beside the blue mug (glass, water and label-cap, 3 meshes): +5 meshes, +2,651 vertices. Desktop opening calls unchanged at 93, phone measured 73 (69 last time, back to the earlier value: measurement spread plus the new meshes)", vertices: 132250, meshes: 356, desktopCalls: 93, phoneCalls: 73 },
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
