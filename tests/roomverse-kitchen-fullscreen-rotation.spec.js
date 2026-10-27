import { test, expect } from "@playwright/test";

const ROOM = "/prototype/roomverse-3d/kitchen/?lang=zh";

async function enterPortraitFullscreen(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ROOM);
  await page.waitForFunction(() => Boolean(window.__room03));
  await page.evaluate(() => history.replaceState({ rotationTestEntry: true }, "", location.href));
  await page.locator("#immersiveEnter").click();
  await expect(page.locator("#immersiveExit")).toBeVisible();
}

async function expectFullscreenFillsViewport(page) {
  await expect(page.locator("#immersiveExit")).toBeVisible();
  await expect.poll(() => page.locator(".room").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return Math.abs(r.width - innerWidth) < 2 && Math.abs(r.height - innerHeight) < 2;
  })).toBe(true);
  await expect(page.locator("#immersiveControls #moods")).toBeVisible();
  const controls = await page.locator("#immersiveExit").boundingBox();
  expect(controls.x).toBeGreaterThanOrEqual(0);
  expect(controls.y).toBeGreaterThanOrEqual(0);
  expect(controls.y + controls.height).toBeLessThanOrEqual(page.viewportSize().height);
}

async function expectRestored(page) {
  await expect(page.locator("html")).not.toHaveClass(/room-immersive/);
  await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
  await expect(page.locator(".toolbar #moods")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  await expect.poll(() => page.evaluate(() => history.state)).toEqual({ rotationTestEntry: true });
  await expect(page).toHaveURL(ROOM);
}

test("landscape exit remains visible and restores history, scrolling and focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ROOM + "&previous=1");
  await enterPortraitFullscreen(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await expectFullscreenFillsViewport(page);
  await page.locator("#immersiveExit").click();
  await expectRestored(page);
  await expect(page.locator("#lang")).toBeFocused();
  // One more Back reaches the previous document, rather than a redundant immersive entry.
  await page.goBack();
  await expect(page).toHaveURL(ROOM + "&previous=1");
});

test("portrait to landscape to portrait keeps fullscreen controls usable", async ({ page }) => {
  await enterPortraitFullscreen(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await expectFullscreenFillsViewport(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectFullscreenFillsViewport(page);
  await page.locator("#immersiveExit").click();
  await expectRestored(page);
  await expect(page.locator("#immersiveEnter")).toBeFocused();
});

test("Escape exits fullscreen after rotating into landscape", async ({ page }) => {
  await enterPortraitFullscreen(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await expectFullscreenFillsViewport(page);
  await page.keyboard.press("Escape");
  await expectRestored(page);
  await expect(page.locator("#lang")).toBeFocused();
});

test("browser Back exits fullscreen after rotating into landscape", async ({ page }) => {
  await enterPortraitFullscreen(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await expectFullscreenFillsViewport(page);
  await page.goBack();
  await expectRestored(page);
  await expect(page.locator("#lang")).toBeFocused();
});
