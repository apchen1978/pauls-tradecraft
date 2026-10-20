# Mobile TV-wall field of view

On a tall canvas (`aspect < 0.8`), the vertical field of view eases from 66° facing the window to 76° facing the TV wall, by camera yaw. Desktop, the window view, postcards, and the 8-second tour stay on the fov `fit()` already chose.

## Where it lives

`fit()` still sets the shared base (66° when `aspect < 0.8`, otherwise 44°) and still resets the pose to the saved angle. The widening is applied in `render()`, which already draws every orbit frame: dragging, the view-button turn, and the entrance drift. The controls `change` listener does not fire during those hand-placed moves, so the fov would jump at the end. While the short film is playing, `render()` keeps the base fov, so the tour camera path is not reframed. `updateProjectionMatrix` on that path runs only when the fov value actually changes. `fit()` still rebuilds the matrix because the aspect can change on resize.

Weight is `(1 - cos(yaw)) / 2`, with yaw 0 at the window and ±180° at the TV wall. At 135° that is about 74.5°.

## What these pictures are

Chrome, device pixel ratio 1, reduced motion, Vite dev server on port 4188. Before frames replace `app.js` with `391ec84`. This is emulated mobile, not a physical phone. Canvas aspect is the stage, not the viewport.

| Viewport | Language | Stage | Aspect | Window / 135° / TV fov |
| --- | --- | --- | --- | --- |
| 390×844 | zh | 358×490 | 0.731 | 66 / 74.54 / 76 |
| 390×844 | en | 358×444 | 0.806 | 44 / 44 / 44 |
| 390×740 | zh | 358×429 | 0.834 | 44 / 44 / 44 |
| 390×740 | en | 358×340 | 1.053 | 44 / 44 / 44 |
| 360×740 | zh | 328×429 | 0.764 | 66 / 74.54 / 76 |
| 360×740 | en | 328×340 | 0.965 | 44 / 44 / 44 |
| 1440×900 | zh, en | 1360×648 | 2.099 | 44 / 44 / 44 |

Pixel comparison (`diffs.json`): the only changed frames are Chinese 390×844 and 360×740 at 135° and at the TV wall. Window, desktop, English phone, and 390×740 are identical. No horizontal overflow.

The "Christ is the Head of this House" plaque is on the window wall. That view stays at 66° and is pixel-identical; the plaque stays readable and is the first surface under its centre.

## Reproduce

```bash
npx vite --host 127.0.0.1 --port 4188
node docs/qa/roomverse-mobile-tv-fov/capture.mjs
python3 docs/qa/roomverse-mobile-tv-fov/compose.py
```

CC can rerun this locally. The production check is `npx playwright test` (build + preview on 4173).
