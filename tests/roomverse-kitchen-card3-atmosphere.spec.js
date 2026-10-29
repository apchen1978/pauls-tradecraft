import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, width = 1440) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
}

test("paper drum lamp echoes the pendant family while retaining the measured centre and budget", async ({ page }) => {
  await loadRoom(page);
  const info = await page.evaluate(() => window.__room03.info());
  const lamp = info.lamps["floor-reading-lamp"];
  expect(lamp.meshes).toBe(2);
  expect(lamp.vertices - 317, "old spherical lamp: 317 vertices; new tripod and paper drum remain within +1,500").toBeLessThanOrEqual(1500);
  expect(lamp.bounds.size[0]).toBeGreaterThanOrEqual(0.30);
  expect(lamp.bounds.size[0]).toBeLessThanOrEqual(0.34);
  expect(lamp.bounds.size[2]).toBeGreaterThanOrEqual(0.30);
  expect(lamp.bounds.size[2]).toBeLessThanOrEqual(0.34);
  expect(lamp.bounds.size[1]).toBeCloseTo(1.646, 2);
  expect(info.lamps.glow.floor.materialName).toBe("warm-opal-glass");
  expect(info.lamps.glow.floor.roughness).toBeGreaterThanOrEqual(0.9);
  expect(info.lamps.glow.floor.globe[1]).toBeCloseTo(1.42, 2);
  expect(info.lamps.glow.floor.light[1]).toBeCloseTo(1.42, 2);
  expect(info.lamps.glow.floor.halo[1]).toBeCloseTo(1.42, 2);
  expect(info.lamps.glow.floor.emissive).toBeCloseTo(0.2, 2);
  expect(info.lamps.lights.floor.intensity).toBe(0);
  expect(info.lamps.lights.lightCount ?? info.lightMetrics.lightCount).toBe(9);
});

test("curtains stay gathered outside the clear yard opening and tint correctly in every mood", async ({ page }) => {
  await loadRoom(page);
  const moods = ["daylight", "golden", "night", "movie", "dinner", "sunday", "thanksgiving"];
  const colors = [];
  for (const mood of moods) {
    await page.evaluate((value) => window.__room03.setMood(value), mood);
    const info = await page.evaluate(() => window.__room03.info());
    expect(info.curtains.meshes).toBe(1);
    expect(info.curtains.vertices).toBeLessThanOrEqual(500);
    expect(info.curtains.floorHemGapMm).toBeGreaterThanOrEqual(0);
    expect(info.curtains.floorHemGapMm).toBeLessThanOrEqual(10);
    expect(info.curtains.panels).toHaveLength(2);
    expect(info.curtains.panels[0].z[1]).toBeLessThan(-1.6);
    expect(info.curtains.panels[1].z[0]).toBeGreaterThan(1.6);
    colors.push(info.curtains.color);
    expect(info.moodLook.moods[mood].curtainColor).toBeTruthy();
  }
  expect(new Set(colors).size).toBeGreaterThan(1);
});

test("entry mirror, hooks, coat and key dish stay under the Redwood print and clear of protected areas", async ({ page }) => {
  await loadRoom(page);
  const result = await page.evaluate(() => {
    const info = window.__room03.info();
    return { entry: info.entryWallDetails, door: window.__room03.doorBounds(), robot: window.__room03.robotInfo() };
  });
  expect(result.entry.vertices).toBeGreaterThan(0);
  expect(result.entry.bounds.min[0]).toBeGreaterThanOrEqual(0.05);
  expect(result.entry.bounds.max[0]).toBeLessThanOrEqual(0.9);
  expect(result.entry.bounds.max[1]).toBeLessThan(1.175, "hooks and coat remain below the Redwood frame");
  expect(result.entry.bounds.min[2]).toBeGreaterThanOrEqual(3.61, "wall details remain in front of the measured z=3.74 wall face");
  expect(result.entry.bounds.max[2]).toBeLessThanOrEqual(3.741, "wall details do not penetrate beyond the measured z=3.74 wall face");
  expect(result.entry.mirror.diameterMm).toBe(410);
  expect(result.entry.mirror.wallGapMm).toBeLessThanOrEqual(1);
  expect(result.entry.hooks.count).toBe(3);
  expect(result.entry.shelf.dishTopY).toBeGreaterThan(result.entry.shelf.center[1]);
  expect(result.door.min[0]).toBeGreaterThan(result.entry.bounds.max[0] + 1.5, "entry details stay clear of the right-wall door in x");
  expect(result.robot.ready).toBe(true);
  expect(result.robot.centre[0]).toBeCloseTo(1.45, 1);
  expect(result.robot.centre[1]).toBeCloseTo(-0.95, 1);
  expect(result.robot.centre[0]).toBeGreaterThan(result.entry.bounds.max[0] + 0.4, "entry details stay clear of the robot hit area");
});

test("mobile opening stays within the two-draw-call Card 3 budget", async ({ page }) => {
  await loadRoom(page, 390);
  const info = await page.evaluate(() => window.__room03.info());
  expect(info.vertices - 50288).toBeLessThanOrEqual(3000);
  expect(info.meshes - 107).toBeLessThanOrEqual(4);
  expect(info.drawCallsLastFrame - 74).toBeLessThanOrEqual(2);
});
