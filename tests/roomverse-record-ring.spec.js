import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/";

// Paul 2026-11-20: Room 01's record player gets the same glowing ring as Rooms 02, 03 and 04, until it is tapped.
test("Room 01 a glowing ring marks the record player in the record view until it is tapped; hint=0 keeps it away", async ({ page }) => {
  test.setTimeout(150000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${PAGE}?lang=zh&hint=0`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.recordRingInfo, null, { timeout: 90000 }); await page.waitForTimeout(2000);
  await page.evaluate(() => window.__room.recordView()); await page.waitForTimeout(1800);
  expect((await page.evaluate(() => window.__room.recordRingInfo())).visible, "hint=0 hides the ring").toBe(false);
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.recordRingInfo, null, { timeout: 90000 }); await page.waitForTimeout(2000);
  await page.evaluate(() => window.__room.recordView()); await page.waitForTimeout(1800);
  const on = await page.evaluate(() => window.__room.recordRingInfo());
  expect(on.visible, "the ring shows in the record view").toBe(true);
  expect(on.w, "a finger-sized ring").toBeGreaterThanOrEqual(48);
  await page.evaluate(() => window.__room.tapRecordPlayer());
  expect((await page.evaluate(() => window.__room.recordRingInfo())).visible, "tapped: the ring goes away").toBe(false);
  await page.evaluate(() => window.__room.stopMusic());
  expect(errors).toEqual([]);
});
