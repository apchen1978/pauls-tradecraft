import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const lessonURL = pathToFileURL(resolve("prototype/second-source-light-lesson/index.html")).href;

for (const lang of ["zh", "en"]) {
  for (const width of [390, 768, 1440]) {
    test(`${lang} ${width}px: first-order sketch keeps its state and fits`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${lessonURL}?lang=${lang}`);

      const a = page.locator("#order-sketch-a");
      const b = page.locator("#order-sketch-b");
      await expect(a).toHaveAttribute("aria-pressed", "true");
      await expect(b).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator("#order-sketch-fields .next-question")).toHaveCount(4);

      await b.click();
      await expect(a).toHaveAttribute("aria-pressed", "false");
      await expect(b).toHaveAttribute("aria-pressed", "true");
      await a.click();
      await expect(a).toHaveAttribute("aria-pressed", "true");
      await expect(b).toHaveAttribute("aria-pressed", "false");

      const layout = await page.evaluate(() => {
        const size = (selector) => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          body: size("#order-sketch-fields dd"),
          prompt: size("#order-sketch-fields .next-question"),
          takeaway: size("#order-sketch-takeaway"),
          label: size("#order-sketch-fields dt"),
          note: size("#order-sketch-note"),
        };
      });
      expect(layout.overflow).toBeLessThanOrEqual(1);
      expect(Math.min(layout.body, layout.prompt, layout.takeaway)).toBeGreaterThanOrEqual(17);
      expect(Math.min(layout.label, layout.note)).toBeGreaterThanOrEqual(14);

      await a.focus();
      await page.keyboard.press("Tab");
      await expect(b).toBeFocused();
      const outline = await b.evaluate((element) => {
        const style = getComputedStyle(element);
        return { width: parseFloat(style.outlineWidth), type: style.outlineStyle };
      });
      expect(outline.width).toBeGreaterThanOrEqual(2);
      expect(outline.type).not.toBe("none");
    });
  }
}
