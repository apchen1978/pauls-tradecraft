import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
const MOODS = ["golden", "night", "movie"];
// Clean origin/main 261fbc4 measured 39,105 vertices / 96 meshes; this branch adds 2,498 vertices / 3 meshes. Draw calls are captured per viewport and yaw below.
const BASELINE = {
  "1440|golden|0": { vertices: 39105, drawCalls: 65 },
  "1440|night|0": { vertices: 39105, drawCalls: 65 },
  "1440|movie|0": { vertices: 39105, drawCalls: 63 },
  "1440|golden|90": { vertices: 39105, drawCalls: 67 },
  "1440|night|90": { vertices: 39105, drawCalls: 67 },
  "1440|movie|90": { vertices: 39105, drawCalls: 67 },
  "390|golden|0": { vertices: 39105, drawCalls: 61 },
  "390|night|0": { vertices: 39105, drawCalls: 61 },
  "390|movie|0": { vertices: 39105, drawCalls: 59 },
  "390|golden|90": { vertices: 39105, drawCalls: 58 },
  "390|night|90": { vertices: 39105, drawCalls: 58 },
  "390|movie|90": { vertices: 39105, drawCalls: 57 },
};
if (QA) mkdirSync(QA, { recursive: true });

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => Boolean(window.__room03?.info));
  await page.waitForFunction(() => {
    const info = window.__room03.info();
    return info.yardLoaded && info.wallArtLoaded && info.drawCallsLastFrame > 0;
  });
}

test("red Dutch oven is dimensioned, fitted and within geometry budgets", async ({ page }) => {
  const measurements = [];

  for (const width of [1440, 390]) {
    await loadRoom(page, width);
    for (const mood of MOODS) {
      await page.locator(`#moods button[data-mood="${mood}"]`).click();
      await page.waitForFunction((target) => window.__room03.info().mood === target, mood);

      for (const [yaw, angle] of [[0, 0], [90, Math.PI / 2]]) {
        await page.evaluate((azimuth) => window.__room03.setView(azimuth), angle);
        const info = await page.evaluate(() => window.__room03.info());
        const potFit = info.footToBody.find((item) => item.item === "terracotta pot");
        measurements.push({
          width,
          mood,
          yaw,
          vertices: info.vertices,
          triangles: info.triangles,
          meshes: info.meshes,
          drawCalls: info.drawCallsLastFrame,
          pixelRatio: info.pixelRatio,
          canvas: info.canvas,
          cooktopGapMm: potFit?.gapMm ?? null,
          redPot: potFit?.geometry ?? null,
        });
        if (QA) await page.locator(".room").screenshot({ path: `${QA}/room03-pot-${width}-${yaw}-${mood}.png` });
      }
    }
  }

  console.log("Room 03 red pot geometry measurements:", JSON.stringify(measurements));
  const redPot = measurements[0].redPot;
  expect(redPot, "builder reports dimensions and measured geometry for the red pot").toBeTruthy();
  expect(redPot.position, "pot stays centered over the existing burner position").toEqual([0.82, 0.9975, -2.02]);
  expect(redPot.body.size[0], "24 cm body diameter from geometry bounds").toBeGreaterThanOrEqual(0.235);
  expect(redPot.body.size[0]).toBeLessThanOrEqual(0.245);
  expect(redPot.body.size[2]).toBeGreaterThanOrEqual(0.235);
  expect(redPot.body.size[2]).toBeLessThanOrEqual(0.245);
  expect(redPot.bounds.size[1], "pot including lid and knob from geometry bounds").toBeGreaterThanOrEqual(0.11);
  expect(redPot.bounds.size[1]).toBeLessThanOrEqual(0.12);
  expect(redPot.leftHandleOutstandMm, "left loop handle outward projection").toBeLessThanOrEqual(45);
  expect(redPot.rightHandleOutstandMm, "right loop handle outward projection").toBeLessThanOrEqual(45);
  expect(redPot.leftHandleOutstandMm, "left loop handle keeps the intended short 3-4 cm projection").toBeGreaterThanOrEqual(30);
  expect(redPot.rightHandleOutstandMm, "right loop handle keeps the intended short 3-4 cm projection").toBeGreaterThanOrEqual(30);
  expect(Math.abs(measurements[0].cooktopGapMm), "pot base sits on cooktop within 1 mm").toBeLessThanOrEqual(1);
  expect(redPot.handleLidClearanceMm, "short handles do not intersect the lid").toBeGreaterThanOrEqual(0);
  expect(redPot.lidRimOverlapMm, "lid rim rests on pot rim with a small positive overlap").toBeGreaterThanOrEqual(0);
  expect(redPot.lidRimOverlapMm).toBeLessThanOrEqual(6);
  expect(redPot.bodyColor).toBe("#9b211e");
  expect(redPot.knobColor).toBe("#92918c");
  expect(redPot.meshes, "body, rim, lid, two handles and knob").toBe(6);

  for (const current of measurements) {
    expect(current.redPot, `${current.width}px ${current.mood} ${current.yaw}deg geometry report`).toBeTruthy();
    expect(Math.abs(current.cooktopGapMm), `${current.width}px ${current.mood} ${current.yaw}deg cooktop fit`).toBeLessThanOrEqual(1);
  }

  for (const current of measurements) {
    const old = BASELINE[`${current.width}|${current.mood}|${current.yaw}`];
    expect(old, "baseline metrics exist for each viewport, mood and camera direction").toBeTruthy();
    expect(current.vertices - old.vertices, "net change over the 39,105 baseline: living details 2,335, dish dryer and handle-less doors -308, credenza 1,480 = 3,507 (old cap 3,200 was for the living details alone)").toBeLessThanOrEqual(3510);
    expect(current.drawCalls - old.drawCalls, `${current.width}px ${current.mood} ${current.yaw}deg: ${current.drawCalls} current vs ${old.drawCalls} baseline, cap +6 (the right-wall credenza adds one; was +5, before that +2: the entry nook's bench, cushions, pillows and rug are visible at 90 degrees, the coffee maker's display too; the gas hob batching takes three away elsewhere)`).toBeLessThanOrEqual(6);
  }
});
