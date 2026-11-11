# Room 01 sofa: layered pillows, backrest fold gone

Paul, after #771: the pillows were better, but from the side a white fold hung off the backrest (it looked like a sheet draped over the sofa), and a single pillow on each side looked far bigger than the laptop on the table. He asked to remove the fold, try a fuller backrest, shrink the pillows, or put two pillows on each side as on many American sofas. All three were tried.

- **The fold** was the part of each old cushion (fused into the AI sofa mesh) that leans on the backrest: it was pressed out only 35 percent (#756 kept the seat plump). That depth band (0.28 to 0.75 m from the back) is now pressed 62 percent; the seat part keeps 35 percent. A 90 percent press was tried first and tore the fabric beside the right pillow, so it was backed off.
- **Smaller pillows:** the coloured ones are 40 x 27 x 40 cm (were 48 x 32 x 48), the common 16-inch size.
- **Two per side:** a larger plain pillow (48 cm; oat on the left, dusty blue on the right, echoing the blue-stripe rug) sits behind each coloured one. The back pillows are fitted to the sofa first, then the front pillows rest on them (the fit search treats the back pillows as part of the sofa). They fill the gap and hide what is left of the fold.
- **Fit search limits:** pillow lean is limited to 12-38 degrees; without a limit the search laid the front pillows down almost flat (45-55 degrees). Baked into `PILLOW_FIT` as before; `__room.bakePillowFit()` re-runs it, `__room.pillowFit()` measures it.

`before-*` is main after #771, `after-*` is this branch, same camera and viewport (1100 x 800, zh, local diagnostic hook `frameSofa`; a close-up the visitor's orbit camera cannot reach).

Budget (Room 01 ledger, updated with a history line): 119,011 vertices (+2,300), 329 meshes (+2), 84 desktop / 66 phone opening draw calls (+2).

Tests: Room 01 ledger and `roomverse-3d.spec.js`: 50 passed, 18 failed. 17 of those fail identically on unmodified main; the 18th ("closed interior door at 390px", a light count of 7 against 6) also fails on unmodified main when run alone, so none are caused by this change. Not checked: a phone at 390 px, other moods, a real device.
