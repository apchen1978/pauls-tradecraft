# Room 01 popcorn bowl v1 — QA evidence

## FACT

- Asset: `public/prototype/roomverse-3d/models/room01-popcorn-bowl-v1.glb`
- GLB size: 233,556 bytes (228.1 KiB); 10,930 vertices; 21,680 triangles.
- Transformed bounds: X 282.3 mm, Y 98.2 mm, Z 252.1 mm. Bowl body is 200 mm diameter and 74 mm tall; the extra X/Z extent comes from the four kernels on the table.
- Materials: `bowl`, `rim`, `popcorn`, `butter`, `husk`. Mesh attributes include `POSITION` and `NORMAL`.
- Topology audit: 46 connected components (bowl, rim, 40 kernels, four husk flakes), zero boundary edges, zero non-manifold edges, zero degenerate triangles, and zero winding inconsistencies.
- Quantized positions use `KHR_mesh_quantization`; the project GLTFLoader loaded the asset successfully in the local viewer.
- Evidence renders: `side.png`, `top.png`, `three-quarter.png`; compact silhouette preview: `thumbnail-120.png`.

## INFERENCE

- The 120 px crop still reads as a popcorn bowl with loose kernels around it. This is a static thumbnail check, not a real phone usability test.
- The mound reaches approximately 24 mm above the rim based on transformed geometry, close to the requested 25 mm.

## UNKNOWN

- Appearance and legibility on Paul's actual phone have not been checked.
- The receiving application’s color remapping by material name has not been exercised.

## Validation commands

```powershell
node C:\Users\grays\.agents\skills\web-3d-asset-verification\scripts\glb-inspect.mjs public/prototype/roomverse-3d/models/room01-popcorn-bowl-v1.glb
node C:\Users\grays\.agents\skills\web-3d-asset-verification\scripts\glb-topology.mjs public/prototype/roomverse-3d/models/room01-popcorn-bowl-v1.glb
node C:\Users\grays\.agents\skills\web-3d-asset-verification\scripts\glb-quant-check.mjs public/prototype/roomverse-3d/models/room01-popcorn-bowl-v1.glb
```
