import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().wallArtLoaded && window.__room03.info().plaque.status === "loaded");
  await page.waitForFunction(() => window.__room03.info().furniture.pendant === "glb");
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

async function shot(page, name) {
  if (QA) await page.locator(".room").screenshot({ path: `${QA}/${name}.png` });
}

test("hangs the shared house plaque on the entry wall, fully in frame at 180 degrees", async ({ page }) => {
  const seen = [];
  page.on("response", (response) => {
    if (response.url().includes("plaque")) seen.push(response.url());
  });
  await loadRoom(page, 1440);
  const desktop = await page.evaluate(() => window.__room03.info());
  const opening = desktop.plaque;
  expect(opening.name).toBe("house-plaque");
  expect(opening.status).toBe("loaded");
  expect(opening.visible).toBe(true);
  expect(opening.vertices).toBe(4);
  expect(opening.width).toBeGreaterThanOrEqual(0.7);
  expect(opening.width).toBeLessThanOrEqual(0.8);
  expect(opening.height / opening.width).toBeCloseTo(2 / 5, 5);
  expect(opening.position[1]).toBeGreaterThanOrEqual(1.5);
  expect(opening.position[1]).toBeLessThanOrEqual(1.8);
  expect(opening.belowBand).toBe(true);
  expect(opening.wallGap).toBeGreaterThan(0.012);
  expect(opening.wallGap).toBeLessThan(0.018);
  expect(opening.material).toMatchObject({
    type: "MeshStandardMaterial", transparent: true, alphaTest: 0.5, roughness: 0.7, colorSpace: "srgb", anisotropy: 8, hasMap: true,
  });
  for (const [name, gap] of Object.entries(opening.clearance)) {
    expect(gap, `${name} stays at least 40 cm from the plaque`).toBeGreaterThanOrEqual(0.4);
  }
  for (const [name, delta] of Object.entries(opening.frameCenterDeltaY)) {
    expect(delta, `${name} is not on the plaque's horizontal line`).toBeGreaterThanOrEqual(0.08);
  }
  // The loaded camera looks toward the kitchen. The entry wall is behind it, so this
  // opening frame is the "default view" screenshot; the board itself is read at 180°.
  expect(opening.inView, "opening azimuth faces the kitchen, not the entry wall").toBe(false);
  await shot(page, "plaque-desktop-1440-default");
  await page.evaluate(() => window.__room03.setView(Math.PI));
  const turned = await page.evaluate(() => window.__room03.info().plaque);
  expect(turned.inView).toBe(true);
  expect(turned.unobstructed).toBe(true);
  expect(turned.corners.every(([x, y, z]) => Math.abs(x) < 0.98 && Math.abs(y) < 0.98 && z < 1)).toBe(true);
  await shot(page, "plaque-desktop-1440-180");
  const desktopTurned = await page.evaluate(() => window.__room03.info());
  expect(desktop.vertices).toBe(41262); // 41,258 on main e996f45 plus this plane's 4 vertices
  expect(desktop.meshes).toBe(95); // 94 plus one mesh
  // The opening camera faces the kitchen, so frustum culling leaves the first screen at the old 70 calls.
  expect(desktop.drawCallsLastFrame).toBe(70);
  const hiddenDesktop = await page.evaluate(() => {
    window.__room03.plaqueMesh.visible = false;
    window.__room03.render();
    const calls = window.__room03.info().drawCallsLastFrame;
    window.__room03.plaqueMesh.visible = true;
    window.__room03.render();
    return calls;
  });
  expect(desktopTurned.drawCallsLastFrame - hiddenDesktop).toBe(1);

  await loadRoom(page, 390);
  const mobileOpening = await page.evaluate(() => window.__room03.info());
  await shot(page, "plaque-mobile-390-default");
  expect(mobileOpening.plaque.inView).toBe(false);
  expect(mobileOpening.drawCallsLastFrame).toBe(72); // phone first screen, plaque outside the frustum
  await page.evaluate(() => window.__room03.setView(Math.PI));
  const mobile = await page.evaluate(() => window.__room03.info());
  expect(mobile.plaque.inView).toBe(true);
  expect(mobile.plaque.unobstructed).toBe(true);
  const hiddenMobile = await page.evaluate(() => {
    window.__room03.plaqueMesh.visible = false;
    window.__room03.render();
    const calls = window.__room03.info().drawCallsLastFrame;
    window.__room03.plaqueMesh.visible = true;
    window.__room03.render();
    return calls;
  });
  expect(mobile.drawCallsLastFrame - hiddenMobile).toBe(1);
  await shot(page, "plaque-mobile-390-180");
  expect(seen.some((url) => url.includes("/prototype/roomverse-3d/art/wall-plaque-text-v1.webp"))).toBe(true);
  expect(seen.some((url) => url.includes("/kitchen/art/") && url.includes("plaque"))).toBe(false);
});

test("hides the plaque instead of drawing a black quad when the painting fails", async ({ page }) => {
  await page.route("**/wall-plaque-text-v1.webp", (route) => route.abort());
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().plaque.status === "failed");
  const plaque = await page.evaluate(() => window.__room03.info().plaque);
  expect(plaque.visible).toBe(false);
  expect(plaque.material.hasMap).toBe(false);
  expect(plaque.inView).toBe(false);
});
