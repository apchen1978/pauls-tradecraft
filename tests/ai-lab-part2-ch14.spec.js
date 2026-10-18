import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { LADDER } from "../public/ai-lab/ladder.js";

const screenshots = join(process.cwd(), "docs", "qa", "ai-lab-part2-ch14");
const NEXT_CHAPTER_TOOL_LINE = {
  zh: "一句交辦話怎麼變成可用的工具，下一章再看。",
  en: "The next chapter shows how one instruction can become a useful tool.",
};
mkdirSync(screenshots, { recursive: true });

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`Chapter 14: ${lang} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/ai-lab/?lang=${lang}`);
      const x = LADDER[lang];

      await expect(page.locator("#c14-title")).toHaveText(x.title);
      await expect(page.locator("#c14-lead")).toContainText(NEXT_CHAPTER_TOOL_LINE[lang]);
      await expect(page.locator("#c14-demo")).toHaveText(x.demo);
      await expect(page.locator("#rail a[href='#c14']")).toHaveCount(1);
      await expect(page.locator("#toc a[href='#c14']")).toHaveCount(0);
      await expect(page.locator("#ladder-steps li")).toHaveCount(5);
      await expect(page.locator("#ladder-steps li[data-owner='human']")).toHaveCount(5);

      const levels = page.locator("input[name='ladder-level']");
      await levels.nth(1).check();
      await expect(page.locator("#ladder-steps li[data-owner='shared']")).toHaveCount(2);
      await levels.nth(2).check();
      await expect(page.locator("#ladder-steps li[data-owner='agent']")).toHaveCount(2);
      await expect(page.locator("#ladder-steps li").nth(4)).toHaveAttribute("data-owner", "human");

      await page.locator("#ladder-skip").check();
      await expect(page.locator("#ladder-steps li").nth(3)).toHaveAttribute("data-owner", "agent");
      await expect(page.locator("#ladder-outcome")).toHaveText(x.jumped);
      await page.locator("#ladder-skip").uncheck();
      await expect(page.locator("#ladder-steps li").nth(3)).toHaveAttribute("data-owner", "human");
      await expect(page.locator("#ladder-outcome")).toHaveText(x.normal);
      await levels.nth(2).focus();
      await page.keyboard.press("ArrowLeft");
      await expect(levels.nth(1)).toBeChecked();
      await page.keyboard.press("ArrowRight");
      await expect(levels.nth(2)).toBeChecked();
      await page.locator("#ladder-skip").focus();
      await page.keyboard.press("Space");
      await expect(page.locator("#ladder-skip")).toBeChecked();
      await page.keyboard.press("Space");
      await expect(page.locator("#ladder-skip")).not.toBeChecked();

      await page.locator("#ladder-reveal summary").click();
      await expect(page.locator("#ladder-gates li")).toHaveCount(2);
      await expect(page.locator("#ladder-principles li")).toHaveCount(3);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBe(0);

      if (lang === "zh" && width === 390) await page.locator("#ladder-skip").check();
      // Keep the long chapter capture clear of the site's sticky navigation.
      await page.addStyleTag({ content: ".top, .rail { visibility: hidden !important; }" });
      await page.locator("#c14").screenshot({ path: join(screenshots, `${lang}-${width}.png`) });
    });
  }
}
