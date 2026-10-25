# Room 03 furniture models — v1

The furniture GLBs in this folder were modeled procedurally in Python from the approved, generated reference illustrations. They were **not** produced by image-to-3D conversion. The references guided silhouette, materials, and design language; the final geometry is a clean, purpose-built mesh with UVs.

## Models and measured budgets

| Asset | Dimensions / orientation | Vertices | Triangles | GLB bytes | Materials / mesh |
|---|---|---:|---:|---:|---|
| `dining-table-v1.glb` | 2.00 × 0.73 × 0.90 m extents; Y-up; +Z room-forward; foot bottoms seat at rug top Y 0.02 m; tabletop top Y 0.75 m | 576 | 268 | 71,968 | 1 / 1 |
| `dining-chair-v1.glb` | 0.454 × 1.001 × 0.422 m extents; Y-up; +Z chair-front; feet sit at rug top Y 0.02 m | 1,540 | 768 | 114,316 | 2 / 2 |
| `opal-globe-pendant-v1.glb` | 0.32 × 0.6525 × 0.32 m; Y-up; origin at globe bottom | 745 | 896 | 31,208 | 2 / 2 |

Four chair instances share one GLB: their scene contribution is 6,160 vertices and 3,072 triangles. Total furniture geometry is 7,481 vertices / 4,236 triangles; the three downloaded GLB files total 217,492 bytes. Every asset is below its individual vertex and 400 KB file limits; total downloads are below 1.5 MB.

## Materials and validation

- Table: matte oiled oak with directionally mapped grain, rounded slab, tapered legs, apron rails, and recessed stretcher.
- Chair: matte oak frame and UV-mapped woven cane seat; one shared model is instantiated four times.
- Pendant: opal globe, bronze canopy and suspension, with its emissive response linked to the room's existing golden/night presets. The existing point light remains the scene light source.
- All models contain normals and UV coordinates; no compression extensions are used.
- Geometry counts are derived from the actual GLB POSITION/index accessors and rechecked by `build_models.py` output. `GLTFLoader` loads the assets at runtime. Existing procedural furniture remains as a fallback if an asset fails to load.

The generator is `build_models.py` (requires Python and Pillow). Reference previews are in `references/`; full-resolution reference PNGs and the generation record are preserved at `Desktop\AI交接文件\2026-10-25\room03-furniture\refs\`.

## Provenance and limits

The reference concepts were generated for this task from Paul's brief. The geometry and UVs are procedural and were created locally with the accompanying Python builder. No model-conversion service, account, login, or external 3D model was used. The public-facing site uses only the procedural GLBs and bundled textures.
