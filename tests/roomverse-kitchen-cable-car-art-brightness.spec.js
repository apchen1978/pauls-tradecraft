import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;

test("the cable-car print dims by mood without changing the other atlas prints or scene budget", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info?.().wallArtLoaded && window.__room03.info().yardLoaded);
  await page.evaluate(() => {
    const { camera, controls } = window.__room03;
    controls.minDistance = 0.2;
    controls.maxDistance = 12;
    controls.minAzimuthAngle = -Math.PI;
    controls.maxAzimuthAngle = Math.PI;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.05;
    camera.position.set(2.34, 1.52, -0.02);
    camera.fov = 42;
    camera.updateProjectionMatrix();
    controls.target.set(2.94, 1.52, -0.02);
    controls.update();
    window.__room03.render();
  });

  const capture = async (mood) => {
    await page.evaluate((name) => window.__room03.setMood(name), mood);
    await page.waitForTimeout(120);
    const info = await page.evaluate(() => window.__room03.info());
    if (QA) {
      mkdirSync(QA, { recursive: true });
      await page.screenshot({ path: join(QA, `cable-car-${mood}-1440.png`) });
    }
    return info;
  };

  const daylight = await capture("daylight");
  const golden = await capture("golden");
  const night = await capture("night");
  const movie = await capture("movie");

  expect(golden.wallArtAssets.cableCar.matFraction, "the cable-car print uses a slightly narrower cream mat").toBe(0.05);
  expect(golden.wallArtAssets.redwoodPath.matFraction, "the redwood print keeps its existing mat").toBe(0.07);
  expect(golden.wallArtAssets.lampWallMatFraction, "the lamp-wall print keeps its existing mat").toBe(0.07);

  const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const dayCable = luminance(daylight.wallArtMean["cable-car"]);
  const goldenCable = luminance(golden.wallArtMean["cable-car"]);
  const nightCable = luminance(night.wallArtMean["cable-car"]);
  const movieCable = luminance(movie.wallArtMean["cable-car"]);

  expect(goldenCable).toBeLessThan(dayCable * 0.9);
  expect(nightCable).toBeLessThan(dayCable * 0.9);
  expect(movieCable).toBeLessThan(dayCable * 0.9);
  for (const info of [golden, night, movie]) {
    expect(info.wallArtMean["redwood-path"]).toEqual(daylight.wallArtMean["redwood-path"]);
    expect(info.wallArtMean["lamp-wall"]).toEqual(daylight.wallArtMean["lamp-wall"]);
    expect(info.vertices).toBe(daylight.vertices);
    expect(info.meshes).toBe(daylight.meshes);
  }
  console.log("Cable-car print luminance by mood:", JSON.stringify({ daylight: dayCable, golden: goldenCable, night: nightCable, movie: movieCable }));
});
