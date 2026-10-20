import { test, expect } from "@playwright/test";
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
    expect(await page.evaluate(() => __room.tableLampLighting().lightCount)).toBe(6);
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
  const levels = {};
  for (const mood of ["rain", "tv", "family", "tech", "chic", "slow"]) {
    levels[mood] = await page.evaluate((m) => { __room.set("mood", m); return __room.leftWallArt().glow; }, mood);
    expect(await page.evaluate(() => __room.tableLampLighting().lightCount)).toBe(6);
  }
  expect(levels.rain).toBeGreaterThan(levels.family);
  expect(levels.tv).toBeGreaterThan(levels.family);
  expect(levels.family).toBeGreaterThan(levels.slow);
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
    await page.evaluate(() => __room.loadLeftWallArt());
    for (const [mood, wall] of [["tv", "wine"], ["rain", "original"], ["family", "olive"]]) {
      await page.evaluate(([m, w]) => { __room.set("mood", m); __room.set("wall", w); __room.setOrbitAngle(90); }, [mood, wall]);
      await page.waitForTimeout(100);
      await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}-front.jpg`, type: "jpeg", quality: 92 });
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
  await writeFile(`${QA}/geometry-and-glow.json`, JSON.stringify(measured, null, 2));
});
