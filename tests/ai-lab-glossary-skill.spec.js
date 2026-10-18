import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { GLOSSARY, MORE } from "../public/ai-lab/more.js";

const screenshots = join(process.cwd(), "docs", "qa", "ai-lab-glossary-skill");
mkdirSync(screenshots, { recursive: true });

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`Skill glossary ${lang} ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`/ai-lab/?lang=${lang}#glossary`);
      const x = MORE[lang].glossary;
      await expect(page.locator("#gl .term")).toHaveCount(GLOSSARY.length);
      await expect(page.locator("#gl .term").nth(GLOSSARY.indexOf("mcp") + 1)).toHaveAttribute("data-term", "skill");
      for (const id of ["tools", "mcp", "skill"]) {
        const card = page.locator(`#${id}`);
        await expect(card).toHaveCount(1);
        await card.locator("summary").click();
        await expect(card).toHaveAttribute("open", "");
        await expect(card).toContainText(x.terms[id][1]);
        await expect(card).toContainText(x.terms[id][2]);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBe(0);
      await page.addStyleTag({ content: ".top, .rail { visibility: hidden !important; }" });
      await page.locator("#glossary").screenshot({ path: join(screenshots, `${lang}-${width}.png`) });
    });
  }
}
