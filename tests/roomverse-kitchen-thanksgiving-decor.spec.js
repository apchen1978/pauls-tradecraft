import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const MOODS = ["golden", "movie", "night", "dinner", "sunday", "thanksgiving"];

async function loadRoom(page, width = 1440) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  await page.waitForFunction(() => window.__room03.info().furniture.table === "glb");
}

test("the Thanksgiving table layer (bottle, two extra glasses, cranberries, candlesticks) shows only in Thanksgiving and sits on the table", async ({ page }) => {
  await loadRoom(page);
  for (const mood of MOODS) {
    await page.evaluate((name) => window.__room03.setMood(name), mood);
    const info = await page.evaluate(() => window.__room03.info());
    const shown = mood === "thanksgiving";
    expect(info.moodLook.moods[mood].thanksgivingDecor, `${mood} flag`).toBe(shown);
    expect(info.thanksgivingDecor.visible, `${mood} visible`).toBe(shown);
    expect(info.thanksgivingDecor.mounted, `${mood} mounted`).toBe(shown);
  }
  await page.evaluate(() => window.__room03.setMood("thanksgiving"));
  const info = await page.evaluate(() => window.__room03.info());
  const decor = info.thanksgivingDecor;
  expect(decor.meshes, "one opaque mesh plus glass and wine, like the place settings").toBe(3);
  expect(decor.vertices, "geometry budget for the layer").toBeLessThanOrEqual(6000);
  const names = decor.items.map((item) => item.name).sort();
  expect(names).toEqual(["bread-plate", "candlestick-0", "candlestick-1", "candlestick-2", "candlestick-3", "cranberry-bowl", "wine-bottle", "wine-glass-0", "wine-glass-1", "wine-glass-2", "wine-glass-3"]);
  for (const item of decor.items) expect(item.gapMm, `${item.name} rests on the tabletop`).toBeLessThanOrEqual(1);
  for (const item of decor.items) expect(item.gapMm, `${item.name} is not sunk into the table`).toBeGreaterThanOrEqual(-1);
  expect(decor.items.find((item) => item.name === "wine-bottle").heightMm, "a standard 750 ml bottle is about 30 cm").toBeGreaterThanOrEqual(295);
  const glassSides = decor.items.filter((item) => item.name.startsWith("wine-glass")).map((item) => Math.sign(item.z - 0.5));
  expect(glassSides.filter((side) => side > 0).length, "the same number of extra glasses on both sides of the table").toBe(glassSides.filter((side) => side < 0).length);
  expect(decor.minNeighbourMm, "no two pieces touch").toBeGreaterThanOrEqual(15);
  // Clear of every place setting's plate (27 cm plates).
  for (const setting of info.tableware.settings) {
    for (const item of decor.items) {
      const distance = Math.hypot(item.x - setting.plateCenter[0], item.z - setting.plateCenter[2]) - item.radius - 0.135;
      expect(distance * 1000, `${item.name} clears the plate at ${setting.plateCenter[0]}, ${setting.plateCenter[2]}`).toBeGreaterThanOrEqual(30);
    }
  }
});
