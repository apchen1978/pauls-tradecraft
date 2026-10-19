# Mobile first screen lighter — QA

Date: 2026-10-19
Branch: `codex/mobile-first-screen-lighter`
Stage: local production-preview QA; Draft PR planned. No merge or deployment.

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

The showcase heading is fully in view in all four mobile cases; the colorful cover is within 300px of the viewport bottom. The three commercial links end at y=553 (zh) / y=604 (en). At 360×740 English, the showcase heading ends at y=737, so it fits but has little bottom margin. This version meets the target of bringing the showcase heading into the first screen and the first cover close behind; it does not show 120px of the cover in every viewport without scrolling.

The 1440×1000 desktop measurements are unchanged: hero y=77–776 (699px), commercial cards end at y=686, showcase starts at y=776. The desktop portrait request remains `/images/paul-art.webp`.

## Mobile image requests / performance observations

Measured in the local Vite production preview on the initial mobile viewport, before scrolling:

- Before: `/images/paul-art-800.webp` (28,378 bytes) and ROOMVERSE cover (58,730 bytes): 87,108 image bytes, excluding the 572-byte favicon.
- After: ROOMVERSE cover only (58,730 bytes), plus the same favicon: 28,378 fewer initial image bytes (about 32.6%). The desktop portrait is not requested on mobile. The Trade Street cover is deferred until scrolling near its card, then loads successfully.
- Observed mobile LCP across the final automated run: 1.8–5.2s; CLS: 0–0.0477. LCP varied between runs under local browser/test load, and no same-run baseline LCP/CLS was captured, so this is not evidence of an LCP improvement. The initial image-byte reduction and element positions are directly measured.

## Screenshots

Before / after, 390×844 and 360×740, Chinese and English:

- `before-390x844-zh.png` / `after-390x844-zh.png`
- `before-390x844-en.png` / `after-390x844-en.png`
- `before-360x740-zh.png` / `after-360x740-zh.png`
- `before-360x740-en.png` / `after-360x740-en.png`

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

The browser checks cover zh/en mobile at 390×844 and 360×740, no horizontal overflow, minimum hero link target size 52px, the three commercial links remain present and ordered, the showcase CTA is keyboard focusable and navigates to `#showcase`, mobile hero-photo request is absent, first and deferred covers load, and desktop portrait/layout remain in place.

