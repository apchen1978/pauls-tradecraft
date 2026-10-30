import { test, expect } from "@playwright/test";
import { LEDGER } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("the credenza top carries books, a vessel, a plant and a dish, all standing on the oak top and inside its footprint", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  const info = await page.evaluate(() => window.__room03.info());
  const decor = info.credenzaDecor, credenza = info.credenza;
  expect(decor.vertices, "the decor exists and is one merged mesh").toBeGreaterThan(500);
  expect(info.vertices).toBe(LEDGER.scene.vertices);
  const top = credenza.heightMm / 1000;
  expect(decor.bounds.min[1] - top, "rests on the top, neither floating nor sunk").toBeGreaterThanOrEqual(-0.002);
  expect(decor.bounds.min[1] - top).toBeLessThanOrEqual(0.002);
  expect(decor.bounds.max[1] - top, "stays well below the painting").toBeLessThanOrEqual(0.6);
  expect(decor.bounds.max[0], "inside the credenza depth (front edge 2.49, wall 2.94)").toBeLessThanOrEqual(2.92);
  expect(decor.bounds.min[0]).toBeGreaterThanOrEqual(2.49);
  expect(decor.bounds.min[2], "clear of the door leaf end (z -0.80)").toBeGreaterThanOrEqual(-0.79);
  expect(decor.bounds.max[2], "short of the wok counter (z 1.023)").toBeLessThanOrEqual(1.0);
});
