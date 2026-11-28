import { test, expect } from "@playwright/test";
import { LEDGER, CAPS } from "./helpers/room03-ledger.js";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

test("a sourdough board and a bowl of fruit stand on the kitchen counter, inside its run", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`${PAGE}?lang=zh`);
    await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.info().furniture.table === "glb" && window.__room03.robotInfo().ready, null, { timeout: 120000 });
    const info = await page.evaluate(() => window.__room03.info());
    const fresh = info.counterFresh;
    expect(fresh.vertices, "one merged mesh with the board, loaf, bowl and fruit").toBeGreaterThan(800);
    expect(info.vertices).toBeLessThanOrEqual(CAPS.vertices);
    expect(fresh.bounds.min[1] - 0.955, "stands on the counter top").toBeGreaterThanOrEqual(-0.002);
    expect(fresh.bounds.min[1] - 0.955).toBeLessThanOrEqual(0.002);
    expect(fresh.bounds.max[1] - 0.955, "low pieces, well under the wall cabinets").toBeLessThanOrEqual(0.2);
    expect(fresh.bounds.min[0], "clear of the coffee maker (x -0.34, half width 0.14)").toBeGreaterThanOrEqual(-0.2);
    expect(fresh.bounds.max[0], "inside the counter run (ends at x 2.23)").toBeLessThanOrEqual(2.2);
    expect(fresh.bounds.min[2], "in front of the backsplash").toBeGreaterThanOrEqual(-2.3);
    expect(fresh.bounds.max[2], "inside the counter depth (front edge z -1.65)").toBeLessThanOrEqual(-1.7);
    expect(fresh.bounds.max[2], "the cut slice and the lemon half lie in front of the board").toBeGreaterThanOrEqual(-1.8);
    expect(fresh.vertices, "board, loaf, slice, crumbs, lemon half, bowl and fruit").toBeGreaterThan(2400);
    expect(fresh.bread.dimensionsMm, "a loaf pan with a domed quick bread").toEqual([253, 123, 98]);
    expect(fresh.bread.boardEmbedMm, "the loaf sits into the board").toBe(2);
    expect(fresh.bread.style).toContain("quick-bread loaf");
    expect(info.coffeeMaker.style).toBe("grind-and-brew drip");
    expect(info.coffeeMaker.hopperLid).toBe("closed");
    expect(info.coffeeMaker.beansVisible).toBeGreaterThanOrEqual(150);
    expect(info.coffeeMaker.carafeRimClearanceToUpperHousingMm).toBeGreaterThanOrEqual(40);
    for (const key of ["mineral-water-bottle-1"]) { // one bottle since 2026-11-21
      const bottle = info.propBounds[key];
      expect(bottle.size[1], "1.5 L-style tall bottle").toBeGreaterThanOrEqual(0.30);
      expect(bottle.size[1]).toBeLessThanOrEqual(0.32);
      // Paul 2026-11-21: the water bottle stands on the floor beside the window lounge chair (somebody sitting there may want a drink).
      expect(bottle.min[1], "bottle stands on the floor").toBeGreaterThanOrEqual(-0.002);
      expect(bottle.min[1]).toBeLessThanOrEqual(0.004);
      expect(bottle.min[0], "beside the lounge chair, near the glass").toBeGreaterThanOrEqual(-3.0);
      expect(bottle.max[0]).toBeLessThanOrEqual(-1.6);
      expect(bottle.min[2]).toBeGreaterThanOrEqual(-0.9);
      expect(bottle.max[2]).toBeLessThanOrEqual(0.2);
    }
    expect(info.cookbookCount).toBe(3);
    expect(info.storageBoxCount).toBe(2);
    expect(info.counterMugCount, "one glazed mug, not two").toBe(1);
    const mugs = info.propBounds["counter-mugs"];
    // Paul 2026-11-17: the brick-red mug moved from the counter to the credenza, right of the record player; the stone dish took its place on the counter.
    expect(mugs.min[1] - 0.815, "the mug stands on the credenza top").toBeGreaterThanOrEqual(-0.002);
    expect(mugs.min[1] - 0.815).toBeLessThanOrEqual(0.002);
    expect(mugs.min[0], "the mug is on the credenza (x)").toBeGreaterThan(2.55);
    expect(mugs.max[0], "the mug is on the credenza (x)").toBeLessThan(2.95);
    expect(mugs.min[2], "the mug clears the record player's right edge").toBeGreaterThan(0.76);
    expect(mugs.max[2], "the mug stays on the credenza, short of the wok counter").toBeLessThan(1.0);
    expect(mugs.max[0] - mugs.min[0], "a mug body with a handle, not a wide prop").toBeLessThan(0.13);
    await page.waitForFunction(() => window.__room03.info().propBounds["counter-popcorn-bowl"]?.size[1] > 0.05, null, { timeout: 30000 }); // the popcorn bowl is Room 01's model, loaded after the first frame (Paul 2026-11-22)
    const popcorn = await page.evaluate(() => window.__room03.info().propBounds["counter-popcorn-bowl"]);
    const dish = popcorn;
    expect(dish.min[1] - 0.955, "the popcorn bowl sits on the counter").toBeGreaterThanOrEqual(-0.002);
    expect(dish.min[1] - 0.955).toBeLessThanOrEqual(0.0035);
    expect(dish.max[2], "the bowl stays inside the front edge of the counter").toBeLessThanOrEqual(-1.65);
    expect(dish.min[2], "the bowl clears the coffee maker front").toBeGreaterThan(-1.85);
    const bowl = info.propBounds["wok-wood-serving-bowl"];
    expect(bowl.min[1] - 0.955, "wooden bowl sits on the wok counter").toBeGreaterThanOrEqual(-0.002);
    expect(bowl.min[1] - 0.955).toBeLessThanOrEqual(0.002);
    expect(bowl.min[2], "wooden bowl clears the cooktop").toBeGreaterThanOrEqual(1.973);
    expect(bowl.max[2], "wooden bowl stays inside the counter end").toBeLessThanOrEqual(2.343);

    if (QA) {
      for (const [key, x, z, filename] of [
        ["coffee-maker", -0.34, -2.03, `coffee-maker-close-${width}.png`],
        ["sourdough", 0.04, -2.06, `sourdough-close-${width}.png`],
        ["water-bottles", 2.55, 0.02, `water-bottles-close-${width}.png`],
      ]) {
        await page.evaluate(({ key, x, z }) => {
          const room = window.__room03;
          room.controls.minDistance = 0.1; room.controls.maxDistance = 12;
          room.controls.minAzimuthAngle = -Math.PI; room.controls.maxAzimuthAngle = Math.PI;
          room.controls.minPolarAngle = 0.05; room.controls.maxPolarAngle = Math.PI - 0.05;
          if (key === "water-bottles") {
            room.camera.fov = 46; room.camera.position.set(1.55, 1.35, z);
            room.controls.target.set(x, 1.00, z);
          } else if (key === "coffee-maker") {
            room.camera.fov = 46; room.camera.position.set(x, 1.47, z + 1.08);
            room.controls.target.set(x, 1.14, z);
          } else {
            room.camera.fov = 40; room.camera.position.set(x, 1.32, z + 0.70);
            room.controls.target.set(x, 1.03, z);
          }
          room.camera.updateProjectionMatrix(); room.controls.update(); room.render();
        }, { key, x, z });
        await page.waitForTimeout(300);
        await page.locator(".room").screenshot({ path: `${QA}/${filename}` });
      }
    }
  }
});
