import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const output = process.env.ROOM03_VIEW_QA;
const phase = process.env.ROOM03_VIEW_PHASE || "after";
const views = ["default", "az-min", "az-max", "polar-min", "polar-max", "distance-max", "az-min-distance-max", "shared-left", "shared-right"];

async function setOrbit(page, view, baseline) {
  return page.evaluate(({ name, baseline }) => {
    const { camera, controls, render } = window.__room03;
    const target = controls.target;
    const { theta: defaultTheta, phi: defaultPhi } = baseline;
    const radius = name.includes("distance-max") ? controls.maxDistance : baseline.radius;
    const theta = name === "az-min" || name === "az-min-distance-max" ? controls.minAzimuthAngle : name === "az-max" ? controls.maxAzimuthAngle : name === "shared-left" ? -0.2 : name === "shared-right" ? 0.2 : defaultTheta;
    const phi = name === "polar-min" ? controls.minPolarAngle : name === "polar-max" ? controls.maxPolarAngle : defaultPhi;
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta),
    );
    controls.update();
    render();
    const info = window.__room03.info();
    return {
      view: name,
      theta: controls.getAzimuthalAngle(),
      phi: controls.getPolarAngle(),
      limits: {
        azMin: controls.minAzimuthAngle,
        azMax: controls.maxAzimuthAngle,
        polarMin: controls.minPolarAngle,
        polarMax: controls.maxPolarAngle,
        distanceMin: controls.minDistance,
        distanceMax: controls.maxDistance,
      },
      vertices: info.vertices,
      triangles: info.triangles,
      meshes: info.meshes,
      drawCallsLastFrame: info.drawCallsLastFrame,
      lounge: info.lounge.projectedCenter,
      wok: info.projectedRegions.wokOpening,
      pendant: info.projectedRegions.pendant,
    };
  }, { name: view, baseline });
}

for (const width of [1440, 390]) {
  test(`Room 03 view limits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/prototype/roomverse-3d/kitchen/?lang=zh");
    await page.waitForFunction(() => {
      const room = window.__room03?.info();
      return room?.yardLoaded && room?.wallArtLoaded && room?.drawCallsLastFrame > 0;
    });
    const baseline = await page.evaluate(() => {
      const { camera, controls } = window.__room03;
      const offset = camera.position.clone().sub(controls.target);
      return { radius: offset.length(), theta: Math.atan2(offset.x, offset.z), phi: Math.acos(offset.y / offset.length()) };
    });
    const records = [];
    for (const mood of ["golden", "night"]) {
      await page.evaluate((value) => window.__room03.setMood(value), mood);
      for (const view of views) {
        const record = await setOrbit(page, view, baseline);
        records.push({ mood, ...record });
        if (output) {
          mkdirSync(output, { recursive: true });
          await page.locator(".room").screenshot({ path: `${output}/${phase}-${width}-${mood}-${view}.png` });
        }
      }
    }
    if (output) writeFileSync(`${output}/${phase}-${width}-metrics.json`, JSON.stringify(records, null, 2));
    expect(records).toHaveLength(18);
    expect(records.every(({ vertices }) => vertices === records[0].vertices)).toBe(true);
    expect(records.every(({ meshes }) => meshes === records[0].meshes)).toBe(true);
    if (phase === "after") {
      const limits = records[0].limits;
      expect(limits.polarMax, "camera must stay above the floor-facing horizon").toBeLessThan(Math.PI / 2);
      expect(limits.azMax - limits.azMin, "Room 03 must retain useful left/right exploration").toBeGreaterThanOrEqual(0.55);
      expect(limits.distanceMax, "zoom limit must match the reviewed camera preset").toBeCloseTo(width === 390 ? 5 : 5.3, 2);
      expect(limits.distanceMax, "default camera must remain within the zoom limit").toBeGreaterThanOrEqual(baseline.radius);
      expect(limits.distanceMax - limits.distanceMin, "mobile zoom range must remain useful").toBeGreaterThanOrEqual(width === 390 ? 0.49 : 0.79);
      for (const mood of ["golden", "night"]) {
        const sides = records.filter((record) => record.mood === mood && ["az-min", "az-max"].includes(record.view));
        expect(sides.some((record) => Math.abs(record.lounge[0]) < 1), "window chair must stay reachable").toBe(true);
        expect(sides.some((record) => Math.abs(record.wok[0]) < 1), "wok kitchen must stay reachable").toBe(true);
        expect(Math.abs(sides[0].lounge[0] - sides[1].lounge[0]), "rotation must reveal a distinct window-chair angle").toBeGreaterThan(0.08);
        expect(Math.abs(sides[0].wok[0] - sides[1].wok[0]), "rotation must reveal a distinct wok-kitchen angle").toBeGreaterThan(0.08);
      }
    }
  });
}
