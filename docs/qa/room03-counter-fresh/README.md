# Room 03: sourdough and fruit on the counter

GrokBot (the counter looks empty) and ChatGPT (add only a little; a board and a towel beat five more models), 2026-10-31.

- A round oak board with a scored sourdough boule in the free stretch between the coffee maker and the hob (x 0.04), and a cream glazed bowl with four apples and an orange at the free right end (x 2.02). Both stand on the counter top; the new spec checks height, the gap to the coffee maker and the counter run limits.
- One merged vertex-colour mesh `room03-counter-fresh`: +1,768 vertices, +1 mesh, +1 draw call (desktop 79, phone 78).
- Budgets re-measured, not cut to fit (Paul: budgets are QA tools): whole-room vertex cap 58,000 -> 64,000 (measured 58,195; draw calls 79 of 130); the review-camera call caps 100 -> 110 (measured 101 of 130); the composition spec now follows the ledger cap instead of a stale 75. Ledger updated.
- Cache-bust `kitchen.js?v=86`, `page.js?v=87`. Tests: kitchen main, composition, new counter-fresh, ledger, P0 lighting, P2 contact shadows: passed; 1 skipped. Full Room 03 suite not run. Real iPhone Safari: UNKNOWN.
- `after-1440.png`: opening view (the boule is by the coffee maker, the fruit bowl at the right end).
