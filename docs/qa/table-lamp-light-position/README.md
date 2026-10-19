# Table lamp light alignment

## Finding

The original point light was already inside the shade. The misplaced highlight was
the additive halo: it was offset by 0.2 m along world Z, with a 0.65 m sprite around
a shade only about 0.35 m wide. That displaced patch is especially visible beside
the shade from the sofa-side view. The whole closed lamp mesh already had
`castShadow = false`, so self-shadowing was not the original cause.

## Measured geometry (world metres)

Both the loaded GLB in Chrome and a separate Node GLTFLoader inspection gave these
shade bounds, using its existing pale vertex colours (blue >= 0.6):

| Item | X | Y | Z |
| --- | --- | --- | --- |
| Shade minimum | 1.527269 | 0.825130 | -1.924283 |
| Shade maximum | 1.872731 | 1.050000 | -1.575717 |
| Previous bulb | 1.700000 | 0.924000 | -1.750000 |
| Previous halo | 1.700000 | 0.924000 | -1.550000 |
| New bulb and halo | 1.700000 | 0.924073 | -1.750000 |

The new anchor comes from the actual shade bounds, at 44% of its height: just below
its centre. It nearly matches the previous bulb position; this fix does not claim
the bulb was originally on the table or outside the lamp.

Raw values: [before](before-measurements.json), [after](after-measurements.json),
[quarter turns](orbit-measurements.json). The halo offset is now zero at all four
angles. Total lights remain six. Floor-lamp and floor-halo positions are unchanged.

## Rendering change

- Align the halo exactly with the bulb, with no fixed camera-facing displacement;
  scale it to 1.25 times the shade width. Keep depth testing enabled.
- Keep the closed visible GLB non-shadow-casting and its existing shade emission.
- Apply a smooth emission envelope to this table light only: full strength toward
  the open top/bottom, gradually reduced to 32% through the cloth sides. It composes
  with the existing fabric and emissive shaders and preserves their cache keys.
- Use inverse-square distance decay (`2`) and a 0.025 m shadow near plane, so nearby
  furniture participates in the existing point-light shadow map. The old 0.5 m near
  plane skipped nearby occluders. No light is added.
- No `MOODS` values or floor-lamp setup changed.

This is a soft illustration of a fabric shade, not measured photometric data or
full light transport through fabric. The fixed envelope avoids hard cone borders.
Sources: [Three.js PointLight](https://threejs.org/docs/pages/PointLight.html),
[Sprite](https://threejs.org/docs/pages/Sprite.html), and the vendored r160
`lights_pars_begin` shader used by this page.

## Visual evidence

- [1440px before / after](comparison-1440.webp): series night, rain, light-tech.
- [390px before / after](comparison-390.webp): the same three moods and camera.
- [All six moods after](all-six-moods.webp).
- [0 / 90 / 180 / 270 degrees](four-angle-contact.webp).
- [Bulb inside shade](debug-bulb-inside-shade.png): magenta sphere is the source;
  cyan box is the measured shade. Only for this diagnostic capture, the lamp was
  made transparent and marker depth testing disabled to show its interior. Both
  marker and box were removed, materials restored, and removal checked immediately
  after capture. Debug objects and instrumentation are not in the website code.

Before is main `893d647`; after uses this branch's app. Fresh Chrome contexts,
reduced motion, 1440 x 900 and 390 x 844 CSS viewports. Side-view camera position
`(0.3, 1.28, 0.2)` looks toward `(1.4, 0.88, -1.7)` identically before/after.
Screenshots are technically re-encoded as WebP; the debug PNG is retained.
The 390px check is desktop Chrome emulation, not a physical-phone test.

## Checks

Run only:

```text
npx playwright test tests/roomverse-3d.spec.js
npm test
git diff --check
```

The added regression cases check all six moods and quarter turns at both viewport
sizes, the shade bounds, source/halo coincidence, unchanged light count, and
absence of browser or shader errors. Full Playwright suite not run.

Results: ROOMVERSE spec 23 passed (5.7 minutes); unit tests 89 passed;
`git diff --check` passed. The spec's preview server builds the app successfully
(existing large-chunk warning only). Historical QA snapshots rewritten by that
spec were restored; this round's evidence lives only in this folder.

Draft PR only; no merge or deployment.
