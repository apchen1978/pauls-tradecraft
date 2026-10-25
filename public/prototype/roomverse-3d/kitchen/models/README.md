# Room 03 furniture models — v2 table, chair and pendant

The furniture GLBs in this folder were modeled procedurally in Python from the approved, generated reference illustrations. They were **not** produced by image-to-3D conversion. The references guided silhouette, materials, and design language; the final geometry is a clean, purpose-built mesh with UVs.

## Models and measured budgets

| Asset | Dimensions / orientation | Vertices | Triangles | GLB bytes | Materials / primitives |
|---|---|---:|---:|---:|---|
| `dining-table-v2.glb` | 2.00 × 0.73 × 0.90 m extents; Y-up; +Z room-forward; foot bottoms seat at rug top Y 0.02 m; tabletop top Y 0.75 m | 864 | 396 | 81,956 | 1 / 1 |
| `dining-chair-v2.glb` | 0.453 × 1.005 × 0.427 m extents; Y-up; +Z chair-front; feet sit at rug top Y 0.02 m | 1,740 | 1,556 | 118,704 | 2 / 2 |
| `opal-globe-pendant-v2.glb` | 0.32 × 0.6525 × 0.32 m; Y-up; origin at globe bottom | 2,037 | 3,240 | 86,624 | 2 / 2 |

Four chair instances share one GLB: their scene contribution is 6,960 vertices and 6,224 triangles. With the table and pendant, furniture geometry is 9,861 vertices / 9,860 triangles; the three loaded GLB files total 287,284 bytes. Every asset is below its individual vertex and 400 KB file limits; total downloads are below 1.5 MB. The v1 assets are retained for version history; the page loads v2.

## Materials and validation

- Table: matte oiled oak with directionally mapped grain, rounded slab, tapered legs moved closer to the corners, apron rails, and recessed stretcher. Each rounded corner uses eight segments to avoid the faceted close-up notch in v1.
- Chair: matte oak frame, arched back, tapered legs, and a 3.8 cm warm oat linen cushion; one shared model is instantiated four times.
- Pendant: 48 × 32 segment opal globe, bronze canopy and finer suspension, with its emissive response linked to the room's existing golden/night presets. The existing point light remains the scene light source.
- All models contain normals and UV coordinates; no compression extensions are used.
- Geometry counts are derived from the actual GLB POSITION/index accessors and rechecked by `build_models.py` output. `GLTFLoader` loads the assets at runtime. Existing procedural furniture remains as a fallback if an asset fails to load.

The generator is `build_models.py` (requires Python and Pillow). Reference previews are in `references/`; full-resolution reference PNGs and the generation record are preserved at `Desktop\AI交接文件\2026-10-25\room03-furniture\refs\`.

## Provenance and limits

The reference concepts were generated for this task from Paul's brief. The geometry and UVs are procedural and were created locally with the accompanying Python builder. No model-conversion service, account, login, or external 3D model was used. The public-facing site uses only the procedural GLBs and bundled textures.
