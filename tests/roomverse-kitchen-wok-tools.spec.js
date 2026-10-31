import { test, expect } from "@playwright/test";
import { LEDGER } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("the wok tool rail holds five tools clear of the counter, and a canister and soy bottle sit on the oak shelf", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  const info = await page.evaluate(() => window.__room03.info());
  const tools = info.wokTools;
  expect(tools.vertices, "one merged mesh with the rail, five tools, canister and bottle").toBeGreaterThan(1500);
  expect(info.vertices).toBe(LEDGER.scene.vertices);
  // Wok counter top is at 0.955; the lowest tool head must hang well above it.
  expect(tools.bounds.min[1] - 0.955, "tools hang clear of the counter").toBeGreaterThanOrEqual(0.05);
  expect(tools.bounds.max[1], "canister lids stay under the hood bottom").toBeLessThanOrEqual(1.60);
  expect(tools.bounds.max[0], "nothing is buried deeper than the wall face (2.94)").toBeLessThanOrEqual(2.9405);
  expect(tools.bounds.min[0], "tools hang close to the wall, not into the cooking space").toBeGreaterThanOrEqual(2.78);
  expect(tools.bounds.min[2], "stays on the backsplash run").toBeGreaterThanOrEqual(1.5);
  expect(tools.bounds.max[2], "short of the front wall face (2.34) plus rail end cap").toBeLessThanOrEqual(2.45);
});
