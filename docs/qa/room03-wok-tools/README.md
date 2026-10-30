# Room 03: the tool rail and shelf beside the wok

Paul 2026-10-31: the tools hanging in the corner by the hob were too plain.

- Before: a black rail with three black sticks, all merged into the dark iron mesh.
- Now: one brass rail on two brackets, five tools on brass S-hooks (ladle with walnut handle, turner with oak, spider skimmer with bamboo, wooden spoon, whisk), steel heads, plus two ceramic canisters (cream, sage) with oak lids on the oak shelf next to the oil bottle. One merged vertex-colour mesh `room03-wok-tools`; the old rail and sticks were removed from the dark mesh, so there is no extra draw call (77 / 77).
- Measured by `roomverse-kitchen-wok-tools.spec.js`: lowest tool head 7 cm above the wok counter's reference (0.955 m), lid tops under the hood at 1.57 m, everything against the wall face.
- Net +1,096 vertices (scene 56,427, under the 58,000 whole-room cap). Ledger updated. Cache-bust `kitchen.js?v=84`, `page.js?v=85`.
- The screenshot is the entry-wall view, so the rack on the right wall is seen from the side. I could not frame a head-on view without a camera hook; Paul's phone is the real check. Real iPhone Safari: UNKNOWN.
- Tests: ledger, wok-tools (new), P0 lighting, kitchen main, hub: 28 passed, 1 skipped. Full Room 03 suite not run.
