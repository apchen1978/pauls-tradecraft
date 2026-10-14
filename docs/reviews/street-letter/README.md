# Street letter review — v0.3

Local build, not a deployed release. Screenshots use the actual bilingual UI and actual downloaded PNGs.

- [Chinese review](zh-review.jpg): 390px letter/composer, 1440px letter/result.
- [English review](en-review.jpg): same views.
- [Chinese downloaded card](zh-download-card.png) / [English downloaded card](en-download-card.png).
- Full 390/768/1440 evidence: ignored local `output/playwright/street-letter/`.

## Validation

- `npm ci`: completed without lockfile changes.
- `npm test`: 82 passed.
- `npm run build`: passed; existing chunk-size warning remains.
- Export presence: 58 passed; journey language: 105 checks passed; OnePager sync and document parity passed.
- Final street-specific browser suite: 19 passed (both languages, 390/768/1440, notes/focus, direct composition, ordering, cancellation, reset, download text and drawing bounds).
- Earlier full browser suite: 256 passed, 5 failed, 4 skipped. This is not an all-green suite.
- Pristine archived base `a4af191` reproduced four of those failures: three teammate showcase tests have ambiguous text locators; the phone try-it CTA exceeds its viewport threshold. The animation timeout passed on the base rerun; its earlier timeout remains a timing uncertainty, not proven preexisting. No unrelated implementation or tests were changed to hide these results.
- Manual image review: both actual download cards and desktop/mobile letter/result screenshots inspected; no clipped text found.

## Review boundaries

Sunny's questions are fictional wording examples, not Paul-confirmed practice. Asking does not confirm an order. The two-slot composer and optional notes follow Paul's later request for lighter, story-first play. The lamp is the main next stop; Trade Street is secondary. Sunny's apron/thermos and the lamp's door-note/visit remain Grokbot's separate work. No new art, lamp edits, merge or deployment in this round.
