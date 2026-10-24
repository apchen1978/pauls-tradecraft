import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const QA = "docs/qa/roomverse-left-wall-art";

for (const width of [390, 1440]) {
  test(`left-wall painting at ${width}px: delayed, 16:9, clear of lamp, plant and chair`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
    const requests = [], errors = [];
    page.on("request", (r) => { if (r.url().includes("left-wall-harbor-dusk")) requests.push(r.url()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${PAGE}?lang=zh&mood=rain`);
    expect(requests).toHaveLength(0);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room);
    expect(requests).toHaveLength(0);
    expect((await page.evaluate(() => __room.leftWallArt())).built).toBe(false);
    await page.evaluate(() => __room.setOrbitAngle(90));
    await page.waitForFunction(() => __room.leftWallArt().ready);
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
