import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const PAGE = "/ai-lab/how-made/";
const QA = join(process.cwd(), "docs", "qa", "ai-lab-how-made");
mkdirSync(QA, { recursive: true });

const BANNED = ["老闆", "前職", "Former role", "ROI", "延米", "質米", "中間層", "A2A", "CDD"];

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`how-made ${lang} ${width}px: structure, language and no horizontal overflow`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`${PAGE}?lang=${lang}`);

      const copy = page.locator(`.guide-copy[data-language="${lang}"]`);
      const other = page.locator(`.guide-copy[data-language="${lang === "zh" ? "en" : "zh"}"]`);
      await expect(copy).toBeVisible();
      await expect(other).toBeHidden();
      await expect(page.locator("html")).toHaveAttribute("lang", lang === "zh" ? "zh-Hant" : "en");

      await expect(copy.locator("h1")).toHaveCount(1);
      await expect(copy.locator(".guide-principle")).toHaveCount(5);
      await expect(copy.locator(".guide-principle h3")).toHaveCount(4);
      await expect(copy.locator(".made-lesson")).toHaveCount(4);
      await expect(copy.locator(".guide-misconceptions li")).toHaveCount(2);
      await expect(copy.locator(".made-quote")).toHaveCount(1);

      const text = await copy.innerText();
      for (const word of BANNED) expect(text, `banned wording: ${word}`).not.toContain(word);
      expect(text).toContain("Claude Code");
      expect(text).toContain("Codex");
      expect(text).toContain("Rucker Park");
      expect(text).toContain("Eichler");
      expect(text).toContain("Bed-Stuy");

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
      await page.screenshot({ path: join(QA, `how-made-${lang}-${width}.png`), fullPage: true });
    });
  }

  test(`how-made ${lang}: entry from AI Lab chapter 12 keeps language, links go back`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/ai-lab/?lang=${lang}#c12`);
    const entry = page.locator("#c12-howmade-link-anchor");
    await expect(entry).toHaveAttribute("href", `${PAGE}?lang=${lang}`);
    await expect(page.locator("#c12-howmade-link-title")).not.toBeEmpty();
    await entry.click();
    await expect(page).toHaveURL(new RegExp(`/ai-lab/how-made/\\?lang=${lang}$`));
    await expect(page.locator(`.guide-copy[data-language="${lang}"]`)).toBeVisible();
    await expect(page.locator(`.guide-copy[data-language="${lang}"] [data-destination="room"]`)).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=${lang}`);
    await expect(page.locator(`.guide-copy[data-language="${lang}"] [data-destination="lab"]`)).toHaveAttribute("href", `/ai-lab/?lang=${lang}#c12`);
    await expect(page.locator(`[data-language-link="${lang}"]`)).toHaveAttribute("aria-current", "page");
  });
}
