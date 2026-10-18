import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// This source-owned prototype is copied into dist by deploy.yml after the Vite build.
const PAGE = pathToFileURL(resolve("prototype/code-words/index.html")).href;

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test.describe(`code words ${lang} ${width}px`, () => {
      test.use({ viewport: { width, height: width === 390 ? 844 : 900 } });

      test("selection gives a visible next step without changing the reading", async ({ page }) => {
        await page.goto(`${PAGE}?lang=${lang}`);
        const read = page.locator("#read");
        const hint = page.locator("#selection-hint");
        const choice = page.locator(".chip").first();
        await expect(read).toBeDisabled();
        await expect(hint).toBeHidden();
        await expect(choice).toHaveAttribute("aria-pressed", "false");

        await choice.click();
        await expect(choice).toHaveAttribute("aria-pressed", "true");
        await expect(choice.locator(".selection-check")).toBeVisible();
        await expect(hint).toBeVisible();
        await expect(hint).toContainText(lang === "zh" ? "隨便" : "Whatever");
        await expect(read).toBeEnabled();
        const selected = await choice.evaluate((el) => getComputedStyle(el).backgroundColor);
        const unselected = await page.locator(".chip").nth(1).evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(selected).not.toBe(unselected);
        const enabled = await read.evaluate((el) => getComputedStyle(el).backgroundColor);

        await read.click();
        const firstReading = await page.locator("#agents .reads").allTextContents();
        expect(firstReading).toHaveLength(3);
        await page.locator("#back-pick").click();
        await page.locator("#read").click();
        expect(await page.locator("#agents .reads").allTextContents()).toEqual(firstReading);
        await page.locator("#back-pick").click();

        await page.locator("#own").fill(lang === "zh" ? "想想看" : "maybe");
        await expect(page.locator('.chip[aria-pressed="true"]')).toHaveCount(0);
        await expect(hint).toContainText(lang === "zh" ? "想想看" : "maybe");
        await expect(read).toBeEnabled();
        await page.locator("#own").fill("");
        await expect(read).toBeDisabled();
        await expect(hint).toBeHidden();
        const disabled = await read.evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(enabled).not.toBe(disabled);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      });

      test("tap targets remain at least 44px", async ({ page }) => {
        await page.goto(`${PAGE}?lang=${lang}`);
        const sizes = await page.locator(".chip,[data-set-lang],#read").evaluateAll((els) =>
          els.map((el) => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })),
        );
        for (const size of sizes) {
          expect(size.width).toBeGreaterThanOrEqual(44);
          expect(size.height).toBeGreaterThanOrEqual(44);
        }
      });
    });
  }
}
