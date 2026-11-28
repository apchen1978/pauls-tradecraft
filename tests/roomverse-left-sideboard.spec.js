import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

async function openRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${PAGE}?lang=zh&mood=golden`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room?.sideboardDetails, null, { timeout: 90000 });
  await page.waitForFunction(() => window.__room.hallStand?.() && window.__room.sideboardDetails().standClearMm !== null, null, { timeout: 60000 });
  // Wait until every model has arrived and the mesh count holds for 3 s (lazy TV and left-wall details only load on those views).
  await page.waitForFunction(() => window.__room.geometryMetrics().robotLoaded, null, { timeout: 90000 });
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const now = await page.evaluate(() => window.__room.geometryMetrics().meshes);
    if (now === last) break;
    last = now; await page.waitForTimeout(3000);
  }
  return errors;
}

// Paul 2026-10-31: the TV console was full, so a low oak sideboard on the left wall under the harbour painting holds a mug and a napkin pack.
for (const width of [1280, 390]) {
  test(`left-wall sideboard sits on the floor and wall, its props rest on top, and it clears the painting and coat stand (${width})`, async ({ page }) => {
    test.setTimeout(150000);
    const errors = await openRoom(page, width);
    const d = await page.evaluate(() => window.__room.sideboardDetails());
    // Floor and wall contact (fit-craft: embed, never just kiss).
    expect(d.floorEmbedMm, "plinth sinks into the floor").toBeGreaterThanOrEqual(1);
    expect(d.floorEmbedMm).toBeLessThanOrEqual(3);
    expect(d.plasterEmbedMm, "top meets the plaster").toBeGreaterThanOrEqual(0);
    expect(d.plasterEmbedMm).toBeLessThanOrEqual(1);
    expect(d.carcassToSkirtingMm, "carcass back rests on the skirting face").toBe(0);
    // Size: a low sideboard (~1 m x ~0.4 m x 0.68 m).
    expect(d.heightMm).toBeCloseTo(680, 0);
    expect(d.lengthMm).toBeGreaterThanOrEqual(850);
    expect(d.lengthMm).toBeLessThanOrEqual(1050);
    expect(d.depthMm).toBeGreaterThanOrEqual(350);
    expect(d.depthMm).toBeLessThanOrEqual(420);
    // Props rest on the measured top (+/-2 mm) and stay inside its footprint.
    expect(Math.abs(d.mugSeatMm), "mug rests on the top").toBeLessThanOrEqual(2);
    expect(Math.abs(d.packSeatMm), "napkin pack rests on the top").toBeLessThanOrEqual(2);
    expect(d.propsInsideTop).toBe(true);
    // Vitamin bottle (Paul's photo): ~55 x 105 mm with a 60 mm cap, resting on the top, clear of the mug and the napkin pack.
    expect(Math.abs(d.bottleSeatMm), "bottle rests on the top").toBeLessThanOrEqual(2);
    expect(d.bottleSizeMm[0]).toBeGreaterThanOrEqual(58);
    expect(d.bottleSizeMm[0]).toBeLessThanOrEqual(64);
    expect(d.bottleSizeMm[1]).toBeCloseTo(105.6, 0);
    expect(d.bottleMugGapMm, "bottle clear of the mug").toBeGreaterThanOrEqual(5);
    expect(d.bottlePackGapMm, "bottle clear of the napkin pack").toBeGreaterThanOrEqual(5);
    // Gilded pulls: warm gold, near-full metal, low roughness.
    expect(d.pulls.metalness).toBeGreaterThanOrEqual(.9);
    expect(d.pulls.roughness).toBeLessThanOrEqual(.3);
    // Under the painting with room to breathe; clear of the coat stand.
    // Paul 2026-11-18 put a 230 mm water bottle on the top (the tallest prop now), so the air under the painting is measured from its cap: at least 120 mm.
    expect(d.paintingClearMm, "nothing touches the painting; 120 mm+ air above the tallest prop").toBeGreaterThanOrEqual(120);
    expect(d.standClearMm, "clear of the coat stand").toBeGreaterThanOrEqual(50);
    // The painting's z span covers the sideboard (it sits under it, not beside it).
    expect(d.bounds.min[2]).toBeGreaterThanOrEqual(1 - 0.659);
    expect(d.bounds.max[2]).toBeLessThanOrEqual(1 + 0.659);
    // Budget: four merged meshes.
    expect(d.meshes).toBe(4);
    const metrics = await page.evaluate(() => window.__room.geometryMetrics()); // read before any orbit loads the left-wall art
    // Count only what the sideboard adds. The old check subtracted a whole-scene total measured on 2026-10-31 (277 meshes), so every unrelated change to the room broke it
    // (it read 68 too many on main). The four sideboard meshes must each be in the scene, and the scene must hold at least their vertices.
    expect(d.meshes, "the four sideboard meshes are in the scene").toBe(4);
    expect(metrics.meshes, "the scene holds at least the sideboard's meshes").toBeGreaterThanOrEqual(d.meshes);
    expect(metrics.vertices, "the scene holds at least the sideboard's vertices").toBeGreaterThanOrEqual(d.vertices);
    expect(d.vertices).toBeLessThanOrEqual(18000);
    // Cameras never enter the sideboard: the orbit sweep and the coat-stand close-ups.
    const cams = await page.evaluate(() => {
      const out = [];
      for (let deg = -180; deg < 180; deg += 15) out.push(window.__room.setOrbitAngle(deg));
      for (const kind of ["room", "scale", "close", "base"]) { const f = window.__room.frameHallStand(kind); if (f) out.push(f.eye); }
      return out;
    });
    const pad = 0.06;
    for (const [x, y, z] of cams) {
      const inside = x > d.bounds.min[0] - pad && x < d.bounds.max[0] + pad && y < d.props.max[1] + pad && z > d.bounds.min[2] - pad && z < d.bounds.max[2] + pad;
      expect(inside, `camera ${[x, y, z].map((v) => v.toFixed(2))} clear of the sideboard`).toBe(false);
    }
    expect(errors).toEqual([]);
    if (QA) {
      await page.evaluate(() => window.__room.setOrbitAngle(90));
      await page.waitForTimeout(1500);
      await page.locator("#stage").screenshot({ path: `${QA}/sideboard-orbit90-${width}.png` });
    }
  });
}

for (const width of [1280, 390]) test(`Room 01 sideboard top: two taller water bottles with distinct colour bands, three vitamin bottles, all seated and clear of each other (${width})`, async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(`${PAGE}?lang=zh&mood=golden&hint=0`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.sideboardTopItems);
  const t = await page.evaluate(() => window.__room.sideboardTopItems());
  for (const key of ["mug", "redVitamin", "orangeVitamin", "water1", "water2"]) {
    expect(Math.abs(t[key].seatMm), `${key} sits on the oak`).toBeLessThanOrEqual(1.5);
    expect(t[key].gapMm, `${key} clear of ${t[key].nearest}`).toBeGreaterThanOrEqual(3);
  }
  for (const key of ["water1", "water2"]) expect(t[key].wallGapMm, `${key} stands near the wall`).toBeLessThanOrEqual(40);
  // Paul 2026-11-20 (second pass): the two waters were twins. Now one is clear water with a thin cream label and the other a cola-style drink (dark liquid, a tall printed label with our own
  // name, a dark cap) that is shorter and plumper; the green jar is gone and the orange one is stout.
  expect(t.water1.heightMm, "the clear water is the taller bottle").toBeGreaterThan(t.water2.heightMm + 15);
  expect(t.water2.heightMm).toBeGreaterThan(190);
  expect(t.labels.labelMm.water2, "the cola's label is at least twice as tall as the clear water's").toBeGreaterThanOrEqual(t.labels.labelMm.water1 * 2);
  expect(t.labels.fill.water1).not.toBe(t.labels.fill.water2);
  expect(t.labels.fill.water2, "the cola is dark").toMatch(/^#[0-4]/);
  expect(t.labels.distinctWaterShells, "the two waters are no longer the same shape").toBe(true);
  expect(t.greenVitamin, "the green jar is gone").toBeUndefined();
  // Paul 2026-11-19 (later) and 2026-11-20: the roomverse 3d jar (red band) stands forward by the mug; behind, the two waters and one stout orange jar stay near the wall.
  expect(t.redVitamin.nearest, "the red-band jar stands by the mug").toBe("mug");
  expect(t.redVitamin.gapMm, "a small clear gap to the mug").toBeGreaterThanOrEqual(8);
  expect(t.redVitamin.gapMm).toBeLessThanOrEqual(20);
  expect(t.redVitamin.wallGapMm - t.orangeVitamin.wallGapMm, "it stands well forward of the back row").toBeGreaterThanOrEqual(100);
  expect(t.orangeVitamin.wallGapMm, "the orange jar stands near the wall").toBeLessThanOrEqual(60);
  expect(t.orangeVitamin.gapMm, "the orange jar is not touching its neighbour").toBeGreaterThanOrEqual(8);
  expect(Math.abs(t.orangeVitamin.heightMm - t.redVitamin.heightMm), "the stout orange jar is about as tall as the red one, not taller: it is fatter instead").toBeLessThanOrEqual(8);
  expect(t.orangeVitamin.widthMm, "and it is plumper than the red jar").toBeGreaterThan(t.redVitamin.widthMm + 8);
});
