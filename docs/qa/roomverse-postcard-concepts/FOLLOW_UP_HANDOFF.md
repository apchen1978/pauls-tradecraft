# ROOMVERSE postcard concepts — PR 3 handoff

## Paul’s instruction

Provide two or three wider postcard PNG concepts with the window, sofa, part of the TV wall or right wall, and the house plaque completely clear. Wait for Paul to choose before changing postcard behavior. Keep this as the third separate Draft PR. When Paul selects a concept, continue on this branch/PR with the postcard implementation and intentionally updated pixel-comparison test.

## FACT

- Three 1200×664 PNG concepts were captured from the existing ROOMVERSE 3D scene and combined with the existing postcard footer. No production code or image assets were changed.
- All three show the complete plaque and its text. The test checked every projected plaque corner stayed inside the canvas.
- Concept-generation Playwright test passed 1/1. It was a temporary local QA test and is not included in the PR.
- See `README.md` for each camera angle, vertical FOV, trade-offs, and image files.

## INFERENCE

Option B is the strongest balance between a wider room composition and keeping the plaque easy to read. Option C shows more of the room but has the strongest wide-angle perspective.

## UNKNOWN

- Paul has not selected a final composition.
- No production postcard implementation, pixel comparison update, or deployment has been made.

## Next action

Wait for Paul to choose A, B, or C. Then implement only the selected postcard framing and update the pixel-comparison test to match that approved composition.
