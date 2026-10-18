import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { REGISTRY } from "../public/ai-lab/registry.js";
import { NAV_CHAPTERS } from "../public/ai-lab/content.js";

const PAGE = "/ai-lab/";
const screenshots = join(process.cwd(), "docs", "qa", "ai-lab-part2-ch17");
mkdirSync(screenshots, { recursive: true });

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`Chapter 17 ${lang} ${width}px: register, review and Part II close`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${PAGE}?lang=${lang}`);
      const copy = REGISTRY[lang];

      await expect(page.locator("#c17")).toHaveCount(1);
      await expect(page.locator("#registry-title")).toHaveText(copy.title);
      await expect(page.locator("#registry-demo")).toHaveText(copy.demo);
      await expect(page.locator("#registry-opening p")).toHaveCount(3);
      await expect(page.locator("#registry-board-note")).toHaveText(copy.registerNote);
      await expect(page.locator("#registry-rows > .registry-item")).toHaveCount(5);
      await expect(page.locator("#registry-rows > .registry-detail-row")).toHaveCount(5);
      await expect(page.locator("#registry-rows .registry-toggle")).toHaveCount(5);
      await expect(page.locator(".registry-table thead th")).toHaveCount(6);
      await expect(page.locator("#rail [data-target='c17']")).toHaveCount(1);
      await expect(page.locator("#rail [data-target='c17'] .mono")).toHaveText("17");
      await expect(page.locator("#rail [data-target='c17']").evaluate((node) => node.previousElementSibling?.dataset.target)).resolves.toBe("c16");
      await expect(page.locator("#toc a[href='#c17']")).toHaveCount(0);
      await expect(page.locator("#main .chapter[id^='c']")).toHaveCount(NAV_CHAPTERS.filter(({ id }) => /^c\d+$/.test(id)).length + 1);
      await expect(page.locator("#c16").evaluate((node) => node.nextElementSibling?.id)).resolves.toBe("c17");
      await expect(page.locator("#c17").evaluate((node) => node.nextElementSibling?.id)).resolves.toBe("latest");

      const rowNames = copy.rows.map(({ tool }) => tool);
      await expect(page.locator("#registry-rows .registry-toggle")).toHaveText(rowNames);
      for (const [index, row] of copy.rows.entries()) {
        const button = page.locator(`#registry-toggle-${row.id}`);
        const panel = page.locator(`#registry-detail-${row.id}`);
        await expect(button).toHaveAttribute("aria-expanded", "false");
        await button.click();
        await expect(button).toHaveAttribute("aria-expanded", "true");
        await expect(panel).toBeVisible();
        await expect(panel).toContainText(copy.detailLabels[0]);
        await expect(panel).toContainText(copy.detailLabels[1]);
        if (index === 0) {
          await expect(panel).toContainText(row.issue);
          await page.locator("#c17").screenshot({ path: join(screenshots, `${lang}-${width}-expanded.png`) });
          await button.focus();
          await page.keyboard.press("Enter");
          await expect(page.locator(`#registry-toggle-${row.id}`)).toHaveAttribute("aria-expanded", "false");
        } else {
          await button.click();
          await expect(page.locator(`#registry-detail-${row.id}`)).toBeHidden();
        }
      }

      await expect(page.locator("#registry-questions li")).toHaveText(copy.questions);
      await expect(page.locator("#registry-failures-text")).toContainText(lang === "zh" ? "第 10 章" : "chapter 10");
      await expect(page.locator("#registry-links a[href='#c10']")).toHaveCount(1);
      await expect(page.locator("#registry-links a[href='#c16']")).toHaveCount(1);
      await expect(page.locator("#registry-closing-body p")).toHaveCount(4);
      await expect(page.locator("#registry-closing-body")).toContainText(copy.closing.at(-1));
      await expect(page.locator("#c16-to-c17")).toHaveText(copy.bridge);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      if (width === 390) await expect(page.locator(".registry-item").first()).toHaveCSS("display", "grid");
    });
  }
}
