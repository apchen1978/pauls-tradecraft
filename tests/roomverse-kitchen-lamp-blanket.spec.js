import { test, expect } from "@playwright/test";
import { LEDGER } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("a stool with a folded blanket and a book stands on the floor beside the lamp, clear of the lamp and the window", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  const info = await page.evaluate(() => window.__room03.info());
  const corner = info.lampBlanket, lamp = info.lamps["floor-reading-lamp"].bounds;
  expect(corner.vertices, "one merged mesh: stool, three folds, book and ribbon").toBeGreaterThan(400);
  expect(info.vertices).toBe(LEDGER.scene.vertices);
  expect(Math.abs(corner.bounds.min[1]), "the stool legs stand on the floor").toBeLessThanOrEqual(0.003);
  expect(corner.bounds.max[1], "low enough to read as a stool, not furniture").toBeLessThanOrEqual(0.5);
  expect(lamp.min[0] - corner.bounds.max[0], "at least 12 cm between the stool and the lamp base").toBeGreaterThanOrEqual(0.12);
  expect(corner.bounds.min[0], "clear of the window frame (x -2.91) and its curtain").toBeGreaterThanOrEqual(-2.7);
  expect(corner.bounds.max[2], "short of the front wall face (z 2.34)").toBeLessThanOrEqual(2.1);
});
