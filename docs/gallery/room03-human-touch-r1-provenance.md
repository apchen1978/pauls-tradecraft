# Room 03 Round 1 — Bay Area art provenance

Date: 2026-10-27

## Selected art integrated in the room

| Key | Location | Source master | Source SHA-256 | Public derivative | Dimensions / bytes / SHA-256 |
|---|---|---|---|---|---|
| A — cable car hill | Existing side-wall frame, position A; frame retained | `docs/gallery/sources/room03-human-touch-r1/room03-bay-cable-car-source.png` (1448×1086, 2,865,403 bytes) | `290958812b279b545146454be0af357a333284c99f06043cb24d33ceefce2ecf` | `public/prototype/roomverse-3d/kitchen/art/room03-bay-cable-car-v1.webp` | 800×616, 149,654 bytes, `1bfedff2ac163f8332aa6ba4c9a59fa95abfa857abc5842dd97ebe1186ef686b` |
| B — redwood path | 180° end wall beside screen, larger landscape frame | `docs/gallery/sources/room03-human-touch-r1/room03-bay-redwood-path-source.png` (1448×1086, 3,295,790 bytes) | `62217612480668dd4ef5f43d3ff92f5e9c87af0283000bc69ee330dc17d2d143` | `public/prototype/roomverse-3d/kitchen/art/room03-bay-redwood-path-v1.webp` | 800×600, 133,260 bytes, `183cfce6cd0fa172c4d1dd3d0f2370262d7f28716385451f51e37d8ef0e13a6f` |

A+B image transfer total: **282,914 bytes**. The atlas is assembled in memory after the first scene render. Each selected source image is loaded with a warm paper-color fallback, avoiding a black frame if a request fails.

## Retained candidate C — redwood canopy

- Master: `docs/gallery/sources/room03-human-touch-r1/room03-bay-redwood-canopy-source.png` (1448×1086, 3,195,776 bytes), SHA-256 `6ef185724e6808d104c8aa3ad043d2db73cc6d6b1cfb52df2a8c061b652f0888`.
- Derivative: `docs/gallery/sources/room03-human-touch-r1/room03-bay-redwood-canopy-v1.webp` (800×600, 108,056 bytes), SHA-256 `ca3e6ac86fcd8e7bb64ddefdc5b7b3331e92e402a25780759775a710414ce9e2`.
- C is not referenced by runtime code and is not in `public/`. It is retained here for possible later AI Lab curation. This PR makes no AI Lab changes.

## Generation and derivative process

- Tool: OpenAI ImageGen. Original outputs were created for this Room 03 task. No external photographs, third-party 3D model outputs, named artist references, or existing artwork were used as prompts.
- Prompt summaries are in the prior candidate package `room03-human-touch-r1/artwork-prompts.md`: stylized original 4:3 Bay Area cable-car hill; eye-level redwood path; upward-looking redwood canopy. Warm, low-saturation painted illustration; no text, signature, brand, or portrait.
- A was center-cropped to 800×616 to preserve the room frame’s 1.2:0.87 ratio. B and C were resized/cropped to 800×600. WebP quality was raised for A to keep the derivative under 150,000 bytes; B/C use the earlier quality-78 preview output. No painting edits were applied to the masters.
- SHA-256 values above were calculated from the committed files. All source masters are below 5 MB each.

## Review boundary

Absence of text, signatures, brands, and recognizable faces is a visual self-check, not an external similarity search or legal opinion. The illustrations are stylized concept art, not location-accurate documentary images.
