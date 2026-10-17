import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

mkdirSync("output/december-lamp-story", { recursive: true });

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} ${width}: the optional lamp story can be played without changing the role`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`/prototype/teammate-type/?c=AAA&lang=${lang}`);
      const originalRole = await page.locator("#card-name").innerText();
      await expect(page.locator("#night-panel")).toBeHidden();
      await page.locator("#night-toggle").click();
      await expect(page.locator("#night-panel")).toBeVisible();
      await page.locator('[data-night-look="steps"]').click();
      await expect(page.locator("#night-clues li")).toHaveCount(1);
      await page.locator('[data-night-companion="strategist"]').click();
      await expect(page.locator("#night-actions")).toBeVisible();
      await page.locator('[data-night-action="stage"]').click();
      await expect(page.locator("#night-ending")).toBeVisible();
      await expect.poll(async () => page.locator("#night-image").evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect.poll(async () => page.locator("#night-end-image").evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(page.locator("#night-ending-line")).toContainText(lang === "zh" ? "廣場的大燈" : "lamp in the square");
      const proportions = await page.evaluate(() => {
        const stage = document.querySelector("#night-image").getBoundingClientRect();
        const map = document.querySelector("#night-end-image").getBoundingClientRect();
        return [stage.height / stage.width, map.height / map.width];
      });
      expect(proportions[0]).toBeCloseTo(1.25, 1);
      expect(proportions[1]).toBeCloseTo(0.5625, 1);
      await expect(page.locator("#card-name")).toHaveText(originalRole);
      expect(new URL(page.url()).searchParams.get("c")).toBe("AAA");
      expect(errors).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      await page.locator("#night-story").screenshot({ path: `output/december-lamp-story/${lang}-${width}.png`, animations: "disabled" });

      await page.locator(`[data-set-lang="${lang === "zh" ? "en" : "zh"}"]`).click();
      await expect(page.locator("#night-ending")).toBeVisible();
      await expect(page.locator('[data-night-action="stage"]')).toHaveAttribute("aria-pressed", "true");
      await page.locator("#again").click();
      await expect(page.locator("#night-story")).toBeHidden();
    });
  }
}
