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
  for (const [name, [x, y]] of Object.entries({ dining: regions.dining, kitchen: regions.kitchen })) {
    expect(x, `${name} should fit horizontally in the default camera`).toBeGreaterThan(-0.94);
    expect(x, `${name} should fit horizontally in the default camera`).toBeLessThan(0.94);
    expect(y, `${name} should fit vertically in the default camera`).toBeGreaterThan(-0.94);
    expect(y, `${name} should fit vertically in the default camera`).toBeLessThan(0.94);
  }
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
    expect(info.mood).toBe("golden");
    expect(info.dimensions).toEqual({ width: 6, depth: 4.8, height: 2.7 });
    expect(info.vertices).toBeGreaterThan(3000);
    expect(info.vertices).toBeLessThanOrEqual(25000);
    expect(info.meshes).toBeLessThan(60);
    expect(info.categories.structure.vertices).toBeGreaterThan(0);
    expect(info.categories["dining-table"].vertices).toBeGreaterThan(0);
    expect(info.categories.yard.vertices).toBe(4);
    expect(info.pixelRatio).toBe(1.5);
    expect(statSync("public/prototype/roomverse-3d/kitchen/courtyard-v1.webp").size).toBeLessThanOrEqual(150 * 1024);
    expect(errors).toEqual([]);
    await shot(page, "desktop-golden-zh");
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
    expect(golden.vertices).toBe(4509);
    expect(golden.vertices - 4155, "wok-kitchen work should stay within its geometry budget").toBeLessThanOrEqual(1500);
    expect(golden.meshes - 45, "wok-kitchen work should add only a small number of meshes").toBe(3);
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
        };
      });
      console.log(`Room 03 wok interior samples ${width}px:`, JSON.stringify({ goldenSamples, nightSamples, projected }));
      expect(goldenSamples.interior.red, `golden-hour wok interior should stay warm at ${width}px`).toBeGreaterThan(goldenSamples.interior.blue);
      expect(nightSamples.interior.meanLuminance, `night wok interior should read brighter than adjacent wall at ${width}px`).toBeGreaterThan(nightSamples.wall.meanLuminance + 10);
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
