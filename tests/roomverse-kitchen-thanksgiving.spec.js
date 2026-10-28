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
  await page.waitForFunction(() => {
    const info = window.__room03.info();
    return info.screenContent.ready && info.courtyardMap === "courtyard-v1";
  });
}

test("Thanksgiving changes the light, the screen, and the courtyard, and adds no props", async ({ page }) => {
  await loadRoom(page, 1440);
  await expect(page.getByRole("button", { name: "感恩節" })).toBeVisible();
  const propKeys = await page.evaluate(() => Object.keys(window.__room03.info().propBounds));
  expect(propKeys).toHaveLength(7);
  expect(propKeys.join(" ")).not.toMatch(/pumpkin|wreath|candle|apple/i);

  await page.evaluate(() => window.__room03.setMood("thanksgiving"));
  await page.waitForFunction(() => {
    const info = window.__room03.info();
    return info.screenContent.map && info.courtyardMap === "courtyard-autumn-v1";
  });
  const applied = await page.evaluate(() => {
    const info = window.__room03.info();
    const metrics = info.lightMetrics;
    const lights = info.lamps.lights;
    const intensities = [metrics.hemi, metrics.ambient, metrics.sun, metrics.pendant, metrics.under, metrics.side, lights.floor.intensity, lights.table.intensity, lights.screenCool.intensity];
    return {
      on: intensities.filter((value) => value > 0).length,
      screenCool: lights.screenCool.color,
      screenCoolOn: lights.screenCool.intensity,
      screen: info.screenContent,
      courtyard: info.courtyardMap,
      props: Object.keys(info.propBounds).length,
      fields: Object.keys(info.moodLook.moods.thanksgiving).sort().join(),
      required: [...info.moodLook.fields].sort().join(),
    };
  });
  expect(applied.fields).toBe(applied.required);
  expect(applied.on).toBeLessThanOrEqual(7);
  expect(applied.screenCoolOn).toBe(0);
  expect(applied.screen.map).toBe(true);
  expect(applied.screen.asset).toBe("screen-thanksgiving-parade-v1");
  expect(applied.screen.toneMapped).toBe(false);
  expect(applied.courtyard).toBe("courtyard-autumn-v1");
  expect(applied.props).toBe(7);

  const desktop = await measure(page, 1440);
  console.log("Room 03 thanksgiving desktop:", JSON.stringify(desktop));

  await page.evaluate(() => window.__room03.setMood("golden"));
  const restored = await page.evaluate(() => {
    const info = window.__room03.info();
    return { map: info.screenContent.map, courtyard: info.courtyardMap, color: info.screenContent.color };
  });
  expect(restored.map).toBe(false);
  expect(restored.color).toBe(0x171918);
  expect(restored.courtyard).toBe("courtyard-v1");

  await page.locator("#lang").click();
  await expect(page.getByRole("button", { name: "Thanksgiving" })).toBeVisible();

  await loadRoom(page, 390);
  const mobile = await measure(page, 390);
  console.log("Room 03 thanksgiving mobile:", JSON.stringify(mobile));
});

async function measure(page, width) {
  await page.evaluate(() => window.__room03.setMood("thanksgiving"));
  await page.waitForFunction(() => window.__room03.info().courtyardMap === "courtyard-autumn-v1");
  const samples = {};
  for (const degrees of ANGLES) {
    await page.evaluate((value) => window.__room03.setView(value * Math.PI / 180), degrees);
    if (QA) await page.locator(".room").screenshot({ path: `${QA}/thanksgiving-${width}-${degrees}.png` });
    const sample = await page.evaluate(() => {
      const room = window.__room03;
      const frame = room.samplePixels({ left: 0, top: 0, width: 1, height: 1 });
      const rightWall = room.samplePixels({ left: 0.72, top: 0.22, width: 0.16, height: 0.16 });
      return { frame, rightWall };
    });
    expect(sample.frame.blownRatio, `${width}px ${degrees}° blown`).toBeLessThanOrEqual(0.01);
    expect(sample.frame.meanLuminance, `${width}px ${degrees}° mean`).toBeGreaterThanOrEqual(40);
    expect(sample.frame.darkRatio, `${width}px ${degrees}° dark`).toBeLessThanOrEqual(0.45);
    if (degrees === 180) {
      expect(sample.rightWall.blue, `${width}px right wall`).toBeLessThan(sample.rightWall.red);
      expect(sample.rightWall.blownRatio, `${width}px right wall blown`).toBeLessThanOrEqual(0.01);
    }
    samples[degrees] = {
      mean: sample.frame.meanLuminance,
      std: sample.frame.luminanceStdDev,
      blown: sample.frame.blownRatio,
      dark: sample.frame.darkRatio,
      rightWall: { red: sample.rightWall.red, green: sample.rightWall.green, blue: sample.rightWall.blue, blown: sample.rightWall.blownRatio },
    };
  }
  return samples;
}
