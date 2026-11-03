import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { LEDGER } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";

function boxGap(a, b) {
  const axisGap = (amin, amax, bmin, bmax) => Math.max(0, Math.max(amin - bmax, bmin - amax));
  const dx = axisGap(a.min[0], a.max[0], b.min[0], b.max[0]);
  const dy = axisGap(a.min[1], a.max[1], b.min[1], b.max[1]);
  const dz = axisGap(a.min[2], a.max[2], b.min[2], b.max[2]);
  return Math.hypot(dx, dy, dz);
}

test("wok station has one reduced wall board, four everyday tools, four seasonings and oil beside the paper pack", async ({ page }) => {
  test.setTimeout(process.env.ROOMVERSE_QA_DIR ? 120000 : 60000);
  const pageErrors = [];
  page.on("pageerror", (error) => { pageErrors.push(error.stack || error.message); console.log("ROOM03 PAGEERROR", error.stack || error.message); });
  page.on("console", (message) => { if (message.type() === "error") console.log("ROOM03 CONSOLE", message.text()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(PAGE + "?lang=zh");
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().furniture.table === "glb", null, { timeout: 45000 });
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0, null, { timeout: 45000 });
  console.log("ROOM03 RUNTIME ERRORS", JSON.stringify(pageErrors));
  expect(pageErrors).toEqual([]);
  const info = await page.evaluate(() => window.__room03.info());
  const tools = info.wokTools;
  const board = info.propBounds["cutting-board"];
  const oil = info.propBounds["wok-olive-oil"];
  const pack = info.paperNapkinPack.bounds;

  expect(info.vertices).toBe(LEDGER.scene.vertices);
  expect(tools.utensils.map(({ name }) => name)).toEqual(["wood-spoon", "slotted-spoon", "compact-turner", "stainless-tongs"]);
  const oilBottleHeightMm = info.wokOliveOil.bounds.size[1] * 1000;
  expect(Math.max(...tools.utensils.map(({ heightMm }) => heightMm)), "longest hanging utensil is visibly larger than the 244 mm olive-oil bottle").toBeGreaterThanOrEqual(oilBottleHeightMm * 1.2);
  expect(Math.max(...tools.utensils.map(({ bounds }) => bounds.min[1])), "longer tools still clear the counter").toBeGreaterThanOrEqual(1.005);
  expect(tools.spiceJars).toHaveLength(4);
  expect(tools.vertices, "rail, four utensils and four small shelf jars remain one merged draw-call mesh").toBeGreaterThan(1500);

  // Original board was 340×420 mm on the main island; approved version is 75% (255×315 mm), vertical against the wok backsplash.
  expect(board.min[0], "board relocated to the small wok station").toBeGreaterThan(2.7);
  expect(info.cuttingBoardFit.nominalSizeMm).toEqual([255, 315, 20]);
  expect(board.size[2] * 1000).toBeGreaterThanOrEqual(250);
  expect(board.size[2] * 1000).toBeLessThanOrEqual(260);
  expect(board.size[1] * 1000).toBeGreaterThanOrEqual(305);
  expect(board.size[1] * 1000).toBeLessThanOrEqual(315);
  expect(info.cuttingBoardFit.gapMm, "board foot sits on the stone counter within 1 mm").toBeGreaterThanOrEqual(-1);
  expect(info.cuttingBoardFit.gapMm).toBeLessThanOrEqual(1);
  expect(info.cuttingBoardFit.wallClearanceMm, "leaning upper edge stays just in front of the wall").toBeGreaterThanOrEqual(0);
  expect(info.cuttingBoardFit.wallClearanceMm).toBeLessThanOrEqual(5);
  expect(info.cuttingBoardFit.burnerClearanceMm, "board clears the cooktop").toBeGreaterThanOrEqual(25);

  // Oil bottle is a small, unbranded dark-glass retail-style bottle, near the permanent red-banded napkin pack and away from the hob.
  expect(info.wokOliveOil.material).toEqual({ roughness: 0.24, clearcoat: 0.55, transparent: false });
  expect(info.wokOliveOil.gapMm).toBeGreaterThanOrEqual(-2);
  expect(info.wokOliveOil.gapMm).toBeLessThanOrEqual(0);
  expect(info.wokOliveOil.bounds.size[1] * 1000).toBeGreaterThanOrEqual(235);
  expect(info.wokOliveOil.bounds.size[1] * 1000).toBeLessThanOrEqual(245);
  expect(boxGap(oil, pack) * 1000, "oil bottle sits beside the napkin pack").toBeLessThanOrEqual(80);
  expect(pack.min[2]).toBeLessThan(oil.max[2]);
  expect(oil.max[2]).toBeLessThan(1.35);
  expect(info.paperNapkinPack.visible).toBe(true);
  expect(info.paperNapkinPack.mounted).toBe(true);

  // Wok counter top is 0.955 m; shelf jars sit on their 1.4325 m support and remain below the hood.
  expect(Math.min(...tools.utensils.map(({ bounds }) => bounds.min[1])), "tool heads hang clear of the counter").toBeGreaterThanOrEqual(1.005);
  for (const jar of tools.spiceJars) {
    expect(jar.bounds.min[1]).toBeGreaterThanOrEqual(1.431);
    expect(jar.bounds.min[1]).toBeLessThanOrEqual(1.434);
    expect(jar.bounds.max[1]).toBeLessThanOrEqual(1.56);
  }
  expect(tools.bounds.max[1], "spice jar lids stay under the hood bottom").toBeLessThanOrEqual(1.60);
  expect(tools.bounds.max[0], "nothing is buried beyond the wall face").toBeLessThanOrEqual(2.9405);
  expect(tools.bounds.min[0], "tools and shelf things stay near the wall").toBeGreaterThanOrEqual(2.78);
  expect(tools.bounds.min[2]).toBeGreaterThanOrEqual(1.5);
  expect(tools.bounds.max[2]).toBeLessThanOrEqual(2.45);
  console.log("Room 03 wok-station fit:", JSON.stringify({ board: info.cuttingBoardFit, boardBounds: board, oil: info.wokOliveOil, oilToNapkinsMm: boxGap(oil, pack) * 1000, utensils: tools.utensils, spiceJars: tools.spiceJars, vertices: info.vertices, meshes: info.meshes, drawCalls: info.drawCallsLastFrame }));
  if (process.env.ROOMVERSE_QA_DIR) {
    fs.mkdirSync(process.env.ROOMVERSE_QA_DIR, { recursive: true });
    await page.evaluate(() => {
      const { camera, controls, render } = window.__room03;
      controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity;
      controls.minPolarAngle = 0.2; controls.maxPolarAngle = Math.PI - 0.2;
      controls.minDistance = 1.7; controls.maxDistance = 8;
      controls.target.set(2.48, 1.22, 1.72);
      camera.position.set(0.45, 1.62, 1.72);
      camera.fov = 62; camera.updateProjectionMatrix();
      controls.update(); render();
    });
    await page.waitForTimeout(400);
    await page.locator(".room").screenshot({ path: path.join(process.env.ROOMVERSE_QA_DIR, "wok-station-1440-close.png"), animations: "disabled", timeout: 45000 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      const { camera, controls, render } = window.__room03;
      controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity;
      controls.minPolarAngle = 0.2; controls.maxPolarAngle = Math.PI - 0.2;
      controls.minDistance = 1.55; controls.maxDistance = 8;
      controls.target.set(2.62, 1.22, 1.72);
      camera.position.set(1.0, 1.62, 1.72);
      camera.fov = 66; camera.updateProjectionMatrix();
      controls.update(); render();
    });
    await page.waitForTimeout(400);
    await page.locator(".room").screenshot({ path: path.join(process.env.ROOMVERSE_QA_DIR, "wok-station-390-close.png"), animations: "disabled", timeout: 45000 });
  }
});
