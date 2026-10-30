import { test, expect } from "@playwright/test";
import { LEDGER } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("a sourdough board and a bowl of fruit stand on the kitchen counter, inside its run", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  const info = await page.evaluate(() => window.__room03.info());
  const fresh = info.counterFresh;
  expect(fresh.vertices, "one merged mesh with the board, loaf, bowl and fruit").toBeGreaterThan(800);
  expect(info.vertices).toBe(LEDGER.scene.vertices);
  expect(fresh.bounds.min[1] - 0.955, "stands on the counter top").toBeGreaterThanOrEqual(-0.002);
  expect(fresh.bounds.min[1] - 0.955).toBeLessThanOrEqual(0.002);
  expect(fresh.bounds.max[1] - 0.955, "low pieces, well under the wall cabinets").toBeLessThanOrEqual(0.2);
  expect(fresh.bounds.min[0], "clear of the coffee maker (x -0.34, half width 0.14)").toBeGreaterThanOrEqual(-0.2);
  expect(fresh.bounds.max[0], "inside the counter run (ends at x 2.23)").toBeLessThanOrEqual(2.2);
  expect(fresh.bounds.min[2], "in front of the backsplash").toBeGreaterThanOrEqual(-2.3);
  expect(fresh.bounds.max[2], "inside the counter depth (front edge z -1.65)").toBeLessThanOrEqual(-1.7);
  expect(fresh.bounds.max[2], "the cut slice and the lemon half lie in front of the board").toBeGreaterThanOrEqual(-1.8);
  expect(fresh.vertices, "board, loaf, slice, crumbs, lemon half, bowl and fruit").toBeGreaterThan(2400);
});
