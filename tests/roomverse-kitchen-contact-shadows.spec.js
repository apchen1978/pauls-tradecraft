import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const output = process.env.ROOM03_CONTACT_QA;
const phase = process.env.ROOM03_CONTACT_PHASE || "after";

for (const width of [1440, 390]) {
  for (const mood of ["golden", "night"]) {
    test(`Room 03 contact review ${width}px ${mood}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto("/prototype/roomverse-3d/kitchen/?lang=zh");
      await page.waitForFunction(() => {
        const info = window.__room03?.info();
        return info?.yardLoaded && info?.wallArtLoaded && info?.drawCallsLastFrame > 0;
      });
      await page.evaluate((name) => window.__room03.setMood(name), mood);

      const initial = await page.evaluate(() => {
        const { camera, controls, info } = window.__room03;
        return {
          target: controls.target.toArray(),
          offset: camera.position.clone().sub(controls.target).toArray(),
          info: info(),
        };
      });
      if (output) {
        mkdirSync(output, { recursive: true });
        await page.locator(".room").screenshot({ path: `${output}/${phase}-${width}-${mood}-wide.png` });
      }

      await page.evaluate(({ offset }) => {
        const { camera, controls, render } = window.__room03;
        const focus = [0, 0.76, 0.5];
        const length = Math.hypot(...offset);
        controls.target.set(...focus);
        controls.minDistance = 2.45;
        controls.maxDistance = 5;
        camera.position.set(...focus.map((value, index) => value + offset[index] / length * 2.7));
        controls.update();
        render();
      }, initial);
      if (output) {
        await page.locator(".room").screenshot({ path: `${output}/${phase}-${width}-${mood}-dining-close.png` });
        writeFileSync(`${output}/${phase}-${width}-${mood}-metrics.json`, JSON.stringify(initial.info, null, 2));
      }
      expect(initial.info.vertices).toBeGreaterThan(0);
      expect(initial.info.triangles).toBeGreaterThan(0);
      expect(initial.info.meshes).toBeGreaterThan(0);
      // Old: 108 vertices, including the fig-pot plane. That plane left with the plant, so 104.
      // Four ottoman foot decals: 26 -> 30 patches, 104 -> 120 vertices.
      expect(initial.info.categories["contact-shadow"]).toEqual({ vertices: 120, meshes: 1 });
    });
  }
}
