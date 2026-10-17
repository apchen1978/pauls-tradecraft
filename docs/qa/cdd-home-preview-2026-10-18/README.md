# CDD homepage preview review · 2026-10-18

The `before-*` files capture the live homepage and `after-*` files capture the local branch. Each file is a screenshot of the complete Commercial Decision Desk flagship card at the named language and viewport width. `measurements.json` records element heights, document width, and page errors from the same runs.

| Language | Width | Card before → after | Preview before → after |
| --- | ---: | ---: | ---: |
| zh | 390 | 1513 → 1403 px | 422 → 312 px |
| zh | 1440 | 1603 → 1030 px | 903 → 330 px |
| en | 390 | 1634 → 1536 px | 450 → 352 px |
| en | 1440 | 1696 → 1108 px | 917 → 330 px |

The viewport-width and document-width measurements match in every run; no page errors were captured. The full decision screenshot remains on `/cases/commercial-decision-desk/`; the new homepage link opens that case page in the chosen language. Focused browser smoke checks passed for all four language/width combinations: preview content, original demo CTA, case link, language, overflow, and page errors.

Validation: `npm test`, `npm run build`, `node scripts/verify-export-check.mjs`, `node scripts/check-journey-language.mjs`, `python scripts/check-onepager-sync.py`, and `node scripts/check-document-parity.mjs` passed. The full `npx playwright test` run did not start because another existing preview was listening on localhost port 4173. Paul then requested focused checks only, so the full-site suite was not pursued. This change does not modify the OnePager.
