# Room 03: hood and dish-dryer finish

GrokBot (2026-10-31): the hood and the "microwave" read like plastic. The "microwave" is Paul's own dish dryer (copied from his photo), so its shape and display are untouched.

- Hood: steel colour a little cooler and more metallic (`#c4c9ca`, roughness 0.5, metalness 0.2); five dark vent slots in the canopy underside, three steel knobs and a polished lip on the front face.
- Dish dryer: a 3 mm polished lip around the opening (vertex colour 1.0 against 0.9 on the frame) and stronger diagonal glare on the black glass. There is no environment map in the room, so highlights are painted in rather than coming from metalness.
- All pieces join existing meshes (the appliance black and steel buckets and the dryer frame): +504 vertices, no new mesh, no new draw call (79 / 78). Ledger updated.
- Cache-bust `kitchen.js?v=87`, `page.js?v=88`. Tests: kitchen main, ledger, P0 lighting, P2 contact shadows, composition, lamps, dish dryer: 35 passed, 1 skipped. Full Room 03 suite not run. Real iPhone Safari: UNKNOWN.
- `after-1440.png` is the opening view at 2x; hood and dryer are in the upper middle.
