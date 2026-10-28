import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().furniture.table === "glb" && window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

const gap = (a, b) => Math.hypot(
  Math.max(a.min[0] - b.max[0], b.min[0] - a.max[0], 0),
  Math.max(a.min[1] - b.max[1], b.min[1] - a.max[1], 0),
  Math.max(a.min[2] - b.max[2], b.min[2] - a.max[2], 0),
);

// Paul 2026-10-29: the window lounge chair had nothing in front of it; a low round ottoman gives the feet somewhere to rest.
test("a round bouclé ottoman stands in front of the window lounge chair, fitted to the millimetre", async ({ page }) => {
  await loadRoom(page, 1440);
  const info = await page.evaluate(() => window.__room03.info());
  const o = info.ottoman;
  expect(o.meshes, "cushion and legs").toBe(2);
  expect(o.vertices, "small procedural piece").toBeLessThanOrEqual(700);
  expect(o.diameterMm, "about 48 cm across").toBeGreaterThanOrEqual(470);
  expect(o.diameterMm).toBeLessThanOrEqual(490);
  expect(Math.abs(o.footFloorGapMm), "legs rest on the floor").toBeLessThanOrEqual(1);
  expect(o.legTopEmbedMm, "leg tops sit well inside the cushion").toBeGreaterThanOrEqual(5);
  expect(Math.abs(o.cushionBottomGapMm), "cushion underside where the legs end").toBeLessThanOrEqual(1);
  expect(o.topY, "top 8-14 cm below the chair seat so a seated person can rest feet on it").toBeLessThan(o.seatTopY - 0.08);
  expect(o.topY).toBeGreaterThan(o.seatTopY - 0.14);
  expect(o.chairClearanceMm, "clear of the chair's seat and arms").toBeGreaterThanOrEqual(50);
  expect(o.chairClearanceMm, "close enough to reach").toBeLessThanOrEqual(200);
  const chairLocalFront = [Math.sin(8 * Math.PI / 180), Math.cos(8 * Math.PI / 180)];
  const fromChair = [o.position[0] - info.lounge.position[0], o.position[2] - info.lounge.position[2]];
  expect(fromChair[0] * chairLocalFront[0] + fromChair[1] * chairLocalFront[1], "in front of the chair, not beside it").toBeGreaterThan(0.6);
  // The rest of the room stays clear of it.
  expect(gap(o.bounds, info.furnitureBounds.table) * 1000, "table").toBeGreaterThanOrEqual(400);
  for (const chair of info.furnitureBounds.chairs) expect(gap(o.bounds, chair) * 1000, "dining chair").toBeGreaterThanOrEqual(300);
  const lamp = info.lamps["floor-reading-lamp"].bounds;
  expect(gap(o.bounds, lamp) * 1000, "floor lamp").toBeGreaterThanOrEqual(400);
  expect(info.rug.min[0], "off the dining rug, on the bare floor by the window").toBeGreaterThan(o.bounds.max[0]);
  if (QA) {
    await page.evaluate(() => { const R = window.__room03; const c = R.controls; c.minDistance = 0.1; c.maxDistance = 12; c.minAzimuthAngle = -Math.PI; c.maxAzimuthAngle = Math.PI; c.minPolarAngle = 0; c.maxPolarAngle = Math.PI; R.camera.position.set(-0.7, 1.2, 1.4); c.target.set(-2.2, 0.35, 0.45); R.camera.fov = 50; R.camera.updateProjectionMatrix(); c.update(); R.render(); });
    await page.locator(".room").screenshot({ path: `${QA}/ottoman-1440.png` });
  }
});

test("the ottoman does not change what the default views show or cost", async ({ page }) => {
  for (const width of [1440, 390]) {
    await loadRoom(page, width);
    const info = await page.evaluate(() => window.__room03.info());
    // Budget: two meshes, no extra draw call in the default frame (it stays out of both default frames).
    expect(info.ottoman.meshes).toBe(2);
    expect(info.contactShadow.totalPatchCount, "four soft foot decals added").toBeGreaterThanOrEqual(30);
  }
});
