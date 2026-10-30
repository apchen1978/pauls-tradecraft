import { test, expect } from "@playwright/test";
import { LEDGER } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("smart kitchen hub sits on the backsplash above the hob, clear of the pots and the cabinet strip", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  const info = await page.evaluate(() => window.__room03.info());
  const hub = info.kitchenHub;
  expect(hub.vertices).toBe(4);
  expect(hub.bounds.min[0]).toBeGreaterThanOrEqual(0.53);
  expect(hub.bounds.max[0]).toBeLessThanOrEqual(1.03);
  expect(hub.bounds.min[1], "above the tallest pot on the hob").toBeGreaterThanOrEqual(1.15);
  expect(hub.bounds.max[1], "below the under-cabinet strip at 1.4825").toBeLessThanOrEqual(1.43);
  expect(hub.bounds.min[2], "in front of the backsplash face z=-2.2675").toBeGreaterThanOrEqual(-2.2675);
  expect(hub.bounds.max[2]).toBeLessThanOrEqual(-2.25);
  expect(info.vertices).toBe(LEDGER.scene.vertices);
});
