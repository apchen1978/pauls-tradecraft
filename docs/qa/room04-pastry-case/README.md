# Room 04 pastry case — PR evidence

The case now has 8 mm side panes and a closed curved front/top shell with a visible edge. Fruit tarts have fluted crust rims and filling, the cake has a true layered wedge, and bottles have continuous feet, shoulders, necks and lips. The display adds four macarons, two tartlets and two petite éclairs, keeping room between plates and the bottle tray.

## Screenshots

| Width | Before | After |
| --- | --- | --- |
| 1440 | [before-1440.png](before-1440.png) | [after-1440.png](after-1440.png) |
| 390 | [before-390.png](before-390.png) | [after-390.png](after-390.png) |

[Close comparison](close-before-after.png) · [before close view](before-close.png) · [after close view](after-close.png)

## Measurements

Headless Chrome, all 24 deferred art assets loaded, 1440×900 and 390×844. The close counter station draws 104 desktop and 98 phone calls in both versions.

| | Before | After |
| --- | ---: | ---: |
| Vertices | 201,093 | 207,210 |
| Meshes | 141 | 141 |
| Opening draw calls, 1440 / 390 | 69 / 62 | 69 / 62 |
| Counter draw calls, 1440 / 390 | 104 / 98 | 104 / 98 |

The extra detail remains in existing material batches. The scene remains below the 230,000-vertex and 150-mesh caps.

## Validation

Ran `npm run build` and the five relevant Room 04 Playwright checks: scene ledger, six-mood draw-call budget, physics audit, historical physics fixtures, and built content-hash versions. Did not run unrelated site or Room 04 tests. The build has the existing large-chunk warning.

Built script versions after updating from `main`: `page.js?v=17b174c97e` → `cafe.js?v=9db94cba78`. These are content hashes, so deployment hashes must be checked from the published page and its exact versioned script response.
