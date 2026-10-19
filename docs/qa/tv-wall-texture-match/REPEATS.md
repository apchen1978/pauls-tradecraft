# TV wall texture repeats

Each sized mesh has its own cloned material and texture transform. Box UVs are corrected per face without adding vertices or material groups. All 20 mesh entries are also in `after-measurements.json`.

| Mesh (instances) | W / H / D metres | Asset | map.repeat (front) | effective +/-X | effective +/-Y | effective +/-Z |
| --- | --- | --- | --- | --- | --- | --- |
| tv-wall-backing x1 | 2.95 / 2.35 / 0.08 | tv-backing-v1.webp | (2.45833, 1.95833) | (0.0666667, 1.95833) | (2.45833, 0.0666667) | (2.45833, 1.95833) |
| tv-shelf-back x2 | 0.62 / 1.62 / 0.025 | tv-oak-v1.webp | (0.775, 2.025) | (0.03125, 2.025) | (0.775, 0.03125) | (0.775, 2.025) |
| tv-shelf-return x4 | 0.025 / 1.62 / 0.135 | tv-oak-v1.webp | (0.03125, 2.025) | (0.16875, 2.025) | (0.03125, 0.16875) | (0.03125, 2.025) |
| tv-shelf-board x8 | 0.62 / 0.035 / 0.135 | tv-oak-v1.webp | (0.775, 0.04375) | (0.16875, 0.04375) | (0.775, 0.16875) | (0.775, 0.04375) |
| tv-frame x1 | 1.58 / 0.94 / 0.075 | tv-frame-v1.webp | (3.16, 1.88) | (0.15, 1.88) | (3.16, 0.15) | (3.16, 1.88) |
| tv-console x1 | 2.05 / 0.5 / 0.4 | tv-oak-v1.webp | (2.5625, 0.625) | (0.5, 0.625) | (2.5625, 0.5) | (2.5625, 0.625) |
| tv-console-plinth x1 | 1.74 / 0.075 / 0.36 | tv-oak-v1.webp | (2.175, 0.09375) | (0.45, 0.09375) | (2.175, 0.45) | (2.175, 0.09375) |
| tv-console-door x2 | 0.94 / 0.42 / 0.025 | tv-door-v1.webp | (1, 1) | (0.0265957, 1) | (1, 0.0595238) | (1, 1) |

Oak tiles represent 0.8 m, frame 0.5 m, backing 1.2 m. Door art is a complete front panel (repeat 1,1); its thin side/top faces sample proportional strips rather than repeating a whole inset panel on an edge. Six face entries are recorded separately for every mesh.
