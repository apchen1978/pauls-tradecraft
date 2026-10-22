import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = "docs/qa/home-roomverse-two-rooms";
mkdirSync(out, { recursive: true });

for (const lang of ["zh", "en"]) {
  for (const width of [390, 768, 1440]) {
    test(`ROOMVERSE series card shows both rooms, readable and without sideways scroll (${lang} ${width})`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(`/?lang=${lang}#showcase`);
      const card = page.locator("#showcase article").first();
      await expect(card.getByRole("heading", { level: 4 })).toHaveCount(2);
      await expect(card.getByRole("heading", { level: 4 }).nth(0)).toContainText(lang === "zh" ? "客廳" : "Living Room");
      await expect(card.getByRole("heading", { level: 4 }).nth(1)).toContainText(lang === "zh" ? "都市青年Style" : "Urban Youth Style");
      await expect(card.getByText(lang === "zh" ? "目前開放兩間房" : "Two rooms are open")).toBeVisible();
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      // both covers load (images are lazy on phones)
      for (const i of [0, 1]) { await card.locator("a:has(img) img").nth(i).scrollIntoViewIfNeeded(); }
      await page.waitForFunction(() => [...document.querySelectorAll("#showcase ol > li:first-child img")].every((im) => im.complete && im.naturalWidth > 100));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      await card.screenshot({ path: `${out}/${lang}-${width}.png` });
    });
  }
}
