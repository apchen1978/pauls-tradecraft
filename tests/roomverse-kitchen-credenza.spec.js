import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("a clay-red credenza fills the wall under the cable-car painting, lined up with the wok run, with air above it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  const info = await page.evaluate(() => window.__room03.info());
  const c = info.credenza;
  expect(c, "credenza report exists").toBeTruthy();
  expect(c.underPainting, "spans the full width of the painting").toBe(true);
  expect(c.heightMm, "a low sideboard, below the 95.5 cm counters").toBeGreaterThanOrEqual(780);
  expect(c.heightMm).toBeLessThanOrEqual(850);
  expect(c.depthMm, "shallower than the 59 cm wok counter").toBeLessThanOrEqual(500);
  expect(c.floorGapMm, "stands on the floor").toBeLessThanOrEqual(1);
  expect(c.floorGapMm).toBeGreaterThanOrEqual(-1);
  expect(c.wallGapMm, "against the wall").toBeLessThanOrEqual(5);
  expect(c.wokCounterGapMm, "a hair short of the wok counter, not into it").toBeGreaterThanOrEqual(5);
  expect(c.wokCounterGapMm).toBeLessThanOrEqual(40);
  const air = (info.wallArtBounds.min[1] - c.heightMm / 1000) * 1000;
  expect(air, "at least 20 cm of wall between the top and the painting").toBeGreaterThanOrEqual(200);
  expect(c.doors).toBe(4);
  expect(c.color, "muted clay red, a second cabinet colour beside the olive").toBe("#9c5b45");
});
