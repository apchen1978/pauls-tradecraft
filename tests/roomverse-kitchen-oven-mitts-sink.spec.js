import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=en`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().furniture.table === "glb");
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

test("the oven, mitts, and sink read as fitted kitchen fixtures with stable clearances", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 390]) {
    await loadRoom(page, width);
    const info = await page.evaluate(() => window.__room03.info());
    expect(info.wokOven.style).toBe("built-in under-counter oven");
    expect(info.wokOven.nominalSizeMm).toEqual([560, 620, 430]);
    expect(info.wokOven.sideClearanceMm).toBeGreaterThanOrEqual(15);
    expect(info.wokOven.lowerClearanceMm).toBeGreaterThanOrEqual(20);
    expect(info.wokOven.upperClearanceMm).toBeGreaterThanOrEqual(50);
    expect(info.wokOven.rearClearanceMm).toBeGreaterThanOrEqual(0);
    expect(info.wokOven.controls).toBe(2);
    expect(info.wokOven.display).toContain("timer panel");
    expect(info.wokOven.handle).toContain("centered horizontal brushed brass pull");
    expect(info.wokOven.cabinetPulls).toContain("oven-facing inner door edges");
    expect(info.wokOven.cabinetPullOffsetFromOvenMm).toBeGreaterThanOrEqual(40);
    expect(info.wokOven.cabinetPullOffsetFromOvenMm).toBeLessThanOrEqual(65);
    expect(info.wokOven.displayPanelMm).toEqual([240, 60]);
    expect(info.wokOven.transparentGlass).toBe(false);

    expect(info.wokMitts.count).toBe(2);
    expect(info.wokMitts.hookCount).toBe(4);
    expect(info.wokMitts.occupiedHooks).toBe(2);
    expect(info.wokMitts.colorFamily).toMatch(/cream|sage|botanical/);
    expect(info.wokMitts.shape).toBe("one distinct thumb and four-finger mitt silhouette");
    expect(info.wokMitts.print.leaves).toBeGreaterThanOrEqual(14);
    expect(info.wokMitts.print.flowers).toBeGreaterThanOrEqual(6);
    expect(info.wokMitts.materialRoughness).toBeGreaterThanOrEqual(0.9);
    expect(info.wokMitts.reachHeightMm).toBeGreaterThanOrEqual(1300);
    expect(info.wokMitts.reachHeightMm).toBeLessThanOrEqual(1600);
    // The former test required z > 2.30, which placed the mitts beyond the room's +Z wall.
    // Keep them on the interior side wall, in the open backsplash span before the hood.
    expect(info.wokMitts.bounds.min[2]).toBeGreaterThan(1.02);
    expect(info.wokMitts.bounds.max[2]).toBeLessThan(1.49);
    expect(info.wokMitts.lowerClearanceToCounterMm).toBeGreaterThanOrEqual(350);
    expect(info.wokMitts.lowerClearanceToCounterMm).toBeLessThanOrEqual(450);

    expect(info.mainSink.openingMm).toEqual([680, 420]);
    expect(info.mainSink.openingClear, "the countertop has a real opening over the basin").toBe(true);
    expect(info.mainSink.basinFinish).toBe("brushed stainless steel");
    expect(info.mainSink.smartSensorVisualOnly).toBe(true);
    expect(info.mainSink.faucet).toContain("gooseneck");
    expect(info.mainSink.control).toContain("side lever");
    expect(info.mainSink.leverLengthMm).toBe(70);
    expect(info.mainSink.faucetMount).toContain("rear deck");
    expect(info.mainSink.rearDeckOffsetMm).toBeGreaterThanOrEqual(60);
    expect(info.pantryJarFit.gapMm).toBeLessThanOrEqual(2);
    expect(info.pantryJarFit.gapMm).toBeGreaterThanOrEqual(-2);
    const jar = info.propBounds["glass-pantry-jar"];
    const kettle = info.propBounds["electric-kettle"];
    const jarKettleDistance = Math.hypot(jar.min[0] + jar.size[0] / 2 - (kettle.min[0] + kettle.size[0] / 2), jar.min[2] + jar.size[2] / 2 - (kettle.min[2] + kettle.size[2] / 2));
    expect(jarKettleDistance, "the jar has moved beside the kettle").toBeLessThan(0.36);

    if (QA) {
      await page.locator(".room").screenshot({ path: `${QA}/oven-mitts-sink-${width}.png` });
      await page.evaluate(() => {
        const room = window.__room03;
        room.controls.minDistance = 0.1; room.controls.maxDistance = 12;
        room.controls.minAzimuthAngle = -Math.PI; room.controls.maxAzimuthAngle = Math.PI;
        room.controls.minPolarAngle = 0.05; room.controls.maxPolarAngle = Math.PI - 0.05;
        room.camera.fov = 42; room.camera.position.set(-0.15, 1.34, 0.15);
        room.controls.target.set(-1.20, 0.91, -2.02);
        room.camera.updateProjectionMatrix(); room.controls.update(); room.render();
      });
      await page.waitForTimeout(300);
      await page.locator(".room").screenshot({ path: `${QA}/sink-close-${width}.png` });
      if (width === 1440) {
        await page.evaluate(() => {
          const room = window.__room03;
          room.camera.fov = 70; room.camera.position.set(0.8, 1.75, 1.85);
          room.controls.target.set(2.84, 1.10, 1.7);
          room.camera.updateProjectionMatrix(); room.controls.update(); room.render();
        });
        await page.waitForTimeout(300);
        await page.locator(".room").screenshot({ path: `${QA}/oven-close-1440.png` });
      }
      await page.evaluate(() => {
        const room = window.__room03;
        room.controls.minDistance = 0.1; room.controls.maxDistance = 12;
        room.controls.minAzimuthAngle = -Math.PI; room.controls.maxAzimuthAngle = Math.PI;
        room.controls.minPolarAngle = 0.05; room.controls.maxPolarAngle = Math.PI - 0.05;
        room.camera.fov = 52; room.camera.position.set(1.45, 1.52, 0.45);
        room.controls.target.set(2.93, 1.49, 1.25);
        room.camera.updateProjectionMatrix(); room.controls.update(); room.render();
      });
      await page.waitForTimeout(300);
      await page.locator(".room").screenshot({ path: `${QA}/mitts-close-${width}.png` });
    }
  }
  expect(errors).toEqual([]);
});
