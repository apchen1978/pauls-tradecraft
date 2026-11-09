# Room 01: smudges between the scatter cushions and the sofa

Cause: the AI sofa mesh carries the old cushions' baked vertex colours (dark green/orange undersides, lum ~0.3 vs ~0.56 for the fabric).
After the cushions were pressed down and covered with smaller procedural ones, those vertices showed as dark/reddish smudges around the new cushions.

Fix: inside the cushion zones, vertices that are dark (lum < .5) or too orange (r-b > .25) are repainted from their clean neighbours, a ring at a time. Positions are not touched.

- `before-*` = origin/main, `after-*` = this branch, same mood/viewport/wait (390 @4x crop; 1440 crop).
- `original-before-pillows-390.png` = the build before the procedural cushions were added (#750), for reference.
Remaining: a pin-size dark speck at the left cushion's top corner (390 @4x only). Night/other moods look the same as before.
