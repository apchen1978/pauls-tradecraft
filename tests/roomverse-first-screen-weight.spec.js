import { test, expect } from "@playwright/test";
import { ROOMS, LEDGER, TARGET_BYTES, TOLERANCE } from "./helpers/first-screen-ledger.js";
import { measureFirstScreen, mb } from "./helpers/first-screen-weight.js";

test("the first-screen ledger is internally consistent", () => {
  for (const room of ROOMS) expect(LEDGER.baselineBytes, `${room.id} has a baseline`).toHaveProperty(room.id);
  expect(LEDGER.history.length).toBeGreaterThan(0);
  for (let i = 1; i < LEDGER.history.length; i++) expect(LEDGER.history[i].date >= LEDGER.history[i - 1].date, "history is in date order").toBe(true);
});

// Measuring tool (skipped unless asked): prints a ledger block, ready to paste into tests/helpers/first-screen-ledger.js.
//   ROOM_WEIGHT_MEASURE=1 npx playwright test tests/roomverse-first-screen-weight.spec.js -g measure
test("measure every room and print a ledger block", async ({ browser, baseURL }) => {
  test.skip(!process.env.ROOM_WEIGHT_MEASURE, "set ROOM_WEIGHT_MEASURE=1 to measure");
  test.setTimeout(10 * 60 * 1000);
  const out = {};
  for (const room of ROOMS) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const r = await measureFirstScreen(page, baseURL, room);
    out[room.id] = r.bytes;
    console.log(`${room.id}: ${mb(r.bytes)} in ${r.requests} requests; top: ${r.files.slice(0, 5).map(([b, p]) => `${Math.round(b / 1024)}KB ${p.split("/").pop()}`).join(", ")}`);
    await context.close();
  }
  console.log("baselineBytes:", JSON.stringify(out));
});

for (const room of ROOMS) {
  test(`${room.id} first screen is no bigger than its ledger baseline`, async ({ browser, baseURL }) => {
    test.skip(process.env.ROOM_WEIGHT_MEASURE, "measuring, not checking");
    test.setTimeout(3 * 60 * 1000);
    const baseline = LEDGER.baselineBytes[room.id];
    expect(baseline, `${room.id} baseline is filled in; run the measure test first`).toBeGreaterThan(0);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const r = await measureFirstScreen(page, baseURL, room);
    await context.close();
    console.log(`${room.id} first screen: ${mb(r.bytes)} (baseline ${mb(baseline)}, target ${mb(TARGET_BYTES)})`);
    if (r.bytes > TARGET_BYTES) {
      const msg = `${room.id} first screen is ${mb(r.bytes)}, over the ${mb(TARGET_BYTES)} target (warning only)`;
      console.warn(`WARNING: ${msg}`);
      test.info().annotations.push({ type: "warning", description: msg });
    }
    expect(r.bytes, `${room.id} first screen must not grow beyond its baseline (${mb(baseline)}); top files: ${r.files.slice(0, 5).map(([b, p]) => `${Math.round(b / 1024)}KB ${p}`).join(", ")}`).toBeLessThanOrEqual(Math.ceil(baseline * (1 + TOLERANCE)));
  });
}
