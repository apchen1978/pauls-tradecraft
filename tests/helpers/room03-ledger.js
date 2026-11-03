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
  scene: Object.freeze({ vertices: 70539, meshes: 117 }),
  // Draw calls in the first frame (desktop 1440 px, phone 390 px), golden/daylight opening view.
  openingDrawCalls: Object.freeze({ desktop: 77, phone: 76 }),
  // Draw calls per mood (first frame after the mood is set), measured with the persistent paper-napkin pack.
  moodDrawCalls: Object.freeze({
    desktop: Object.freeze({ daylight: 77, golden: 77, movie: 75, night: 77, dinner: 84, sunday: 77, thanksgiving: 87 }),
    phone: Object.freeze({ daylight: 76, golden: 76, movie: 74, night: 76, dinner: 83, sunday: 76, thanksgiving: 86 }),
  }),
  // Room above the measured value that cap checks allow. Kept at the strictest of the caps the specs used before the ledger existed
  // (vertices: the red-pot spec's 39,105 + 11,300 = 50,405). A resized desktop page is not a real phone, so it has its own cap.
  headroom: Object.freeze({ vertices: 117, meshes: 0, desktopCalls: 0, phoneCalls: 0 }),
  resizedPhoneCalls: 80,
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
    { date: "2026-10-31", change: "entry-hall wall clock modernised: matte black thin frame, white dial, quarter batons, slim hands and a coral second hand (same mesh, +344 vertices)", vertices: 59958, meshes: 112, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "entry-hall TV: a 55 in wall-mounted panel with a thin black bezel (one black slab mesh) replaces the 40 in oak-framed one; left quarter sits inside the side wall (-72 vertices, +1 mesh)", vertices: 59886, meshes: 113, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "reading corner by the floor lamp: oak stool, folded blanket and a book with a ribbon bookmark (one merged mesh, +544 vertices, +1 mesh; not in the opening frustum, so the opening draw calls stay 79 / 78)", vertices: 60430, meshes: 114, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "stool legs seated inside apron; same merged mesh, +160 vertices", vertices: 60590, meshes: 114, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "unbranded ketchup and mustard on counter; soy bottle replaces one wok-shelf canister; +738 vertices, existing meshes", vertices: 61328, meshes: 114, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "entry hall: wall clock and red towel replaced by a cork board (crayon drawing, generic menu, market flyer; canvas atlas on the same mesh) and a canvas tote plus plain cap on the hooks (+1,769 vertices, same mesh, no new draw call)", vertices: 63097, meshes: 114, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "entry hall: plain cap replaced by a second, narrower brick-red canvas tote on the left hook (-318 vertices, same mesh, no new draw call)", vertices: 62779, meshes: 114, desktopCalls: 79, phoneCalls: 78 },
    { date: "2026-10-31", change: "entry nook decor: kilim rug and fringe, folded throw, basket and books, shoe tray with two pairs of slippers, pampas floor vase (one vertex-colour mesh, +4,378 vertices incl. lenses), two recessed downlights (lens mesh) and one warm point light that follows the mood", vertices: 67157, meshes: 116, desktopCalls: 80, phoneCalls: 79 },
    { date: "2026-10-31", change: "hall interior widened to x +/-1.64 (same vertex count); nook downlight point light replaced by a ceiling halo mesh (no extra scene light, +8 vertices, +1 mesh); TV and downlights forced on in the nook view", vertices: 67165, meshes: 117, desktopCalls: 80, phoneCalls: 79 },
    { date: "2026-11-01", change: "nook pass: TV panel 1.20 x 0.675 -> 1.45 x 0.816 and shifted to the hall side wall so its cut edge hides behind the corner (same mesh and vertex count); throw reshaped with a hanging flap (+4 vertices); contact decals under the bench feet, shoe tray and pampas vase (+24 vertices); no new mesh or draw call", vertices: 67193, meshes: 117, desktopCalls: 80, phoneCalls: 79 },
    { date: "2026-11-01", change: "nook micro-world: a sleeping puppy plush on the console top (+468 vertices, same merged decor mesh, no new mesh or draw call) and uneven rug fringe at the same vertex count", vertices: 67661, meshes: 117, desktopCalls: 80, phoneCalls: 79 },
    { date: "2026-11-03", change: "two differently coloured takeaway coffee cups replace the tiny cup on the terracotta credenza (+581 vertices net, same merged decor mesh; no draw-call increase)", vertices: 68242, meshes: 117, desktopCalls: 80, phoneCalls: 79 },
    { date: "2026-11-03", change: "a 1,660-vertex unbranded San Francisco cable-car keepsake replaces the procedural potted plant on the terracotta credenza (+1,055 net vertices, same merged decor mesh; no draw-call increase)", vertices: 69297, meshes: 117, desktopCalls: 80, phoneCalls: 79 },
    { date: "2026-11-03", change: "paper-napkin pack beside the clay-red credenza is permanent across moods (+766 vertices, one mesh; dinner/Thanksgiving views include it)", vertices: 70063, meshes: 118, desktopCalls: 80, phoneCalls: 79 },
    { date: "2026-11-03", change: "window-side beam matches the ceiling honey wood finish (+1 mesh and +1 visible draw call; art mat change is texture-only)", vertices: 70063, meshes: 119, desktopCalls: 81, phoneCalls: 80 },
    { date: "2026-11-04", change: "wok station detail pass: one 75%-scale solid wall board, four smaller everyday utensils and four seasoning jars; retail-style olive oil moved beside the permanent napkin pack (+476 vertices, net -2 meshes, opening draw calls -4 desktop / -3 phone)", vertices: 70539, meshes: 117, desktopCalls: 77, phoneCalls: 76 },
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
