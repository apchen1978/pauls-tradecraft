# Room 03 daylight table: a stoneware water pitcher and two cups

In daylight the dining table held only the lemon bowl and read as an empty display table. This adds one pitcher (0.20 m tall, with a handle) and two cups (0.085 m) beside the bowl.

- One merged vertex-colour mesh in the lemon bowl's mood slot: +794 vertices, +1 mesh, +1 draw call in the moods that show the centerpiece. Dinner and Thanksgiving hide that slot, so their draw calls are unchanged and the new set never overlaps a place setting.
- The lemon bowl itself is untouched (its size and position are pinned by tests).
- Ledger updated per its own process (`tests/helpers/room03-ledger.js`): 107,019 vertices, 131 meshes, 81 desktop / 78 phone opening draw calls, with a history line.

Shots, same viewport and mood: `before-*` is main after #762, `after-*` is this branch (1440 and 390).

Checked: kitchen, daylight, p0-lighting, center-view, dinner-sunday, thanksgiving, movie and ledger specs, 37 passed. Not checked on a real phone; the set sits at the far side of the table so the near edge of the default frame does not crop it.
