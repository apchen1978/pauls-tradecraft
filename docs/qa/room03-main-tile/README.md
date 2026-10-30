# Room 03: glazed tile on the main backsplash, and a San Francisco painting by the window

GrokBot (2026-10-31) suggested a handmade glazed tile back wall; Paul asked for the plain-looking painting beside the window to be replaced by something more San Francisco (it looked like a child's collage).

- Main backsplash: the same subway tile picture already loaded for the wok side, tinted a pale sage-oat (`#dde5d0`) so it sits between the olive cabinets and the mist-blue wall. Plain stone colour is the fallback if the picture fails. +24 vertices (rounded box), same bucket, no new mesh or draw call.
- The painting above the window-side floor lamp (the 4:3 frame by the lamp) was "Hills and moon" (flat colour blocks). It now opens on `room03-print-fog-bridge-v1` (Golden Gate in fog, 1200x923, almost exactly 4:3, already in the repo). Hills and moon, hills and sun, window-sill vase stay in the swap menu, and the Ferry Building is added there. The fog print is one file that loads with the room instead of the old moon-hills file, so no extra download; the cable-car frame still offers it too.
- Tests: swaps (choice list and the one default download), lamp-wall art, kitchen main, composition, ledger, P0 lighting: passed; the full Room 03 set was run before merge (see the PR). Real iPhone Safari: UNKNOWN.
- Cache-bust `kitchen.js?v=89`, `page.js?v=90`. Screenshots in this folder.
- Not touched: Room 02's Brooklyn Bridge panorama and the futuristic harbour (Paul's AI-collaboration picture, kept on purpose).
