# ROOMVERSE illustrated postcards — review evidence

- `six-moods-contact-sheet.jpg`: the same window-facing room across six lighting studies. Mood names appear **only on this QA sheet**, never on a downloaded postcard.
- `plaque-detail-family.png`: enlarged crop of the brightest postcard. The inscription is composited from the existing approved `public/prototype/roomverse-3d/art/wall-plaque-text-v1.webp`, not generated lettering. A night crop and all uncompressed source artwork are retained locally at `Desktop/ROOMVERSE_Postcard_2026-10-21/` for CC's review.
- `zh-390-download-ui.png` and `en-1440-download-ui.png`: browser state when the download was triggered. The actual downloads were verified byte-for-byte against the corresponding WebP assets in Playwright.

The six WebPs are 1600×900 and each below 300 KB. They are stylized illustrations, not pixel-accurate renders of every selectable wall, rug, curtain, or product. In particular, the illustrated low chair is not an exact copy of the site's 3D low-chair model; this remains an art-review point before merge. The original screenshot postcard path is retained as a fallback for a mood without an asset or a failed art request.
