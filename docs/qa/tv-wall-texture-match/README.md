# TV wall: illustrated material match

Base: main `1a0f4f2`. This branch changes materials/UVs and reuses an existing prop;
it does not merge or deploy.

## Art and geometry decision

Four original material illustrations were generated with built-in ImageGen, using
the existing room screenshot only as a style/palette reference. No logos or text.
The PNG sources remain on the Desktop in
`ROOMVERSE_電視牆貼圖_2026-10-20/原稿/`; no source PNG is served by the site.
The source outputs are preserved separately from the WebP derivatives.
See [generation prompts](PROMPTS.md).

| Website file (`public/prototype/roomverse-3d/tex/`) | Pixels | Bytes |
| --- | --- | --- |
| tv-oak-v1.webp | 512 x 512 | 21,426 |
| tv-door-v1.webp | 768 x 348 | 26,948 |
| tv-frame-v1.webp | 512 x 512 | 14,590 |
| tv-backing-v1.webp | 512 x 512 | 35,168 |
| **Total** | | **98,132** |

Choice **乙 / B**: the door's inset line, softened edge and panel seam are painted
into the material. Outer silhouettes remain BoxGeometry; no bevel geometry,
vertices or material groups are added to the wall components. The oak source is
rotated 90 degrees during technical encoding so the grain runs along the boards.
All other processing is resize/encoding; no room is repainted in Python.

Each sized board clones its material and texture transform. The same source image
is shared, so there are only four texture requests. Front-face repeat is based on
physical width/height; side and top UVs also account for depth. This avoids
stretching a complete grain tile over a thin edge while keeping one material per
mesh. [All per-mesh repeat values](REPEATS.md) and their six effective face repeats
are recorded from the running scene, not inferred from the screenshot.

Three console props: one book, the existing vase, and a scaled clone of the
existing laptop geometry/material. One of the previous two books was removed.
The original coffee-table laptop remains. No extra model request, plant or light.

## Scope / line audit (app.js)

- Changed 178–210: per-sized-board material/UV handling and four `image()` factory
  calls, preserving the helper's sRGB, anisotropy and wrap setup.
- Changed 251: frame uses its own painted material; old second-book mesh removed.
- Added 464–468: reuse the laptop on the console.
- Added 1017–1029: read-only material diagnostics for tests.
- Unchanged: MOODS (14–33); `tvStripMat` (213), `tvWashMat` (219),
  `TV_STRIP_GLOW` (220), `screenReflectionMat` (450), and mood mappings (612, 621).
  Compared directly to main; see [audit receipt](protected-lines.txt).
- Existing lights remain six. No vendor, dependency, page copy, layout, screen
  image, or reflection mapping changed.

## Reproducible visual checks

Same local machine/date (2026-10-20), installed Chrome via Playwright, Intel Iris Xe
through ANGLE/D3D11, DPR 1, reduced motion, fresh contexts, browser cache disabled.
Desktop 1440 x 900; mobile emulation 390 x 844. Not a physical-phone check.

Each context starts at
`http://127.0.0.1:4173/prototype/roomverse-3d/?lang=zh&mood={tv|rain|family}&view=tv`.
After entry, `setOrbitAngle(180)` captures TV and `setOrbitAngle(0)` captures the
window, with the same mood/exposure. Exposures: tv 0.98; rain 1.05; family 1.15.
Camera, lighting and exposure are not altered to make the TV wall appear brighter.

Matched window / TV pairs:

| Mood | 1440 | 390 |
| --- | --- | --- |
| Series night | [pair](matched-views-tv-1440.webp) | [pair](matched-views-tv-390.webp) |
| Rainy day | [pair](matched-views-rain-1440.webp) | [pair](matched-views-rain-390.webp) |
| Cozy family | [pair](matched-views-family-1440.webp) | [pair](matched-views-family-390.webp) |

TV-wall before/after: [1440](before-after-1440.webp), [390](before-after-390.webp).
Native 1:1 crops: [1440](native-crops-1440.webp), [390](native-crops-390.webp).
Each mood/size also has individual `crop-1to1-...-door/shelf/sofa.webp` files.
Crops use original screenshot pixels without scaling; the contact sheets only
add margins and labels. Narrow-view shelf crops naturally contain less of the
shelf because the existing phone view crops the room sides.

## Counts, timing and mobile entry

External painted maps: **0/39 -> 20/39 meshes**. If procedural light-wash maps are
also counted: **3/39 -> 23/39**. Screen, metal trim, light strips and small props
are deliberately not counted as painted wood. These are mesh counts, not materials.

Median of three fresh-context samples (tv/rain/family), in milliseconds:

| Viewport | document load before/after | poster ready before/after | enter-to-3D-ready before/after |
| --- | --- | --- | --- |
| 1440 x 900 | 74 / 76 | 151 / 146 | 1065 / 2305 |
| 390 x 844 | 70 / 127 | 126 / 189 | 967 / 988 |

The first tv sample in each desktop batch took 6507 / 7719 ms to enter 3D.
Material/shader compilation and machine/cache variation affect these short local
samples. The desktop 3D-ready median regressed in this run; no performance gain is
claimed. Static entry still fetches no GLB, 3D library or new TV texture. These are
local-load timings, not measurements of production networking.

At 390 x 844 in Chinese, **after entering 3D**, the full TV-wall button is visible at
`y=775.91`, height 48, bottom 823.91. The static poster itself offers the entry
button; view controls are created after entry. No layout change is needed for the
specified URL. Story-origin prompts or a physical device's browser chrome can
change available space and are outside this fixed-URL check.
First-screen proof: [before](before-first-screen-390.webp), [after](after-first-screen-390.webp).

English follow-up: the longer header puts the button at y=832.30, height 48,
bottom 880.30, so it is not fully visible in the first 844px. See
[English first screen](after-first-screen-en-390.webp) and
[measurement](mobile-en-button.json). Smallest proposed follow-up: on narrow
English pages only, reduce `#stage` from 58vh to about 53vh (42.2px less at this
viewport). This would recover the missing 36.3px without shrinking text or touch
targets. It is a proposal, not implemented or validated in this texture-only PR.

Raw measurements: [before](before-measurements.json), [after](after-measurements.json),
including exact URLs, GPU, positions, exposure, mesh repeats and console errors.

## Validation

- `npx playwright test tests/roomverse-3d.spec.js`: 24 passed (2.4 minutes).
- `npm test`: 89 passed.
- `git diff --check`: passed.
- Full Playwright suite not run. No physical mobile-device test.

The new regression case checks the 150 KB budget, poster-first loading, four
requests, independent material/map transforms, thin-edge grain density, and the
unchanged light count. Historical QA images rewritten by the existing spec are
restored; current evidence is only in this folder.
