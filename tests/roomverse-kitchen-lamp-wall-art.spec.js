import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().wallArtLoaded && window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

// Paul 2026-10-29: the room felt plain next to Rooms 01 and 02; a third painting hangs above the window-side floor lamp.
test("a 4:3 painting hangs on the entry wall above the window-side floor lamp, loaded and costing no mesh", async ({ page }) => {
  await loadRoom(page, 1440);
  const info = await page.evaluate(() => window.__room03.info());
  const art = info.lampWallArt;
  expect(art.status).toBe("loaded");
  const size = art.imageBounds.size;
  expect(size[0]).toBeCloseTo(0.80, 2);
  expect(size[1]).toBeCloseTo(0.60, 2);
  expect(size[0] / size[1], "4:3").toBeCloseTo(4 / 3, 2);
  const lamp = info.lamps["floor-reading-lamp"].bounds;
  const lampCentreX = (lamp.min[0] + lamp.max[0]) / 2;
  const artCentreX = (art.imageBounds.min[0] + art.imageBounds.max[0]) / 2;
  expect(Math.abs(artCentreX - lampCentreX), "centred over the lamp").toBeLessThanOrEqual(0.05);
  expect(art.imageBounds.min[1] - lamp.max[1], "bottom edge just above the globe, not hidden behind it").toBeGreaterThanOrEqual(0.02);
  expect(art.imageBounds.min[1] - lamp.max[1]).toBeLessThanOrEqual(0.12);
  const wallFace = 2.34;
  const backGap = wallFace - art.bounds.max[2];
  expect(backGap * 1000, "frame back within 2 mm of the wall face").toBeGreaterThanOrEqual(0);
  expect(backGap * 1000).toBeLessThanOrEqual(2);
  expect(art.imageBounds.max[2], "picture faces the room, in front of its frame back").toBeLessThan(art.bounds.max[2]);
  const plaque = info.plaque.bounds;
  expect(plaque.min[0] - art.bounds.max[0], "well clear of the house plaque").toBeGreaterThanOrEqual(0.4);
  expect(art.bounds.max[1], "below the ceiling beams").toBeLessThan(2.4);
  // The picture shares the atlas: no new mesh, and the vertices added are the frame boxes and one image plane.
  // Old main after the lamp-wall painting: 39,105/96 -> 42,612/99 after the living-detail batches (+2,498 vertices, +3 meshes); the painting itself still adds no mesh.
  expect(info.meshes).toBe(103); // 102 -> 103: the right-wall credenza is one vertex-coloured mesh; 100 -> 102: the dish dryer adds a frame and a face mesh; 99 -> 100: the lemon tree's leaf cards are one more mesh (95 -> 96: the coffee maker's temperature display is its own mesh (the entry nook and gas hob add no opening mesh).
  expect(info.vertices).toBe(42612);
  expect(info.wallArtLight, "lit like the other paintings").toBeTruthy();
  if (QA) {
    await page.evaluate(() => window.__room03.setView(Math.PI));
    await page.locator(".room").screenshot({ path: `${QA}/lamp-wall-1440.png` });
  }
});
