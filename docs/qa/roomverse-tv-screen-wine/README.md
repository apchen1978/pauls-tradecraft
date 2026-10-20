# ROOMVERSE TV screen and feeling defaults — QA

- `comparison-1440.png` and `comparison-390.png` pair the #394 baseline (left) with this branch (right), for each of the six moods in the TV-wall view.
- `after-{mood}-tv-wall-{width}.png` are direct Playwright canvas captures after the mood's default wall has been selected.
- The mood defaults use existing finishes: rain/original cream, family/soft olive, tech/misty blue-grey, chic/dusty blush, slow/warm sand, TV/deep wine.
- A `wall=` URL value and a wall selected by the visitor take precedence; mood changes otherwise follow the default map.
- `screen-art-preview.png` is the original image crop/letterbox composite used by the screen material. Original PNG and prompts are retained in the Desktop source folder.
- The screen WebP is 1024×576 and 49,136 bytes. It is requested only after entering the room and the deferred TV-wall loading path runs (or when the TV view is requested); a failed request keeps the existing dark screen.
- Tests cover six mood brightness multipliers, default selections, URL overrides, random choice persistence, postcard copy, and fallback behavior.
