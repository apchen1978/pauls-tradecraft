import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

const ANGLES = [0, 90, 180, 270];

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info().drawCallsLastFrame > 0);
  await page.waitForFunction(() => window.__room03.info().screenContent.ready);
}

test("movie night turns the pendant off, lights the city screen, and stays readable", async ({ page }) => {
  await loadRoom(page, 1440);
  await expect(page.getByRole("button", { name: "追劇夜" })).toBeVisible();

  const before = await page.evaluate(() => window.__room03.info().renderFrame);
  await page.evaluate(() => window.__room03.setMood("movie"));
  const after = await page.evaluate(() => window.__room03.info().renderFrame);
  expect(after - before, "switching to movie renders once").toBe(1);

  const applied = await page.evaluate(() => {
    const info = window.__room03.info();
    const metrics = info.lightMetrics;
    const lights = info.lamps.lights;
    const intensities = [metrics.hemi, metrics.ambient, metrics.sun, metrics.pendant, metrics.under, metrics.side, lights.floor.intensity, lights.table.intensity, lights.screenCool.intensity];
    return {
      mood: info.mood,
      pendant: metrics.pendant,
      under: metrics.under,
      side: metrics.side,
      screen: info.screenContent,
      lights,
      on: intensities.filter((value) => value > 0).length,
      look: info.moodLook.moods.movie,
    };
  });
  expect(applied.mood).toBe("movie");
  expect(applied.pendant, "central pendant is off").toBe(0);
  expect(applied.lights.floor.intensity).toBe(applied.look.floorLamp);
  expect(applied.lights.table.intensity).toBe(applied.look.tableLamp);
  expect(applied.lights.screenCool.intensity).toBe(applied.look.screenCool);
  expect(applied.lights.screenCool.color).toBe(0xcdd6f0);
  expect(applied.lights.floor.castShadow).toBe(false);
  expect(applied.lights.table.castShadow).toBe(false);
  expect(applied.lights.screenCool.castShadow).toBe(false);
  expect(applied.on, "at most 7 true lights on").toBeLessThanOrEqual(7);
  expect(applied.screen.map).toBe(true);
  expect(applied.screen.toneMapped).toBe(false);
  expect(applied.screen.color).toBe(0xffffff);
  expect(applied.look.screenMap).toBe("screen-movie-city-night-v1");

  const desktop = await measureViews(page, 1440);
  console.log("Room 03 movie night samples:", JSON.stringify(desktop));

  await page.evaluate(() => window.__room03.setMood("golden"));
  const restored = await page.evaluate(() => window.__room03.info().screenContent);
  expect(restored.map, "leaving movie clears the city map").toBe(false);
  expect(restored.color).toBe(0x171918);
  expect(restored.toneMapped).toBe(true);

  await page.locator("#lang").click();
  await expect(page.getByRole("button", { name: "Movie night" })).toBeVisible();
  const movieButton = page.locator('#moods button[data-mood="movie"]');
  await movieButton.click();
  await expect(movieButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('#moods button[data-mood="golden"]')).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator('#moods button[data-mood="night"]')).toHaveAttribute("aria-pressed", "false");

  await loadRoom(page, 390);
  const mobile = await measureViews(page, 390);
  console.log("Room 03 movie night mobile samples:", JSON.stringify(mobile));
});

async function measureViews(page, width) {
  const samples = {};
  for (const degrees of ANGLES) {
    await page.evaluate((value) => window.__room03.setView(value * Math.PI / 180), degrees);
    await page.evaluate(() => window.__room03.setMood("movie"));
    if (QA) await page.locator(".room").screenshot({ path: `${QA}/movie-${width}-${degrees}.png` });
    const sample = await page.evaluate(() => {
      const room = window.__room03;
      const frame = room.samplePixels({ left: 0, top: 0, width: 1, height: 1 });
      const project = (x, y, z) => {
        const point = room.camera.position.clone();
        point.set(x, y, z);
        return point.project(room.camera).toArray();
      };
      // Image-right third at 180° is the wall beside the screen, not the lamp shade.
      const rightWall = room.samplePixels({ left: 0.70, top: 0.40, width: 0.18, height: 0.28 });
      const floorWall = project(-2.45, 1.05, 1.5);
      return {
        frame,
        rightWall,
        floorWall: floorWall[2] < 1 && Math.abs(floorWall[0]) < 1.2 ? room.sampleNdc(floorWall, 0.025) : null,
        floorWallNdc: floorWall,
      };
    });
    expect(sample.frame.blownRatio, `${width}px ${degrees}° blown`).toBeLessThanOrEqual(0.01);
    expect(sample.frame.meanLuminance, `${width}px ${degrees}° mean`).toBeGreaterThanOrEqual(40);
    expect(sample.frame.darkRatio, `${width}px ${degrees}° dark`).toBeLessThanOrEqual(0.45);
    if (degrees === 180) {
      expect(sample.rightWall.blue, `${width}px 180° right wall is not purple`).toBeLessThan(sample.rightWall.red);
      expect(sample.rightWall.meanLuminance, `${width}px 180° right wall is the wall, not a lamp`).toBeLessThan(200);
      expect(sample.rightWall.blownRatio, `${width}px 180° right wall blown`).toBeLessThanOrEqual(0.01);
    }
    if (degrees === 90) {
      expect(sample.floorWall, `${width}px 90° sees the wall by the floor lamp`).toBeTruthy();
      expect(sample.floorWall.blownRatio, `${width}px floor-lamp wall blown`).toBeLessThanOrEqual(0.01);
      expect(sample.floorWall.meanLuminance, `${width}px floor-lamp wall mean`).toBeLessThan(230);
    }
    samples[degrees] = {
      mean: sample.frame.meanLuminance,
      std: sample.frame.luminanceStdDev,
      blown: sample.frame.blownRatio,
      dark: sample.frame.darkRatio,
      rightWall: { red: sample.rightWall.red, green: sample.rightWall.green, blue: sample.rightWall.blue, mean: sample.rightWall.meanLuminance, blown: sample.rightWall.blownRatio },
      floorWall: sample.floorWall ? { mean: sample.floorWall.meanLuminance, blown: sample.floorWall.blownRatio, red: sample.floorWall.red, blue: sample.floorWall.blue, ndc: sample.floorWallNdc } : null,
    };
  }
  return samples;
}
