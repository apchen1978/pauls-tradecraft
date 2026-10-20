import { test, expect } from "@playwright/test";
import { mkdir, stat, writeFile } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const QA = "docs/qa/roomverse-right-wall-art";

for (const width of [390, 1440]) {
  test(`right-wall painting at ${width}px: delayed, full canvas, clear of door and lamps`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
    const requests = [], errors = [];
    page.on("request", (r) => { if (r.url().includes("right-wall-harbor")) requests.push(r.url()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${PAGE}?lang=zh&mood=rain`);
    expect(requests).toHaveLength(0);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room);
    expect(requests).toHaveLength(0);
    expect((await page.evaluate(() => __room.rightWallArt())).built).toBe(false);
    await page.evaluate(() => __room.setOrbitAngle(270));
    await page.waitForFunction(() => __room.rightWallArt().ready);
    const art = await page.evaluate(() => __room.rightWallArt());
    expect(art.loaded).toBe(true);
    expect(art.file).toBe(width === 390 ? "right-wall-harbor-mobile-v1.webp" : "right-wall-harbor-v1.webp");
    expect(art.size).toEqual(width === 390 ? [800, 533] : [1024, 683]);
    expect(art.painting.max[2] - art.painting.min[2]).toBeCloseTo(1.2, 5);
    expect(art.painting.max[1] - art.painting.min[1]).toBeCloseTo(.8, 5);
    expect(art.collisions).toEqual([]);
    expect(art.bounds.max[0]).toBeLessThan(2.6);
    expect(art.bounds.max[2]).toBeLessThan(.72); // door begins here, including the soft wash
    expect(await page.evaluate(() => __room.tableLampLighting().lightCount)).toBe(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => __room.loadRightWallArt());
    expect(requests).toHaveLength(1);
    expect(errors).toEqual([]);
  });
}

test("missing painting keeps a solid framed fallback and a usable room", async ({ page }) => {
  await page.route("**/right-wall-harbor*.webp", (route) => route.abort());
  await page.goto(`${PAGE}?lang=zh&mood=tv`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  expect(await page.evaluate(() => __room.loadRightWallArt())).toBe(false);
  const art = await page.evaluate(() => __room.rightWallArt());
  expect(art.built).toBe(true); expect(art.ready).toBe(true); expect(art.loaded).toBe(false);
  expect(art.collisions).toEqual([]);
  await page.evaluate(() => { __room.set("mood", "family"); __room.setOrbitAngle(270); });
  expect(await page.evaluate(() => __room.postcard().width)).toBeGreaterThan(0);
  await expect(page.locator("#status")).toBeHidden();
});

test("gallery lighting is local, mood-aware, and image variants stay in budget", async ({ page }) => {
  for (const file of ["right-wall-harbor-v1.webp", "right-wall-harbor-mobile-v1.webp"]) {
    expect((await stat(`public/prototype/roomverse-3d/tex/${file}`)).size).toBeLessThanOrEqual(90000);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  await page.evaluate(() => __room.loadRightWallArt());
  const levels = {};
  for (const mood of ["rain", "tv", "family", "tech", "chic", "slow"]) {
    levels[mood] = await page.evaluate((m) => { __room.set("mood", m); return __room.rightWallArt().glow; }, mood);
    expect(await page.evaluate(() => __room.tableLampLighting().lightCount)).toBe(6);
  }
  expect(levels.rain).toBeGreaterThan(levels.family);
  expect(levels.tv).toBeGreaterThan(levels.family);
  expect(levels.family).toBeGreaterThan(levels.slow);
});

test("right-wall QA: three moods, two widths, front/side/detail plus postcard and finite tour", async ({ page }) => {
  test.setTimeout(180000);
  await mkdir(QA, { recursive: true });
  const measured = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=zh&mood=rain`);
    await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
    await page.evaluate(() => Promise.all([__room.loadRightWallArt(), __room.loadTvWallTextures(), __room.loadDoorTexture(), __room.loadConsoleDecor()]));
    for (const [mood, wall] of [["tv", "wine"], ["rain", "original"], ["family", "olive"]]) {
      await page.evaluate(([m, w]) => { __room.set("mood", m); __room.set("wall", w); __room.setOrbitAngle(270); }, [mood, wall]);
      await page.waitForTimeout(100);
      await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}-front.jpg`, type: "jpeg", quality: 92 });
      measured.push({ mood, width, ...(await page.evaluate(() => __room.rightWallArt())) });
      // Crop the real render for detail inspection; do not change the visitor's camera or its limits.
      const rect = await page.evaluate(() => __room.rightWallArt().screenRect);
      const canvas = await page.locator("#stage canvas").boundingBox();
      const x = Math.max(0, rect.x - 18), y = Math.max(0, rect.y - 45);
      const right = Math.min(canvas.width, rect.x + rect.width + 18), bottom = Math.min(canvas.height, rect.y + rect.height + 18);
      await page.screenshot({ path: `${QA}/${mood}-${width}-detail.png`, clip: { x: canvas.x + x, y: canvas.y + y, width: right - x, height: bottom - y } });
      await page.evaluate(() => __room.setOrbitAngle(240));
      await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}-side.jpg`, type: "jpeg", quality: 92 });
    }
    await page.evaluate(() => __room.setOrbitAngle(0));
    await page.locator("#stage").screenshot({ path: `${QA}/sofa-${width}.jpg`, type: "jpeg", quality: 92 });
    const card = await page.evaluate(() => __room.postcard().toDataURL().split(",")[1]);
    await writeFile(`${QA}/postcard-${width}.png`, Buffer.from(card, "base64"));
    // The existing finite movie must still finish, restore its room and keep the same camera path.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`${PAGE}?lang=zh&mood=family&wall=olive`);
    await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
    await page.evaluate(() => { __room.setOrbitAngle(0); return __room.loadRightWallArt(); });
    if (await page.locator("#panelToggle").isVisible()) await page.locator("#panelToggle").click();
    const before = await page.evaluate(() => ({ camera: __room.cam(), url: location.href }));
    await page.locator(".director").click();
    await page.waitForFunction(() => __room.director().playing);
    await page.waitForTimeout(4000);
    await page.locator("#stage").screenshot({ path: `${QA}/tour-${width}.jpg`, type: "jpeg", quality: 92 });
    await page.waitForFunction(() => !__room.director().playing, null, { timeout: 15000 });
    expect(await page.evaluate(() => ({ camera: __room.cam(), url: location.href }))).toEqual(before);
  }
  await writeFile(`${QA}/geometry-and-glow.json`, JSON.stringify(measured, null, 2));
});
