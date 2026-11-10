# Room 03 daylight: a clearer light direction, a lighter oak floor

Daylight mood only (`kitchen.js`):

- Sun position `[-3.6, 2.1, 3.4]` -> `[-3.9, 1.6, 3.2]`. Intensity stays 1.25, so the 1 percent blown-out gate is untouched. The window frame now throws real shadows across the cabinets and floor.
- Floor tint `0xc8bda9` -> `0xd8d8d2`: a lighter, greyer oak, less orange. The oak photo texture is still honey-coloured, so a tint can reduce the orange but not remove it.
- Hemisphere fill is unchanged at 1.15. Lowering it to 0.95 and 1.08 dropped the upper-cabinet luminance to 74.9 and 78.0, under the 78.36 gate.

Shots (same viewport, same mood, same camera): `before-*` is production, `after-*` is this branch.

- `before-1440-daylight.png` / `after-1440-daylight.png`
- `before-390-daylight.png` / `after-390-daylight.png`

Checked: kitchen, kitchen-daylight and room03-p0-lighting specs, 28 passed. Other moods were not changed and were not screenshotted. Not checked on a real phone.
