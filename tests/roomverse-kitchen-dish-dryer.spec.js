import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("the built-in dish dryer sits flush in the upper cabinet row, with a recessed glass face in front of the carcass", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  const dryer = await page.evaluate(() => window.__room03.info().dishDryer);
  expect(dryer, "dryer report exists").toBeTruthy();
  expect(dryer.widthMm, "a 96 cm unit fills one cabinet door slot").toBeGreaterThanOrEqual(940);
  expect(dryer.widthMm).toBeLessThanOrEqual(980);
  expect(dryer.heightMm, "60 cm tall").toBeGreaterThanOrEqual(580);
  expect(dryer.heightMm).toBeLessThanOrEqual(620);
  expect(dryer.centre[0], "in the far-left upper door slot").toBeCloseTo(-1.55, 2);
  expect(dryer.faceRecessInFrameMm, "glass face sits 10-30 mm behind the frame front").toBeGreaterThanOrEqual(10);
  expect(dryer.faceRecessInFrameMm).toBeLessThanOrEqual(30);
  expect(dryer.faceZ - dryer.carcassFrontZ, "the face is in front of the cabinet carcass, not inside it").toBeGreaterThan(0);
  expect(dryer.faceZ - dryer.carcassFrontZ).toBeLessThan(0.01);
  expect(dryer.meshes, "frame plus face").toBe(2);
});
