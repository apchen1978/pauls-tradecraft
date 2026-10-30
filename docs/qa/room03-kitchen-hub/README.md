# Room 03: smart kitchen hub above the hob

Paul 2026-10-30: the hob area should feel like 2026 Bay Area: a temperature control or simple dashboard with a few numbers.

- One unlit display plane (4 vertices, 1 mesh) on the backsplash above the hob, x 0.55-1.01, y 1.165-1.325 (above the pots, below the cabinet strip at 1.4825). The dark bezel is painted into the texture, so it costs no second draw call.
- Reads: KITCHEN 72 F with AIR GOOD; HOB four zone levels (two lit); TIMER 04:32; WOK 380 F with a progress bar. Numbers are decor, not a claim about a real appliance.
- Drawn once on a canvas, `toneMapped` off, so it reads in every mood and nothing runs per frame.
- Ledger: vertices 52,268 -> 52,272, meshes 109 -> 110, draw calls +1 (desktop 75, phone 76). `resizedPhoneCalls` 75 -> 76.
- Cache-bust: `kitchen.js?v=75`, `page.js?v=76` (same numbers as the daylight-tone PR; whichever merges second gets bumped again).
- Real iPhone Safari: UNKNOWN until Paul checks. Screenshots: `after-390.png`, `after-1440.png`.
