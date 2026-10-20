# ROOMVERSE continuous orbit — PR 1 handoff

## Paul’s instruction

Fix the continuous-rotation issue as the first of three separate Draft PRs. Check every camera-angle dependency, preserve the plaque text and existing room behavior, and do not merge without Paul’s `merge #N` instruction. PR 2 will expand click targets; PR 3 will present wide postcard concepts and wait for Paul to choose before changing postcard behavior.

## FACT

- On the baseline (`42b61a1`), real Playwright mouse drags in phone and desktop viewports reached the ±180° azimuth boundary after about one full turn; a second turn could not continue. Baseline screenshots are prefixed `baseline-`.
- The cause was `OrbitControls.minAzimuthAngle/maxAzimuthAngle` fixed at `-Math.PI/Math.PI`. The camera could reach the TV-wall pose at the boundary but could not cross it.
- PR 1 removes those hard limits. Phone `390×844` and desktop `1440×900` each completed four half-turn drag gestures, measuring `-719°` total from the TV-wall start. After the first release, both settled near `1°`, away from the TV-wall preset at `180°`; no return to that pose occurred.
- The 179°/181° FOV seam check remained continuous. `moveToView()` already takes the shortest wrapped angular delta. The director uses explicit camera poses and restores the saved camera. The postcard temporarily uses its window-facing pose and restores the live camera.
- URL state supports `view=tv` and the default window view. There is no `angle=` URL parameter in the current app; this PR does not add one.
- All ROOMVERSE specs passed: 73/73 across `roomverse-3d`, `roomverse-director`, `roomverse-right-wall-art`, `roomverse-shelf-decor`, and `roomverse-tv-screen`.
- Also passed: `npm test` (89/89), `npm run build`, `node scripts/verify-export-check.mjs`, `node scripts/check-journey-language.mjs`, `python scripts/check-onepager-sync.py`, `node scripts/check-document-parity.mjs`, and `git diff --check`.

## INFERENCE

The apparent snap-back was caused by the hard azimuth boundary interacting with OrbitControls damping, rather than a separate spring-back routine. Removing the boundary lets the camera continue across the seam while retaining the existing damping and camera path behavior.

## UNKNOWN

- The phone viewport was tested with Playwright mouse input, not on a physical phone or touchscreen. Physical-device touch behavior remains unverified.
- No `angle=` deep-link behavior exists to preserve or test. Only `view=tv` was present.

## Evidence

- `baseline-phone-start-tv.png`, `baseline-phone-stuck-at-seam.png`
- `baseline-desktop-start-tv.png`, `baseline-desktop-stuck-at-seam.png`
- `phone-rotation-*.png`, `desktop-rotation-*.png`
- `phone-rotation-measurements.json`, `desktop-rotation-measurements.json`

The existing plaque and its text were not edited. PR remains Draft; no merge or deployment was performed.
