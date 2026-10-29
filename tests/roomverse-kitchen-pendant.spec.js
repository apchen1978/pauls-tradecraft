import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.info().furniture.table === "glb", null, { timeout: 90000 });
}

test("the dining pendant is three stacked paper tiers hung above the eye line over the table", async ({ page }) => {
  await loadRoom(page, 1440);
  const info = await page.evaluate(() => window.__room03.info());
  const pendant = info.pendantPaper;
  expect(info.furniture.pendant).toBe("tiered-paper");
  expect(pendant.tiers).toBe(3);
  expect(pendant.radiiMm, "smallest on top, largest at the bottom").toEqual([185, 230, 270]);
  expect(pendant.materialName, "keeps the name the moods drive").toBe("warm-opal-glass");
  expect(pendant.vertices, "about the old globe (1,617)").toBeLessThanOrEqual(1800);
  const { min, max } = pendant.bounds;
  expect(min[1], "lowest tier stays above the 1.64 m eye").toBeGreaterThanOrEqual(1.79);
  expect(min[1]).toBeLessThanOrEqual(1.81);
  expect(max[1], "canopy sits on the ceiling soffit").toBeCloseTo(2.471, 2);
  expect((min[0] + max[0]) / 2, "over the middle of the table").toBeCloseTo(0, 2);
  expect((min[2] + max[2]) / 2).toBeCloseTo(0.15, 2);
  expect(max[0] - min[0], "diameter 0.54 m").toBeGreaterThan(0.53);
  expect(max[0] - min[0]).toBeLessThan(0.56);
});

test("the paper glows with the mood: faint by day, strongest at night", async ({ page }) => {
  await loadRoom(page, 1440);
  const read = async (mood) => {
    await page.evaluate((m) => window.__room03.setMood(m), mood);
    return page.evaluate(() => window.__room03.info().pendantPaper.emissive);
  };
  const day = await read("daylight");
  const dinner = await read("dinner");
  const night = await read("night");
  expect(day).toBeGreaterThan(0);
  expect(night, "night glow").toBeGreaterThan(day * 3);
  expect(dinner, "dinner glow is warmer than daylight").toBeGreaterThan(day);
});
