import { test, expect } from "@playwright/test";

// Every picture Room 03 can load must arrive: no failed request and no 4xx/5xx while the room opens and while the visitor flips through
// every mood, the yard views, the wall-art choices, the wallpapers and the door side of the room (where lazy textures are fetched).
// This catches the quiet failure where a path or domain change leaves one image 404ing and the room simply shows one thing less.
const PAGE = "/prototype/roomverse-3d/kitchen/";
const IMAGE = /\.(webp|png|jpe?g|avif|glb)(\?|$)/i;
const MOODS = ["daylight", "golden", "movie", "night", "dinner", "sunday", "thanksgiving"];

test("every image the room loads arrives with no failed request or 404", async ({ page }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const failures = [], badStatus = [], loaded = new Map();
  page.on("requestfailed", (request) => { if (IMAGE.test(request.url())) failures.push(`${request.url()} ${request.failure()?.errorText}`); });
  page.on("response", (response) => {
    const url = response.url();
    if (!IMAGE.test(url)) return;
    // The preview server (and some hosts) answer a missing file with the home page and a 200, so the content type must be a picture or a model.
    const type = response.headers()["content-type"] || "";
    if (response.status() >= 400) badStatus.push(`${response.status()} ${url}`);
    else if (/text\/html/i.test(type)) badStatus.push(`${response.status()} served as ${type} (a missing file answered by the fallback page) ${url}`);
    else loaded.set(new URL(url).pathname, response.status());
  });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info().yardLoaded && window.__room03.info().wallArtLoaded, null, { timeout: 120000 });

  // The door wall and the entry side load their own textures only when they come into view.
  for (const yaw of [-Math.PI / 2, Math.PI / 2, Math.PI]) {
    await page.evaluate((y) => window.__room03.setView(y), yaw);
    await page.waitForTimeout(700);
  }
  for (const mood of MOODS) {
    await page.evaluate((m) => window.__room03.setMood(m), mood);
    await page.waitForTimeout(900);
  }
  const names = await page.evaluate(() => ({ yards: window.__room03.yardViews(), art: window.__room03.artOptions(), walls: window.__room03.wallpaperOptions() }));
  for (const view of names.yards) {
    await page.evaluate((v) => new Promise((resolve) => window.__room03.setYardView(v, resolve)), view);
    await page.waitForTimeout(400);
  }
  for (const [frame, options] of Object.entries(names.art)) {
    for (const option of options) {
      await page.evaluate(([f, o]) => new Promise((resolve) => window.__room03.setArtwork(f, o, resolve)), [frame, option]);
      await page.waitForTimeout(300);
    }
  }
  for (const wall of names.walls) {
    await page.evaluate((w) => window.__room03.setWallpaper(w), wall);
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(1500);

  console.log(`Room 03 images loaded: ${loaded.size}`, JSON.stringify([...loaded.keys()]));
  expect(failures, "no image request fails").toEqual([]);
  expect(badStatus, "no image answers 4xx or 5xx").toEqual([]);
  expect(loaded.size, "the room really fetched its pictures (floor, walls, art, yard)").toBeGreaterThanOrEqual(10);
});
