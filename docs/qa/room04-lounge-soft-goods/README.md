# Room 04 Lounge upholstery — PR evidence

The banquette seats now vary slightly in width, thickness and sitting dip. Their welt and the seat/back junction remain visible. Two leaning pillows have shaped corners and seams; a light throw follows the seat and falls over its front edge. The upholstered end has a solid return. Six Lounge palettes include coordinated pillow and throw colours. The Lounge name, English menu and house plaque are unchanged.

## Screenshots

| Width | Before | After |
| --- | --- | --- |
| 1440 | [before-1440.png](before-1440.png) | [after-1440.png](after-1440.png) |
| 390 | [before-390.png](before-390.png) | [after-390.png](after-390.png) |

[Banquette close-up, before and after](lounge-close-before-after.png). The un-cropped Lounge views are [before](before-lounge-1440.png) and [after](after-lounge-1440.png); phone Lounge views are [before](before-lounge-390.png) and [after](after-lounge-390.png).

## Measured scene

Measured after all 24 deferred art assets had loaded in headless Chrome at 1440×900 and 390×844.

| | Before | After |
| --- | ---: | ---: |
| Vertices | 198,551 | 201,093 |
| Meshes | 139 | 141 |
| Opening draw calls, 1440 | 69 | 69 |
| Opening draw calls, 390 | 62 | 62 |

The two extra meshes are the pillow and throw fabric batches. The owner approved prioritising detail over the original 200,000-vertex target. This remains under the project's 230,000-vertex cap.

## Checks

Ran `npm run build` and the five targeted Room 04 Playwright checks selected with `-g "Room 04 audits|content-hash versions|ledger is|lounge upholstery|Room 04 looks"`: scene ledger, Lounge look swaps, all-look consistency, support physics audit, and built asset hash chain. Did not run the full Room 04 suite, unrelated Playwright suites, `npm test`, or site-wide checks, per the request to run only tests for this Room 04 change. The build emitted its existing large-chunk warning.

The current build resolves `page.js?v=efa5ad1c4c` and `cafe.js?v=1dfb3bd251` through the repository's automatic content-hash pipeline. These hashes will be rechecked in CI because a subsequent edit changes them.
