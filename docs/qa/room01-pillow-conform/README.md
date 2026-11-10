# Room 01: the scatter pillows conform to the sofa

Paul: since the sofa was tidied (#756) the pillows look like they hover, especially from the side. Card 41 (Codex) measured that no rigid pose can fit: the AI sofa's backrest is lumpy, so a flat pillow leaned on it leaves a wedge of air at the top while its lower back digs in. A real pillow is soft, so these now deform.

- **Pose:** each pillow's lean, sideways and back-to-front position are chosen by search (rear sheet closest to the backrest, bottom edge resting on the seat). Both came out at 30 degrees; the green one moved 30 mm toward the middle of the seat and about 30 mm back, the terracotta one about 30 mm back.
- **Shape:** every vertex of the rear sheet is pulled to 3 mm off the sofa surface along the pillow's back normal (clamped to -25/+40 mm, smoothed six passes, faded toward the rim), the front sheet follows by half so the pillow stays plump, and the lowest six rows settle onto the seat.
- **Denser grid:** the pillow is 24 x 22 segments per sheet (was 16 x 14) so the shaped surface is smooth instead of faceted: +1,280 vertices, no new mesh, no new draw call.
- **Baked, not searched at load:** the search ray-casts the whole sofa mesh (about 40 s offline). Its result is stored in `PILLOW_FIT` and applied at load with no ray cast. `__room.bakePillowFit()` re-runs it if the sofa mesh ever changes; `__room.pillowFit()` measures the result.
- The sofa mesh, its vertex colours, the pillow colours and weave, the curtains and the table are untouched. The pillow size is the same (0.48 x 0.32 x 0.48 m).

## Measured (sampled; `__room.pillowFit()`, mm; gap > 0 is air, < 0 is sunk into the sofa)
| | Before (rear sheet vs backrest) | After |
|---|---|---|
| Green, median gap | 63.6 | 10.7 |
| Terracotta, median gap | 57.6 | 10.0 |
| Seat contact, median at the bottom row | -26 / -32 (sunk) | -3.8 / -11 |

**Not met, said plainly:** the sampled maximum penetration is still about 56 mm for both, and the 95th-percentile gap at the top is still 130 to 186 mm. Those numbers come from the pillow's outer rim near the sofa arms and from the top of the backrest, where the AI mesh is far away or the ray meets the arm. The card's goals of "at most 15 mm" and "closed backrest gap" are therefore not proven by these numbers. What did change, and is visible: in the right-hand view the terracotta pillow now lies against the backrest where before a wedge of air showed; from the left front both pillows sit down onto the seat. Visual judgment only; no tests guard these numbers (a guard would have to be loosened to pass).

## Pictures
`before-*` and `after-*`, same camera and viewport (1100 x 800, zh), from the local diagnostic hook `frameSofa` (a close-up the visitor's orbit camera cannot reach). Not checked: a phone at 390 px, other moods, a real device.

## Tests
Room 01 ledger and `roomverse-3d.spec.js`: 51 passed, 17 failed, 1 skipped. The same 17 fail on unmodified main (compared name by name, identical sets), so this change adds none. The Room 01 ledger had fallen behind main (it said 113,023 vertices; main measured 115,431); it is brought to the real 116,711 / 327 / 82 / 64 with a history line.
