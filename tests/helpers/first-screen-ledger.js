// First-screen download ledger for the four ROOMVERSE rooms: the ONE place that holds how many bytes a visitor downloads
// before a room is usable. Added 2026-11-17 after the size measurement (Desktop\AI交接文件\2026-11-17\RoomVerse_體積量測報告.md).
//
// TWO RULES (Paul, 2026-11-17):
//   - HARD LIMIT: a room's first screen may never get bigger than its `baselineBytes` (desktop) or `baselineBytesPhone` (a 390 px phone window, added
//     2026-11-17), plus the small tolerance. A test fails if it does.
//   - TARGET: 3 MB. Going over the target only prints a warning; it never fails a run. Rooms 02 and 04 start above it on purpose.
//
// HOW TO UPDATE after a change that makes a room's first screen smaller (the good case):
//   1. Measure:  ROOM_WEIGHT_MEASURE=1 npx playwright test tests/roomverse-first-screen-weight.spec.js
//      (prints a block to paste here).
//   2. Lower that room's `baselineBytes` to the new number and add one line to `history` saying why.
//   3. Never RAISE a baseline to make a test pass. If a change is worth its weight, say so in the PR and let Paul decide.
//
// WHAT IS COUNTED: everything the page requests from its own origin, from the first request until nothing new arrives for 6 s after
// "enter the room" is clicked, on a 1440 x 900 desktop window. Text files (js, html, css, json) are counted gzip-compressed (level 6), the way a
// real host sends them; images and models are counted as-is. This is a local measure of the SAME files, not the live site's network bill.

export const TARGET_BYTES = 3 * 1024 * 1024;
export const TOLERANCE = 0.01; // 1% slack for timing noise (a deferred picture that lands a moment sooner or later)

export const ROOMS = Object.freeze([
  Object.freeze({ id: "room01", url: "/prototype/roomverse-3d/", hook: "__room" }),
  Object.freeze({ id: "room02", url: "/prototype/roomverse-3d/bedroom/", hook: "__bedroom" }),
  Object.freeze({ id: "room03", url: "/prototype/roomverse-3d/kitchen/", hook: "__room03" }),
  Object.freeze({ id: "room04", url: "/prototype/roomverse-3d/cafe/", hook: "__room04" }),
]);

export const LEDGER = Object.freeze({
  // Bytes at desktop 1440 px, after entering the room, default mood.
  baselineBytes: Object.freeze({ room01: 2910568, room02: 4550656, room03: 2235922, room04: 3684556 }),
  // Bytes at a 390 x 844 phone window, same rules. Room 02 starts lower than its desktop number because it loads phone-size pictures there.
  baselineBytesPhone: Object.freeze({ room01: 2843227, room02: 3610426, room03: 2256615, room04: 3488533 }),
  history: Object.freeze([
    Object.freeze({ date: "2026-11-17", note: "Ledger created from the first measurement (main a63f0af1, after #938)." }),
    Object.freeze({ date: "2026-11-17", note: "Room 02 phone-size pictures (19 smaller copies, about 70 percent of the width, same pictures) plus the striped rug and the night balcony picture fetched only when used: Room 02 phone 4.66 -> 3.44 MB, desktop 4.91 -> 4.55 MB. Phone baselines added for all four rooms (measured, no change to Rooms 01, 03, 04)." }),
  ]),
});
