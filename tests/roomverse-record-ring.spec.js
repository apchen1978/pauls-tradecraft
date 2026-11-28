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

// Paul 2026-11-20: Rooms 02 to 04 stop the ring once the music plays; Room 01 should too, whoever started the music (the TV, the speakers or the robot, not only the record player).
test("Room 01 the record ring goes away when music starts some other way, and stays away", async ({ page }) => {
  test.setTimeout(150000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.recordRingInfo, null, { timeout: 90000 }); await page.waitForTimeout(2000);
  await page.evaluate(() => window.__room.recordView()); await page.waitForTimeout(1800);
  expect((await page.evaluate(() => window.__room.recordRingInfo())).visible, "the ring shows before any music").toBe(true);
  await page.evaluate(() => window.__room.playMusic()); await page.waitForTimeout(600); // the music starts without touching the record player
  expect((await page.evaluate(() => window.__room.musicState())).playing, "the music plays").toBe(true);
  expect((await page.evaluate(() => window.__room.recordRingInfo())).visible, "the ring is gone while the music plays").toBe(false);
  await page.evaluate(() => window.__room.stopMusic()); await page.waitForTimeout(500);
  expect((await page.evaluate(() => window.__room.recordRingInfo())).visible, "and it does not come back when the music stops").toBe(false);
  expect(errors).toEqual([]);
});
