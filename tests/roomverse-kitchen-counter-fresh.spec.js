import { test, expect } from "@playwright/test";
import { LEDGER } from "./helpers/room03-ledger.js";
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
    expect(info.vertices).toBe(LEDGER.scene.vertices);
    expect(fresh.bounds.min[1] - 0.955, "stands on the counter top").toBeGreaterThanOrEqual(-0.002);
    expect(fresh.bounds.min[1] - 0.955).toBeLessThanOrEqual(0.002);
    expect(fresh.bounds.max[1] - 0.955, "low pieces, well under the wall cabinets").toBeLessThanOrEqual(0.2);
    expect(fresh.bounds.min[0], "clear of the coffee maker (x -0.34, half width 0.14)").toBeGreaterThanOrEqual(-0.2);
    expect(fresh.bounds.max[0], "inside the counter run (ends at x 2.23)").toBeLessThanOrEqual(2.2);
    expect(fresh.bounds.min[2], "in front of the backsplash").toBeGreaterThanOrEqual(-2.3);
    expect(fresh.bounds.max[2], "inside the counter depth (front edge z -1.65)").toBeLessThanOrEqual(-1.7);
    expect(fresh.bounds.max[2], "the cut slice and the lemon half lie in front of the board").toBeGreaterThanOrEqual(-1.8);
    expect(fresh.vertices, "board, loaf, slice, crumbs, lemon half, bowl and fruit").toBeGreaterThan(2400);
    expect(fresh.bread.dimensionsMm, "a low oval loaf rather than a spherical egg shape").toEqual([190, 102, 70]);
    expect(fresh.bread.boardEmbedMm, "the loaf sits into the board").toBe(2);
    expect(fresh.bread.style).toContain("country sourdough");
    expect(info.coffeeMaker.style).toBe("grind-and-brew drip");
    expect(info.coffeeMaker.hopperLid).toBe("closed");
    expect(info.coffeeMaker.beansVisible).toBeGreaterThanOrEqual(12);
    expect(info.coffeeMaker.carafeRimClearanceToUpperHousingMm).toBeGreaterThanOrEqual(40);

    if (QA) {
      for (const [key, x, z, filename] of [
        ["coffee-maker", -0.34, -2.03, `coffee-maker-close-${width}.png`],
        ["sourdough", 0.04, -2.06, `sourdough-close-${width}.png`],
      ]) {
        await page.evaluate(({ key, x, z }) => {
          const room = window.__room03;
          room.controls.minDistance = 0.1; room.controls.maxDistance = 12;
          room.controls.minAzimuthAngle = -Math.PI; room.controls.maxAzimuthAngle = Math.PI;
          room.controls.minPolarAngle = 0.05; room.controls.maxPolarAngle = Math.PI - 0.05;
          if (key === "coffee-maker") {
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
