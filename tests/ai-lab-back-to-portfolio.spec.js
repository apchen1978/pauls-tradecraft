import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const QA = process.env.AILAB_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

for (const [lang, label] of [["zh", "← 回作品集"], ["en", "← Back to the portfolio"]]) {
  for (const width of [390, 1440]) {
    test(`AI Lab shows a visible back-to-portfolio button, ${lang} ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`/ai-lab/?lang=${lang}`);
      const back = page.locator("#back-home");
      await expect(back).toBeVisible();
      await expect(back).toHaveText(label);
      await expect(back).toHaveAttribute("href", `/?lang=${lang}`);
      const box = await back.boundingBox();
      expect(box.height, "tap target height").toBeGreaterThanOrEqual(36);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await expect(back, "stays reachable half way down the page").toBeInViewport();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, "no horizontal overflow").toBeLessThanOrEqual(0);
      const langBox = await page.locator("#lang-group").boundingBox();
      expect(box.x + box.width, "pill does not collide with the language buttons").toBeLessThanOrEqual(langBox.x);
      if (QA) await page.screenshot({ path: `${QA}/ai-lab-back-${lang}-${width}.png`, clip: { x: 0, y: 0, width, height: 140 } });
    });
  }
}

test("the back button returns to the portfolio homepage", async ({ page }) => {
  await page.goto("/ai-lab/?lang=zh");
  await page.locator("#back-home").click();
  await expect(page).toHaveURL(/\/\?lang=zh$/);
});
