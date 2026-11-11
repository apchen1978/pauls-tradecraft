import { test, expect } from "@playwright/test";

// Paul 2026-11-11, time and season touches: Sunday morning has dust turning in the sun and steam over the mug; Thanksgiving has autumn leaves blown in
// through the open panel. Both are hidden in every other mood, and the morning motion stops when the mood is left (no idle render loop elsewhere).
const PAGE = "/prototype/roomverse-3d/kitchen/";
async function loadRoom(page, opts = {}) {
  await page.setViewportSize({ width: opts.width || 1440, height: opts.width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.info().furniture.table === "glb", null, { timeout: 90000 });
}

test("Sunday morning shows dust and steam, other moods do not, and the motion moves only while the mood is on", async ({ page }) => {
  await loadRoom(page);
  expect(await page.evaluate(() => window.__room03.morningTouchInfo())).toMatchObject({ dustVisible: false, steamVisible: false });
  await page.evaluate(() => window.__room03.setMood("sunday"));
  const on = await page.evaluate(() => window.__room03.morningTouchInfo());
  expect(on).toMatchObject({ dustVisible: true, steamVisible: true, dustCount: 44, steamCount: 16 });
  const frames = async () => page.evaluate(() => window.__room03.info().renderFrame);
  const a = await frames(); await page.waitForTimeout(1200); const b = await frames();
  expect(b - a, "the loop renders while Sunday is on").toBeGreaterThan(5);
  await page.evaluate(() => window.__room03.setMood("daylight"));
  expect(await page.evaluate(() => window.__room03.morningTouchInfo())).toMatchObject({ dustVisible: false, steamVisible: false });
  await page.waitForTimeout(300); const c = await frames(); await page.waitForTimeout(1200); const e = await frames();
  expect(e - c, "no idle render loop once the mood is left").toBeLessThanOrEqual(1);
});

test("with reduced motion Sunday hangs still: no render loop", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadRoom(page);
  await page.evaluate(() => window.__room03.setMood("sunday"));
  await page.waitForTimeout(300);
  const a = await page.evaluate(() => window.__room03.info().renderFrame); await page.waitForTimeout(1200);
  const b = await page.evaluate(() => window.__room03.info().renderFrame);
  expect(b - a).toBeLessThanOrEqual(1);
  expect((await page.evaluate(() => window.__room03.morningTouchInfo())).dustVisible).toBe(true);
});

test("Thanksgiving has nine leaves on the floor just inside the open panel, clear of the chair; other moods hide them", async ({ page }) => {
  await loadRoom(page);
  expect((await page.evaluate(() => window.__room03.autumnLeavesInfo())).visible).toBe(false);
  await page.evaluate(() => window.__room03.setMood("thanksgiving"));
  const leaves = await page.evaluate(() => window.__room03.autumnLeavesInfo());
  expect(leaves).toMatchObject({ visible: true, leaves: 9 });
  expect(leaves.bounds.min[0]).toBeGreaterThan(-2.83); expect(leaves.bounds.max[1]).toBeLessThan(0.02);
  const lounge = (await page.evaluate(() => window.__room03.info())).lounge.bounds;
  expect(leaves.bounds.min[2], "leaves start beyond the lounge chair").toBeGreaterThan(lounge.max[2]);
  await page.evaluate(() => window.__room03.setMood("dinner"));
  expect((await page.evaluate(() => window.__room03.autumnLeavesInfo())).visible).toBe(false);
});
