# Room 03: lemon tree leaves, no longer flat discs

Paul 2026-10-30: the lemon tree foliage looks like a flat picture (billboard).

Cause: 46 big round cards (~0.2 m), each a photo of a whole leaf cluster with feathered round edges, so the crown read as stacked discs.

Now: about 190 single leaves (36 sprigs of six), each its own small leaf-shaped card with a real alpha leaf outline, painted leaf texture cut from Codex's atlas (`room03-lemon-leaf-atlas-v2.webp`, no new image), a midrib and side veins. Sprigs fan outward and droop; leaves are darker toward the inside of the crown for depth; matte material so the sun no longer blows leaves out to white.

- Same two meshes for the tree, same draw calls. +848 vertices (scene 52,672 -> 53,520). The living-details cap (3,200) is kept: 3,133.
- Cache-bust `kitchen.js?v=81`, `page.js?v=82`.
- Tests: ledger, P0 lighting, kitchen main spec: 28 passed, 1 skipped. Full Room 03 suite not run. Real iPhone Safari: UNKNOWN.
- Screenshots `after-*-entry.png` (entry-wall view, tree beside the floor lamp).
