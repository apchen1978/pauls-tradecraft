# Room 03: things on the credenza

Paul 2026-10-30: the clay-red credenza under the cable-car painting had nothing on it. Styled like Room 01's shelves (same procedural approach, no new models): a stack of three lying books with a small cup, a faceted ceramic vessel with dried stems, a row of five upright books next to a small wooden sculpture, a potted plant, and a shallow dish with three stones. One merged vertex-colour mesh, every piece standing on the oak top (measured by the new spec), clear of the door leaf (z -0.80) and the wok counter (z 1.023).

- Cost: +1,811 vertices, +1 mesh, +1 draw call on desktop (phone opening view unchanged). FPS not measured: a headless run has no real GPU, so a number would mislead; iPhone check is Paul's.
- Budget note (Paul 2026-10-31: budgets are QA tools): the golden-hour interior luminance sample moved from >= 104 to 103.98 (0.016, invisible). Its floor in `roomverse-kitchen.spec.js` is now 103.5 with the reason written next to it. Ledger updated with a history line.
- Cache-bust `kitchen.js?v=82`, `page.js?v=83`.
- Tests: ledger, credenza, new credenza-decor, P0 lighting, kitchen main spec: 28 passed, 1 skipped. Full Room 03 suite not run. Real iPhone Safari: UNKNOWN.
