import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.info().furniture.table === "glb", null, { timeout: 90000 });
}

test("Room 03 arrives in Bay Area daylight and golden hour stays a choice that restores its colours", async ({ page }) => {
  await loadRoom(page, 1440);
  const day = await page.evaluate(() => window.__room03.info());
  expect(day.mood).toBe("daylight");
  expect(day.materialColors.ceiling, "lighter, less orange wood overhead").toBe("#cdae80");
  expect(day.materialColors.beam).toBe("#9a7a52");
  await expect(page.locator('#moods button[data-mood="daylight"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('#moods button[data-mood="golden"]')).toHaveText("黃金時刻");
  await page.locator('#moods button[data-mood="golden"]').click();
  await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("golden");
  const golden = await page.evaluate(() => window.__room03.info());
  expect(golden.materialColors.ceiling, "golden hour keeps the original orange timber").toBe("#c48a4a");
  expect(golden.materialColors.beam).toBe("#8a5a2e");
  await page.locator('#moods button[data-mood="daylight"]').click();
  await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("daylight");
  expect((await page.evaluate(() => window.__room03.info().materialColors.ceiling))).toBe("#cdae80");
});

for (const width of [1440, 390]) {
  test(`daylight is readable from every side, never blown out or crushed at ${width}`, async ({ page }) => {
    await loadRoom(page, width);
    for (const deg of [0, 90, 180, 270]) {
      await page.evaluate((d) => window.__room03.setView(d * Math.PI / 180), deg);
      await page.waitForTimeout(500);
      const sample = await page.evaluate(() => window.__room03.samplePixels({ left: 0, top: 0, width: 1, height: 1 }));
      expect(sample.meanLuminance, `${deg} deg mean luminance`).toBeGreaterThan(85);
      expect(sample.meanLuminance, `${deg} deg mean luminance`).toBeLessThan(175);
      expect(sample.blownRatio, `${deg} deg blown ratio`).toBeLessThanOrEqual(0.015);
    }
  });
}
