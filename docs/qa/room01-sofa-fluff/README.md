# Room 01 sofa fluff

Sofa area at 390 x 844, device pixel ratio 4, slow mood, default view, clipped around the sofa.

- `before-390.png`: production before the change (#751-#753 had pressed the seat and backrest flat).
- `after-390.png`: this change, served from a local static copy of `public/`.

Change: the press-flat of the AI sofa's old cushions is 35% instead of 100% between the cushions (arm tips are still capped in full), the neighbour smoothing runs 4 passes on positions only (vertex colours are no longer averaged), the model's own normals are kept where nothing moved, and the scatter pillows are 0.48 m instead of 0.54 m (the terracotta one 3.5 cm further out).
