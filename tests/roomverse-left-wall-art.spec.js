import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const QA = "docs/qa/roomverse-left-wall-art";

for (const width of [390, 1440]) {
  test(`left-wall small print at ${width}px: delayed, 4:3, aligned and clear`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
    const requests = [], printRequests = [], alternateRequests = [], errors = [];
    page.on("request", (r) => {
      if (r.url().includes("left-wall-harbor-dusk")) requests.push(r.url());
      if (r.url().includes("room01-wall-print-v2-botanical-window.webp")) printRequests.push(r.url());
      if (r.url().includes("room01-wall-print-v2-neighborhood-corner.webp")) alternateRequests.push(r.url());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${PAGE}?lang=zh&mood=rain`);
    expect(requests).toHaveLength(0);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room);
    expect(requests).toHaveLength(0);
    expect((await page.evaluate(() => __room.leftWallArt())).built).toBe(false);
    expect(await page.evaluate(() => __room.leftWallSmallPrint().built)).toBe(false);
    expect(printRequests).toHaveLength(0); // small print must not join the existing idle preload
    expect(alternateRequests).toHaveLength(0); // candidate 2 stays disconnected
    await page.evaluate(() => Promise.all([__room.loadLeftWallArt(), __room.loadRightWallArt(), __room.loadConsoleDecor(), __room.loadTvWallTextures(), __room.loadDoorTexture()])); // reproduce the complete idle-loaded room before measuring the small-print delta
    await page.waitForFunction(() => __room.leftWallArt().loaded);
    await page.waitForTimeout(500);
    expect((await stat("public/prototype/roomverse-3d/art/room01-wall-print-v2-botanical-window.webp")).size).toBeLessThanOrEqual(60000);
    expect((await stat("public/prototype/roomverse-3d/art/room01-wall-print-v2-neighborhood-corner.webp")).size).toBeLessThanOrEqual(60000);
    const beforePoster = await page.evaluate(() => __room.geometryMetrics());
    await page.evaluate(() => __room.setOrbitAngle(90));
    await page.waitForFunction(() => __room.leftWallSmallPrint().loaded);
    const afterPoster = await page.evaluate(() => __room.geometryMetrics());
    const poster = await page.evaluate(() => __room.leftWallSmallPrint());
    expect(printRequests).toHaveLength(1);
    expect(alternateRequests).toHaveLength(0);
    expect(poster.ready).toBe(true);
    expect(poster.file).toBe("room01-wall-print-v2-botanical-window.webp");
    expect(poster.size).toEqual([1000, 750]);
    expect(poster.place).toEqual({ x: -2.592, y: 1.6225, z: -1.07 });
    expect(poster.image.max[1] - poster.image.min[1]).toBeCloseTo(0.375, 5);
    expect(poster.image.max[2] - poster.image.min[2]).toBeCloseTo(.5, 5);
    expect(poster.bounds.max[1]).toBeCloseTo(poster.boardBounds.max[1], 2);
    expect(Math.abs(poster.bounds.max[1] - poster.boardBounds.max[1])).toBeLessThanOrEqual(.01);
    expect(poster.vertices).toBe(124);
    expect(poster.meshes).toBe(6);
    expect(afterPoster.vertices - beforePoster.vertices).toBe(poster.vertices);
    expect(afterPoster.meshes - beforePoster.meshes).toBe(poster.meshes);
    for (const name of ["plant", "board", "couplet", "harbor"]) {
      expect(poster.clearances[name].intersects, `${name} overlap`).toBe(false);
      expect(poster.clearances[name].distance, `${name} clearance`).toBeGreaterThanOrEqual(.06);
    }
    expect(poster.screenRect.x).toBeGreaterThanOrEqual(0);
    expect(poster.screenRect.y).toBeGreaterThanOrEqual(0);
    expect(poster.screenRect.x + poster.screenRect.width).toBeLessThanOrEqual(width);
    expect(poster.screenRect.y + poster.screenRect.height).toBeLessThanOrEqual(width === 390 ? 844 : 900);
    expect((await page.evaluate(() => __room.leftWallArt())).ready).toBe(true);
    const art = await page.evaluate(() => __room.leftWallArt());
    expect(art.loaded).toBe(true);
    expect(art.file).toBe(width === 390 ? "left-wall-harbor-dusk-mobile-v1.webp" : "left-wall-harbor-dusk-v1.webp");
    expect(art.size).toEqual(width === 390 ? [800, 450] : [1280, 720]);
    expect(art.place).toEqual({ x: -2.592, y: 1.5, z: 1 });
    expect(art.painting.max[2] - art.painting.min[2]).toBeCloseTo(1.2, 5);
    expect(art.painting.max[1] - art.painting.min[1]).toBeCloseTo(.675, 5);
    expect(art.bounds.min[0]).toBeGreaterThan(-2.6);
    expect(art.bounds.min[2]).toBeGreaterThan(-1.2); // stays on the open front half, away from the lamp and plant
    expect(art.bounds.max[2]).toBeLessThan(2.2);
    expect(art.collisions).toEqual([]);
    await page.evaluate(() => __room.setOrbitAngle(0));
    expect((await page.evaluate(() => __room.plaqueView())).firstHit).toBe("house-plaque");
    expect(await page.evaluate(() => __room.tableLampLighting().lightCount)).toBe(7);
    expect((await page.evaluate(() => __room.leftWallArt())).spot.castShadow).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => __room.loadLeftWallArt());
    expect(requests).toHaveLength(1);
    expect(errors).toEqual([]);
  });
}

test("missing left-wall painting keeps a plain framed canvas and a usable room", async ({ page }) => {
  await page.route("**/left-wall-harbor-dusk*.webp", (route) => route.abort());
  await page.goto(`${PAGE}?lang=zh&mood=tv`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  expect(await page.evaluate(() => __room.loadLeftWallArt())).toBe(false);
  const art = await page.evaluate(() => __room.leftWallArt());
  expect(art.built).toBe(true); expect(art.ready).toBe(true); expect(art.loaded).toBe(false);
  expect(art.collisions).toEqual([]);
  await page.evaluate(() => { __room.set("mood", "family"); __room.setOrbitAngle(90); });
  expect(await page.evaluate(() => __room.postcard().width)).toBeGreaterThan(0);
  await expect(page.locator("#status")).toBeHidden();
});

test("left-wall glow follows the mood and both image variants stay in budget", async ({ page }) => {
  for (const file of ["left-wall-harbor-dusk-v1.webp", "left-wall-harbor-dusk-mobile-v1.webp"]) {
    expect((await stat(`public/prototype/roomverse-3d/tex/${file}`)).size).toBeLessThanOrEqual(90000);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  await page.evaluate(() => __room.loadLeftWallArt());
  const levels = {}, spots = {};
  for (const mood of ["rain", "tv", "family", "tech", "chic", "slow"]) {
    const art = await page.evaluate((m) => { __room.set("mood", m); return __room.leftWallArt(); }, mood);
    levels[mood] = art.glow;
    spots[mood] = art.spot;
    expect(art.spot.castShadow).toBe(true);
    expect(art.spot.shadowMap).toBe(512);
    expect(art.spot.decay).toBe(2);
    expect(art.spot.distance).toBeGreaterThan(1.2);
    expect(art.spot.distance).toBeLessThan(3);
    expect(art.spot.penumbra).toBeGreaterThan(.6);
    expect(art.spot.color).toBe("#ffbe7a");
    expect(art.spot.bulb).toBe(art.spot.color);
    expect(await page.evaluate(() => __room.tableLampLighting().lightCount)).toBe(7);
  }
  const fixture = await page.evaluate(() => __room.leftWallArt().fixture);
  expect(fixture.max[2] - fixture.min[2]).toBeGreaterThan(.3);
  expect(fixture.max[2] - fixture.min[2]).toBeLessThan(.4);
  // Rain and Cozy keep the lamp up. Series night is a little lower. The wash planes stay off:
  // the canvas is lit only by the picture spot.
  for (const mood of ["rain", "tv", "family"]) {
    expect(levels[mood]).toBe(0);
    expect(spots[mood].intensity).toBeGreaterThan(5);
  }
  expect(spots.family.intensity).toBe(spots.rain.intensity);
  expect(spots.tv.intensity).toBeLessThan(spots.rain.intensity);
});

test("left-wall QA: three moods, two widths, front, side and detail", async ({ page }) => {
  test.setTimeout(180000);
  await mkdir(QA, { recursive: true });
  const measured = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=zh&mood=rain`);
    await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
    await page.evaluate(() => Promise.all([__room.loadLeftWallArt(), __room.loadRightWallArt()]));
    for (const [mood, wall] of [["tv", "wine"], ["rain", "original"], ["family", "olive"]]) {
      await page.evaluate(([m, w]) => { __room.set("mood", m); __room.set("wall", w); __room.setOrbitAngle(90); }, [mood, wall]);
      await page.waitForTimeout(100);
      await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}-front.jpg`, type: "jpeg", quality: 92 });
      await page.evaluate(() => __room.setOrbitAngle(270));
      await page.locator("#stage").screenshot({ path: `${QA}/dawn-${mood}-${width}-front.jpg`, type: "jpeg", quality: 92 });
      await page.evaluate(() => __room.setOrbitAngle(90));
      const art = await page.evaluate(() => __room.leftWallArt());
      measured.push({ mood, width, ...art });
      const rect = art.screenRect;
      const canvas = await page.locator("#stage canvas").boundingBox();
      const x = Math.max(0, rect.x - 18), y = Math.max(0, rect.y - 45);
      const right = Math.min(canvas.width, rect.x + rect.width + 18), bottom = Math.min(canvas.height, rect.y + rect.height + 18);
      await page.screenshot({ path: `${QA}/${mood}-${width}-detail.png`, clip: { x: canvas.x + x, y: canvas.y + y, width: right - x, height: bottom - y } });
      await page.evaluate(() => __room.setOrbitAngle(70));
      await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}-side.jpg`, type: "jpeg", quality: 92 });
    }
    await page.evaluate(() => __room.setOrbitAngle(0));
    expect((await page.evaluate(() => __room.plaqueView())).firstHit).toBe("house-plaque");
  }
  execFileSync("python3", ["-c", `
from PIL import Image
from pathlib import Path
d = Path(${JSON.stringify(QA)})
for mood in ["tv", "rain", "family"]:
  for width in [390, 1440]:
    left = Image.open(d / f"{mood}-{width}-front.jpg").convert("RGB")
    right = Image.open(d / f"dawn-{mood}-{width}-front.jpg").convert("RGB")
    h = max(left.height, right.height)
    canvas = Image.new("RGB", (left.width + right.width + 8, h), (24, 22, 20))
    canvas.paste(left, (0, 0))
    canvas.paste(right, (left.width + 8, 0))
    canvas.save(d / f"pair-{mood}-{width}.jpg", quality=86)
`], { stdio: "inherit" });
  await writeFile(`${QA}/geometry-and-glow.json`, JSON.stringify(measured, null, 2));
});

