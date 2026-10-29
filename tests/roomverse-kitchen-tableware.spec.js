import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

const MOODS = ["golden", "movie", "night", "dinner", "sunday", "thanksgiving"];
const TABLEWARE_MOODS = new Set(["dinner", "thanksgiving"]);
// Old main 39,105/96 -> 42,582/99 after the living-detail batches (+2,498 vertices, +3 meshes, +1 opening call).
const BASELINE_BY_WIDTH_AND_MOOD = {
  // Room 03 main after the lamp-wall painting: 30,877 vertices and 95 meshes. Countertop refinements add 3,180 vertices; vertex-color batching reduces meshes to 94 and saves one opening call.
  // Desktop draw calls 70 -> 67 (-3) in every mood: the gas hob replaces four separate steel ring meshes with parts of the existing batches.
  // Same-test-sequence opening calls: desktop main 67 -> 68; phone main 69 -> 70.
  // Dish dryer frame + face are in the opening view: +2 meshes, +2 opening calls (desktop).
  1440: { golden: [42582, 104, 71], movie: [42582, 104, 69], night: [42582, 104, 71], dinner: [42582, 104, 71], sunday: [42582, 104, 71], thanksgiving: [42582, 104, 71] }, // credenza: +1 desktop call
  // Phone opening calls: main 69 -> 70; later camera turns are measured separately.
  // Tableware deltas are measured from the new main-plus-living-details baseline.
  390: { golden: [42582, 104, 72], movie: [42582, 104, 70], night: [42582, 104, 72], dinner: [42582, 104, 72], sunday: [42582, 104, 72], thanksgiving: [42582, 104, 72] },
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
      expect(info.moodSlots.tabletopCenterpiece.visible, `${mood}: the lemon bowl steps aside for the roast chicken`).toBe(!shown);
      const [baselineVertices, baselineMeshes, baselineCalls] = BASELINE_BY_WIDTH_AND_MOOD[width][mood];
      if (!shown) {
        expect(info.vertices, `${mood} vertices remain at main`).toBe(baselineVertices);
        expect(info.meshes, `${mood} meshes remain at main`).toBe(baselineMeshes);
        expect(info.drawCallsLastFrame, `${mood} draw calls remain at main`).toBe(baselineCalls);
      } else {
        // v2 (linen runner, napkins, accent plates, pitcher, bread board): ceiling raised 7,000 -> 9,000 vertices per the v2 task card; measured 8,488.
        // Roast chicken feast (platter, bird, potatoes, carrots, rosemary, lemon halves, croutons): ceiling 9,000 -> 12,500 (Paul 2026-10-29); measured 11,924.
        expect(info.tableware.vertices).toBeLessThanOrEqual(12500);
        // Thanksgiving also shows its own table layer (bottle, extra glasses, cranberries, candlesticks): tracked in roomverse-kitchen-thanksgiving-decor.spec.js.
        const decor = mood === "thanksgiving" ? info.thanksgivingDecor : { vertices: 0, meshes: 0 };
        expect(info.vertices - baselineVertices).toBe(info.tableware.vertices + decor.vertices);
        expect(info.meshes - baselineMeshes).toBe(info.tableware.meshes + decor.meshes);
        expect(info.drawCallsLastFrame - baselineCalls).toBeLessThanOrEqual(8 + decor.meshes); // Old +8; Thanksgiving's layer adds up to 3 more meshes.
        // Old: ceramic, glass, liquid, metal (4). Then plus one linen mesh (5). Now plus one glossy food mesh (6); everything else is merged into those.
        expect(info.tableware.meshes).toBeLessThanOrEqual(6);
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
    expect(Math.abs(place.accentPlateGapMm), `${place.chair} accent plate to dinner plate`).toBeLessThanOrEqual(1);
    expect(Math.abs(place.napkinTableGapMm), `${place.chair} napkin to table`).toBeLessThanOrEqual(1);
    expect(Math.abs(place.forkNapkinGapMm), `${place.chair} fork rests on the napkin`).toBeLessThanOrEqual(1);
    expect(place.plateDiameterMm).toBeCloseTo(270, 0);
    expect(place.bowlDiameterMm).toBeCloseTo(160, 0);
    expect(place.bowlHeightMm).toBeCloseTo(70, 0);
  }
  expect(info.tableware.materials.glass).toMatchObject({ transparent: true, depthWrite: false, renderOrder: 2 });
  expect(info.tableware.materials.liquid).toMatchObject({ transparent: true, depthWrite: false, renderOrder: 1 });
  expect(info.tableware.colors.wine).toBe("#5c1823");
  // Table centre: linen runner, pitcher, bread board and bread, all measured to the millimetre.
  const extras = info.tableware.extras;
  expect(extras.runner.gapMm, "runner lies on the tabletop").toBeLessThanOrEqual(1);
  expect(extras.runner.minSettingClearanceMm, "runner clears plates and glasses in plan view").toBeGreaterThanOrEqual(0);
  expect(extras.pitcher.gapMm, "pitcher base on the runner").toBeLessThanOrEqual(1);
  expect(extras.pitcher.minSettingClearanceMm, "pitcher clears plates and glasses").toBeGreaterThanOrEqual(40);
  expect(extras.pitcher.boardClearanceMm, "pitcher clears the bread board").toBeGreaterThanOrEqual(20);
  expect(extras.pitcher.lemonClearanceMm).toBeGreaterThanOrEqual(100);
  expect(extras.board.gapMm, "bread board on the runner").toBeLessThanOrEqual(1);
  expect(extras.board.lemonClearanceMm, "board clears the lemon bowl").toBeGreaterThanOrEqual(20);
  expect(extras.board.minSettingClearanceMm).toBeGreaterThanOrEqual(40);
  expect(extras.bread.loafBottomMm, "loaf pressed 1-4 mm into the board").toBeGreaterThanOrEqual(-4);
  expect(extras.bread.loafBottomMm).toBeLessThanOrEqual(-1);
  for (const bottom of extras.bread.sliceBottomsMm) { expect(bottom).toBeGreaterThanOrEqual(-4); expect(bottom).toBeLessThanOrEqual(-1); }
  expect(extras.bread.maxXOverBoardMm, "bread stays on the board").toBeLessThanOrEqual(0);
  expect(extras.runner.maxX, "runner ends before the glasses").toBeLessThan(0.67);
  const feast = extras.feast;
  expect(feast.platterWidthMm, "oval platter about 52 cm long (was 34 cm before the bird moved to the table centre)").toBeGreaterThanOrEqual(500);
  expect(feast.platterWidthMm).toBeLessThanOrEqual(540);
  expect(Math.abs(feast.platterCenterXMm), "platter is on the table's centre line").toBeLessThanOrEqual(5);
  expect(feast.platterDepthMm, "and 19-21 cm deep, inside the 22 cm runner").toBeGreaterThanOrEqual(185);
  expect(feast.platterDepthMm).toBeLessThanOrEqual(210);
  expect(feast.platterGapMm, "platter sits on the runner").toBeLessThanOrEqual(1);
  expect(feast.platterSettingClearanceMm, "platter clears plates and glasses").toBeGreaterThanOrEqual(10);
  expect(feast.platterBoardClearanceMm).toBeGreaterThanOrEqual(20);
  expect(feast.minRestGapMm, "food is pressed 1-3 mm into the platter").toBeGreaterThanOrEqual(-3);
  expect(feast.maxRestGapMm).toBeLessThanOrEqual(-1);
  expect(feast.overhangMm, "no food overhangs the platter rim").toBeLessThanOrEqual(0);
  expect(feast.topMm, "the bird and rosemary stay below 11 cm").toBeLessThanOrEqual(110);
  expect(feast.potatoes).toBe(4); expect(feast.carrots).toBe(3); expect(feast.lemonHalves).toBe(2); expect(feast.croutons).toBe(5);
  expect(info.tableware.colors.accent).toEqual(["#777f63", "#9a6a50"]);
});
