import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { LEDGER } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

async function loadRoom(page, width, lang = "zh") {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().plaque.status === "loaded");
  await page.waitForFunction(() => window.__room03.info().furniture.table === "glb" && window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

// The nook camera must stay in the main room: in front of the front-wall face (z 2.34), inside the nook opening's x span (side walls at
// x +/-0.94), below the lintel (y 2.1) and above the floor.
function expectClearOfWalls(cam, label) {
  expect(cam[2], `${label}: camera in front of the front wall (z < 2.34)`).toBeLessThan(2.335);
  expect(cam[2], `${label}: camera stays in the room`).toBeGreaterThan(0.5);
  // Near the opening (z > 2.2) the camera must be inside its x span; further back the main room is about 6 m wide.
  expect(Math.abs(cam[0]), `${label}: camera clear of the nook side walls / piers`).toBeLessThan(cam[2] > 2.2 ? 0.9 : 2.8);
  expect(cam[1], `${label}: below the lintel`).toBeLessThan(2.05);
  expect(cam[1], `${label}: above the floor`).toBeGreaterThan(0.6);
}

// Paul 2026-10-31: visitors want to look closer at the small entry nook; one extra preset view, no new geometry.
for (const width of [1280, 390]) {
  test(`the nook button moves the orbit close to the entry nook and frames its details at ${width}px`, async ({ page }) => {
    await loadRoom(page, width);
    const before = await page.evaluate(() => { const i = window.__room03.info(); return { vertices: i.vertices, meshes: i.meshes }; });
    const button = page.locator("#nookView");
    await expect(button).toBeVisible();
    await expect(button).toHaveText("走近小角落");
    expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await button.click();
    const view = await page.evaluate(() => {
      const r = window.__room03; const i = r.info();
      const e = i.entryWallDetails;
      const pts = {
        boardLeft: [e.corkboard.minX + 0.02, e.corkboard.center[1], 3.73], boardRight: [e.corkboard.maxX - 0.02, e.corkboard.center[1], 3.73],
        toteNatural: [(e.tote.minX + e.tote.maxX) / 2, (e.tote.bottomY + e.tote.topY) / 2, 3.72], toteRed: [(e.redTote.minX + e.redTote.maxX) / 2, (e.redTote.bottomY + e.redTote.topY) / 2, 3.72],
        keyShelf: e.shelf.center, tvEdge: [-0.15, 1.0, 3.70],
      };
      const ndc = Object.fromEntries(Object.entries(pts).map(([k, p]) => { const v = r.camera.position.clone().set(...p).project(r.camera); return [k, [v.x, v.y, v.z]]; }));
      return { info: r.nookViewInfo(), cam: r.camera.position.toArray(), target: r.controls.target.toArray(), ndc, vertices: i.vertices, meshes: i.meshes, center: r.centerViewInfo() };
    });
    expect(view.info).not.toBeNull();
    expect(view.center).toBeNull();
    for (let k = 0; k < 3; k++) expect(Math.abs(view.cam[k] - view.info.position[k]), `camera axis ${k}`).toBeLessThan(0.02);
    for (let k = 0; k < 3; k++) expect(Math.abs(view.target[k] - view.info.target[k]), `target axis ${k}`).toBeLessThan(0.001);
    const wallDistance = 3.74 - view.cam[2];
    expect(wallDistance, "1.3-1.6 m from the entry wall").toBeGreaterThanOrEqual(1.3);
    expect(wallDistance).toBeLessThanOrEqual(1.6);
    expect(view.cam[1], "natural eye height").toBeGreaterThanOrEqual(1.3);
    expect(view.cam[1]).toBeLessThanOrEqual(1.6);
    expectClearOfWalls(view.cam, "preset");
    for (const [name, [x, y, z]] of Object.entries(view.ndc)) {
      expect(z, `${name} in front of the camera`).toBeLessThan(1);
      expect(Math.abs(x), `${name} framed horizontally`).toBeLessThanOrEqual(1);
      expect(Math.abs(y), `${name} framed vertically`).toBeLessThanOrEqual(1);
    }
    expect(view.vertices, "zero new geometry").toBe(before.vertices);
    expect(view.vertices).toBe(LEDGER.scene.vertices);
    expect(view.meshes).toBe(before.meshes);
    if (QA) await page.locator(".room").screenshot({ path: `${QA}/nook-view-${width}-zh.png` });
    // Orbit and zoom still work from here, but the limits never let the camera into the walls.
    const extremes = await page.evaluate(() => {
      const r = window.__room03, out = [];
      const t = r.controls.target.clone();
      for (const theta of [Math.PI - 1.2, Math.PI - 0.6, Math.PI, -Math.PI + 0.6, -Math.PI + 1.2]) for (const radius of [0.6, 1.58, 1.7, 3]) for (const phi of [1.0, 1.4, 1.9]) {
        const p = t.clone().add({ x: radius * Math.sin(phi) * Math.sin(theta), y: radius * Math.cos(phi), z: radius * Math.sin(phi) * Math.cos(theta) });
        r.camera.position.copy(p); r.controls.update(); out.push(r.camera.position.toArray());
      }
      return out;
    });
    extremes.forEach((cam, i) => expectClearOfWalls(cam, `orbit extreme ${i}`));
  });
}

test("the nook view is labelled in English, leaves cleanly to the other views, and keeps the 390 px button row tidy", async ({ page }) => {
  await loadRoom(page, 390);
  const initial = await page.evaluate(() => ({ cam: window.__room03.camera.position.toArray(), target: window.__room03.controls.target.toArray(), min: window.__room03.controls.minDistance, az: [window.__room03.controls.minAzimuthAngle, window.__room03.controls.maxAzimuthAngle] }));
  const nook = page.locator("#nookView"), plaque = page.locator("#plaqueView"), center = page.locator("#centerView");
  // Standing view -> nook leaves the standing view.
  await center.click();
  await expect(center).toHaveAttribute("aria-pressed", "true");
  await nook.click();
  await expect(center).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.__room03.centerViewInfo())).toBeNull();
  expect(await page.evaluate(() => window.__room03.nookViewInfo())).not.toBeNull();
  // Nook -> entry wall restores the room orbit (target, limits), then turns to 180 degrees as before.
  await plaque.click();
  const after = await page.evaluate(() => ({ nook: window.__room03.nookViewInfo(), target: window.__room03.controls.target.toArray(), min: window.__room03.controls.minDistance, az: [window.__room03.controls.minAzimuthAngle, window.__room03.controls.maxAzimuthAngle], azimuth: window.__room03.controls.getAzimuthalAngle() }));
  expect(after.nook).toBeNull();
  expect(after.target).toEqual(initial.target);
  expect(after.min).toBe(initial.min);
  expect(after.az).toEqual(initial.az);
  expect(Math.abs(Math.abs(after.azimuth) - Math.PI)).toBeLessThan(0.05);
  // Nook -> standing view works too, and back to orbit restores the orbit from before the nook.
  await nook.click();
  await center.click();
  expect(await page.evaluate(() => window.__room03.nookViewInfo())).toBeNull();
  expect(await page.evaluate(() => window.__room03.centerViewInfo())).not.toBeNull();
  await center.click();
  expect(await page.evaluate(() => window.__room03.controls.target.toArray())).toEqual(initial.target);
  await page.locator("#lang").click();
  await expect(nook).toHaveText("Closer to the nook");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "no horizontal overflow at 390 px").toBeLessThanOrEqual(0);
  const boxes = await Promise.all([center, plaque, nook, page.locator("#immersiveEnter")].map((l) => l.boundingBox()));
  const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(overlap(boxes[i], boxes[j]), `buttons ${i} and ${j} do not overlap`).toBe(false);
  if (QA) await page.locator(".room").screenshot({ path: `${QA}/nook-button-390-en.png` });
});
