# Room 01 coffee-table mug

The coffee-table mug now has a fine, shader-only crema edge and a 22-point steam wisp using the same motion and soft particle treatment as the red mug by the sofa. The cup model, vertex count, triangles, and mesh count are unchanged by the refinement; the steam adds one draw call in every measured view and mood.

## Evidence

- `before-golden-1440.png` / `after-golden-1440.png`: 1440px room context.
- `before-golden-390.png` / `after-golden-390.png`: 390px phone context.
- `before-mug-detail-1440.png` / `after-mug-detail-1440.png`: mug and table view. The existing test framing is a contextual view, not a macro crop.

## Measurements

- Mug: 862 vertices, 1,712 triangles; model and clearances unchanged.
- Latest-main settled room baseline measured before this change: 246,256 vertices, 406 meshes. Current refinement measures the same geometry totals.
- Draw calls: +1 on desktop and phone, in all seven moods.
- Room 01 ledger: 3 passed; measurement case skipped after collecting the measurement block.
- Mug and steam focused spec: 1 passed, including a check that steam particle positions change over time.
- Full Room 01 spec: 69 passed, 5 failed. All five failures were reproduced on clean `origin/main`; none involve the mug.

## Limits

- Steam motion was verified in headless Chrome, not on a physical phone.
- No user-level device performance or visual acceptance is claimed.
