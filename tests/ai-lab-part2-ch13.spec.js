import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { NAV_CHAPTERS, TEXT } from "../public/ai-lab/content.js";
import { PART_TWO } from "../public/ai-lab/enterprise.js";

const PAGE = "/ai-lab/";
const screenshotDir = join(process.cwd(), "docs", "qa", "ai-lab-part2-ch13");
mkdirSync(screenshotDir, { recursive: true });

async function noOverflow(page) {
  const sizes = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
  expect(sizes.document).toBe(0);
  expect(sizes.body).toBe(0);
}

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`Part II chapter 13: ${lang} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${PAGE}?lang=${lang}`);

      const x = PART_TWO[lang];
      const sectionCount = NAV_CHAPTERS.filter(({ id }) => /^c\d+$/.test(id)).length;
      await expect(page.locator(".chapter[id^='c']")).toHaveCount(sectionCount);
      await expect(page.locator("#rail .rail-dot")).toHaveCount(NAV_CHAPTERS.length);
      await expect(page.locator("#toc a")).toHaveCount(TEXT[lang].toc.length + 1);
      await expect(page.locator("#toc a[href='#part2'], #toc a[href='#c13']")).toHaveCount(0);
      await expect(page.locator("#rail a[href='#part2'], #rail a[href='#c13']")).toHaveCount(2);
      await expect(page.locator("#part2-title")).toHaveText(x.partTitle);
      await expect(page.locator("#part2-intro p")).toHaveCount(2);
      await expect(page.locator("#c13-title")).toHaveText(x.title);
      await expect(page.locator("#c13-demo")).toHaveText(x.demo);
      await expect(page.locator("#access-table tr")).toHaveCount(5);
      await expect(page.locator("#access-table input[type=checkbox]")).toHaveCount(7);
      await expect(page.locator("#access-table .access-na")).toHaveCount(5);
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "safe");
      await expect(page.locator("#access-result-status")).toHaveText(x.statuses.safe);
      await expect(page.locator("#access-approval")).toBeChecked();
      expect(await page.evaluate(() => localStorage.length)).toBe(0);
      await expect(page.locator("#deep-kicker")).toContainText("05–12");

      // An unnecessary grant changes the outcome even when approval is on.
      const erpWrite = page.locator('input[data-system="erp"][data-permission="write"]');
      await erpWrite.check();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "broad");
      await expect(page.locator("#access-result-status")).toHaveText(x.statuses.broad);
      await expect(page.locator("#access-result-copy")).toContainText(x.extra);
      await erpWrite.uncheck();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "safe");

      // A missing required read permission is reported immediately.
      await page.locator('[data-task="reply"]').click();
      await page.locator('input[data-system="products"][data-permission="read"]').uncheck();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "missing");
      await expect(page.locator("#access-result-copy")).toContainText(x.missing);
      await page.locator('input[data-system="products"][data-permission="read"]').check();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "safe");

      // An unreviewed external send is the high-risk case.
      await page.locator('input[data-system="email"][data-permission="send"]').check();
      await page.locator("#access-approval").uncheck();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "risky");
      await expect(page.locator("#access-result-copy")).toContainText(x.risks.send);
      await page.locator("#access-approval").check();
      await page.locator('input[data-system="email"][data-permission="send"]').uncheck();

      // Follow-up needs CRM read + write, with the human approval gate left on.
      await page.locator('[data-task="followup"]').click();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "missing");
      await page.locator('input[data-system="crm"][data-permission="read"]').check();
      await page.locator('input[data-system="crm"][data-permission="write"]').check();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "broad");
      await page.locator('input[data-system="products"][data-permission="read"]').uncheck();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "safe");
      await page.locator("#access-approval").uncheck();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "risky");
      await expect(page.locator("#access-result-copy")).toContainText(x.risks.write);
      await page.locator("#access-approval").check();

      // Task selection and permission toggles work from the keyboard.
      const taskButton = page.locator('[data-task="products"]');
      await taskButton.focus();
      await page.keyboard.press("Enter");
      await expect(taskButton).toHaveAttribute("aria-pressed", "true");
      const erpRead = page.locator('input[data-system="erp"][data-permission="read"]');
      await erpRead.focus();
      await page.keyboard.press("Space");
      await expect(erpRead).toBeChecked();

      // Leave a readable end state for the four review screenshots.
      await page.locator('input[data-system="products"][data-permission="read"]').check();
      await page.locator('input[data-system="crm"][data-permission="read"]').uncheck();
      await page.locator('input[data-system="crm"][data-permission="write"]').uncheck();
      await erpRead.uncheck();
      await expect(page.locator("#access-result")).toHaveAttribute("data-state", "safe");
      if (lang === "zh" && width === 390) {
        await erpWrite.check();
        await expect(page.locator("#access-result")).toHaveAttribute("data-state", "broad");
      }

      const reveal = page.locator("#access-reveal");
      await reveal.locator("summary").click();
      await expect(reveal).toHaveAttribute("open", "");
      await expect(page.locator("#access-just-enough .access-answer")).toHaveCount(x.justEnough.length);
      await expect(page.locator("#access-principles li")).toHaveCount(x.principles.length);

      await page.evaluate(() => document.querySelector("#c13").scrollIntoView({ block: "start" }));
      await noOverflow(page);
      await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
      const suffix = `${lang}-${width}`;
      await page.locator("#c13").screenshot({ path: join(screenshotDir, `${suffix}.png`) });
    });
  }
}
