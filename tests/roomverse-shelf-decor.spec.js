import { test, expect } from "@playwright/test";
import { mkdir, stat, writeFile } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const QA = "docs/qa/roomverse-shelf-decor";
for (const width of [390, 1440]) {
  test(`shelf decor ${width}: delayed, fuller grounded display, no extra images or light`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
    const requests = [], errors = [];
    page.on("request", (r) => requests.push(new URL(r.url()).pathname));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${PAGE}?lang=zh&mood=tv&wall=wine`);
    await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
    expect(await page.evaluate(() => __room.shelfDecor())).toEqual({ ready: false, art: null, objects: [], overlaps: [] });
    expect(requests.some((r) => r.includes("console-art-river") || r.includes("shelf-art-still"))).toBe(false);
    await page.evaluate(() => __room.loadConsoleDecor());
    const data = await page.evaluate(() => __room.shelfDecor());
    expect(data.ready).toBe(true); expect(data.objects).toHaveLength(11); expect(data.overlaps).toEqual([]);
    expect(data.art).toBe("shelf-art-still-v1.webp");
    expect(await page.evaluate(() => __room.consoleDetails().artFile)).toBe("console-art-river-v1.webp");
    expect(requests.filter((r) => r.endsWith("/shelf-art-still-v1.webp"))).toHaveLength(1);
    expect(requests.filter((r) => r.endsWith("/console-art-river-v1.webp"))).toHaveLength(1);
    expect((await stat("public/prototype/roomverse-3d/tex/shelf-art-still-v1.webp")).size).toBeLessThan(80000);
    expect(new Set(data.objects.map((o) => o.bay)).size).toBe(6);
    for (const item of data.objects) {
      expect(item.depth, item.name).toBeLessThan(.12);
      expect(item.fits, item.name).toBe(true); expect(item.supported, item.name).toBe(true);
      expect(item.max[1] - item.min[1], item.name).toBeLessThan(.5);
    }
    expect(data.objects.filter((o) => o.name.startsWith("shelf-book-blue") || o.name.startsWith("shelf-book-moss") || o.name.startsWith("shelf-book-clay") || o.name.startsWith("shelf-book-paper")).length).toBe(5);
    expect(data.objects.filter((o) => o.bay === "left-lower").map((o) => o.name)).toEqual(["shelf-ceramic-dish"]);
    expect(data.objects.find((o) => o.name === "shelf-small-frame").max[1] - data.objects.find((o) => o.name === "shelf-small-frame").min[1]).toBeGreaterThan(.24);
    expect(data.objects.find((o) => o.name === "shelf-medium-ceramic-vessel").max[1] - data.objects.find((o) => o.name === "shelf-medium-ceramic-vessel").min[1]).toBeGreaterThan(.30);
    const stack = data.objects.find((o) => o.name === "shelf-horizontal-book-stack");
    const sculpture = data.objects.find((o) => o.name === "shelf-small-wood-sculpture");
    expect(stack?.bay).toBe("right-lower"); expect(stack.max[1] - stack.min[1]).toBeGreaterThan(.16);
    expect(sculpture?.bay).toBe("right-lower"); expect(sculpture.max[1] - sculpture.min[1]).toBeGreaterThan(.16);
    expect(await page.evaluate(() => __room.tableLampLighting().lightCount)).toBe(6);
    const before = requests.length;
    await page.evaluate(() => __room.loadConsoleDecor());
    expect(requests.length).toBe(before);
    await page.evaluate(() => __room.setOrbitAngle(180));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("shelf texture failure leaves solid props and a working room", async ({ page }) => {
  await page.route(/\/tex\/(?:console-art-river-v1|shelf-art-still-v1|tv-oak-v1|tv-backing-v1)\.webp$/, (route) => route.abort());
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  await page.evaluate(() => __room.loadConsoleDecor());
  const shelf = await page.evaluate(() => __room.shelfDecor());
  expect(shelf.objects).toHaveLength(11);
  expect(shelf.art).toBe(null);
  expect((await page.evaluate(() => __room.consoleDetails())).artLoaded).toBe(false);
  await page.evaluate(() => __room.setOrbitAngle(180));
  expect(await page.evaluate(() => __room.postcard().width)).toBeGreaterThan(0);
  await expect(page.locator("#status")).toBeHidden();
});

test("framed pictures stay distinct across feelings, walls and prints", async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${PAGE}?lang=zh&mood=family&view=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room);
  await page.evaluate(() => Promise.all([__room.loadConsoleDecor(), __room.loadLeftWallArt(), __room.loadRightWallArt()]));
  const moods = ["rain", "family", "tech", "chic", "slow", "tv"];
  const walls = ["original", "sand", "olive", "blush", "mist", "pine", "dusk", "wine", "stripe", "botanical"];
  const prints = ["hills", "moon", "rain"];
  const windowFile = { rain: "window-rain-v1.webp", family: "window-family-v1.webp", tech: "window-tech-v1.webp", chic: "window-chic-v1.webp", slow: "window-family-v1.webp", tv: "window-tech-v1.webp" };
  for (const mood of moods) {
    for (const wall of walls) {
      for (const print of prints) {
        const where = `${mood} / ${wall} / ${print}`;
        const pics = await page.evaluate(async ([m, w, p, file]) => {
          __room.set("mood", m); __room.set("wall", w); __room.set("print", p);
          const deadline = performance.now() + 8000;
          let pics = __room.framedPictures();
          const ready = (pics) => pics.sofa && pics.console && pics.shelf && pics.left && pics.right && pics.window === file;
          while (!ready(pics) && performance.now() < deadline) {
            await new Promise((resolve) => setTimeout(resolve, 40));
            pics = __room.framedPictures();
          }
          return pics;
        }, [mood, wall, print, windowFile[mood]]);
        const shown = [pics.sofa, pics.console, pics.shelf, pics.left, pics.right];
        expect(shown.every(Boolean), `${where}: ${JSON.stringify(pics)}`).toBe(true);
        expect(new Set(shown).size, `${where}: ${shown.join(", ")}`).toBe(shown.length);
        expect(pics.shelf, where).toBe("shelf-art-still-v1.webp");
        expect(pics.console, where).toBe("console-art-river-v1.webp");
        expect(pics.sofa, where).toBe(`wall-print-${print}-v1.webp`);
        expect(pics.plaque, where).toBe("wall-plaque-text-v1.webp");
        expect(shown, where).not.toContain(pics.plaque);
        expect(pics.window, where).toBe(windowFile[mood]);
        expect(shown, where).not.toContain(pics.window);
      }
    }
  }
  await page.evaluate(() => __room.setOrbitAngle(0));
  expect((await page.evaluate(() => __room.plaqueView())).firstHit).toBe("house-plaque");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("shelf QA: six moods, three key palettes at both widths, front and side views", async ({ page }) => {
  test.setTimeout(180000); await mkdir(QA, { recursive: true });
  const rows = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=zh&mood=rain`);
    await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
    await page.evaluate(() => Promise.all([__room.loadConsoleDecor(), __room.loadRightWallArt(), __room.loadDoorTexture()]));
    for (const [mood, wall] of [["tv", "wine"], ["rain", "original"], ["family", "olive"], ["tech", "mist"], ["chic", "original"], ["slow", "sand"]]) {
      await page.evaluate(([m, w]) => { __room.set("mood", m); __room.set("wall", w); __room.setOrbitAngle(180); }, [mood, wall]);
      await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}-front.jpg`, type: "jpeg", quality: 92 });
      const data = await page.evaluate(() => __room.shelfDecor());
      expect(data.objects.every((o) => o.fits && o.supported)).toBe(true); expect(data.overlaps).toEqual([]);
      rows.push({ mood, width, ...data });
      if (["tv", "rain", "family"].includes(mood)) {
        for (const angle of [170, 190]) {
          await page.evaluate((a) => __room.setOrbitAngle(a), angle);
          await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}-side-${angle}.jpg`, type: "jpeg", quality: 92 });
        }
      }
    }
  }
  await writeFile(`${QA}/geometry.json`, JSON.stringify(rows, null, 2));
});

test("eight-second tour still restores camera and postcard geometry", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto(`${PAGE}?lang=zh&mood=tv&wall=wine`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  await page.waitForTimeout(2300); // existing entry drift must finish before recording the camera
  await page.evaluate(() => __room.loadConsoleDecor());
  if (await page.locator("#panelToggle").isVisible()) await page.locator("#panelToggle").click();
  const before = await page.evaluate(() => ({ camera: __room.cam(), url: location.href, card: [__room.postcard().width, __room.postcard().height] }));
  await page.locator(".director").click();
  await page.waitForFunction(() => __room.director().playing);
  await page.waitForTimeout(4000);
  await page.locator("#stage").screenshot({ path: `${QA}/tour-midpoint.jpg`, type: "jpeg", quality: 90 });
  await page.waitForFunction(() => !__room.director().playing, null, { timeout: 15000 });
  expect(await page.evaluate(() => ({ camera: __room.cam(), url: location.href, card: [__room.postcard().width, __room.postcard().height] }))).toEqual(before);
});
