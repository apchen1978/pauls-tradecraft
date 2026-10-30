import { test, expect } from "@playwright/test";
import { LEDGER, CAPS, budgetFor } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().lamps && window.__room03.info().drawCallsLastFrame > 0);
}

test("three lamps sit on measured surfaces, counter pendants are removed, and new lights stay off in golden and night", async ({ page }) => {
  await loadRoom(page);
  const info = await page.evaluate(() => window.__room03.info());
  expect(info.propBounds["window-fiddle-leaf-fig"]).toBeUndefined();
  expect(info.plantLeafCount).toBe(0);
  expect(info.lightMetrics.lightCount).toBe(9);
  expect(info.vertices).toBeLessThanOrEqual(CAPS.vertices);
  expect(info.meshes).toBeLessThanOrEqual(CAPS.meshes);
  expect(info.drawCallsLastFrame).toBeLessThanOrEqual(CAPS.desktopCalls);
  for (const name of ["floor-reading-lamp", "console-table-lamp", "redwood-picture-light"]) {
    expect(info.lamps[name].meshes, name).toBeLessThanOrEqual(2);
    expect(info.lamps[name].meshes, name).toBeGreaterThan(0);
  }

  const floor = info.lamps["floor-reading-lamp"].bounds;
  // 1.62-1.67 m overlapped the wall art; the shorter drum restores its 1.45-1.55 m clearance range.
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

  // Old: two globes at y=1.88 and hardware reaching y=2.61, clear of the hood but floating in front of cabinet doors.
  // Paul chose removal: these placement/clearance checks become an assertion that no pendant group remains.
  expect(info.lamps["counter-mini-pendants"], "no counter pendant geometry remains").toBeNull();

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
