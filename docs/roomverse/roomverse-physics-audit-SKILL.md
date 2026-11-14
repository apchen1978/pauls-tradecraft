---
name: roomverse-physics-audit
description: Audit procedural ROOMVERSE furniture and props for support, joint, container-wall, barrier and grounding failures; use when adding or moving a part that should touch another part.
---

# Roomverse physics audit

Use this when a Room 04 change adds or moves a chair leg, support post, ring, frame, straw, vine, shelf object or counter prop. The audit checks selected construction relationships numerically before geometry is merged. It supplements fixed camera screenshots; it does not simulate rigid-body physics or prove that every triangle is collision-free.

## Five rules

1. A foot or post enters its supported seat or beam footprint and extends at least **3 mm** inside its underside. A point touching an outer edge fails.
2. Ring, back and adjoining line endpoints have a surface gap of at most **2 mm**. Register both partners, including ring radius and tube radius.
3. At a container rim, the interpolated straw or utensil centre plus its tube radius stays within the inner rim radius. A negative clearance fails.
4. A vine or cable clears every solid shelf or wall it crosses. Sample the actual curve against a solid box, including tube radius. Deliberate hang points need an explicit support relationship.
5. Feet and bases meet their named floor or support surface within **3 mm**. Frames mount to their wall. Construction state such as `partShift` returns to zero before later objects are built.

These are Room 04 defaults in metres internally, reported in millimetres. Use the physical size of a new object to justify any item-specific tolerance; never relax the global threshold to hide a failure.

## Register and run

- Register a named relationship in `cafe.js` beside the geometry that creates it, before the next `flush()`. Use `registerSupport(name, kind, data)`. The current kinds are `embed`, `join`, `rim`, `barrier`, `rest`, `ground`, `wall`, and `reset`; see [`physics-audit.js`](../../public/prototype/roomverse-3d/cafe/physics-audit.js) for the exact input fields.
- Derive coordinates from the builder's geometry, curve, or shared construction parameters. For a transformed part, apply the same rotation and translation as the rendered geometry. Do not register constants unrelated to the built part or an automatic check becomes a second story about the scene.
- After entering the room, call `window.__room04.physicsAudit()` in the browser or run `npx playwright test tests/roomverse-room04-physics.spec.js`. The hook computes only when called. Every result has `{ ok, name, detail }`; a failed `detail` gives a signed gap, inset or penetration in mm.
- Run the Room 04 scene and home-link specs after a scene change. Check the ledger for unchanged or deliberately changed vertices, mesh count and opening draw calls. When `cafe.js` changes, bump `page.js`'s `cafe.js?v=`, then bump `index.html`'s `page.js?v=`.

## Read a failure

`support inset -7 mm` means the support point lies outside the supported footprint. `vertical embed 0 mm` means it only touches the underside. Positive `joint gap` means detached parts. Negative `rim clearance` means a straw pierces the cup wall. Positive `board/wall penetration` means a line passes through the solid. Positive `ground gap` means floating; a negative value means burying. Check the named builder and inspect a close view before deciding whether the registered geometry is correct. For intentionally suspended objects, name the hanger and audit that attachment instead of suppressing grounding.

The current room has 26 pinned findings in the Playwright spec: four Lounge armchair legs are 10.7 mm above the floor; the footstool and side-table bases are 12 mm above; the stone table base is 11 mm above; three oak-table legs are 7.6–7.8 mm above; and 16 bentwood bar-stool leg tips have 0 mm vertical embed. Keep them visible in the report. Fix each in a separate scene PR, then remove its exact expected finding. A new failure or changed measurement must fail the test.

## Historical regression cases

- **#837 chair legs:** the old window-chair legs were centred 207 mm from a 200 mm seat axis. The fixture expects a negative footprint inset; current chair legs must enter the seat.
- **#838 chair-back oval:** a 35 mm surface gap between ring and post must fail `join`; the built ring and both posts must touch.
- **#843 46 straws:** interpolate each straw at the holder rim. Its outside radius must remain within the cup's inner rim.
- **#850 pothos:** sample every trailing vine over the upper shelf. Crossing the slab before clearing its front edge must fail `barrier`.
- **#845 displaced picture frames:** a leftover counter `partShift` after building the room must fail `reset`. Wall frames are also checked against the wall plane.

The bad versions live as small numeric fixtures only in the Playwright test. They do not modify the public scene. The audit's registration list is deliberately scoped; unregistered objects remain **unverified**, not proven sound.
