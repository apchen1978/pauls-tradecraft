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

test("PR2: contact shadows are one merged mesh covering the listed furniture", async ({ page }) => {
  await loadRoom(page, 1440);
  const info = await page.evaluate(() => window.__room03.info());
  expect(info.contactShadow.name).toBe("room03-contact-shadows");
  expect(info.contactShadow.meshes).toBe(1);
  expect(info.contactShadow.materialType).toBe("MeshBasicMaterial");
  // Old: 108 vertices, 27 patches, including the fig pot. That one plane (4 vertices) left with the plant.
  // Four soft decals under the lounge ottoman's feet: 26 -> 30 patches, 104 -> 120 vertices.
  expect(info.contactShadow.vertices).toBe(120);
  expect(info.contactShadow.totalPatchCount).toBe(30);
  expect(info.contactShadow.patchCount).toBe(20); // 4 table feet + 16 chair feet, the order the QA hook aligns by
  expect(info.categories["contact-shadow"]).toEqual({ vertices: 120, meshes: 1 }); // same four ottoman decals: 104 -> 120
  for (const covered of ["dining-table", "dining-chair-0.5-1.22", "dining-chair-0.5--0.22", "dining-chair--0.5-1.22", "dining-chair--0.5--0.22", "kitchen-island", "side-kitchen", "lounge-chair"]) {
    expect(info.contactShadow.coverage).toContain(covered);
  }
  // The side strip now follows the 1.28 m base cabinet. The old door-frame strip was shorter than 0.9 m.
  expect(info.contactShadow.sideRun.size[2]).toBeGreaterThan(1.05);
  expect(info.contactShadow.sideRun.min[2]).toBeGreaterThan(0.9);
  expect(info.contactShadow.sideRun.max[0]).toBeLessThan(2.7);
  // One decal layer just above the rug (0.021) and one just above the floor (0.003); nothing is buried inside the rug.
  expect(info.contactShadow.bounds.min[1]).toBeGreaterThan(0.0025);
  expect(info.contactShadow.bounds.max[1]).toBeLessThan(0.025);
  expect(info.contactShadow.depthWrite).toBe(false);
  expect(info.contactShadow.polygonOffsetFactor).toBeLessThan(0);
});

test("PR2: the night decal is fainter than the golden one", async ({ page }) => {
  await loadRoom(page, 1440);
  await page.evaluate(() => window.__room03.setMood("golden"));
  await page.waitForTimeout(900);
  const golden = await page.evaluate(() => window.__room03.info().contactShadow.opacity);
  await page.evaluate(() => window.__room03.setMood("night"));
  await page.waitForTimeout(1100);
  const night = await page.evaluate(() => window.__room03.info().contactShadow.opacity);
  expect(golden).toBe(0.3);
  expect(night).toBe(0.12);
  expect(night).toBeLessThan(golden);
});

test("PR2: contact shadows stay inside the vertex, mesh and draw-call budget", async ({ page }) => {
  await loadRoom(page, 1440);
  const desktop = await page.evaluate(() => window.__room03.info());
  expect(desktop.vertices).toBeLessThanOrEqual(41296); // main 41,246 + 50
  // Old ceiling 95 (main 95). Plaque +1, fig −5, four lamps +8 → 98.
  expect(desktop.meshes).toBeLessThanOrEqual(98);
  expect(desktop.drawCallsLastFrame).toBeLessThanOrEqual(72); // measured: main 71 -> 70 (-1), budget allows +1
  expect(desktop.vertices - 41246).toBeLessThanOrEqual(50);

  // A phone loads at 390 px; resizing a desktop page keeps a wider frustum and is not the real phone case.
  const phone = await page.context().browser().newPage({ viewport: { width: 390, height: 844 } });
  await phone.goto(`${PAGE}?lang=zh`);
  await phone.waitForFunction(() => Boolean(window.__room03?.info));
  await phone.waitForFunction(() => window.__room03.info().yardLoaded && window.__room03.info().drawCallsLastFrame > 0);
  const mobile = await phone.evaluate(() => window.__room03.info());
  expect(mobile.drawCallsLastFrame).toBeLessThanOrEqual(74); // measured: main 73 -> 72 (-1), budget allows +1
  await phone.close();
});
