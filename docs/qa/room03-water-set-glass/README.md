# Room 03 daylight table: the water set rebuilt as real glass

The first version (#763) was one opaque stoneware mesh. Paul: it looked like a mould, nothing like the glasses on the same table. Rebuilt the way the dinner glassware is built.

- **Pitcher:** a pear-shaped clear-glass pitcher (0.219 m tall, 0.136 m across the belly, heavy 12 mm base), a pinched pour spout, a large D-shaped glass handle, filled with water and two Meyer-lemon slices (they echo the lemon bowl beside it). The first rebuild was a straight tube; the shape was changed to a rounded belly narrowing to a neck.
- **Tumblers:** the dinner water-glass profile (0.072 m x 0.082 m), one half full, one nearly empty.
- **Water and glass:** the water uses the sideboard mineral-water bottles' tint and opacity (`waterClear`: 0xc9e2e4, 0.30); the glass uses the dinner glass material numbers. Two merged transparent meshes (water then glass), no shadow casting, same as the dinner glassware.
- Ledger updated through its own process: 108,509 vertices, 132 meshes, 82 desktop / 79 phone opening draw calls, with a history line. Dinner and Thanksgiving hide the set, so their counts are unchanged.

Shots, same viewport and mood: `before-*` is main after #763, `after-*` is this branch; `after-closeup-table.png` is a diagnostic camera (not a user-reachable view).

Checked: kitchen, daylight, p0-lighting, center-view, dinner-sunday, thanksgiving, movie and ledger specs, 37 passed. Not checked on a real phone.
