import { test, expect } from "@playwright/test";
import { LEDGER, CAPS, budgetFor } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const MOODS = ["daylight", "golden", "movie", "night", "dinner", "sunday", "thanksgiving"];

test("the budget ledger is internally consistent", () => {
  const last = LEDGER.history[LEDGER.history.length - 1];
  expect(last.vertices, "the newest history line is the current scene").toBe(LEDGER.scene.vertices);
  expect(last.meshes).toBe(LEDGER.scene.meshes);
  expect(last.desktopCalls).toBe(LEDGER.openingDrawCalls.desktop);
  expect(last.phoneCalls).toBe(LEDGER.openingDrawCalls.phone);
  for (const value of Object.values(LEDGER.headroom)) expect(value, "headroom is never negative").toBeGreaterThanOrEqual(0);
  expect(CAPS.vertices).toBeGreaterThanOrEqual(LEDGER.scene.vertices);
  expect(Object.keys(LEDGER.moodDrawCalls.desktop).sort()).toEqual(Object.keys(LEDGER.moodDrawCalls.phone).sort());
  for (const mood of Object.keys(LEDGER.moodDrawCalls.desktop)) {
    expect(MOODS, `${mood} is a real mood`).toContain(mood);
    expect(budgetFor(1440, mood)[2]).toBe(LEDGER.moodDrawCalls.desktop[mood]);
    expect(budgetFor(390, mood)[2]).toBe(LEDGER.moodDrawCalls.phone[mood]);
  }
  for (let i = 1; i < LEDGER.history.length; i++) expect(LEDGER.history[i].date >= LEDGER.history[i - 1].date, "history is in date order").toBe(true);
});

// Measuring tool (skipped unless asked): prints the numbers in ledger shape, ready to paste into tests/helpers/room03-ledger.js.
//   ROOM03_LEDGER_MEASURE=1 npx playwright test tests/roomverse-room03-ledger.spec.js -g measure
test("measure the live room and print a ledger block", async ({ page }) => {
  test.skip(!process.env.ROOM03_LEDGER_MEASURE, "set ROOM03_LEDGER_MEASURE=1 to measure");
  const result = { scene: null, openingDrawCalls: {}, moodDrawCalls: { desktop: {}, phone: {} } };
  for (const [width, key] of [[1440, "desktop"], [390, "phone"]]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`${PAGE}?lang=zh`);
    await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.info().furniture.table === "glb" && window.__room03.robotInfo().ready, null, { timeout: 120000 });
    const base = await page.evaluate(() => window.__room03.info());
    result.openingDrawCalls[key] = base.drawCallsLastFrame;
    if (key === "desktop") result.scene = { vertices: base.vertices, meshes: base.meshes };
    for (const mood of MOODS) {
      await page.evaluate((name) => window.__room03.setMood(name), mood);
      const info = await page.evaluate(() => window.__room03.info());
      result.moodDrawCalls[key][mood] = info.drawCallsLastFrame;
    }
  }
  console.log("ROOM03_LEDGER_MEASURED " + JSON.stringify(result));
  console.log(`  scene: { vertices: ${result.scene.vertices}, meshes: ${result.scene.meshes} },\n  openingDrawCalls: { desktop: ${result.openingDrawCalls.desktop}, phone: ${result.openingDrawCalls.phone} },\n  moodDrawCalls desktop: ${JSON.stringify(result.moodDrawCalls.desktop)}\n  moodDrawCalls phone: ${JSON.stringify(result.moodDrawCalls.phone)}`);
});
