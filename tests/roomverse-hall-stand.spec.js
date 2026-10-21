import { test, expect } from "@playwright/test";
import { mkdir, stat } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const QA = "docs/qa/roomverse-hall-stand";
const MOODS = ["rain", "family", "tech", "chic", "slow", "tv"];

async function openRoom(page, { width, mood = "rain", lang = "zh" }) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${PAGE}?lang=${lang}&mood=${mood}&wall=original`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  return errors;
}

test("hall stand is clean geometry in the front-left corner", async ({ page }) => {
  test.setTimeout(120000);
  await mkdir(QA, { recursive: true });
  await expect(stat("public/prototype/roomverse-3d/models/coat-rack.glb")).rejects.toThrow();
  const glb = [];
  page.on("request", (request) => { if (request.url().includes(".glb")) glb.push(new URL(request.url()).pathname); });
  const errors = await openRoom(page, { width: 1440 });
  expect(glb.filter((file) => file.endsWith(".glb"))).toHaveLength(9);
  expect(glb.some((file) => file.includes("coat-rack"))).toBe(false);
  expect(await page.evaluate(() => window.__room.tableLampLighting().lightCount)).toBe(6);
  const rack = await page.evaluate(() => window.__room.hallStand());
  expect(rack.ready).toBe(true);
  expect(rack.names).toEqual(expect.arrayContaining(["hall-stand-base", "hall-stand-pole", "hall-stand-hook", "hall-stand-scarf"]));
  expect(rack.names.some((name) => name.includes("cap") || name.includes("coat"))).toBe(false);
  expect(rack.hasCap).toBe(false);
  expect(rack.names.join(" ").toLowerCase()).not.toMatch(/yankees|dodgers|new era|mlb/);
  expect(rack.height).toBeGreaterThanOrEqual(1.75);
  expect(rack.height).toBeLessThanOrEqual(1.8);
  expect(rack.minY).toBeGreaterThanOrEqual(-0.002);
  expect(rack.minY).toBeLessThan(0.01);
  expect(rack.baseDiameter).toBeGreaterThanOrEqual(0.4);
  expect(rack.baseDiameter).toBeLessThanOrEqual(0.42);
  expect(rack.discHeight).toBeGreaterThanOrEqual(0.03);
  expect(rack.discHeight).toBeLessThanOrEqual(0.04);
  expect(rack.collar).toBe(true);
  expect(rack.baseType).toBe("MeshPhysicalMaterial");
  expect(rack.baseMetal).toBeGreaterThanOrEqual(0);
  expect(rack.baseMetal).toBeLessThan(0.15);
  expect(rack.baseMapped).toBe(true);
  expect(rack.baseHasRough).toBe(true);
  expect(rack.bounds.min[0]).toBeGreaterThan(-2.56);
  expect(rack.bounds.max[0]).toBeLessThan(-1.4);
  expect(rack.bounds.min[2]).toBeGreaterThan(1.5);
  expect(rack.bounds.max[2]).toBeLessThan(2.22);
  expect(rack.collisions).toEqual([]);
  expect(rack.scarfSide).toBe(2);
  expect(rack.scarfRough).toBeGreaterThan(0.9);
  expect(rack.scarfMetal).toBe(0);
  // 布面要有細織紋凹凸，兩端要有流蘇（精品圍巾的兩個辨識點）。
  expect(rack.scarfBump).toBe(true);
  expect(rack.scarfBumpScale).toBeGreaterThan(0);
  expect(rack.scarfFringe).toBe(true);
  expect(rack.brassMetal).toBeGreaterThan(0.8);
  expect(rack.edgeByName["hall-stand-scarf"]).toBeLessThan(0.18);
  const m = rack.measured;
  expect(m.poleDiameterTop).toBeGreaterThanOrEqual(0.03);
  expect(m.poleDiameterBottom).toBeLessThanOrEqual(0.035);
  expect(m.poleDiameterTop).toBeLessThanOrEqual(m.poleDiameterBottom);
  expect(m.hookCount).toBeGreaterThanOrEqual(6);
  expect(m.hookCount).toBeLessThanOrEqual(8);
  expect(m.hookLength).toBeGreaterThanOrEqual(0.1);
  expect(m.hookLength).toBeLessThanOrEqual(0.15);
  expect(m.hookHeight).toBeGreaterThanOrEqual(1.6);
  expect(m.hookHeight).toBeLessThanOrEqual(1.7);
  expect(m.scarfLength).toBeGreaterThanOrEqual(1.5);
  expect(m.scarfLength).toBeLessThanOrEqual(1.8);
  expect(m.scarfWidth).toBeGreaterThanOrEqual(0.29);
  expect(m.scarfWidth).toBeLessThanOrEqual(0.31); // 30 cm
  expect(m.scarfThick).toBeGreaterThanOrEqual(0.008);
  expect(m.scarfThick).toBeLessThanOrEqual(0.014);
  expect(Math.min(m.drapeA, m.drapeB)).toBeGreaterThanOrEqual(0.7);
  expect(Math.max(m.drapeA, m.drapeB)).toBeLessThanOrEqual(0.9);
  expect(rack.clothEdge).toBeLessThan(0.18);
  expect(rack.vertices).toBeLessThan(4000);
  expect(rack.castShadow).toBe(true);
  expect(rack.contact).toBe(true);
  expect(rack.lightCount).toBe(6);
  expect(await page.evaluate(() => window.__room.plaqueView())).toMatchObject({ firstHit: "house-plaque" });
  const before = await page.evaluate(() => window.__room.angle());
  await page.evaluate(() => window.__room.setOrbitAngle(200));
  expect(await page.evaluate(() => window.__room.angle())).not.toBe(before);
  const placed = rack.bounds.min;
  for (const mood of MOODS) {
    const settled = await page.evaluate((next) => {
      window.__room.set("mood", next);
      window.__room.setOrbitAngle(0);
      const info = window.__room.hallStand();
      return { ready: info.ready, min: info.bounds.min, lights: info.lightCount, plaque: window.__room.plaqueView().firstHit, edge: info.clothEdge };
    }, mood);
    expect(settled.ready, mood).toBe(true);
    expect(settled.lights, mood).toBe(6);
    expect(settled.plaque, mood).toBe("house-plaque");
    expect(settled.edge, mood).toBeLessThan(0.18);
    expect(settled.min[0], mood).toBeCloseTo(placed[0], 2);
    expect(settled.min[2], mood).toBeCloseTo(placed[2], 2);
  }
  expect(glb.filter((file) => file.endsWith(".glb"))).toHaveLength(9);
  expect(errors).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`hall stand photographs at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await mkdir(QA, { recursive: true });
    const errors = await openRoom(page, { width, mood: "rain" });
    await page.evaluate(() => window.__room.frameHallStand("room"));
    const rack = await page.evaluate(() => window.__room.hallStand());
    expect(rack.screen[2]).toBeLessThan(1);
    expect(Math.abs(rack.screen[0])).toBeLessThan(1);
    expect(Math.abs(rack.screen[1])).toBeLessThan(1);
    expect(rack.collisions).toEqual([]);
    await page.locator("#stage canvas").screenshot({ path: `${QA}/rain-${width}-room.jpg`, type: "jpeg", quality: 82 });
    await page.evaluate(() => window.__room.frameHallStand("close"));
    await page.locator("#stage canvas").screenshot({ path: `${QA}/rain-${width}-close.jpg`, type: "jpeg", quality: 82 });
    await page.evaluate(() => window.__room.frameHallStand("base"));
    await page.locator("#stage canvas").screenshot({ path: `${QA}/rain-${width}-base.jpg`, type: "jpeg", quality: 82 });
    await page.evaluate(() => window.__room.frameHallStand("scale"));
    await page.locator("#stage canvas").screenshot({ path: `${QA}/rain-${width}-scale.jpg`, type: "jpeg", quality: 82 });
    expect(rack.edgeByName["hall-stand-scarf"]).toBeLessThan(0.18);
    expect(rack.hasCap).toBe(false);
    await page.evaluate(() => window.__room.setOrbitAngle(0));
    const plaqueAtWindow = await page.evaluate(() => window.__room.plaqueView());
    expect(plaqueAtWindow.firstHit).toBe("house-plaque");
    expect(plaqueAtWindow.corners.every((corner) => corner.z < 1 && Math.abs(corner.y) < 1)).toBe(true);
    if (width === 1440) expect(plaqueAtWindow.corners.every((corner) => Math.abs(corner.x) < 1)).toBe(true);
    await page.locator("#stage canvas").screenshot({ path: `${QA}/rain-${width}-window.jpg`, type: "jpeg", quality: 82 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
