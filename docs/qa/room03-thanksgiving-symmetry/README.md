# Room 03 Thanksgiving: both sides of the table match

Paul 2026-10-30: the Thanksgiving extras (bottle, candles, cranberries, two extra wine glasses) stood only on the far edge of the table; the near seats had none. He asked for the same number of glasses on both sides and, if easy, one more bread dish.

- The layer is now two rows, one along each long edge (z 0.72 and 0.28). Each row: two candlesticks, two wine glasses.
- Far row keeps the bottle and the cranberry bowl. Near row gets a stoneware plate of five baked dinner rolls instead (the second bread course).
- Place settings were already 2 glasses per seat; unchanged.
- Cost: Thanksgiving-only layer, about 4,250 vertices (was under 3,000); still 3 merged meshes, no new draw call. Base scene and other moods unchanged. The layer budget in `roomverse-kitchen-thanksgiving-decor.spec.js` goes 3000 -> 6000, and the spec now also checks equal glass counts on both sides.
- Cache-bust: `kitchen.js?v=79`, `page.js?v=80`.
- Not touched: the yard picture for Thanksgiving (an autumn afternoon). Real iPhone Safari: UNKNOWN until Paul checks.
- Screenshots: `after-*-entry.png` (entry-wall view, Thanksgiving).
