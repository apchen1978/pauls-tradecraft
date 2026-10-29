import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

const ANGLES = [0, 90, 180, 270];
const MOODS = ["dinner", "sunday"];

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info().drawCallsLastFrame > 0);
}

test("dinner and sunday morning are readable, and five mood buttons stay usable", async ({ page }) => {
  await loadRoom(page, 1440);
  const labels = await page.locator("#moods button").allTextContents();
  // Old: five labels, ending at 週日早晨. Thanksgiving is the sixth mood.
  expect(labels).toEqual(["日光", "黃金時刻", "追劇夜", "夜晚", "晚餐", "週日早晨", "感恩節"]);
  await page.locator('#moods button[data-mood="dinner"]').click();
  const pressed = await page.locator('#moods button[aria-pressed="true"]').count();
  expect(pressed).toBe(1);
  await expect(page.locator('#moods button[data-mood="dinner"]')).toHaveAttribute("aria-pressed", "true");

  await page.locator('#moods button[data-mood="golden"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('#moods button[data-mood="movie"]')).toBeFocused();
  await expect(page.locator('#moods button[data-mood="dinner"]')).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('#moods button[data-mood="golden"]')).toBeFocused();

  const desktop = {};
  for (const mood of MOODS) desktop[mood] = await measureMood(page, 1440, mood);
  console.log("Room 03 dinner sunday desktop:", JSON.stringify(desktop));

  await page.locator("#lang").click();
  await expect(page.getByRole("button", { name: "Dinner" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sunday morning" })).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadRoom(page, 390);
  const motion = await page.locator("#moods button").first().evaluate((button) => getComputedStyle(button).transitionDuration);
  expect(motion === "0s" || motion === "0ms" || motion === "none").toBe(true);
  const rows = await page.locator("#moods button").evaluateAll((nodes) => new Set(nodes.map((node) => Math.round(node.getBoundingClientRect().top))).size);
  expect(rows, "390px mood buttons use more than one row").toBeGreaterThanOrEqual(2);
  for (const button of await page.locator("#moods button").all()) {
    const box = await button.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const pageWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client + 1);

  const mobile = {};
  for (const mood of MOODS) mobile[mood] = await measureMood(page, 390, mood);
  console.log("Room 03 dinner sunday mobile:", JSON.stringify(mobile));

  await page.locator("#immersiveEnter").click();
  await expect(page.locator(".room")).toHaveClass(/is-immersive/);
  const snap = await page.locator("#moods").evaluate((group) => getComputedStyle(group).scrollSnapType);
  expect(snap).toContain("x");
  await page.locator('#moods button[data-mood="sunday"]').click();
  await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("sunday");
  await page.locator('#moods button[data-mood="dinner"]').click();
  await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("dinner");
  if (QA) await page.locator(".room").screenshot({ path: `${QA}/dinner-390-fullscreen.png` });
});

async function measureMood(page, width, mood) {
  const look = await page.evaluate((name) => {
    window.__room03.setMood(name);
    const info = window.__room03.info();
    const metrics = info.lightMetrics;
    const lights = info.lamps.lights;
    const intensities = [metrics.hemi, metrics.ambient, metrics.sun, metrics.pendant, metrics.under, metrics.side, lights.floor.intensity, lights.table.intensity, lights.screenCool.intensity];
    return {
      on: intensities.filter((value) => value > 0).length,
      pendant: metrics.pendant,
      screenCool: lights.screenCool.intensity,
      floor: lights.floor.intensity,
      table: lights.table.intensity,
      screenMap: info.screenContent.map,
      fields: Object.keys(info.moodLook.moods[name]).sort().join(),
      required: [...info.moodLook.fields].sort().join(),
    };
  }, mood);
  expect(look.fields, mood).toBe(look.required);
  expect(look.on, `${mood} lights on`).toBeLessThanOrEqual(7);
  expect(look.screenCool, `${mood} screen cool stays off`).toBe(0);
  expect(look.screenMap, `${mood} does not keep the city screen`).toBe(false);
  if (mood === "dinner") {
    expect(look.pendant).toBeGreaterThan(0);
    expect(look.table).toBeGreaterThan(0);
  }
  if (mood === "sunday") {
    expect(look.pendant).toBe(0);
    expect(look.floor).toBeGreaterThan(0);
    expect(look.table).toBeGreaterThan(0);
  }

  const samples = {};
  for (const degrees of ANGLES) {
    await page.evaluate((value) => window.__room03.setView(value * Math.PI / 180), degrees);
    if (QA) await page.locator(".room").screenshot({ path: `${QA}/${mood}-${width}-${degrees}.png` });
    const sample = await page.evaluate(() => {
      const room = window.__room03;
      const frame = room.samplePixels({ left: 0, top: 0, width: 1, height: 1 });
      const rightWall = room.samplePixels({ left: 0.72, top: 0.22, width: 0.16, height: 0.16 });
      const point = room.camera.position.clone();
      point.set(-2.45, 1.05, 1.5);
      const floorNdc = point.project(room.camera).toArray();
      const floorWall = floorNdc[2] < 1 && Math.abs(floorNdc[0]) < 1.2 ? room.sampleNdc(floorNdc, 0.025) : null;
      return { frame, rightWall, floorWall };
    });
    expect(sample.frame.blownRatio, `${width}px ${mood} ${degrees}° blown`).toBeLessThanOrEqual(0.01);
    expect(sample.frame.meanLuminance, `${width}px ${mood} ${degrees}° mean`).toBeGreaterThanOrEqual(40);
    expect(sample.frame.darkRatio, `${width}px ${mood} ${degrees}° dark`).toBeLessThanOrEqual(0.45);
    if (degrees === 180) {
      expect(sample.rightWall.blue, `${width}px ${mood} right wall`).toBeLessThan(sample.rightWall.red);
      expect(sample.rightWall.blownRatio, `${width}px ${mood} right wall blown`).toBeLessThanOrEqual(0.01);
    }
    if (degrees === 90 && sample.floorWall) {
      expect(sample.floorWall.blownRatio, `${width}px ${mood} floor-lamp wall`).toBeLessThanOrEqual(0.01);
    }
    samples[degrees] = {
      mean: sample.frame.meanLuminance,
      std: sample.frame.luminanceStdDev,
      blown: sample.frame.blownRatio,
      dark: sample.frame.darkRatio,
      rightWall: { red: sample.rightWall.red, green: sample.rightWall.green, blue: sample.rightWall.blue },
      floorWall: sample.floorWall ? { mean: sample.floorWall.meanLuminance, blown: sample.floorWall.blownRatio } : null,
    };
  }
  return samples;
}
