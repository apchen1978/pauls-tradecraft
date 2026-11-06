import { test, expect } from "@playwright/test";
import { LEDGER, CAPS, budgetFor } from "./helpers/room01-ledger.js";

// Room 01 had no budget test. This one checks the settled scene size and the draw calls against the caps in tests/helpers/room01-ledger.js (the one
// place to update). The caps leave real headroom: polish comes first, the test only guards that the room still runs.
const PAGE = "/prototype/roomverse-3d/";
const MOODS = ["rain", "family", "tech", "chic", "slow", "golden", "tv"];

// A page created at 390 px is a real phone layout; resizing a desktop page is not (it reports different draw calls), so every check opens its
// own context at the right size from the start.
async function openSettled(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 } });
  const page = await context.newPage();
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room?.geometryMetrics, null, { timeout: 90000 });
  // Room 01 grows its TV-wall and shelf decorations while the browser is idle: wait until the mesh count stops changing.
  let last = -1, stable = 0;
  for (let i = 0; i < 80 && stable < 4; i++) {
    await page.waitForTimeout(500);
    const meshes = (await page.evaluate(() => window.__room.geometryMetrics())).meshes;
    stable = meshes === last ? stable + 1 : 0;
    last = meshes;
  }
  expect(stable, "the scene stopped growing").toBeGreaterThanOrEqual(4);
  return { page, context };
}

test("the ledger is internally consistent", () => {
  const last = LEDGER.history[LEDGER.history.length - 1];
  expect(last.vertices, "the newest history line is the current scene").toBe(LEDGER.scene.vertices);
  expect(last.meshes).toBe(LEDGER.scene.meshes);
  expect(last.desktopCalls).toBe(LEDGER.openingDrawCalls.desktop);
  expect(last.phoneCalls).toBe(LEDGER.openingDrawCalls.phone);
  for (const value of Object.values(LEDGER.headroom)) expect(value, "headroom is never negative").toBeGreaterThanOrEqual(0);
  expect(Object.keys(LEDGER.moodDrawCalls.desktop).sort()).toEqual([...MOODS].sort());
  expect(Object.keys(LEDGER.moodDrawCalls.phone).sort()).toEqual([...MOODS].sort());
  for (const mood of MOODS) {
    expect(budgetFor(1440, mood)[2]).toBe(LEDGER.moodDrawCalls.desktop[mood]);
    expect(budgetFor(390, mood)[2]).toBe(LEDGER.moodDrawCalls.phone[mood]);
  }
  for (let i = 1; i < LEDGER.history.length; i++) expect(LEDGER.history[i].date >= LEDGER.history[i - 1].date, "history is in date order").toBe(true);
});

for (const width of [1440, 390]) {
  test(`Room 01 stays inside its ledger at ${width}px (settled scene, opening and per-mood draw calls)`, async ({ browser }) => {
    test.setTimeout(240000);
    const { page, context } = await openSettled(browser, width);
    const opening = await page.evaluate(() => window.__room.geometryMetrics());
    expect(opening.vertices).toBeLessThanOrEqual(CAPS.vertices);
    expect(opening.meshes).toBeLessThanOrEqual(CAPS.meshes);
    expect(opening.drawCalls, `opening draw calls at ${width}px`).toBeLessThanOrEqual(width === 390 ? CAPS.phoneCalls : CAPS.desktopCalls);
    for (const mood of MOODS) {
      await page.evaluate((m) => window.__room.set("mood", m), mood);
      await page.waitForTimeout(1200);
      const calls = (await page.evaluate(() => window.__room.geometryMetrics())).drawCalls;
      expect(calls, `${mood} draw calls at ${width}px`).toBeLessThanOrEqual(budgetFor(width, mood)[2] + LEDGER.headroom.drawCalls);
    }
    await context.close();
  });
}

// Measuring tool (skipped unless asked): prints the numbers in ledger shape, ready to paste into tests/helpers/room01-ledger.js.
//   ROOM01_LEDGER_MEASURE=1 npx playwright test tests/roomverse-room01-ledger.spec.js -g measure
test("measure the live room and print a ledger block", async ({ browser }) => {
  test.skip(!process.env.ROOM01_LEDGER_MEASURE, "set ROOM01_LEDGER_MEASURE=1 to measure");
  test.setTimeout(300000);
  const result = { scene: null, openingDrawCalls: {}, moodDrawCalls: { desktop: {}, phone: {} } };
  for (const [width, key] of [[1440, "desktop"], [390, "phone"]]) {
    const { page, context } = await openSettled(browser, width);
    const opening = await page.evaluate(() => window.__room.geometryMetrics());
    if (key === "desktop") result.scene = { vertices: opening.vertices, meshes: opening.meshes };
    result.openingDrawCalls[key] = opening.drawCalls;
    for (const mood of MOODS) {
      await page.evaluate((m) => window.__room.set("mood", m), mood);
      await page.waitForTimeout(1200);
      result.moodDrawCalls[key][mood] = (await page.evaluate(() => window.__room.geometryMetrics())).drawCalls;
    }
    await context.close();
  }
  console.log("ROOM01 LEDGER BLOCK\n" + JSON.stringify(result, null, 2));
});
