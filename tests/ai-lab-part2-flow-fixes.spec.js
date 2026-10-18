import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { TEXT } from "../public/ai-lab/content.js";

const screenshots = join(process.cwd(), "docs", "qa", "ai-lab-part2-flow-fixes");
mkdirSync(screenshots, { recursive: true });

test("mobile chapter rail measurement at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ai-lab/?lang=zh");
  const measurement = await page.locator("#rail").evaluate((rail) => {
    const rect = rail.getBoundingClientRect();
    return {
      display: getComputedStyle(rail).display,
      height: rect.height,
      viewportHeight: window.innerHeight,
      linkCount: rail.querySelectorAll("a").length,
      visible: rect.height > 0 && rect.width > 0,
    };
  });
  console.log("390px rail measurement:", JSON.stringify(measurement));
  expect(measurement.display).toBe("none");
  expect(measurement.height).toBe(0);
  expect(measurement.visible).toBe(false);
  await expect(page.locator("#toc")).toBeVisible();
  await expect(page.locator("#toc a")).toHaveCount(TEXT.zh.toc.length + 1);
  await page.screenshot({ path: join(screenshots, "rail-390.png") });
});
