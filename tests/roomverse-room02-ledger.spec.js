import { test, expect } from "@playwright/test";
import { LEDGER, CAPS, budgetFor } from "./helpers/room02-ledger.js";

// Room 02 kept its budget numbers typed into tests/roomverse-bedroom.spec.js (a "< 66000" ceiling in seven tests, 64,291 / 304 in one, 64,014 / 302 in
// another). This spec pins the settled scene and the draw calls against tests/helpers/room02-ledger.js, the one place to update.
const PAGE = "/prototype/roomverse-3d/bedroom/";
const MOODS = ["focus", "weekend", "golden", "night", "sunday", "series"];

// Every check opens its own context at the right size from the start: resizing a desktop page is not a real phone layout.
async function openSettled(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
  const page = await context.newPage();
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom, null, { timeout: 60000 });
  await page.waitForFunction(() => {
    const info = window.__bedroom.info();
    return Object.values(info.painted).every(Boolean) && window.__bedroom.robotState().loaded && info.sofaAsset.source === "procedural" && info.vertices > 50000;
  }, null, { timeout: 90000 });
  let last = -1, stable = 0;
  for (let i = 0; i < 80 && stable < 4; i++) {
    await page.waitForTimeout(300);
    const vertices = await page.evaluate(() => window.__bedroom.info().vertices);
    stable = vertices === last ? stable + 1 : 0;
    last = vertices;
  }
  expect(stable, "the scene stopped growing").toBeGreaterThanOrEqual(4);
  return { page, context };
}

const readInfo = (page) => page.evaluate(() => { window.__bedroom.render(); return window.__bedroom.info(); });

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
  expect(LEDGER.scene.vertices - LEDGER.pocket.vertices, "the settled scene minus the bedside pocket set").toBe(LEDGER.sceneWithoutPocket.vertices);
  expect(LEDGER.scene.meshes - LEDGER.pocket.meshes).toBe(LEDGER.sceneWithoutPocket.meshes);
  for (let i = 1; i < LEDGER.history.length; i++) expect(LEDGER.history[i].date >= LEDGER.history[i - 1].date, "history is in date order").toBe(true);
});

for (const width of [1440, 390]) {
  test(`Room 02 stays inside its ledger at ${width}px (settled scene, opening and per-mood draw calls)`, async ({ browser }) => {
    test.setTimeout(240000);
    const { page, context } = await openSettled(browser, width);
    const opening = await readInfo(page);
    expect(opening.vertices, "settled vertices (exact; update the ledger with a history line if you changed the room)").toBe(LEDGER.scene.vertices);
    expect(opening.meshes, "settled meshes").toBe(LEDGER.scene.meshes);
    expect(opening.vertices).toBeLessThanOrEqual(CAPS.vertices);
    expect(opening.meshes).toBeLessThanOrEqual(CAPS.meshes);
    expect(opening.drawCalls, `opening draw calls at ${width}px`).toBeLessThanOrEqual(width === 390 ? CAPS.phoneCalls : CAPS.desktopCalls);
    expect(opening.drawCalls, `opening draw calls at ${width}px did not drop: record the saving in the ledger`).toBeGreaterThanOrEqual(width === 390 ? LEDGER.openingDrawCalls.phone : LEDGER.openingDrawCalls.desktop);
    for (const mood of MOODS) {
      await page.evaluate((m) => window.__bedroom.setMood(m), mood);
      await page.waitForTimeout(600);
      const info = await readInfo(page);
      expect(info.vertices, `${mood} vertices`).toBe(LEDGER.scene.vertices);
      expect(info.meshes, `${mood} meshes`).toBe(LEDGER.scene.meshes);
      expect(info.drawCalls, `${mood} draw calls at ${width}px`).toBeLessThanOrEqual(budgetFor(width, mood)[2] + LEDGER.headroom.drawCalls);
    }
    await context.close();
  });
}

// Measuring tool (skipped unless asked): prints the numbers in ledger shape, ready to paste into tests/helpers/room02-ledger.js.
//   ROOM02_LEDGER_MEASURE=1 npx playwright test tests/roomverse-room02-ledger.spec.js -g measure
test("measure the live room and print a ledger block", async ({ browser }) => {
  test.skip(!process.env.ROOM02_LEDGER_MEASURE, "set ROOM02_LEDGER_MEASURE=1 to measure");
  test.setTimeout(300000);
  const result = { scene: null, pocket: null, openingDrawCalls: {}, moodDrawCalls: { desktop: {}, phone: {} } };
  for (const [width, key] of [[1440, "desktop"], [390, "phone"]]) {
    const { page, context } = await openSettled(browser, width);
    const opening = await readInfo(page);
    if (key === "desktop") {
      result.scene = { vertices: opening.vertices, meshes: opening.meshes };
      result.pocket = { vertices: opening.bedsidePocket.vertices, meshes: opening.bedsidePocket.meshes };
    }
    result.openingDrawCalls[key] = opening.drawCalls;
    for (const mood of MOODS) {
      await page.evaluate((m) => window.__bedroom.setMood(m), mood);
      await page.waitForTimeout(600);
      result.moodDrawCalls[key][mood] = (await readInfo(page)).drawCalls;
    }
    await context.close();
  }
  console.log("ROOM02 LEDGER BLOCK\n" + JSON.stringify(result, null, 2));
});
