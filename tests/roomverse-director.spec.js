import { expect, test } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/";

async function enter(page, lang = "zh") {
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await expect(page.locator("#panel .director")).toBeVisible();
}

test("the tour restores the visitor's room, camera, controls and URL", async ({ page }) => {
  await enter(page);
  await page.waitForTimeout(1900);
  const before = await page.evaluate(() => ({ camera: __room.cam(), url: location.href }));
  await page.locator("#panel .director").click();
  await expect(page.locator("#stage .director-stop")).toBeVisible();
  await page.waitForFunction(() => window.__room.director().playing, null, { timeout: 15000 });
  await page.waitForFunction(() => !window.__room.director().playing && window.__room.director().controlsEnabled, null, { timeout: 15000 });
  const after = await page.evaluate(() => ({ camera: __room.cam(), url: location.href }));
  expect(after).toEqual(before);
  await expect(page.locator("#stage .director-stop")).toBeHidden();
});

test("Escape cancels a playing tour and restores the camera", async ({ page }) => {
  await enter(page, "en");
  await page.waitForTimeout(1900);
  const before = await page.evaluate(() => __room.cam());
  await page.locator("#panel .director").click();
  await page.waitForFunction(() => window.__room.director().playing, null, { timeout: 15000 });
  await page.keyboard.press("Escape");
  await expect(page.locator("#stage .director-stop")).toBeHidden();
  expect(await page.evaluate(() => __room.cam())).toEqual(before);
});

test("a 390px visitor sees most of the canvas immediately and has a visible stop control", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  await page.locator("#panel .director").click();
  const visibleRatio = await page.evaluate(() => {
    const r = document.querySelector("#stage canvas").getBoundingClientRect();
    return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height;
  });
  expect(visibleRatio).toBeGreaterThan(0.7);
  await expect(page.locator("#stage .director-stop")).toBeVisible();
  await page.locator("#stage .director-stop").click();
});

test("an early click settles the entrance animation before saving the camera", async ({ page }) => {
  await enter(page);
  await page.locator("#panel .director").click();
  await page.waitForFunction(() => window.__room.director().playing, null, { timeout: 15000 });
  await page.waitForFunction(() => !window.__room.director().playing, null, { timeout: 15000 });
  expect(await page.evaluate(() => __room.cam())).toEqual([0.15, 1.5, 3.5]);
});

test("reduced motion shows three distinct room-light studies without moving the camera", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page, "en");
  const before = await page.evaluate(() => ({ camera: __room.cam(), url: location.href }));
  await page.locator("#panel .director").click();
  await expect(page.locator(".director-mini-room")).toHaveCount(3);
  await expect(page.locator(".director-phase")).toContainText(["Rain", "Daylight", "Night"]);
  const after = await page.evaluate(() => ({ camera: __room.cam(), url: location.href }));
  expect(after).toEqual(before);
});

test("a viewport change ends playback and restores control", async ({ page }) => {
  await enter(page);
  await page.locator("#panel .director").click();
  await page.waitForFunction(() => window.__room.director().playing, null, { timeout: 15000 });
  await page.setViewportSize({ width: 1300, height: 900 });
  await page.waitForFunction(() => !window.__room.director().playing && window.__room.director().controlsEnabled);
  await expect(page.locator("#stage .director-stop")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
