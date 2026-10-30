# Room 03: a modern wall clock

Paul 2026-10-31: the oak-rimmed cream clock in the entry hall looked dated; check what US shoppers buy in 2026 and modernise it.

- Research (WebSearch, US): roundup blogs and Amazon search results for 2026 agree on the look: a 12 in silent sweep clock, matte-black thin metal frame, white dial, minimal markers. These are affiliate blogs and search snippets, not a live Amazon bestseller list, and they disagree on rankings, so they were used for style direction only.
- Now: matte-black thin frame (`#232422`), white matte dial (`#f4f2ec`), bold baton markers at 12, 3, 6 and 9 with fine ticks between, slim black hour and minute hands, one slim coral second hand with a short tail, a black cap with a coral dot. Same size (410 mm), same position, same mesh: +344 vertices, no new mesh or draw call.
- Cache-bust `kitchen.js?v=91`, `page.js?v=92`. Full Room 03 set (116 tests): 115 passed, 1 skipped, 0 failed. Real iPhone Safari: UNKNOWN.
- `entry-1440.png` is the entry-wall view at 3x (the clock is under the redwood print).
