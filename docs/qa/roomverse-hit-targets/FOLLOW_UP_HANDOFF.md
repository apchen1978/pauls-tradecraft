# ROOMVERSE hit targets — PR 2 handoff

## Paul’s instruction

Make mood, wall, rug, curtain and print choices, plus the language toggle, easier to tap without changing visible sizes or layout. Keep the English TV-wall button on the first screen of a short phone. This is the second of three separate Draft PRs; do not merge without Paul’s `merge #N` instruction. PR 3 is concept images for a wider postcard and must wait for Paul’s selection before changing postcard code.

## FACT

- Before: choice pills rendered at `30px` high. The language toggle measured `44.5×31px` on 390px and `39.3×35px` on desktop.
- After: transparent pseudo-elements make every choice target at least `44×44px`; the language toggle is at least `45.3×45px` in all tested layouts. The original visual dimensions of each button are unchanged; the test compares every choice and the camera button position to the saved baseline measurements.
- Playwright clicked the transparent area above one option in each of the five groups and above the language toggle; the expected control responded in Chinese and English at 390px and 1440px.
- English at `390×740`: “Turn to the TV wall” remains on the first screen, ending at y=730.8px. No horizontal overflow in the tested layouts.
- Targeted `tests/roomverse-hit-targets.spec.js`: 5/5 passed.
- `npm test`: 89/89; `npm run build`: passed with the existing large-chunk warning; export check, journey-language, One-Pager sync, document parity, and `git diff --check`: passed.
- Full Playwright has 608 cases. It was started and stopped after 11 passed. The focused Roomverse suite has 76 cases; it was started and stopped after 8 passed because render-heavy runs were taking much longer than the new targeted checks. These two full-suite runs are incomplete.

## INFERENCE

An invisible pseudo-element extends pointer hit-testing without participating in layout, so the labels, visible button shapes, spacing, and first-screen composition stay in place. Baseline and after screenshots appear visually unchanged.

## UNKNOWN

- No physical iPhone/Android touch test was performed; clicks were simulated in Playwright viewports.
- Browser/platform-specific touch handling beyond the tested Chrome engine remains unverified.

## Evidence

- `before-zh-390.png`, `after-zh-390.png`
- `before-en-390.png`, `after-en-390.png`
- `before-zh-1440.png`, `after-zh-1440.png`
- `before-en-1440.png`, `after-en-1440.png`
- `after-en-390x740-tv-button.png`
- Matching JSON files contain the measured target and unchanged visual dimensions.

Only `public/prototype/roomverse-3d/index.html` and this task’s test/QA files were intended to change. No merge or deployment was performed.
