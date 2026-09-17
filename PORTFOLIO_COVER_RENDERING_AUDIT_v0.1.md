# Paul’s Tradecraft — Portfolio Cover Rendering Audit v0.1

**Mode:** read-only forensic review, followed by one explicitly authorized targeted repair
**Review target:** `https://paulstradecraft.com/` and the current `portfolio-overview` source
**Viewport checks:** desktop live layout (~1266 CSS px captured), 390px mobile layout, source-level 1440/390 ratio rules

## Executive finding

The CDD symptom is a presentation-ratio defect, not an image-loading defect. The new CDD cover is 1600×1200 (4:3), while the Featured Work image frame is fixed at `aspect-[16/9]` and uses `object-cover`. That frame can display only 75% of the source height when fitting the source width, so the top and bottom of the CDD artifact are necessarily hidden. The same rule is acceptable for the covers intentionally composed at 3:2, but not for an evidence artifact whose lower decision rows are part of the meaning.

One targeted remediation was applied after the audit: CDD now opts into `object-contain` in the Featured Work frame. No business logic, evidence, fixture, or other cover was changed.

## Cover inventory

| Work | Asset | Intrinsic ratio | Container / render ratio | Desktop status | Mobile status | Root cause | Recommended treatment |
|---|---|---:|---:|---|---|---|---|
| MORI Soft Furnishing | `cover-mori-soft-furnishing.webp` | 1200×675 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Business Spending Insight | `cover-business-spending-insight.svg` | 1600×900 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Trade Deal Desk | `cover-trade-deal-desk.png` | 1440×810 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Curtain Pilot Tracker | `cover-tracker-v2.svg` | 1600×900 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Sales Pilot Case Brief | `cover-sales-pilot-casebrief-v3.svg` | 1600×900 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Pilot Simulation Kit | `cover-simulations-v2.png` | 1536×1024 · 3:2 | 16:9 | B — intentional crop; central workflow remains visible | B — same crop, no overflow | `object-cover` removes ~15.6% vertical area | Keep unless lower edge becomes semantically important |
| Lil Matt’s Gaming World | `cover-game-v3.png` | 1672×941 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Waste Time | `cover-wastetime-v2.png` | 1536×1024 · 3:2 | 16:9 | B — intentional composition; dark left negative space remains | B — same composition, no overflow | Source is 3:2 but focal object remains inside crop | Keep; do not globalize `contain` |
| AI Lyrics Generator | `cover-lyrics-v3.png` | 1672×941 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Execution Capability Deck | `cover-deck-v2.png` | 1672×941 · ~16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Expense Tracker | `cover-expense-v2.png` | 1672×941 · ~16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Payment Concentration | `cover-payment-concentration.png` | 1440×810 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| MG Desktop Pet | `cover-mg-desktop-pet.webp` | 1440×810 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Overseas Lead Discovery | `cover-lead-discovery.png` | 2880×1620 · 16:9 | 16:9 | A — full | A — full | None | Keep; consider payload optimization later |
| Global Business Development | `cover-global-business-development.svg` | 1600×900 · 16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| AI-Native Market Entry | No cover asset | — | No image frame | A — not applicable | A — not applicable | Text/evidence case, no cover configured | Keep text-led presentation |
| Trade Profit Navigator | `cover-trade-profit-navigator.png` | 1672×941 · ~16:9 | 16:9 | A — full | A — full | None | Keep `cover` |
| Commercial Decision Desk (CDD) | `cover-commercial-decision-desk.svg` / `-en.svg` | 1600×1200 · 4:3 | 16:9 in Featured Work; 4:3 in Hero | **C — unintentionally cropped before repair**; lower decision rows hidden by `object-cover` | **C — same ratio defect** | Source/frame ratio mismatch plus `object-cover` | **Per-cover `object-contain`**; applied |

### Measurement notes

- The portfolio card component gives image-bearing cards a fixed `aspect-[16/9]` frame. The Featured Work frame uses the same 16:9 ratio.
- Most SVG images report a browser intrinsic size based on their rendered resource metadata, but their source `viewBox` confirms the authoritative ratio above. This is not a loading failure.
- Lazy images below the fold reported `naturalWidth: 0` until they were requested by the browser. Their source assets exist and the visible loaded examples rendered correctly; this was not classified as a cover defect.
- On the live desktop page, loaded covers used `object-fit: cover`, `object-position: 50% 0%`, and an overflow-hidden parent. At 390px, the same 16:9 rule remains in effect after cards become single-column.

## Exact CDD root cause

The CDD cover’s source box is 1600×1200 (4:3), but the Featured Work `<img>` is rendered in a 16:9 box and has `object-cover object-top`. To fill a 16:9 frame without side bars, the browser scales the source to the frame width and clips its vertical extent. `object-top` preserves the top and discards the lower part. The lower rows containing the complete decision context are therefore absent from the visible preview. The Hero snapshot is separately 4:3 and was not the cause of the card symptom.

The safe fix is per-cover, not global: preserve the existing 16:9 card rhythm but use `object-contain` for the 4:3 CDD artifact, with the existing paper background providing a quiet letterbox. A global `contain` rule would create unnecessary empty space or weaken intentionally image-led covers.

## Other confirmed defects

No other unintentionally cropped or distorted cover was confirmed. Two assets are non-16:9 and are technically cropped by the shared frame:

- `cover-simulations-v2.png` (3:2): its central numbered workflow remains visible; classified B, acceptable composition.
- `cover-wastetime-v2.png` (3:2): the deliberate dark negative space and hourglass focal area remain visible; classified B, acceptable composition.

They should not be changed solely because their source ratios differ.

## Systemic vs per-cover causes

There is one systemic framing rule — all cover frames use 16:9 with `object-cover` — but only one confirmed semantic defect. The correct treatment is mixed:

- **Global:** keep the stable 16:9 frame and overflow behavior so the portfolio remains rhythmically consistent.
- **Per-cover:** opt in to `object-contain` when the source is an evidence/document artifact whose full vertical content is material (CDD).
- **Source-specific:** preserve `object-cover` for intentionally cinematic 3:2 artwork unless an important focal element is demonstrably lost.

## Performance findings

The largest obvious cover payload is `cover-lead-discovery.png` at 2880×1620; `cover-commercial-decision-desk.png` is an older 2880×1620 asset but is no longer the active CDD cover. Several 1672×941 PNGs are larger than their displayed card needs. These are optimization opportunities, not rendering defects. No image was recompressed, replaced, or deleted in this audit.

The current SVG CDD covers are small vector resources and are preferable for this information-dense summary. No external assets or fonts are involved in the CDD fix.

## Regression risks

- Changing the global aspect ratio could create inconsistent card heights and alter the established portfolio rhythm.
- Applying `object-contain` globally would add letterboxing to photographic or cinematic covers and reduce their visual impact.
- Replacing source images could alter evidence semantics or bilingual parity.
- The targeted CDD `imageFit` flag must remain limited to rendering; it must not affect work data, business logic, or links.

## Recommended implementation order

1. **Completed:** per-cover CDD `object-contain` treatment.
2. Re-run desktop and 390px visual checks, including CDD lower-row visibility and no horizontal overflow.
3. Only if needed, optimize the largest raster covers in a separate performance-only round with before/after visual comparison.
4. Do not globally change the cover frame until a new cover demonstrates a real semantic loss.

## Scope record

- Production logic, fixtures, evidence states, links, and copy were not changed.
- No cover files were replaced or deleted.
- Existing untracked user files remain untracked and untouched.
