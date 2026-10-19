# Mobile first screen lighter — QA

Date: 2026-10-19
Branch: `codex/mobile-first-screen-lighter`
Stage: local production-preview QA; PR #373 remains Draft. No merge or deployment.

## Scope and result

On screens up to 768px, the hero portrait band and its mobile image request are removed. The three commercial links remain first and in their existing order; the interactive showcase follows, with ROOMVERSE first. Mobile spacing is tighter. Desktop keeps its existing portrait, spacing, and showcase position. The second and later showcase covers defer on mobile until near the viewport; desktop continues loading them as before.

## Before / after measurements

Coordinates are CSS pixels from the top of the page. “First cover” is the ROOMVERSE cover.

| Viewport / language | Hero height | Showcase top | First cover top | First cover visible without scrolling |
|---|---:|---:|---:|---:|
| 390×844 zh | 907 → 526 (-381) | 976 → 595 (-381) | 1253 → 792 (-461) | 0 → 52 px |
| 390×844 en | 961 → 577 (-384) | 1030 → 646 (-384) | 1352 → 887 (-465) | 0 → 0 px (43 px below viewport) |
| 360×740 zh | 907 → 526 (-381) | 976 → 595 (-381) | 1253 → 792 (-461) | 0 → 0 px (52 px below viewport) |
| 360×740 en | 1023 → 577 (-446) | 1092 → 646 (-446) | 1413 → 887 (-526) | 0 → 0 px (147 px below viewport) |

V1 brought the showcase heading into view, with the first colorful cover close behind. It did not show the requested minimum of 120px in 390px Chinese or 60px in 390px English.

## Step37 second version: header tightening

This compares the original #373 result (v1) with the step37 result (v2). V1 header height was not captured directly; values marked `*` are derived from the logged first-cover y, section top, and the former 24px list margin. V2 header height is measured from the eyebrow through the full recommendation link, including its 44px tap area.

| Viewport | Language | Header height v1 → v2 | ROOMVERSE cover top y v1 → v2 | Visible cover px v1 → v2 |
|---|---|---:|---:|---:|
| 390×844 | 中文 | 149* → 119 | 792 → 720 | 52 → 124 |
| 390×844 | English | 193* → 131 | 887 → 783 | 0 → 61 |
| 360×740 | 中文 | 149* → 119 | 792 → 720 | 0 → 20 |
| 360×740 | English | 193* → 151 | 887 → 803 | 0 → 0 (cover starts 63px below viewport) |

At 360×740 English, the large heading is visible but the complete header block, including the recommendation link, ends at y=801. The cover enters view after scrolling 63px, within the requested 150px. This is the remaining small-screen shortfall. To fit the whole block without changing copy or font sizes, the cleanest next trade-off is moving the recommendation line below the first work card at narrow widths; otherwise allow that line to sit just below the first screen.

The 1440×1000 desktop measurements are unchanged: hero y=77–776 (699px), commercial cards end at y=686, showcase starts at y=776. The desktop portrait request remains `/images/paul-art.webp`.

## Mobile image requests / performance observations

Measured in the local Vite production preview on the initial mobile viewport, before scrolling:

- Before: `/images/paul-art-800.webp` (28,378 bytes) and ROOMVERSE cover (58,730 bytes): 87,108 image bytes, excluding the 572-byte favicon.
- After: ROOMVERSE cover only (58,730 bytes), plus the same favicon: 28,378 fewer initial image bytes (about 32.6%). The desktop portrait is not requested on mobile. The Trade Street cover is deferred until scrolling near its card, then loads successfully.
- V1 observed mobile LCP was 1.8–5.2s and CLS 0–0.0477. In the latest V2 run, LCP was 1.32–2.23s and CLS 0–0.0149. These are local preview readings; no controlled before/after performance run was made, so they do not establish an LCP improvement. The image request size and element positions are directly measured.

## Screenshots

Mobile, 390×844 and 360×740, Chinese and English (`before` = main before #373, `v1` = original #373, `after` = step37):

- 390×844 zh: `before-390x844-zh.png` → `v1-390x844-zh.png` → `after-390x844-zh.png`
- 390×844 en: `before-390x844-en.png` → `v1-390x844-en.png` → `after-390x844-en.png`
- 360×740 zh: `before-360x740-zh.png` → `v1-360x740-zh.png` → `after-360x740-zh.png`
- 360×740 en: `before-360x740-en.png` → `v1-360x740-en.png` → `after-360x740-en.png`

Desktop 1440×1000 Chinese:

- `before-1440x1000-zh.png` / `after-1440x1000-zh.png`

## Verification

- `npx playwright test tests/mobile-first-screen-lighter.spec.js`: 5 passed.
- `npx playwright test tests/showcase-entry.spec.js`: 10 passed (ran together with the first spec: 15 passed total).
- `npm test`: 89 passed.
- `node scripts/check-journey-language.mjs`: passed (123 checks).
- `python scripts/check-onepager-sync.py`: passed (18 canonical works reviewed).
- `node scripts/check-document-parity.mjs`: passed.
- `git diff --check`: passed.
- Full Playwright suite: not run.

The browser checks cover zh/en mobile at 390×844 and 360×740, no horizontal overflow, minimum hero link target size 52px, the three commercial links remain present and ordered, the showcase CTA has a 44px mobile tap target and is keyboard focusable, its navigation leaves the heading below the sticky header, the mobile hero-photo request is absent, first and deferred covers load, and desktop portrait/layout remain in place.
