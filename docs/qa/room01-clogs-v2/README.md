# Room01 Clogs V2 QA

## FACT

- Asset: `room01-clogs-beige-v2.glb` (344,464 bytes; 11,740 vertices; 23,028 triangles).
- Texture: `room01-clogs-beige-v2-microfoam.webp` (256 × 256; 978 bytes). Load it beside the GLB.
- Four meshes and material names are preserved: `upper`, `sole`, `lining`, `loop`.
- GLB bounds: X 216.119 mm, Y 98.457 mm, Z 265.917 mm; floor remains at Y = 0. Relative to v1, width and length are unchanged and height is 0.043 mm lower.
- The loop mesh spans Y = 76.500–98.457 mm (21.957 mm overall); its arch rises about 16.5 mm above its modeled anchors.
- Static mesh audit: 0 nonmanifold edges, 0 inconsistent winding edges, 0 zero-area triangles. Open boundaries are at the shoe opening and intentionally open lining/trim surfaces. No isolated loose fragments were found; connected pieces correspond to the two shoes' shells, soles, lining surfaces and loops.
- The local project Three.js r160 `GLTFLoader` loaded both GLBs and the WebP texture for the comparison render. No application code was changed and no app/Playwright tests were run.

## INFERENCE

- The rear wall and orange-red inner lining visually wrap the heel in the supplied three-quarter comparison. The compact pull loops remain within the original overall height envelope.
- `upper` is matte (`roughnessFactor` 0.97) and carries a low-contrast 256 px grain map. Grain visibility depends on the target renderer and lighting.

## UNKNOWN

- Paul still needs to load v2 in Room 01 and confirm in-scene fit, mobile appearance, and whether the fine grain reads as intended.

## Comparisons

- [Side](comparison-side.png)
- [Top](comparison-top.png)
- [Three-quarter](comparison-three-quarter.png)
