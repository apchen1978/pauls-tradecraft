# Room 03: the room door goes from deep olive to soft sage

GrokBot: the dark tall door on the right wall is heavy. Paul 2026-10-31: lighten it.

- Leaf colour `#566339` -> `#8c9a70`, a sage in the cabinet family (cabinets are `#71805b`, a little lighter than the cabinet). Frame, brass lever, frosted slot and hinges unchanged. One colour constant, no geometry change; ledger unchanged.
- Golden-hour frame contrast std-dev 43.7 -> 42.9 (the darkest pixels are gone, which is the point); floor in `roomverse-room03-p0-lighting.spec.js` 43 -> 42, reason written beside it.
- Cache-bust `kitchen.js?v=88`, `page.js?v=89`. Tests: door, ledger, P0 lighting, kitchen main, credenza: passed; 1 skipped. Full Room 03 suite not run. Real iPhone Safari: UNKNOWN. If sage is still too dark or now too pale, it is one hex value.
- Screenshots `after-{1440,390}-{daylight,golden}.png`.
