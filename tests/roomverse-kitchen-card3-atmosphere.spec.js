import { test, expect } from "@playwright/test";
import { LEDGER, CAPS } from "./helpers/room03-ledger.js";

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
  expect(lamp.bounds.size[1]).toBeGreaterThanOrEqual(1.45);
  expect(lamp.bounds.size[1]).toBeLessThanOrEqual(1.52);
  expect(info.lamps.glow.floor.materialName).toBe("paper-floor-lamp-shade");
  expect(info.lamps.glow.floor.roughness).toBeGreaterThanOrEqual(0.9);
  expect(info.lamps.glow.floor.globe[1]).toBeCloseTo(1.27, 2);
  expect(info.lamps.glow.floor.light[1]).toBeCloseTo(1.27, 2);
  expect(info.lamps.glow.floor.halo[1]).toBeCloseTo(1.27, 2);
  expect(info.lamps.glow.floor.emissive).toBe(0);
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

test("entry cork board, hooks with tote and cap, and key dish stay under the Redwood print and clear of protected areas", async ({ page }) => {
  await loadRoom(page);
  const result = await page.evaluate(() => {
    const info = window.__room03.info();
    return { entry: info.entryWallDetails, door: window.__room03.doorBounds(), robot: window.__room03.robotInfo() };
  });
  expect(result.entry.vertices).toBeGreaterThan(0);
  expect(result.entry.bounds.min[0]).toBeGreaterThanOrEqual(0.05);
  expect(result.entry.bounds.max[0]).toBeLessThanOrEqual(0.9);
  expect(result.entry.bounds.max[1]).toBeLessThan(1.175, "cork board, hooks, tote and cap remain below the Redwood frame");
  expect(result.entry.bounds.min[2]).toBeGreaterThanOrEqual(3.61, "wall details remain in front of the measured z=3.74 wall face");
  expect(result.entry.bounds.max[2]).toBeLessThanOrEqual(3.741, "wall details do not penetrate beyond the measured z=3.74 wall face");
  // Paul 2026-10-31: the round clock is gone; a cork board hangs at a natural height between the TV and the hooks.
  expect(result.entry.clock, "the wall clock was replaced").toBeNull();
  const board = result.entry.corkboard;
  expect(board.center[1], "cork board centre at a natural 0.95-1.15 m").toBeGreaterThanOrEqual(0.95);
  expect(board.center[1]).toBeLessThanOrEqual(1.15);
  expect(board.topY, "cork board clears the Redwood frame (bottom 1.175)").toBeLessThan(1.175);
  expect(board.minX, "cork board clears the TV screen frame (x <= -0.038)").toBeGreaterThan(-0.038 + 0.05);
  expect(board.bottomY, "cork board clears the key shelf and dish").toBeGreaterThan(result.entry.shelf.dishTopY + 0.3);
  expect(board.wallGapMm).toBe(0);
  expect(board.papers).toBe(3);
  expect(board.pins).toBe(3);
  expect(result.entry.hooks.count).toBe(3);
  // The canvas tote's straps rest in a hook cup (0-1 mm embed); its body touches the wall (<= 1 mm into it) and stays right of the shelf.
  const tote = result.entry.tote;
  expect(result.entry.hooks.xs).toContain(tote.hookX);
  expect(tote.strapHookEmbedMm).toBeGreaterThanOrEqual(0);
  expect(tote.strapHookEmbedMm).toBeLessThanOrEqual(1);
  expect(tote.wallGapMm, "tote body touches the wall").toBeLessThanOrEqual(0.5);
  expect(tote.wallGapMm, "tote body barely embeds").toBeGreaterThanOrEqual(-1);
  expect(tote.minX, "tote clears the key shelf (x <= 0.51)").toBeGreaterThan(0.51 + 0.015);
  // Plain cap on another hook, clear of the cork board (cap radius 85 mm) and of the tote.
  expect(result.entry.cap.plain).toBe(true);
  expect(result.entry.cap.hookX).not.toBe(tote.hookX);
  expect((result.entry.cap.hookX - 0.085 - board.maxX) * 1000, "cap clears the cork board").toBeGreaterThanOrEqual(15);
  expect((tote.minX - (result.entry.cap.hookX + 0.085)) * 1000, "cap does not touch the tote").toBeGreaterThan(0);
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
  expect(info.vertices).toBeLessThanOrEqual(CAPS.vertices);
  expect(info.meshes).toBeLessThanOrEqual(CAPS.meshes);
  expect(info.drawCallsLastFrame).toBeLessThanOrEqual(CAPS.phoneCalls);
  expect(info.vertices).toBe(LEDGER.scene.vertices);
  expect(info.meshes).toBe(LEDGER.scene.meshes);
});
