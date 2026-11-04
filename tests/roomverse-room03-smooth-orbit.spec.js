import { test, expect } from "@playwright/test";

// Paul 2026-11-05: finger drag in Room 03 felt choppy next to Room 01. Room 03 now uses damping and one render per animation frame
// (same loop as Room 01). A drag must glide a little past the release, then settle, and must not leave a render loop running.
const PAGE = "/prototype/roomverse-3d/kitchen/";

test("dragging glides after release, then settles and stops rendering", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(PAGE);
  await page.waitForFunction(() => window.__room03?.info().drawCallsLastFrame > 0);
  const azimuth = () => page.evaluate(() => { const r = window.__room03; const d = r.camera.position.clone().sub(r.controls.target); return Math.atan2(d.x, d.z); });
  const frames = () => page.evaluate(() => window.__room03.info().renderFrame);
  const box = await page.locator("#stage canvas").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const start = await azimuth();
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(cx + i * 20, cy); await page.waitForTimeout(16); }
  const atRelease = await azimuth();
  await page.mouse.up();
  await page.waitForTimeout(700);
  const shortlyAfter = await azimuth();
  expect(Math.abs(atRelease - start), "the drag turned the camera").toBeGreaterThan(0.05);
  expect(Math.abs(shortlyAfter - atRelease), "the camera glides a little past the release (damping)").toBeGreaterThan(0.0005);
  // Wait until the render frame counter stops moving (damping decays by 5% per frame; software rendering is slow, so allow up to 20 s).
  let last = -1, still = 0;
  for (let i = 0; i < 80 && still < 3; i++) { await page.waitForTimeout(250); const f = await frames(); still = f === last ? still + 1 : 0; last = f; }
  expect(still, "the render loop stops by itself once the camera has settled").toBeGreaterThanOrEqual(3);
  const settled = await azimuth();
  await page.waitForTimeout(400);
  expect(await azimuth(), "the camera stays put").toBeCloseTo(settled, 5);
});
