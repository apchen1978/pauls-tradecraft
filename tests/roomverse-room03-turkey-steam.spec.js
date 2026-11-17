import { test, expect } from "@playwright/test";

// Paul 2026-11-18: the Thanksgiving roast steams (the red mug's steam, three larger wisps), only while the Thanksgiving mood is on.
test("Room 03 the turkey steams only in the Thanksgiving mood", async ({ page }, testInfo) => {
  test.setTimeout(180000);
  const errors = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/prototype/roomverse-3d/kitchen/?lang=zh");
  await page.waitForFunction(() => window.__room03?.info().drawCallsLastFrame > 0, null, { timeout: 120000 });
  expect((await page.evaluate(() => window.__room03.turkeySteamInfo())).visible).toBe(false);
  await page.evaluate(() => window.__room03.setMood("thanksgiving"));
  const on = await page.evaluate(() => window.__room03.turkeySteamInfo());
  expect(on).toMatchObject({ visible: true, wisps: 3, looping: true });
  await page.evaluate(() => window.__room03.setMood("dinner"));
  expect((await page.evaluate(() => window.__room03.turkeySteamInfo())).visible, "the roast chicken does not get it").toBe(false);
  await page.evaluate(() => window.__room03.setMood("thanksgiving"));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: testInfo.outputPath("turkey-steam.png") });
  expect(errors).toEqual([]);
});
