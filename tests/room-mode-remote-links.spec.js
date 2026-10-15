import { expect, test } from "@playwright/test";

// ROOM MODE REMOTE: a way back to the portfolio, and a next stop at the result (no dead end).
const PAGE = "/prototype/room-mode-remote/";

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} at ${width}px: home link in the header, next stop at the result, both keep the language`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`${PAGE}?lang=${lang}`);
      await expect(page.locator("#home-link")).toHaveAttribute("href", `/?lang=${lang}`);
      await expect(page.locator("#home-link")).toBeVisible();
      await page.locator("#choice-list button").first().click();
      await page.locator("#next-button").click();
      await page.locator("#choice-list button").first().click();
      await page.locator("#next-button").click();
      await expect(page.locator("#next-stop-link")).toHaveAttribute("href", `/prototype/match-the-approved-lamp/?lang=${lang}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test("switching language updates the home link", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#language-toggle").click();
  await expect(page.locator("#home-link")).toHaveAttribute("href", "/?lang=en");
});
