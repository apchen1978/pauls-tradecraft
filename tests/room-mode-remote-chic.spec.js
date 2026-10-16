import { expect, test } from "@playwright/test";

const PAGE = "/prototype/room-mode-remote/";

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} at ${width}px: chic city mood follows ROOMVERSE's blush palette`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const errors = [];
      const assets = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => assets.push(new URL(response.url()).pathname));
      await page.goto(`${PAGE}?lang=${lang}`);

      if (width <= 800) {
        await page.locator("#mobile-scene-select").selectOption("sun");
      } else {
        await page.getByRole("button", { name: lang === "zh" ? "Cozy family" : "Cozy family" }).click();
        await page.locator("#choice-list .choice-option").filter({ hasText: lang === "zh" ? "讓陽光進來" : "Let the sun in" }).click();
      }

      const sample = async (x, y) => page.locator("#room-canvas").evaluate((canvas, point) => {
        const ctx = canvas.getContext("2d");
        return [...ctx.getImageData(Math.round(canvas.width * point.x), Math.round(canvas.height * point.y), 1, 1).data];
      }, { x, y });
      const wallBefore = await sample(.65, .22);
      const curtainBefore = await sample(.29, .35);

      if (width <= 800) {
        await page.locator("#mobile-scene-select").selectOption("chic");
      } else {
        await page.getByRole("button", { name: lang === "zh" ? "都會晨光" : "City mornings" }).click();
        await page.locator("#choice-list .choice-option").filter({ hasText: lang === "zh" ? "粉領新貴風" : "Chic city professional" }).click();
      }

      await expect(page.locator("#scene-caption")).toContainText(lang === "zh" ? "小矮椅" : "low chair");
      await expect(page.locator("#scene-caption")).toContainText(lang === "zh" ? "小機器人" : "little robot");
      await expect(page.locator("#room-canvas")).toHaveAttribute("aria-label", new RegExp(lang === "zh" ? "木牌匾" : "wooden plaque"));
      await expect(page.locator("#choice-list .choice-option[aria-pressed='true']")).toContainText(lang === "zh" ? "粉領新貴風" : "Chic city professional");
      await expect.poll(() => assets.some((path) => path.endsWith(width <= 800 ? "room-chic-v1-mobile.webp" : "room-chic-v1.webp"))).toBe(true);
      await expect.poll(() => assets.some((path) => path.endsWith("room-chic-plaque-v1.webp"))).toBe(true);
      await expect.poll(() => assets.some((path) => path.endsWith("room-chic-robot-v1.webp"))).toBe(true);

      const wallAfter = await sample(.65, .22);
      const curtainAfter = await sample(.29, .35);
      expect(wallAfter).not.toEqual(wallBefore);
      expect(curtainAfter).not.toEqual(curtainBefore);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
      await page.screenshot({ path: `test-results/chic-${lang}-${width}.png`, fullPage: true });
    });
  }
}

test("the chic city mood stays selected when switching language", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#mobile-scene-select").selectOption("chic");
  await page.locator("#language-toggle").click();
  await expect(page).toHaveURL(/lang=en/);
  await expect(page.locator("#mobile-scene-select")).toHaveValue("chic");
  await expect(page.locator("#scene-caption")).toContainText("little robot");
});

test("the chic postcard exports with the selected room", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#mobile-scene-select").selectOption("chic");
  await page.locator("#next-button").click();
  await page.locator("#choice-list .choice-option").first().click();
  await page.locator("#next-button").click();
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#next-button").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("room-mode-remote-chic.png");
});
