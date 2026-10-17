import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

mkdirSync("output/december-map-clear", { recursive: true });

for (const width of [390, 768, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} ${width}: complete map, outside controls, district and lamp interactions`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`/prototype/teammate-type/?lang=${lang}`);
      await page.locator("#town-map").evaluate(img => img.decode());
      const start = page.locator("#start");
      await expect(start).toBeInViewport();
      await expect(page.locator("#title")).toHaveText(lang === "zh" ? "十二月的燈" : "December Lights");

      const geometry = await page.evaluate(() => {
        const frame = document.querySelector(".map-frame").getBoundingClientRect();
        const overlays = [".cover-copy", ".cover-action", "#intro", "#cover-hint", ".district-links", "#entry-boundary"];
        const overlaps = overlays.map(selector => {
          const r = document.querySelector(selector).getBoundingClientRect();
          return Math.max(0, Math.min(r.right, frame.right) - Math.max(r.left, frame.left)) *
            Math.max(0, Math.min(r.bottom, frame.bottom) - Math.max(r.top, frame.top));
        });
        const img = document.querySelector("#town-map");
        return {
          ratio: frame.width / frame.height,
          left: frame.left, right: frame.right,
          fit: getComputedStyle(img).objectFit,
          overlaps,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(geometry.ratio).toBeCloseTo(width < 860 ? 9 / 16 : 16 / 9, 2);
      expect(geometry.fit).toBe("contain");
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(width);
      expect(geometry.overlaps.every(area => area < 1)).toBe(true);
      expect(geometry.overflow).toBe(0);
      await expect(page.locator(".scrim")).toHaveCount(0);
      expect(await page.locator(".hotspots .pin-label").evaluateAll(nodes => nodes.every(n => n.getBoundingClientRect().width === 0))).toBe(true);

      await page.screenshot({ path: `output/december-map-clear/after-${lang}-${width}.png`, animations: "disabled" });
      await page.locator("#main").screenshot({ path: `output/december-map-clear/full-${lang}-${width}.png`, animations: "disabled" });

      // Text entrances reuse the same district action and return focus to the opener.
      for (const faction of ["galaxy", "andromeda", "chart", "lantern"]) {
        const button = page.locator(`.district-links [data-faction="${faction}"]`);
        await expect(button).not.toBeEmpty();
        const size = await button.boundingBox();
        expect(size.width).toBeGreaterThanOrEqual(44);
        expect(size.height).toBeGreaterThanOrEqual(44);
        await button.click();
        await expect(page.locator("#district-sheet")).toBeVisible();
        await expect(page.locator("#district-members .member")).toHaveCount(4);
        await page.keyboard.press("Escape");
        await expect(page.locator("#district")).toBeHidden();
        await expect(button).toBeFocused();
      }

      const spots = width < 860 ? ".hotspots-mobile" : ".hotspots-desk";
      await page.locator(`${spots} .hot-galaxy`).click();
      await expect(page.locator("#district-sheet")).toBeVisible();
      await page.locator("#district-close").click();
      await page.locator(`${spots} .hot-lamp`).click();
      await expect(page.locator("#quiz")).toBeVisible();
      await expect(page.locator("#entry")).toBeHidden();
      expect(errors).toEqual([]);
    });
  }
}
