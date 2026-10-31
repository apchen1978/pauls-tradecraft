import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

// Screenshots are opt-in (set ROOMVERSE_QA_DIR); a normal run writes nothing into the repo.
const out = process.env.ROOMVERSE_QA_DIR || null;
if (out) mkdirSync(out, { recursive: true });

for (const lang of ["zh", "en"]) {
  for (const width of [390, 700, 768, 1024, 1280, 1440]) {
    test(`ROOMVERSE series card shows all three rooms, readable and without sideways scroll (${lang} ${width})`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(`/?lang=${lang}#showcase`);
      const card = page.locator("#showcase article").first();
      await expect(card.getByRole("heading", { level: 4 })).toHaveCount(3);
      await expect(card.getByRole("heading", { level: 4 }).nth(0)).toContainText(lang === "zh" ? "客廳" : "Living Room");
      await expect(card.getByRole("heading", { level: 4 }).nth(1)).toContainText("Brooklyn Studio");
      await expect(card.getByRole("heading", { level: 4 }).nth(2)).toContainText("Bay Area Kitchen");
      await expect(card.getByText(lang === "zh" ? "目前開放三間房" : "Three rooms are open")).toBeVisible();
      // Paul 2026-10-31: Room 03 is finished, so it shows like the other rooms with no work-in-progress label; the card opens it straight from home.
      await expect(card.getByText(lang === "zh" ? "施工中" : "Work in progress")).toHaveCount(0);
      await expect(card.getByRole("link", { name: lang === "zh" ? "走進廚房" : "Step into the kitchen" })).toHaveAttribute("href", `/prototype/roomverse-3d/kitchen/?from=home&lang=${lang}`);
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      // all covers load (images are lazy on phones)
      for (const i of [0, 1, 2]) { await card.locator("a:has(img) img").nth(i).scrollIntoViewIfNeeded(); }
      await page.waitForFunction(() => [...document.querySelectorAll("#showcase ol > li:first-child img")].every((im) => im.complete && im.naturalWidth > 100));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      // Layout: one column on phones, three across from 768px.
      const tops = await card.locator("h4").evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
      if (width >= 768) expect(new Set(tops).size).toBe(1);
      else expect(new Set(tops).size).toBe(3);
      if (out) await card.screenshot({ path: `${out}/home-${lang}-${width}.png` });
    });
  }
}