test("the left-wall small print stays clear of the director camera and robot turn path", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  await page.evaluate(() => __room.setOrbitAngle(90));
  await page.waitForFunction(() => __room.leftWallSmallPrint().loaded);
  const poster = await page.evaluate(() => __room.leftWallSmallPrint());
  expect(poster.clearances.roomRobot.intersects).toBe(false);
  expect(poster.clearances.roomRobot.distance).toBeGreaterThan(.06);
  expect(poster.clearances.guideRobot.intersects).toBe(false);
  expect(poster.clearances.guideRobot.distance).toBeGreaterThan(.06);
  expect(poster.clearances.roomRobotTurn.intersects).toBe(false);
  expect(poster.clearances.roomRobotTurn.distance).toBeGreaterThan(.06);
  expect(poster.clearances.guideRobotTurn.intersects).toBe(false);
  expect(poster.clearances.guideRobotTurn.distance).toBeGreaterThan(.06);
  await page.evaluate(() => __room.setOrbitAngle(0));
  await page.locator("#panelToggle").click().catch(() => {});
  await page.waitForTimeout(1900);
  const before = await page.evaluate(() => ({ camera: __room.cam(), url: location.href }));
  await page.locator(".save.director").click();
  await page.waitForFunction(() => __room.director().playing, null, { timeout: 15000 });
  const samples = [];
  while (await page.evaluate(() => __room.director().playing)) {
    samples.push(await page.evaluate(() => __room.cam()));
    await page.waitForTimeout(80);
  }
  const distance = ([x, y, z]) => {
    const dx = Math.max(poster.bounds.min[0] - x, x - poster.bounds.max[0], 0);
    const dy = Math.max(poster.bounds.min[1] - y, y - poster.bounds.max[1], 0);
    const dz = Math.max(poster.bounds.min[2] - z, z - poster.bounds.max[2], 0);
    return Math.hypot(dx, dy, dz);
  };
  expect(samples.length).toBeGreaterThan(40);
  expect(Math.min(...samples.map(distance))).toBeGreaterThan(1);
  await page.waitForFunction(() => !__room.director().playing && __room.director().controlsEnabled);
  expect(await page.evaluate(() => ({ camera: __room.cam(), url: location.href }))).toEqual(before);
  expect(errors).toEqual([]);
});

