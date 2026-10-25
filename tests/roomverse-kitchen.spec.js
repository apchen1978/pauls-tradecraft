import { test, expect } from "@playwright/test";
import { mkdirSync, statSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOM03_QA;
if (QA) mkdirSync(QA, { recursive: true });

async function loadRoom(page, width = 1440, lang = "zh") {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => Boolean(window.__room03?.info));
  await page.waitForFunction(() => window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

async function shot(page, name) {
  if (QA) await page.locator(".room").screenshot({ path: `${QA}/${name}.png` });
}

async function expectMainRegionsInFrame(page) {
  const regions = await page.evaluate(() => window.__room03.info().projectedRegions);
  for (const [name, [x, y]] of Object.entries({ dining: regions.dining, kitchen: regions.kitchen, pendant: regions.pendant })) {
    expect(x, `${name} should fit horizontally in the default camera`).toBeGreaterThan(-0.94);
    expect(x, `${name} should fit horizontally in the default camera`).toBeLessThan(0.94);
    expect(y, `${name} should fit vertically in the default camera`).toBeGreaterThan(-0.94);
    expect(y, `${name} should fit vertically in the default camera`).toBeLessThan(0.94);
  }
}

async function setReviewCamera(page, target, position, fov = 42) {
  await page.evaluate(({ target, position, fov }) => {
    const { camera, controls, render } = window.__room03;
    controls.minDistance = 0.2; controls.maxDistance = 12;
    controls.minAzimuthAngle = -Math.PI; controls.maxAzimuthAngle = Math.PI;
    controls.minPolarAngle = 0.05; controls.maxPolarAngle = Math.PI - 0.05;
    controls.target.set(...target);
    camera.fov = fov; camera.position.set(...position); camera.updateProjectionMatrix();
    controls.update(); render();
  }, { target, position, fov });
}

test.describe("Room 03 Bay Area Kitchen", () => {
  test("loads the direct noindex room with a rendered scene within the geometry budget", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await loadRoom(page);
    await expect(page).toHaveTitle("Room 03｜Bay Area Kitchen");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    await expect(page.locator("canvas")).toBeVisible();
    const info = await page.evaluate(() => window.__room03.info());
    console.log("Room 03 measured scene:", JSON.stringify(info));
    await expectMainRegionsInFrame(page);
    expect(info.camera[0]).toBeCloseTo(1.25, 3);
    expect(info.camera[1]).toBeCloseTo(1.65, 3);
    expect(info.camera[2]).toBeCloseTo(4.95, 3);
    expect(info.mood).toBe("golden");
    expect(info.dimensions).toEqual({ width: 6, depth: 4.8, height: 2.7 });
    expect(info.vertices).toBeGreaterThan(3000);
    expect(info.vertices).toBeLessThanOrEqual(16500);
    expect(info.meshes).toBeLessThan(90);
    expect(info.categories["household-props"].vertices).toBeGreaterThan(0);
    expect(info.categories["household-props"].vertices).toBeLessThanOrEqual(2779 + 2500);
    expect(info.categories.structure.vertices).toBeGreaterThan(0);
    expect(info.categories["dining-table"].vertices).toBeGreaterThan(0);
    expect(info.furniture).toMatchObject({ table: "glb", chair: "glb", pendant: "glb" });
    expect(info.furnitureAssets.table.vertices).toBe(864);
    expect(info.furnitureAssets.table.vertices).toBeLessThanOrEqual(2500);
    expect(info.furnitureAssets.chair.vertices / 4).toBeLessThanOrEqual(1800);
    expect(info.furnitureAssets.pendant.vertices).toBeLessThanOrEqual(1200);
    expect(info.furnitureAssets.chair.meshes).toBeGreaterThan(0);
    const modelSizes = ["dining-table-v2.glb", "dining-chair-v1.glb", "opal-globe-pendant-v1.glb"].map((name) => statSync(`public/prototype/roomverse-3d/kitchen/models/${name}`).size);
    expect(modelSizes.every((size) => size <= 400 * 1024)).toBe(true);
    expect(modelSizes.reduce((sum, size) => sum + size, 0)).toBeLessThanOrEqual(1.5 * 1024 * 1024);
    const addedFurnitureVertices = Object.values(info.furnitureAssets).reduce((sum, asset) => sum + asset.vertices, 0);
    expect(addedFurnitureVertices).toBeLessThanOrEqual(14000);
    expect(info.furnitureBounds.table.max[1]).toBeCloseTo(0.75, 2);
    expect(info.furnitureBounds.table.min[1]).toBeCloseTo(info.rug.max[1], 3);
    expect(info.furnitureBounds.table.min[0]).toBeGreaterThanOrEqual(-3);
    expect(info.furnitureBounds.table.max[0]).toBeLessThanOrEqual(3);
    expect(info.furnitureBounds.table.min[2]).toBeGreaterThanOrEqual(-2.4);
    expect(info.furnitureBounds.table.max[2]).toBeLessThanOrEqual(2.4);
    expect(info.categories["wok-base-cabinet"].vertices).toBe(24);
    expect(info.categories["wok-base-cabinet"].meshes).toBe(1);
    expect(info.wokSupport.bounds.min[1]).toBeCloseTo(0.02, 3);
    expect(info.wokSupport.bounds.max[1]).toBeCloseTo(0.8125, 3);
    expect(info.wokSupport.bounds.size[0]).toBeCloseTo(0.47, 3);
    expect(info.wokSupport.counterBottomY - info.wokSupport.bounds.max[1]).toBeLessThanOrEqual(0.02);
    expect(info.wokSupport.counterTopY - info.wokSupport.bounds.min[1]).toBeGreaterThanOrEqual(0.85);
    expect(info.wokSupport.counterTopY - info.wokSupport.bounds.min[1]).toBeLessThanOrEqual(0.9);
    expect(info.wokSupport.bounds.max[0]).toBeCloseTo(2.94, 3);
    expect(info.wokSupport.bounds.min[0]).toBeGreaterThanOrEqual(2.45);
    expect(info.wokSupport.bounds.min[2]).toBeGreaterThan(1.225);
    expect(info.wokSupport.bounds.max[2]).toBeLessThan(2.075);
    expect(info.wokSupport.bounds.size[2]).toBeCloseTo(0.43, 3);
    expect(info.furnitureBounds.chairs).toHaveLength(4);
    for (const chair of info.furnitureBounds.chairs) {
      expect(chair.min[1]).toBeCloseTo(info.rug.max[1], 3);
      expect(chair.min[0]).toBeGreaterThanOrEqual(-3);
      expect(chair.max[0]).toBeLessThanOrEqual(3);
      expect(chair.min[2]).toBeGreaterThanOrEqual(-2.4);
      expect(chair.max[2]).toBeLessThanOrEqual(2.4);
    }
    for (let i = 0; i < info.furnitureBounds.chairs.length; i++) for (let j = i + 1; j < info.furnitureBounds.chairs.length; j++) {
      const a = info.furnitureBounds.chairs[i], b = info.furnitureBounds.chairs[j];
      expect(a.max[0] <= b.min[0] || b.max[0] <= a.min[0] || a.max[2] <= b.min[2] || b.max[2] <= a.min[2], "chair bounding boxes should not overlap").toBe(true);
    }
    for (const chair of info.furnitureBounds.chairs) {
      const gap = chair.max[2] < 0.05 ? 0.05 - chair.max[2] : chair.min[2] - 0.95;
      expect(gap, "dining chairs should clear the table's z footprint").toBeGreaterThanOrEqual(0.04);
    }
    expect(info.furnitureBounds.pendant.min[1]).toBeCloseTo(1.8075, 2);
    expect(info.furnitureBounds.pendant.max[1]).toBeLessThanOrEqual(2.48);
    expect(info.categories.yard.vertices).toBe(4);
    expect(info.pixelRatio).toBe(1.5);
    expect(statSync("public/prototype/roomverse-3d/kitchen/courtyard-v1.webp").size).toBeLessThanOrEqual(150 * 1024);
    expect(errors).toEqual([]);
    await shot(page, "desktop-golden-zh");
    await shot(page, "desktop-golden-furniture");
    if (QA) {
      await page.evaluate(() => {
        const { camera, controls, render } = window.__room03;
        controls.minDistance = 0.2; controls.maxDistance = 10;
        controls.minAzimuthAngle = -Math.PI; controls.maxAzimuthAngle = Math.PI;
        controls.minPolarAngle = 0.05; controls.maxPolarAngle = Math.PI - 0.05;
        controls.target.set(0.82, 0.7, 0.86);
        camera.fov = 35; camera.position.set(1.35, 1.25, 2.35); camera.updateProjectionMatrix();
        controls.update(); render();
      });
      await shot(page, "desktop-table-corner-closeup");
    }
    if (QA) {
      await page.evaluate(() => {
        const { camera, controls, render } = window.__room03;
        controls.minDistance = 0.5; controls.maxDistance = 10;
        controls.target.set(0, 0.62, 0.5);
        camera.fov = 42; camera.position.set(0.55, 1.55, 2.75); camera.updateProjectionMatrix();
        controls.update(); render();
      });
      await shot(page, "desktop-furniture-closeup");
    }
  });

  test("adds the requested household objects on existing surfaces within budget", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await loadRoom(page);
    const info = await page.evaluate(() => window.__room03.info());
    const propBounds = info.propBounds;
    const counterProps = ["drip-coffee-maker", "electric-kettle", "rice-cooker", "cutting-board", "oil-and-salt"];
    expect(Object.keys(propBounds)).toHaveLength(8);
    for (const key of Object.keys(propBounds)) expect(propBounds[key], `${key} should be present`).not.toBeNull();
    for (const key of counterProps) {
      const difference = Math.abs(propBounds[key].min[1] - 0.955);
      expect(difference, `${key} should rest within 2 cm of the counter`).toBeLessThanOrEqual(0.02);
    }
    expect(propBounds["drip-coffee-maker"].size[1]).toBeGreaterThanOrEqual(0.27);
    expect(propBounds["drip-coffee-maker"].size[1]).toBeLessThanOrEqual(0.35);
    expect(propBounds["electric-kettle"].size[0]).toBeLessThanOrEqual(0.3);
    expect(propBounds["cutting-board"].size[1]).toBeGreaterThan(propBounds["cutting-board"].size[2] * 4);
    expect(propBounds["tabletop-succulents"].size[0]).toBeCloseTo(0.728, 2);
    expect(propBounds["tabletop-succulents"].size[2]).toBeCloseTo(0.247, 2);
    expect((propBounds["tabletop-succulents"].min[2] + propBounds["tabletop-succulents"].max[2]) / 2).toBeCloseTo(0.76, 2);
    expect(propBounds["tabletop-succulents"].max[2]).toBeLessThan(info.furnitureBounds.table.max[2]);
    expect(Math.abs(propBounds["tabletop-succulents"].min[1] - 0.75)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(propBounds["window-fiddle-leaf-fig"].min[1])).toBeLessThanOrEqual(0.02);
    expect(propBounds["window-fiddle-leaf-fig"].size[1]).toBeGreaterThanOrEqual(1.5);
    expect(propBounds["window-fiddle-leaf-fig"].size[1]).toBeLessThanOrEqual(1.8);
    expect(propBounds["window-fiddle-leaf-fig"].size[0]).toBeLessThanOrEqual(0.85);
    expect(info.plantLeafCount).toBeGreaterThanOrEqual(24);
    expect(info.propGeometry["window-fiddle-leaf-fig"].meshes).toBe(5);
    for (const [name, window] of Object.entries(info.windowBounds)) {
      expect(window, `${name} glazing bounds should be measurable`).not.toBeNull();
      const plant = propBounds["window-fiddle-leaf-fig"];
      const separated = plant.max.some((edge, axis) => edge <= window.min[axis]) || plant.min.some((edge, axis) => edge >= window.max[axis]);
      expect(separated, `plant should not intersect ${name} glazing`).toBe(true);
    }
    expect(Math.abs(propBounds.cookbooks.min[1] - 2.11)).toBeLessThanOrEqual(0.02);
    expect(info.cookbookCount).toBe(3);
    expect(propBounds.cookbooks.size[0]).toBeGreaterThanOrEqual(0.25);
    expect(propBounds.cookbooks.size[1]).toBeGreaterThanOrEqual(0.32);
    expect(info.vertices - 13903, "incremental room geometry should stay within 2,500 vertices from the merged #541 baseline").toBeLessThanOrEqual(2500);
    expect(info.vertices).toBeLessThanOrEqual(16500);
    expect(info.drawCallsLastFrame - 88, "merged #541 baseline was 88 draw calls at 1440x1000, DPR 1.5").toBeLessThanOrEqual(8);
    expect(info.meshes - 81).toBeLessThanOrEqual(8);
    expect(info.camera[0]).toBeCloseTo(1.25, 3);
    expect(info.camera[1]).toBeCloseTo(1.65, 3);
    expect(info.camera[2]).toBeCloseTo(4.95, 3);
    for (const key of ["tabletop-succulents", "window-fiddle-leaf-fig", "cookbooks"]) {
      const [x, y, z] = propBounds[key].projectedCenter;
      expect(x, `${key} center should be visible horizontally in the default view`).toBeGreaterThan(-0.94);
      expect(x, `${key} center should be visible horizontally in the default view`).toBeLessThan(0.94);
      expect(y, `${key} center should be visible vertically in the default view`).toBeGreaterThan(-0.94);
      expect(y, `${key} center should be visible vertically in the default view`).toBeLessThan(0.94);
      expect(z, `${key} center should be in front of the camera`).toBeLessThan(1);
    }
    const inFrame = Object.values(propBounds).filter(({ projectedCenter: [x, y, z] }) => x > -0.94 && x < 0.94 && y > -0.94 && y < 0.94 && z < 1).length;
    expect(inFrame, "the default view should include at least three prop sets").toBeGreaterThanOrEqual(3);
    const refinedKeys = ["tabletop-succulents", "window-fiddle-leaf-fig", "cookbooks"];
    const refinedPropVertices = refinedKeys.reduce((sum, key) => sum + info.propGeometry[key].vertices, 0);
    console.log("Room 03 prop geometry and render summary:", JSON.stringify({ merged541Baseline: { vertices: 13903, triangles: 10208, meshes: 81, drawCalls: 88, refinedPropVertices: 1530 }, current: { vertices: info.vertices, triangles: info.triangles, meshes: info.meshes, drawCalls: info.drawCallsLastFrame, refinedPropVertices, incrementalVertices: info.vertices - 13903, incrementalDrawCalls: info.drawCallsLastFrame - 88 }, newProps: info.categories["household-props"], propGeometry: info.propGeometry, plantLeafCount: info.plantLeafCount, cookbookCount: info.cookbookCount, propBounds, viewport: info.viewport, pixelRatio: info.pixelRatio, camera: info.camera }));
    expect(errors).toEqual([]);

    await shot(page, "props-desktop-golden-1440");
    if (QA) {
      await setReviewCamera(page, [0, 1.08, -2.0], [0, 1.42, 0.5], 52);
      await shot(page, "props-counter-closeup");
      await setReviewCamera(page, [0, 0.86, 0.5], [0, 1.32, 2.65], 42);
      await shot(page, "props-dining-closeup");
      await setReviewCamera(page, [-1.93, 0.86, 1.68], [-0.95, 1.45, 4.0], 55);
      await shot(page, "props-plant-closeup");
      await setReviewCamera(page, [-1.52, 2.28, -2.16], [-1.42, 2.33, -1.08], 42);
      await shot(page, "props-cookbooks-closeup");
      await setReviewCamera(page, [0, 0.85, 0.65], [0.4, 1.2, 3.15], 48);
      await shot(page, "props-succulents-closeup");
      await setReviewCamera(page, [0.8, 1.25, -0.1], [1.25, 1.65, 4.95], 50);
      await page.locator('#moods button[data-mood="night"]').click();
      await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
      await shot(page, "props-desktop-night-1440");
    }

    await loadRoom(page, 390);
    await page.locator('#moods button[data-mood="night"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    await shot(page, "props-mobile-night-390");
    await expectMainRegionsInFrame(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect(errors).toEqual([]);
  });

  test("keeps procedural furniture visible if any GLB request fails", async ({ page }) => {
    await page.route("**/kitchen/models/*.glb", (route) => route.abort());
    await loadRoom(page);
    const info = await page.evaluate(() => window.__room03.info());
    expect(info.furniture).toMatchObject({ table: "fallback", chair: "fallback", pendant: "fallback" });
    expect(info.categories["dining-table"].vertices).toBeGreaterThan(0);
    expect(info.categories["dining-chairs"].vertices).toBeGreaterThan(0);
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("covers the dining furniture with a raised rug and keeps it readable at night", async ({ page }) => {
    await loadRoom(page);
    const golden = await page.evaluate(() => window.__room03.info());
    const goldenFloor = await page.evaluate(() => window.__room03.sampleNdc(window.__room03.info().floorSamples.farFromWindow, 0.012));
    expect(golden.rug.size[0]).toBeCloseTo(2.9, 2);
    expect(golden.rug.size[2]).toBeCloseTo(2.1, 2);
    expect(golden.rug.min[1]).toBeCloseTo(0.01, 3);
    expect(golden.rug.max[1]).toBeCloseTo(0.02, 3);
    expect(golden.categories.rug).toEqual({ vertices: 24, meshes: 1 });
    expect(golden.vertices).toBeGreaterThanOrEqual(4509);
    expect(golden.vertices, "complete loaded room should stay within the geometry budget").toBeLessThanOrEqual(16500);
    expect(Object.values(golden.furnitureAssets).reduce((sum, asset) => sum + asset.vertices, 0), "new dining furniture should stay within its combined budget").toBeLessThanOrEqual(14000);
    // Baseline captured from commit 084384e at the same world point and viewport.
    expect(goldenFloor.meanLuminance, "far floor should brighten by at least 12/255 from 084384e").toBeGreaterThan(81.5994 + 12);

    await page.locator('#moods button[data-mood="night"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    const night = await page.evaluate(() => {
      const { rug, floorBesideRug } = window.__room03.info().rugSamples;
      return {
        rug: window.__room03.sampleNdc(rug, 0.012),
        floor: window.__room03.sampleNdc(floorBesideRug, 0.012),
      };
    });
    console.log("Room 03 rug dimensions and night samples:", JSON.stringify({ rug: golden.rug, night }));
    expect(night.rug.meanLuminance, "night rug should read brighter than adjacent polished floor").toBeGreaterThan(night.floor.meanLuminance + 4);
    expect(night.floor.meanLuminance, "night floor outside the pendant pool should remain visible").toBeGreaterThanOrEqual(55);
    expect(night.floor.red, "night floor outside the pendant pool should stay warm").toBeGreaterThan(night.floor.blue);
    console.log("Room 03 floor luminance comparison:", JSON.stringify({ baseline084384e: 81.5994, currentGolden: goldenFloor, currentNight: night.floor, worldPoint: [1.72, 0.002, 0.5] }));
    await shot(page, "desktop-night-zh");
  });

  test("switches moods and language while preserving one consistent room title", async ({ page }) => {
    await loadRoom(page);
    await page.getByRole("button", { name: "夜晚" }).click();
    await expect(page.getByRole("button", { name: "夜晚" })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    const globe = await page.evaluate(() => window.__room03.sampleNdc(window.__room03.info().projectedRegions.pendant, 0.008));
    expect(globe.meanLuminance, "night pendant globe should be one of the bright accents without clipping").toBeGreaterThan(190);
    expect(globe.meanLuminance, "night pendant globe should not blow out to white").toBeLessThan(245);
    await shot(page, "desktop-night-zh");
    await page.locator("#lang").click();
    await expect(page.locator("h1")).toHaveText("Room 03｜Bay Area Kitchen");
    await expect(page.getByRole("button", { name: "Golden hour" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    if (QA) await page.screenshot({ path: `${QA}/english-page.png`, fullPage: true });
  });

  test("fits a 390px screen and fake fullscreen exits by button, Escape, and browser back", async ({ page }) => {
    await loadRoom(page, 390);
    await expectMainRegionsInFrame(page);
    const mobileCamera = await page.evaluate(() => window.__room03.info().camera);
    expect(mobileCamera[0]).toBeCloseTo(1.55, 3);
    const pageWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client);
    await shot(page, "mobile-golden-zh");
    await page.locator('#moods button[data-mood="night"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    await shot(page, "mobile-night-zh");
    await page.locator('#moods button[data-mood="golden"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("golden");
    await page.locator("#immersiveEnter").click();
    await expect(page.locator(".room")).toHaveClass(/is-immersive/);
    await page.waitForFunction(() => window.__room03.info().canvas[0] === Math.round(innerWidth * 1.5));
    await shot(page, "mobile-fullscreen-golden");
    await page.keyboard.press("Escape");
    await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
    await page.locator("#immersiveEnter").click();
    await page.goBack();
    await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
  });

  test("keeps mobile night ambience varied and the wok-door reveal brighter than its closed panel", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await loadRoom(page, 390);
    await page.locator('#moods button[data-mood="night"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    const upper = await page.evaluate(() => window.__room03.samplePixels({ left: 0.05, top: 0.01, width: 0.9, height: 0.23 }));
    await shot(page, "mobile-night-pixel-checked");
    await loadRoom(page, 1440);
    await page.locator('#moods button[data-mood="night"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    const door = await page.evaluate(() => {
      const info = window.__room03.info();
      return {
        reveal: window.__room03.sampleNdc(info.projectedRegions.wokGlow, 0.006),
        panel: window.__room03.sampleNdc(info.projectedRegions.doorPanel, 0.006),
        projectedRegions: info.projectedRegions,
      };
    });
    await shot(page, "desktop-night-pixel-checked");
    const metrics = { upper, door };
    console.log("Room 03 night pixel checks:", JSON.stringify(metrics));
    expect(upper.meanLuminance, "upper field should not be crushed to near black").toBeGreaterThan(20);
    expect(upper.luminanceStdDev, "mobile upper field should contain visible lighting and wood variation").toBeGreaterThan(6);
    expect(upper.blue - upper.red, "mobile upper field should not read as a solid blue slab").toBeLessThan(55);
    expect(door.reveal.meanLuminance, "visible wok interior should outshine the closed door panel").toBeGreaterThan(door.panel.meanLuminance + 12);
    expect(errors).toEqual([]);
  });

  test("shows the wok kitchen through the default opening at desktop and mobile sizes", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    for (const width of [1440, 390]) {
      await loadRoom(page, width);
      const info = await page.evaluate(() => window.__room03.info());
      const projected = info.projectedRegions;
      const visible = [projected.wokDoor, projected.wokBowl, projected.wokHood, projected.wokGlow];
      for (const [index, [x, y, depth]] of visible.entries()) {
        expect(x, `wok detail ${index} should fit horizontally at ${width}px`).toBeGreaterThan(-0.96);
        expect(x, `wok detail ${index} should fit horizontally at ${width}px`).toBeLessThan(0.96);
        expect(y, `wok detail ${index} should fit vertically at ${width}px`).toBeGreaterThan(-0.96);
        expect(y, `wok detail ${index} should fit vertically at ${width}px`).toBeLessThan(0.96);
        expect(depth, `wok detail ${index} should be in front of the camera at ${width}px`).toBeLessThan(1);
      }
      const goldenSamples = await page.evaluate(() => {
        const p = window.__room03.info().projectedRegions;
        return {
          interior: window.__room03.sampleNdc(p.wokGlow, 0.006),
          wall: window.__room03.sampleNdc(p.wallBesideWok, 0.018),
          opening: window.__room03.sampleNdc(p.wokOpening, 0.05),
        };
      });
      await shot(page, `${width === 390 ? "mobile" : "desktop"}-golden-wok`);
      await page.locator('#moods button[data-mood="night"]').click();
      await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
      const nightSamples = await page.evaluate(() => {
        const p = window.__room03.info().projectedRegions;
        return {
          interior: window.__room03.sampleNdc(p.wokGlow, 0.006),
          wall: window.__room03.sampleNdc(p.wallBesideWok, 0.018),
          opening: window.__room03.sampleNdc(p.wokOpening, 0.05),
        };
      });
      console.log(`Room 03 wok interior samples ${width}px:`, JSON.stringify({ goldenSamples, nightSamples, projected }));
      expect(goldenSamples.interior.red, `golden-hour wok interior should stay warm at ${width}px`).toBeGreaterThan(goldenSamples.interior.blue);
      expect(goldenSamples.opening.luminanceStdDev, `golden-hour doorway should not be a flat block at ${width}px`).toBeGreaterThan(8);
      expect(nightSamples.interior.meanLuminance, `night wok interior should read brighter than adjacent wall at ${width}px`).toBeGreaterThan(nightSamples.wall.meanLuminance + 10);
      expect(nightSamples.opening.luminanceStdDev, `night doorway should not be a flat block at ${width}px`).toBeGreaterThan(8);
      await shot(page, `${width === 390 ? "mobile" : "desktop"}-night-wok`);
      if (width === 1440 && QA) {
        await page.evaluate(() => {
          const { camera, controls, render } = window.__room03;
          controls.minDistance = 0.5;
          controls.maxDistance = 10;
          controls.target.set(3.1, 1.45, 1.95);
          camera.position.set(2.35, 1.45, 2.85);
          controls.update();
          render();
        });
        await shot(page, "desktop-night-wok-closeup");
      }
    }
    expect(errors).toEqual([]);
  });

  test("keeps the bounded entry camera outside room walls while orbiting", async ({ page }) => {
    await loadRoom(page);
    const positions = [];
    for (let i = 0; i < 12; i++) positions.push(await page.evaluate((angle) => window.__room03.setView(angle), i * Math.PI / 6).then(() => page.evaluate(() => window.__room03.info().camera)));
    for (const [x, y, z] of positions) {
      expect(Math.abs(x)).toBeLessThan(3);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(2.7);
      expect(z).toBeGreaterThan(2.4);
    }
  });
});
