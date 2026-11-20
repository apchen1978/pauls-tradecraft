# Room 01 popcorn bowl v2 — QA evidence

## FACT

- Asset: `public/prototype/roomverse-3d/models/room01-popcorn-bowl-v2.glb`.
- File size: 349,016 bytes (340.8 KiB); 16,482 vertices; 32,592 triangles. This stays below the 350,000-byte and 25,000-vertex limits.
- Materials remain `bowl`, `rim`, `popcorn`, `butter`, `husk`; geometry includes `POSITION` and `NORMAL`.
- The bowl body remains 200.0 mm wide and 74.5 mm high, with its bottom at y=0. The measured rim top is y=76.099 mm.
- The highest popcorn vertex is y=123.046 mm, so the mound is 46.9 mm above the rim. The 84 florets in the bowl measure 22.2–30.1 mm along their longest axis; four additional pieces sit on the table, for 88 popcorn pieces total.
- Overall asset bounds are 279.2 × 123.0 × 271.3 mm (X × Y × Z), including the table pieces. Their lowest measured vertex is y=0.
- Topology audit finds 94 expected closed components (bowl, rim, 88 kernels and four husk accents), with zero boundary edges, non-manifold edges, degenerate triangles or winding inconsistencies.
- The GLB structure and quantization checks pass. It loads with the project’s vendored Three.js r160 GLTFLoader.
- `comparison-side.png`, `comparison-top.png` and `comparison-three-quarter.png` put v1 and v2 side by side at identical camera and lighting settings. Separate v2 renders are provided as `side-v2.png`, `top-v2.png` and `three-quarter-v2.png`. `thumbnail-120.png` is 120 × 120 pixels.

## INFERENCE

- The side and three-quarter silhouettes read as a full bowl with a center-high mound. The top view shows coverage across the bowl opening and kernels overlapping the rim; two outer pieces are positioned to hang over the edge.
- The 120 px preview retains a recognizable full bowl and loose pieces. It is a resized static render, not a phone test.

## UNKNOWN

- The appearance on Paul’s phone and the asset’s fit when CC replaces v1 in the room have not been checked.
- Frame time on a physical GPU and recoloring in the receiving app have not been measured.

## Validation

```powershell
node C:\Users\grays\.agents\skills\web-3d-asset-verification\scripts\glb-inspect.mjs public/prototype/roomverse-3d/models/room01-popcorn-bowl-v2.glb
node C:\Users\grays\.agents\skills\web-3d-asset-verification\scripts\glb-topology.mjs public/prototype/roomverse-3d/models/room01-popcorn-bowl-v2.glb
node C:\Users\grays\.agents\skills\web-3d-asset-verification\scripts\glb-quant-check.mjs public/prototype/roomverse-3d/models/room01-popcorn-bowl-v2.glb
```
