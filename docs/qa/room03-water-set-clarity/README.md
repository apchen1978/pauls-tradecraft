# Room 03 daylight water set: from a frosted blob to readable glass

Paul (2026-11-11, phone screenshot): the pitcher and glasses on the front-right of the dining table still read as a washed-out white blob overlapping the cream chair back. No visible water line, no rim highlight, they looked like frosted plastic and seemed to float.

This pass keeps the pear pitcher, two tumblers and lemon water from #764/#765, then:

- Moves the set toward the table centre (0.50, 0.27 → 0.32, 0.42) so the default daylight camera, desktop and phone, no longer reads the pitcher against the right-hand chair back.
- Rebuilds the glass as a low-opacity `MeshPhysicalMaterial` (opacity 0.22, clearcoat 1, darker rim and foot via vertex colours). Transmission was tried and dropped: three.js re-renders the whole room into a refraction buffer and doubled the opening draw calls (83 → 156). The material now lives in `makeMaterials` as `waterSetGlass`, so the existing room PMREM actually reaches it (it was assigned after the mesh was built, and never stuck). Every lathe is `weldSmooth`'d; the handle ends are buried and capped.
- Fills the pitcher and both tumblers about three-quarters, with a flat water surface and a darker meniscus ring. Two opaque Meyer-lemon slices sit just under the pitcher surface.
- Keeps a tighter, stronger contact-shadow plane under the three footprints, sized so it stays clear of the lemon bowl.

`before-*` is main after #765; `after-*` is this branch. The close-ups use a diagnostic camera (not a user-reachable view).

Ledger: 110,493 vertices, 134 meshes, 85 desktop / 82 phone opening draw calls, with a history line. Dinner and Thanksgiving hide the set with the lemon bowl, so those two moods stay unchanged.
