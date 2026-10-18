import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { NAV_CHAPTERS, TEXT } from "../public/ai-lab/content.js";
import { TOOLPATH } from "../public/ai-lab/toolpath.js";

const screenshots = join(process.cwd(), "docs", "qa", "ai-lab-part2-ch15");
mkdirSync(screenshots, { recursive: true });
const EXPECTED_BRIDGE = {
  zh: "知道什麼時候輪到 agent 之後，還有一件事：一句好用的話，怎麼慢慢變成大家都能用的工具。",
  en: "Once you know when an agent takes its turn, there is one more thing: how one useful sentence gradually becomes a tool everyone can use.",
};

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`Chapter 15: ${lang} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/ai-lab/?lang=${lang}`);
      const x = TOOLPATH[lang];

      await expect(page.locator("#c15-title")).toHaveText(x.title);
      await expect(page.locator("#c15-demo")).toHaveText(x.demo);
      expect(x.bridge).toBe(EXPECTED_BRIDGE[lang]);
      await expect(page.locator("#c14-to-c15")).toHaveText(x.bridge);
      await expect(page.locator("#rail .rail-dot")).toHaveCount(NAV_CHAPTERS.length + 1);
      await expect(page.locator("#rail a[href='#c15']")).toHaveCount(1);
      await expect(page.locator("#toc a[href='#c15']")).toHaveCount(0);
      await expect(page.locator("#toc a")).toHaveCount(TEXT[lang].toc.length + 1);
      await expect(page.locator("#package-original")).toHaveText(x.original);
      await expect(page.locator("#package-features .package-feature")).toHaveCount(0);
      await expect(page.locator("#package-status li")).toHaveCount(3);

      const next = page.locator("#package-next");
      await expect(next).toHaveText(x.blockedButton);
      await expect(next).toHaveAttribute("aria-disabled", "true");
      await next.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#package-features .package-feature")).toHaveCount(0);
      const gates = page.locator("#package-gates input");
      await gates.nth(0).check();
      await expect(page.locator("#package-status li")).toHaveCount(2);
      await gates.nth(1).check();
      await expect(page.locator("#package-status li")).toHaveCount(1);
      await gates.nth(0).uncheck();
      await expect(page.locator("#package-status li")).toHaveCount(2);
      await gates.nth(0).focus();
      await page.keyboard.press("Space");
      await expect(gates.nth(0)).toBeChecked();
      await gates.nth(2).check();
      await expect(next).toHaveText(x.readyButton);
      await expect(page.locator("#package-status")).toContainText(x.ready);

      for (let level = 1; level <= 4; level++) {
        await next.click();
        await expect(page.locator("#package-features .package-feature")).toHaveCount(level);
        await expect(page.locator("#package-stage-name")).toHaveText(x.stages[level - 1].name);
        await expect(page.locator("#package-features .package-tradeoff dt")).toHaveCount(level * 3);
        if (level === 3) {
          await expect(page.locator(".package-example-button")).toBeDisabled();
          await expect(page.locator(".package-check")).toHaveText(x.toolCheck);
        }
      }
      await expect(next).toBeDisabled();
      await expect(next).toHaveText(x.finishedButton);
      for (let level = 3; level >= 0; level--) {
        await page.locator("#package-back").click();
        await expect(page.locator("#package-features .package-feature")).toHaveCount(level);
      }
      await expect(page.locator("#package-back")).toBeDisabled();

      await page.locator("#package-reveal summary").click();
      await expect(page.locator("#package-roles li")).toHaveCount(3);
      await expect(page.locator("#package-principles li")).toHaveCount(3);
      const target = lang === "zh" && width === 390 ? 2 : width === 1440 ? 4 : 3;
      for (let level = 0; level < target; level++) await next.click();
      if (lang === "zh" && width === 390) {
        await gates.nth(2).uncheck();
        await expect(next).toHaveText(x.blockedButton);
        await expect(page.locator("#package-status")).toContainText(x.gates[2].missing);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBe(0);
      await page.addStyleTag({ content: ".top, .rail { visibility: hidden !important; }" });
      await page.locator("#c15").screenshot({ path: join(screenshots, `${lang}-${width}.png`) });
    });
  }
}