test("the left-wall small print is lazy and appears after its first image request fails", async ({ page }) => {
  let hits = 0;
  await page.route("**/room01-wall-print-v2-botanical-window.webp", (route) => (++hits === 1 ? route.abort() : route.continue()));
  await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  expect(await page.evaluate(() => __room.leftWallSmallPrint().built)).toBe(false);
  await page.evaluate(() => __room.setOrbitAngle(90));
  await page.waitForFunction(() => __room.leftWallSmallPrint().loaded, null, { timeout: 12000 });
  const poster = await page.evaluate(() => __room.leftWallSmallPrint());
  expect(hits).toBeGreaterThanOrEqual(2);
  expect(poster.file).toBe("room01-wall-print-v2-botanical-window.webp");
});

test("a left-wall painting whose first download fails appears by itself on a retry, without reloading the page", async ({ page }) => {
  let hits = 0;
  await page.route("**/left-wall-harbor-dusk*.webp", (route) => (++hits === 1 ? route.abort() : route.continue()));
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  expect(await page.evaluate(() => __room.loadLeftWallArt())).toBe(false);
  expect((await page.evaluate(() => __room.leftWallArt())).loaded).toBe(false);
  await page.waitForFunction(() => __room.leftWallArt().loaded, null, { timeout: 8000 });
  expect(hits).toBeGreaterThanOrEqual(2);
});
