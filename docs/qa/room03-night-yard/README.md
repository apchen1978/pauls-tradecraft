# Room 03: real night yard for Night and Movie

Paul 2026-10-30: at night the window showed the daytime yard photo tinted blue. Codex painted a real night yard (full moon upper right, low Bay Area hills, oaks, drought-tolerant planting; fence line and tree placed like the daytime picture): `art/room03-yard-night-moon-v1.webp`, 1024x512, 126 KB.

- Wired to **Night** and **Movie** only. Dinner stays the blue-hour dusk photo (it is evening, not deep night, and stays distinct from Night); Thanksgiving stays the autumn afternoon.
- The picture is fetched the first time Night or Movie is chosen, so other visitors do not download it. The yard tint is now a light exposure trim (`0xd2dcf0` Night, `0x8d9ab8` Movie) instead of the old blue wash.
- No geometry or draw-call change. Cache-bust `kitchen.js?v=80`, `page.js?v=81`.
- Tests (yard swap, Thanksgiving, lamp glow, ledger, P0 lighting, tableware): 15 passed, 1 skipped. Full suite not run. Real iPhone Safari: UNKNOWN.
- Screenshots: `after-{390,1440}-{night,movie,dinner}.png` (dinner is the unchanged control).
