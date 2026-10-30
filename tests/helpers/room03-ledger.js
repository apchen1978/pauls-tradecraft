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
  scene: Object.freeze({ vertices: 59614, meshes: 112 }),
  // Draw calls in the first frame (desktop 1440 px, phone 390 px), golden/daylight opening view.
  openingDrawCalls: Object.freeze({ desktop: 79, phone: 78 }),
  // Draw calls per mood (first frame after the mood is set). Dinner and Thanksgiving record the BASE scene
  // without the tableware layer; their measured totals are 82/83 and 83/86, respectively.
  moodDrawCalls: Object.freeze({
    desktop: Object.freeze({ daylight: 79, golden: 79, movie: 77, night: 79, dinner: 79, sunday: 79, thanksgiving: 79 }),
    phone: Object.freeze({ daylight: 78, golden: 78, movie: 76, night: 78, dinner: 78, sunday: 78, thanksgiving: 78 }),
  }),
  // Room above the measured value that cap checks allow. Kept at the strictest of the caps the specs used before the ledger existed
  // (vertices: the red-pot spec's 39,105 + 11,300 = 50,405). A resized desktop page is not a real phone, so it has its own cap.
  headroom: Object.freeze({ vertices: 117, meshes: 0, desktopCalls: 0, phoneCalls: 0 }),
  resizedPhoneCalls: 78,
  // Newest last. One line per change; the numbers are the measured totals AFTER the change.
  history: Object.freeze([
    { date: "2026-10-29", change: "(reconstructed from spec comments) main 261fbc4 plus living details", vertices: 47680, meshes: 99, desktopCalls: 68, phoneCalls: 70 },
    { date: "2026-10-29", change: "(reconstructed) dish dryer, credenza, TV glass, robot (one merged mesh)", vertices: 47680, meshes: 105, desktopCalls: 72, phoneCalls: 73 },
    { date: "2026-10-30", change: "door beside the cable-car painting (#627): leaf and doorway light; frame joins the trim mesh", vertices: 50368, meshes: 107, desktopCalls: 73, phoneCalls: 74 },
    { date: "2026-10-30", change: "daylight arrival mood (#628): no geometry change", vertices: 50368, meshes: 107, desktopCalls: 73, phoneCalls: 74 },
    { date: "2026-10-30", change: "three-tier paper pendant replaces the opal-globe model (#629)", vertices: 50288, meshes: 107, desktopCalls: 73, phoneCalls: 74 },
    { date: "2026-10-30", change: "Room 03 Card 3: paper floor lamp, gathered curtains, entry mirror and hooks (#631)", vertices: 52265, meshes: 109, desktopCalls: 74, phoneCalls: 75 },
    { date: "2026-10-30", change: "entry wall: linen coat replaced by one red dish towel on the middle hook", vertices: 52268, meshes: 109, desktopCalls: 74, phoneCalls: 75 },
    { date: "2026-10-30", change: "smart kitchen hub: one unlit display plane on the backsplash above the hob (bezel painted into the texture)", vertices: 52272, meshes: 110, desktopCalls: 75, phoneCalls: 76 },
    { date: "2026-10-30", change: "entry wall: flat grey mirror disc replaced by an oak-rimmed round wall clock (same mesh, +400 vertices)", vertices: 52672, meshes: 110, desktopCalls: 75, phoneCalls: 76 },
    { date: "2026-10-31", change: "lemon tree: 46 round photo cards replaced by about 200 single leaf cards in sprigs (+848 vertices, same mesh)", vertices: 53520, meshes: 110, desktopCalls: 75, phoneCalls: 76 },
    { date: "2026-10-31", change: "credenza top styled like Room 01 shelves: books, vessel with dried stems, potted plant, dish with stones (one merged mesh, +1811 vertices)", vertices: 55331, meshes: 111, desktopCalls: 76, phoneCalls: 76 },
    { date: "2026-10-31", change: "entry hall: the three inner walls are dusty pink (second material on the same mesh, +1 draw call, no new geometry)", vertices: 55331, meshes: 111, desktopCalls: 77, phoneCalls: 77 },
    { date: "2026-10-31", change: "wok side: brass tool rail with five wooden-handled tools plus two shelf canisters replace the three black sticks (one new vertex-colour mesh replaces the old black one; net +1,096 vertices, no extra draw call)", vertices: 56427, meshes: 111, desktopCalls: 77, phoneCalls: 77 },
    { date: "2026-10-31", change: "default camera pulled back 0.2 m along the same line of sight (desktop and phone): one more mesh is inside the opening frustum on desktop, no new geometry", vertices: 56427, meshes: 111, desktopCalls: 78, phoneCalls: 77 },
    { date: "2026-10-31", change: "counter: a sourdough boule on a round oak board and a bowl of apples (one merged mesh, +1,768 vertices, +1 mesh, +1 draw call)", vertices: 58195, meshes: 112, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "hood vent slots, knobs and polished lip; dish dryer polished lip and stronger glass glare; all inside existing meshes (+504 vertices, no new mesh or draw call)", vertices: 58699, meshes: 112, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "main backsplash uses a rounded tiled box instead of a plain box (+24 vertices, same bucket, no new mesh or draw call)", vertices: 58723, meshes: 112, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "counter story: a slice cut from the sourdough, crumbs and a lemon half (same mesh, +891 vertices, no new mesh or draw call)", vertices: 59614, meshes: 112, desktopCalls: 79, phoneCalls: 78 },
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
