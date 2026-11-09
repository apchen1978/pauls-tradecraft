# Room 01 curtains: pleats, plumb edges, thickness

Before/after of the same view (local static build of origin/main vs this branch, same mood, viewport and wait).

- `before-1440-slow.png` / `after-1440-slow.png` (1440x900, mood slow)
- `before-390-rain.png` / `after-390-rain.png` (390x844 @3x, mood rain)

Change (`public/prototype/roomverse-3d/app.js`, curtain block):
- Each panel is one mesh: two sewn layers 1.2 cm thick plus side and hem edge strips (was a single flat plane).
- Pleats mix two wavelengths and get ~40% denser and shallower toward the rod (the gather); edges stay plumb.
- Hem hangs 2.5 cm above the floor with a gentle wave. The panels are now opaque (were 93% opacity).
- Panel x position, rod and window frame are unchanged, so the second-print blocker clearance is unaffected.

Cost: +1,388 vertices (82 -> 776 per panel), meshes and draw calls unchanged.
