import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, width = 1440) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => Boolean(window.__room03?.info));
  await page.waitForFunction(() => window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().wallArtLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

const sampleMain = (page) => page.evaluate(() =>
  window.__room03.samplePixels({ left: 0.02, top: 0.12, width: 0.96, height: 0.76 })
);

test("P0a: the sun uses PCF with a 2048 map on desktop and 1024 on phones", async ({ page }) => {
  await loadRoom(page, 1440);
  let lights = await page.evaluate(() => window.__room03.info().lightMetrics);
  expect(lights.shadowType).toBe("PCF");
  expect(lights.shadowMapSize).toEqual([2048, 2048]);
  expect(lights.shadowRadius).toBeGreaterThanOrEqual(3);

  // Phones load at 390 px, so the shadow map is sized at creation there; a desktop resize keeps the desktop map.
  const phone = await page.context().browser().newPage({ viewport: { width: 390, height: 844 } });
  await phone.goto(`${PAGE}?lang=zh`);
  await phone.waitForFunction(() => Boolean(window.__room03?.info));
  await phone.waitForFunction(() => window.__room03.info().yardLoaded && window.__room03.info().drawCallsLastFrame > 0);
  lights = await phone.evaluate(() => window.__room03.info().lightMetrics);
  expect(lights.shadowType).toBe("PCF");
  expect(lights.shadowMapSize).toEqual([1024, 1024]);
  await phone.close();
});

test("P0b: the pendant casts a shadow on desktop only", async ({ page }) => {
  await loadRoom(page, 1440);
  expect(await page.evaluate(() => window.__room03.info().lightMetrics.pendantCastsShadow)).toBe(true);
  expect(await page.evaluate(() => window.__room03.info().lightMetrics.pendantShadowMapSize)).toEqual([512, 512]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => window.__room03.info().lightMetrics.pendantCastsShadow)).toBe(false);
});

test("painted light layers: only the faintest pendant ceiling glow survives", async ({ page }) => {
  await loadRoom(page, 1440);
  await page.evaluate(() => window.__room03.setMood("golden"));
  await page.waitForTimeout(900);
  let lights = await page.evaluate(() => window.__room03.info().lightMetrics);
  expect(lights.goldenFloorPatch).toBe(0);
  expect(lights.pendantFloorBounce).toBe(0);
  expect(lights.windowBounce).toBeLessThanOrEqual(0.12);
  expect(lights.pendantCeilingBounce).toBe(0);

  // The wall art and the screen stay unlit (MeshBasicMaterial) and must not start receiving the new shadows.
  const art = await page.evaluate(() => window.__room03.info());
  expect(art.wallArtMaterial).toBe("MeshBasicMaterial");
  expect(art.wallArtReceivesShadow).toBe(false);

  await page.evaluate(() => window.__room03.setMood("night"));
  await page.waitForTimeout(1100);
  lights = await page.evaluate(() => window.__room03.info().lightMetrics);
  expect(lights.pendantFloorBounce).toBe(0);
  expect(lights.pendantCeilingBounce).toBeGreaterThan(0);
  expect(lights.pendantCeilingBounce).toBeLessThanOrEqual(0.06);
});

test("P0 keeps the geometry budget and the draw calls below the previous baseline", async ({ page }) => {
  await loadRoom(page, 1440);
  const desktop = await page.evaluate(() => window.__room03.info());
  expect(desktop.vertices).toBe(41246);
  expect(desktop.meshes).toBe(95);
  expect(desktop.drawCallsLastFrame).toBeLessThanOrEqual(73);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  const mobile = await page.evaluate(() => window.__room03.info());
  expect(mobile.drawCallsLastFrame).toBeLessThanOrEqual(75);
});

test("P0 keeps the room as bright as before while contrast goes up", async ({ page }) => {
  await loadRoom(page, 1440);
  await page.evaluate(() => window.__room03.setMood("golden"));
  await page.waitForTimeout(900);
  await page.evaluate(() => window.__room03.setView(0));
  await page.waitForTimeout(400);
  const golden = await sampleMain(page);
  expect(golden.meanLuminance).toBeGreaterThan(95);
  expect(golden.meanLuminance).toBeLessThan(130);
  expect(golden.luminanceStdDev).toBeGreaterThanOrEqual(44);

  await page.evaluate(() => window.__room03.setMood("night"));
  await page.waitForTimeout(1100);
  await page.evaluate(() => window.__room03.setView(Math.PI));
  await page.waitForTimeout(400);
  const night = await sampleMain(page);
  expect(night.meanLuminance).toBeGreaterThan(100);
  expect(night.meanLuminance).toBeLessThan(130);
  expect(night.luminanceStdDev).toBeGreaterThanOrEqual(36);
});
