import { expect, test } from "@playwright/test";

const PAGE = "/prototype/room-mode-remote/";

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} at ${width}px starts with the cat room cover`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const expectedAsset = width <= 800
        ? "showcase-room-mode-remote-mobile.webp"
        : "showcase-room-mode-remote.webp";
      const imageResponse = page.waitForResponse((response) => response.url().endsWith(expectedAsset));

      await page.goto(`${PAGE}?lang=${lang}`);
      expect((await imageResponse).status()).toBe(200);

      const expectedCopy = lang === "zh" ? "貓" : "cat";
      await expect(page.locator("#scene-caption")).toContainText(expectedCopy);
      await expect(page.locator("#room-canvas")).toHaveAttribute("aria-label", new RegExp(expectedCopy, "i"));
      await expect(page.locator("#choice-list .choice-option[aria-pressed='true']")).toContainText(expectedCopy);

      const canvasHasImage = await page.locator("#room-canvas").evaluate((canvas) => {
        const context = canvas.getContext("2d");
        const points = [
          [canvas.width * 0.1, canvas.height * 0.2],
          [canvas.width * 0.5, canvas.height * 0.2],
          [canvas.width * 0.9, canvas.height * 0.2],
          [canvas.width * 0.2, canvas.height * 0.8],
          [canvas.width * 0.5, canvas.height * 0.8],
          [canvas.width * 0.8, canvas.height * 0.8],
        ];
        const colors = points.map(([x, y]) => [...context.getImageData(Math.round(x), Math.round(y), 1, 1).data].join(","));
        return new Set(colors).size > 3;
      });
      expect(canvasHasImage).toBe(true);

      if (width === 390) {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      }
    });
  }
}
