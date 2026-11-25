import { test, expect } from "@playwright/test";

// Paul 2026-11-25: the lounge had no shared player bar, and its status text could claim "playing" after 20 s even when no
// note had been scheduled. These checks cover the bar itself (desktop, phone, both languages), switching, a failed load,
// stopping, and a slow network that must not be reported as playing.

const PAGE = "/music-lounge/";

async function openLounge(page, { width = 1440, height = 900, lang = "zh" } = {}) {
  await page.setViewportSize({ width, height });
  await page.goto(`${PAGE}?lang=${lang}`);
  await expect(page.locator(".track-card").first()).toBeVisible({ timeout: 45000 });
}

const barText = (page, id) => page.locator(id).innerText();

test("the bar shows the track and its real status on a desktop, and stopping hides it", async ({ page }) => {
  await openLounge(page);
  await expect(page.locator("#player-bar")).toBeHidden();
  await page.locator(".track-card .play-button").first().click();
  await expect(page.locator("#player-bar")).toBeVisible();
  await expect(page.locator("#player-kicker")).toHaveText("正在播放");
  await expect(page.locator("#player-title")).toHaveText("晨曦");
  await expect(page.locator("#player-stop")).toHaveText("停止");
  // The status may only say "playing" once the engine has scheduled a note; that is what this waits for.
  await expect.poll(async () => barText(page, "#player-status"), { timeout: 45000, intervals: [500] }).toBe("播放中");
  await expect(page.locator("#player-bar")).toHaveClass(/player-bar/);
  expect(await page.evaluate(() => document.body.classList.contains("has-player-bar"))).toBe(true);
  await page.locator("#player-stop").click();
  await expect(page.locator("#player-bar")).toBeHidden({ timeout: 8000 });
  expect(await page.evaluate(() => document.body.classList.contains("has-player-bar"))).toBe(false);
  await expect(page.locator(".track-card .track-status").first()).toHaveText("已停止");
});

test("the bar is the same on a phone, and does not cover the stop button it offers", async ({ page }) => {
  await openLounge(page, { width: 390, height: 844 });
  await page.locator(".track-card .play-button").first().click();
  await expect(page.locator("#player-bar")).toBeVisible();
  await expect(page.locator("#player-title")).toHaveText("晨曦");
  const box = await page.locator("#player-bar").boundingBox();
  expect(box.width).toBeGreaterThan(300); // full width on a phone
  expect(box.y + box.height).toBeLessThanOrEqual(844 + 1); // pinned to the bottom edge
  const stop = await page.locator("#player-stop").boundingBox();
  expect(stop.x).toBeGreaterThan(0);
  expect(stop.x + stop.width).toBeLessThanOrEqual(390);
});

test("the bar speaks English when the page does", async ({ page }) => {
  await openLounge(page, { lang: "en" });
  await page.locator(".track-card .play-button").first().click();
  await expect(page.locator("#player-kicker")).toHaveText("Now playing");
  await expect(page.locator("#player-title")).toHaveText("Morning Light");
  await expect(page.locator("#player-stop")).toHaveText("Stop");
});

test("switching tracks replaces the bar's text and keeps one track playing", async ({ page }) => {
  await openLounge(page);
  const buttons = page.locator(".track-card .play-button");
  await buttons.nth(0).click();
  await expect(page.locator("#player-title")).toHaveText("晨曦");
  await page.waitForTimeout(300);
  await buttons.nth(3).click();
  await expect(page.locator("#player-title")).toHaveText("午後上行", { timeout: 15000 });
  // Only one card may be live at a time.
  const live = await page.evaluate(() => document.querySelectorAll(".track-card.is-live").length);
  expect(live).toBe(1);
  await expect(page.locator("#player-status")).toHaveText("播放中", { timeout: 45000 });
});

test("a load that fails says so in the bar and then steps aside", async ({ page }) => {
  await page.route("**/night-score.js*", (route) => route.abort());
  await openLounge(page);
  await page.locator(".track-card", { hasText: "追劇夜" }).locator(".play-button").click();
  await expect.poll(async () => barText(page, "#player-status"), { timeout: 15000 }).toContain("無法啟動");
  await expect(page.locator("#player-bar")).toBeHidden({ timeout: 10000 });
});

test("a slow network is reported as slow, never as playing", async ({ page }) => {
  test.setTimeout(120000);
  await page.route("**/night-score.js*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 26000));
    await route.continue();
  });
  await openLounge(page);
  await page.locator(".track-card", { hasText: "追劇夜" }).locator(".play-button").click();
  // After the loading ran long, the bar must have said so rather than quietly implying progress.
  await expect.poll(async () => barText(page, "#player-status"), { timeout: 30000, intervals: [1000] }).toContain("比平常久");
  expect(await barText(page, "#player-status")).not.toBe("播放中");
  // And once the module arrives and a note is scheduled, it may say playing.
  await expect.poll(async () => barText(page, "#player-status"), { timeout: 60000, intervals: [1000] }).toBe("播放中");
});
