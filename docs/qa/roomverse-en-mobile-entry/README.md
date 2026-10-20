# English mobile first-screen controls

Base `dae7f06` (#387). One English-only rule inside the existing <=700px media query.
No page copy, font size, touch size, room model, light or director code changes.

## Diagnosis and result

The previously reported 880px measurement was the **post-entry TV-wall control**,
not the initial “Step into the 3D room” button. The entry button was already visible.
Both are measured here; the fix makes both available in the first viewport.

| English viewport | Entry button bottom before / after | TV button bottom before / after | TV touch height |
| --- | ---: | ---: | ---: |
| 390 × 844 | 512.03 / 489.28 px | 880.30 / 834.78 px | 48 / 48 px |
| 390 × 740 | 481.88 / 437.28 px | 819.97 / 730.78 px | 48 / 48 px |

The initial entry button remains 49px high. The stage/poster use the same
`clamp(240px, calc(100svh - 400px), 53vh)` height. A plain 53vh change would still
leave the TV button below the shorter 740px viewport; the available-height cap
handles that case without shrinking typography or targets.

Chinese mobile at both heights and desktop Chinese/English at 1440 × 900 are
unchanged: exact lossless screenshot comparison is zero for both the poster and
the entered room. [Pixel comparison](pixel-comparison.json),
[all coordinates](measurements.json). No horizontal overflow.

## Pictures

- English 844px: [poster](comparison-en-844-poster.webp), [entered room](comparison-en-844-room.webp).
- English 740px: [poster](comparison-en-740-poster.webp), [entered room](comparison-en-740-room.webp).
- Unchanged screenshots: `before/after-zh-390x844-*`, `before/after-zh-390x740-*`,
  `before/after-en-1440x900-*`, `before/after-zh-1440x900-*` in this folder.

## Reproduce

Local Vite on port 4187, then `node docs/qa/roomverse-en-mobile-entry/capture.mjs`
and `python docs/qa/roomverse-en-mobile-entry/compare.py`. Chrome, DPR 1, reduced
motion, ordinary direct `?lang=en|zh` entries. Screenshot-only encoding is lossless.
This is emulated mobile browser testing, not an iPhone/Safari test. Entries with
an extra story-origin banner are not claimed to fit the same fixed viewport.

## Validation

- ROOMVERSE spec: 31 passed (2.4 minutes); npm test: 89 passed. No failures.
- Build is run by the ROOMVERSE spec's webServer; only the existing chunk-size warning.
- `git diff --check`: passed. Full Playwright suite not run.
- Existing QA files rewritten by the spec are restored; no changes to other QA folders.
- Document/PDF closing: N/A, isolated responsive layout fix with identical public wording.
- Draft PR only; no merge/deployment or production claim.
