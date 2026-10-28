import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().lamps && window.__room03.info().drawCallsLastFrame > 0);
}

test("four lamps sit on measured surfaces and the new lights stay off in golden and night", async ({ page }) => {
  await loadRoom(page);
  const info = await page.evaluate(() => window.__room03.info());
  expect(info.propBounds["window-fiddle-leaf-fig"]).toBeUndefined();
  expect(info.plantLeafCount).toBe(0);
  expect(info.lightMetrics.lightCount).toBe(9);
  expect(info.vertices).toBeLessThan(41262);
  for (const name of ["floor-reading-lamp", "console-table-lamp", "redwood-picture-light", "counter-mini-pendants"]) {
    expect(info.lamps[name].meshes, name).toBeLessThanOrEqual(2);
    expect(info.lamps[name].meshes, name).toBeGreaterThan(0);
  }

  const floor = info.lamps["floor-reading-lamp"].bounds;
  expect(floor.size[1]).toBeGreaterThanOrEqual(1.45);
  expect(floor.size[1]).toBeLessThanOrEqual(1.55);
  expect(Math.abs(floor.min[1])).toBeLessThanOrEqual(0.01);
  expect((floor.min[0] + floor.max[0]) / 2).toBeCloseTo(-1.93, 2);
  expect((floor.min[2] + floor.max[2]) / 2).toBeCloseTo(1.68, 2);

  const table = info.lamps["console-table-lamp"].bounds;
  const consoleTop = info.moodSlots.console.bounds;
  expect(table.min[1]).toBeCloseTo(consoleTop.max[1], 2);
  expect(table.max[0]).toBeLessThan(-1.14);
  expect(table.min[0]).toBeGreaterThanOrEqual(consoleTop.min[0] - 0.01);
  expect(table.size[1]).toBeGreaterThanOrEqual(0.35);
  expect(table.size[1]).toBeLessThanOrEqual(0.45);

  const picture = info.lamps["redwood-picture-light"].bounds;
  const redwood = info.wallArtAssets.redwoodPath.bounds;
  expect(picture.min[1]).toBeGreaterThan(redwood.max[1]);
  expect(picture.min[2]).toBeGreaterThan(3.5);
  expect(picture.min[2] - 2.46, "picture light stays off the entry-hall band").toBeGreaterThan(0.4);
  expect((picture.min[0] + picture.max[0]) / 2).toBeCloseTo(0.86, 2);

  const hood = info.wallArtClearanceBounds.hood;
  const pendants = info.lamps["counter-mini-pendants"];
  expect(pendants.bounds.max[1]).toBeGreaterThanOrEqual(2.59);
  expect(pendants.bounds.max[1]).toBeLessThanOrEqual(2.7);
  expect(pendants.pendantCenters).toHaveLength(2);
  for (const center of pendants.pendantCenters) {
    const [x, y, z] = center;
    const separated = x + 0.1 <= hood.min[0] || x - 0.1 >= hood.max[0] || y + 0.1 <= hood.min[1] || y - 0.1 >= hood.max[1] || z + 0.1 <= hood.min[2] || z - 0.1 >= hood.max[2];
    expect(separated, `pendant at ${x} misses the hood`).toBe(true);
    expect(z - 0.1, "globe stays in front of the upper-cabinet doors").toBeGreaterThan(-1.91);
  }

  const night = await page.evaluate(() => {
    window.__room03.setMood("night");
    const lamps = window.__room03.info().lamps.lights;
    window.__room03.setMood("golden");
    return lamps;
  });
  for (const key of ["floor", "table", "screenCool"]) {
    expect(info.lamps.lights[key].intensity).toBe(0);
    expect(info.lamps.lights[key].castShadow).toBe(false);
    expect(night[key].intensity).toBe(0);
    expect(night[key].castShadow).toBe(false);
  }
  expect(info.lamps.lights.screenCool.color).toBe(0xcdd6f0);
});
