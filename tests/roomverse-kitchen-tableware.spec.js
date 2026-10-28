import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

const MOODS = ["golden", "movie", "night", "dinner", "sunday", "thanksgiving"];
const TABLEWARE_MOODS = new Set(["dinner", "thanksgiving"]);
// Measured from main db23c06 (before -> after tableware); non-tableware moods must retain these exact scene totals.
const BASELINE_BY_WIDTH_AND_MOOD = {
  1440: { golden: [30696, 96, 69], movie: [30696, 96, 67], night: [30696, 96, 69], dinner: [30696, 96, 71], sunday: [30696, 96, 69], thanksgiving: [30696, 96, 71] },
  390: { golden: [30696, 96, 72], movie: [30696, 96, 70], night: [30696, 96, 72], dinner: [30696, 96, 74], sunday: [30696, 96, 72], thanksgiving: [30696, 96, 74] },
};

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  await page.waitForFunction(() => window.__room03.info().furniture.table === "glb");
}

test("tableware mood flag is complete and only dinner and Thanksgiving attach it", async ({ page }) => {
  for (const width of [1440, 390]) {
    await loadRoom(page, width);
    const initialAzimuth = await page.evaluate(() => window.__room03.controls.getAzimuthalAngle());
    const base = await page.evaluate(() => window.__room03.info());
    if (QA && width === 1440) {
      await page.evaluate(() => window.__room03.setView(0));
      await page.locator(".room").screenshot({ path: `${QA}/golden-1440-0.png` });
      await page.evaluate((angle) => window.__room03.setView(angle), initialAzimuth);
    }
    const reports = [];
    for (const mood of MOODS) {
      await page.evaluate((name) => window.__room03.setMood(name), mood);
      const info = await page.evaluate(() => window.__room03.info());
      const shown = TABLEWARE_MOODS.has(mood);
      expect(info.moodLook.moods[mood].tableware, `${mood}.tableware`).toBe(shown);
      expect(info.moodSlots.tableware.visible, `${mood} visible flag`).toBe(shown);
      expect(info.moodSlots.tableware.mounted, `${mood} scene attachment`).toBe(shown);
      const [baselineVertices, baselineMeshes, baselineCalls] = BASELINE_BY_WIDTH_AND_MOOD[width][mood];
      if (!shown) {
        expect(info.vertices, `${mood} vertices remain at main`).toBe(baselineVertices);
        expect(info.meshes, `${mood} meshes remain at main`).toBe(baselineMeshes);
        expect(info.drawCallsLastFrame, `${mood} draw calls remain at main`).toBe(baselineCalls);
      } else {
        expect(info.tableware.vertices).toBeLessThanOrEqual(7000);
        expect(info.vertices - baselineVertices).toBe(info.tableware.vertices);
        expect(info.meshes - baselineMeshes).toBe(info.tableware.meshes);
        expect(info.drawCallsLastFrame - baselineCalls).toBeLessThanOrEqual(8);
        expect(info.tableware.meshes).toBeLessThanOrEqual(4);
      }
      reports.push({ mood, vertices: info.vertices, meshes: info.meshes, calls: info.drawCallsLastFrame, tableware: info.tableware?.vertices ?? null });
      if (QA && (mood === "dinner" || mood === "thanksgiving")) {
        for (const angle of [0, 90, 180]) {
          await page.evaluate((degrees) => window.__room03.setView(degrees * Math.PI / 180), angle);
          await page.locator(".room").screenshot({ path: `${QA}/${mood}-${width}-${angle}.png` });
        }
        await page.evaluate((angle) => window.__room03.setView(angle), initialAzimuth);
      }
    }
    console.log(`Room 03 tableware scene metrics ${width}px:`, JSON.stringify({ base: { vertices: base.vertices, meshes: base.meshes, calls: base.drawCallsLastFrame }, reports }));
  }
});

test("four place settings fit the loaded table and glass has a stable transparent material", async ({ page }) => {
  await loadRoom(page, 1440);
  await page.evaluate(() => window.__room03.setMood("dinner"));
  const info = await page.evaluate(() => window.__room03.info());
  expect(info.tableware.settings).toHaveLength(4);
  for (const place of info.tableware.settings) {
    expect(place.chair).toMatch(/^room03-dining-chair-/);
    expect(Math.abs(place.plateTableGapMm), `${place.chair} plate to table`).toBeLessThanOrEqual(1);
    expect(Math.abs(place.bowlPlateGapMm), `${place.chair} bowl to plate`).toBeLessThanOrEqual(1);
    expect(Math.abs(place.wineTableGapMm), `${place.chair} wine glass to table`).toBeLessThanOrEqual(1);
    expect(Math.abs(place.waterTableGapMm), `${place.chair} water glass to table`).toBeLessThanOrEqual(1);
    expect(place.edgeClearanceMm, `${place.chair} clearance from tabletop edges`).toBeGreaterThanOrEqual(60);
    expect(place.lemonClearanceMm, `${place.chair} clears the Meyer lemon bowl`).toBeGreaterThan(0);
    expect(place.plateDiameterMm).toBeCloseTo(270, 0);
    expect(place.bowlDiameterMm).toBeCloseTo(160, 0);
    expect(place.bowlHeightMm).toBeCloseTo(70, 0);
  }
  expect(info.tableware.materials.glass).toMatchObject({ transparent: true, depthWrite: false, renderOrder: 2 });
  expect(info.tableware.materials.liquid).toMatchObject({ transparent: true, depthWrite: false, renderOrder: 1 });
  expect(info.tableware.colors.wine).toBe("#5c1823");
});
