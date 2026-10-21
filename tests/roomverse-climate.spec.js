import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const OUTPUT = "docs/qa/roomverse-climate";

async function enter(page, width) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
}

function inFrame(point) {
  expect(point.x).toBeGreaterThan(-1);
  expect(point.x).toBeLessThan(1);
  expect(point.y).toBeGreaterThan(-1);
  expect(point.y).toBeLessThan(1);
  expect(point.z).toBeGreaterThan(-1);
  expect(point.z).toBeLessThan(1);
}

test("central-air slot stays, and the smart panel sits on the door's latch side", async ({ page }) => {
  await mkdir(OUTPUT, { recursive: true });
  await enter(page, 1440);
  const climate = await page.evaluate(() => window.__room.climate());
  const [px, py, pz] = climate.panel.size;
  const [vx, vy, vz] = climate.vent.size;
  const panelMidY = (climate.panel.min[1] + climate.panel.max[1]) / 2;
  expect(py).toBeGreaterThan(0.1);
  expect(py).toBeLessThan(0.16);
  expect(Math.max(px, pz)).toBeGreaterThan(0.09);
  expect(Math.max(px, pz)).toBeLessThan(0.13);
  expect(Math.min(px, pz)).toBeLessThan(0.03);
  expect(panelMidY).toBeGreaterThan(1.2);
  expect(panelMidY).toBeLessThan(1.4);
  expect(climate.panel.min[0]).toBeGreaterThan(2.45);
  expect(climate.panel.max[2]).toBeLessThan(2.25);
  expect(climate.latchSide).toBe(true);
  expect(climate.frameGap).toBeGreaterThan(0.1);
  expect(climate.frameGap).toBeLessThan(0.15);
  expect(climate.switchGap).toBeGreaterThan(0);
  expect(climate.switchGap).toBeLessThan(0.03);
  expect(climate.switches.max[2]).toBeLessThan(2.25);
  expect(vx).toBeGreaterThan(1.5);
  expect(vz).toBeLessThan(0.12);
  expect(vy).toBeLessThan(0.03);
  expect(climate.vent.min[1]).toBeGreaterThan(2.6);
  expect(climate.vent.max[2]).toBeLessThan(-1.8);
  expect(climate.plaqueClear).toBe(true);
  expect(climate.doorClear).toBe(true);
  expect(climate.lightCount).toBe(6);
  expect(climate.fixtureLights).toBe(0);
  expect(climate.emissive).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__room.plaqueView().firstHit)).toBe("house-plaque");

  await page.evaluate(() => window.__room.setOrbitAngle(270));
  expect(await page.evaluate(() => window.__room.angle())).toBe(270);
  expect(await page.evaluate(() => window.__room.orbitLimits().minRadius)).toBe(1.55);
  await page.evaluate(() => window.__room.setOrbitAngle(0));

  await page.evaluate(() => window.__room.loadDoorTexture());
  await page.evaluate(() => window.__room.frameClimate("entry"));
  const framed = await page.evaluate(() => window.__room.climate());
  inFrame(framed.panelNdc);
  inFrame(framed.switchNdc);
  expect(framed.fixtureLights).toBe(0);
  await page.locator("#stage").screenshot({ path: `${OUTPUT}/room-1440.png` });

  await page.evaluate(() => window.__room.frameClimate("panel"));
  await page.locator("#stage").screenshot({ path: `${OUTPUT}/panel-closeup.png` });

  await enter(page, 390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => window.__room.climate().lightCount)).toBe(6);
  expect(await page.evaluate(() => window.__room.plaqueView().firstHit)).toBe("house-plaque");
  await page.evaluate(() => window.__room.loadDoorTexture());
  await page.evaluate(() => window.__room.frameClimate("entry"));
  const phone = await page.evaluate(() => window.__room.climate());
  inFrame(phone.panelNdc);
  inFrame(phone.switchNdc);
  await page.locator("#stage").screenshot({ path: `${OUTPUT}/room-390.png` });
});
