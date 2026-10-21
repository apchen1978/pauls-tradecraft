import { test, expect } from "@playwright/test";
import { mkdir, stat } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const QA = "docs/qa/roomverse-coat-rack";
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

test("coat rack stays out of the first paint, then stands in the front-left corner", async ({ page }) => {
  test.setTimeout(120000);
  await mkdir(QA, { recursive: true });
  expect((await stat("public/prototype/roomverse-3d/models/coat-rack.glb")).size).toBeLessThan(2_000_000);
  const glb = [];
  page.on("request", (request) => { if (request.url().includes(".glb")) glb.push(new URL(request.url()).pathname); });
  const errors = await openRoom(page, { width: 1440 });
  expect(glb.filter((file) => file.endsWith(".glb"))).toHaveLength(9);
  expect(glb.some((file) => file.includes("coat-rack"))).toBe(false);
  expect(await page.evaluate(() => window.__room.coatRack())).toEqual({ ready: false });
  expect(await page.evaluate(() => window.__room.tableLampLighting().lightCount)).toBe(6);
  expect(await page.evaluate(() => window.__room.loadCoatRack())).toBe(true);
  const rack = await page.evaluate(() => window.__room.coatRack());
  expect(rack.ready).toBe(true);
  expect(rack.height).toBeGreaterThanOrEqual(1.75);
  expect(rack.height).toBeLessThanOrEqual(1.8);
  expect(rack.minY).toBeGreaterThanOrEqual(-0.002);
  expect(rack.minY).toBeLessThan(0.01);
  expect(rack.baseDiameter).toBeGreaterThan(0.38);
  expect(rack.baseDiameter).toBeLessThan(0.46);
  expect(rack.bounds.min[0]).toBeGreaterThan(-2.56);
  expect(rack.bounds.max[0]).toBeLessThan(-1.55);
  expect(rack.bounds.min[2]).toBeGreaterThan(1.62);
  expect(rack.bounds.max[2]).toBeLessThan(2.2);
  expect(rack.collisions).toEqual([]);
  expect(rack.env).toBe(true);
  expect(rack.castShadow).toBe(true);
  expect(rack.contact).toBe(true);
  expect(rack.wallShadow).toBe(true);
  expect(rack.specularIntensity).toBe(1);
  expect(rack.lightCount).toBe(6);
  expect(await page.evaluate(() => window.__room.plaqueView())).toMatchObject({ firstHit: "house-plaque" });
  const before = await page.evaluate(() => window.__room.angle());
  await page.evaluate(() => window.__room.setOrbitAngle(200));
  expect(await page.evaluate(() => window.__room.angle())).not.toBe(before);
  expect((await page.evaluate(() => window.__room.coatRack())).bounds.min[1]).toBeCloseTo(rack.minY, 2);
  const placed = await page.evaluate(() => window.__room.coatRack().bounds.min);
  for (const mood of MOODS) {
    const settled = await page.evaluate(async (next) => {
      window.__room.set("mood", next);
      await window.__room.whenCoatSettled();
      const info = window.__room.coatRack();
      window.__room.setOrbitAngle(0);
      return { mood: next, ready: info.ready, min: info.bounds.min, env: info.env, lights: info.lightCount, plaque: window.__room.plaqueView().firstHit };
    }, mood);
    expect(settled.ready, mood).toBe(true);
    expect(settled.env, mood).toBe(true);
    expect(settled.lights, mood).toBe(6);
    expect(settled.plaque, mood).toBe("house-plaque");
    expect(settled.min[0], mood).toBeCloseTo(placed[0], 2);
    expect(settled.min[2], mood).toBeCloseTo(placed[2], 2);
  }
  expect(glb.filter((file) => file.endsWith("coat-rack.glb"))).toHaveLength(1);
  expect(errors).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`coat rack photographs at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await mkdir(QA, { recursive: true });
    const errors = await openRoom(page, { width, mood: "rain" });
    expect(await page.evaluate(() => window.__room.loadCoatRack())).toBe(true);
    await page.evaluate(() => window.__room.whenCoatSettled());
    await page.evaluate(() => window.__room.frameCoatRack("room"));
    const rackInRoom = await page.evaluate(() => window.__room.coatRack());
    expect(rackInRoom.screen[2]).toBeLessThan(1);
    expect(Math.abs(rackInRoom.screen[0])).toBeLessThan(1);
    expect(Math.abs(rackInRoom.screen[1])).toBeLessThan(1);
    expect(rackInRoom.collisions).toEqual([]);
    await page.locator("#stage canvas").screenshot({ path: `${QA}/rain-${width}-room.jpg`, type: "jpeg", quality: 82 });
    await page.evaluate(() => window.__room.setOrbitAngle(0));
    const plaqueAtWindow = await page.evaluate(() => window.__room.plaqueView());
    expect(plaqueAtWindow.firstHit).toBe("house-plaque");
    expect(plaqueAtWindow.corners.every((corner) => corner.z < 1 && Math.abs(corner.y) < 1)).toBe(true);
    if (width === 1440) expect(plaqueAtWindow.corners.every((corner) => Math.abs(corner.x) < 1)).toBe(true);
    await page.locator("#stage canvas").screenshot({ path: `${QA}/rain-${width}-window.jpg`, type: "jpeg", quality: 82 });
    for (const kind of ["context", "close", "base"]) {
      await page.evaluate((shot) => window.__room.frameCoatRack(shot), kind);
      await page.locator("#stage canvas").screenshot({ path: `${QA}/rain-${width}-${kind}.jpg`, type: "jpeg", quality: 82 });
    }
    for (const mood of ["family", "tv"]) {
      await page.evaluate(async (next) => {
        window.__room.set("mood", next);
        await window.__room.whenCoatSettled();
        window.__room.frameCoatRack("close");
      }, mood);
      await page.locator("#stage canvas").screenshot({ path: `${QA}/${mood}-${width}-close.jpg`, type: "jpeg", quality: 82 });
    }
    await page.evaluate(() => { window.__room.setOrbitAngle(0); });
    const plaque = await page.evaluate(() => window.__room.plaqueView());
    expect(plaque.firstHit).toBe("house-plaque");
    expect(plaque.corners.every((corner) => corner.z < 1)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
