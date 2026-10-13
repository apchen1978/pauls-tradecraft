import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const ROOT = resolvePath(fileURLToPath(new URL("../prototype/trade-street", import.meta.url)));
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webp": "image/webp" };
let server;
let base;

test.beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    let file = resolvePath(join(ROOT, decodeURIComponent(url.pathname)));
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    createReadStream(file).pipe(res);
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  await new Promise((done) => server.close(done));
});

const fxTransform = (page) => page.evaluate(() => getComputedStyle(document.querySelector(".fx-a")).transform);

for (const width of [390, 1440]) {
  test.describe(`water glints at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 900 } });

    test("the glints turn on once the mask has loaded, are decoration only, and really move", async ({ page }) => {
      const problems = [];
      page.on("pageerror", (error) => problems.push(String(error)));
      page.on("console", (message) => { if (message.type() === "error") problems.push(message.text()); });
      await page.goto(`${base}/index.html?lang=zh`);
      await expect(page.locator("#map-stage")).toHaveClass(/fx-ready/);
      await expect(page.locator("#sea-fx")).toHaveAttribute("aria-hidden", "true");
      await expect(page.locator("#sea-fx")).toHaveCSS("pointer-events", "none");
      // same size as the picture, so the mask lines up with the water
      const sizes = await page.evaluate(() => ({ fx: [document.getElementById("sea-fx").offsetWidth, document.getElementById("sea-fx").offsetHeight], inner: [document.getElementById("map-inner").offsetWidth, document.getElementById("map-inner").offsetHeight] }));
      expect(sizes.fx).toEqual(sizes.inner);
      const first = await fxTransform(page);
      await page.waitForTimeout(1500);
      const second = await fxTransform(page);
      expect(second).not.toBe(first);
      expect(problems).toEqual([]);
    });

    test("the stops are still tappable with the glints on, and the glints follow the map while playing", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await expect(page.locator("#map-stage")).toHaveClass(/fx-ready/);
      await page.locator('#hotspots .hot[data-station="8"]').click();
      await expect(page.locator("#preview")).toBeVisible();
      await page.locator("#preview-close").click();
      await page.locator("#start").click();
      await expect(page.locator("#map-stage.playing")).toBeVisible();
      await expect(page.locator("#map-stage")).toHaveClass(/fx-ready/);
      const sizes = await page.evaluate(() => ({ fx: [document.getElementById("sea-fx").offsetWidth, document.getElementById("sea-fx").offsetHeight], inner: [document.getElementById("map-inner").offsetWidth, document.getElementById("map-inner").offsetHeight] }));
      expect(sizes.fx).toEqual(sizes.inner);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("for visitors who want less motion, the glints are off", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${base}/index.html?lang=zh`);
      await expect(page.locator("#map-stage")).toHaveClass(/fx-ready/);
      await expect(page.locator("#sea-fx")).toBeHidden();
    });

    test("if the mask cannot load, the glints stay off so they never spill onto the land", async ({ page }) => {
      await page.route("**/assets/sea-mask-*.webp", (route) => route.abort());
      await page.goto(`${base}/index.html?lang=zh`);
      await page.waitForTimeout(800);
      await expect(page.locator("#map-stage")).not.toHaveClass(/fx-ready/);
      await expect(page.locator("#sea-fx")).toBeHidden();
      // the game itself still works
      await page.locator("#start").click();
      await expect(page.locator("#play")).toBeVisible();
    });

    test("the sky effects (sun, cloud shadows, chimney smoke, gulls) are decoration only and really move", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await expect(page.locator("#map-stage")).toHaveClass(/fx-ready/);
      await expect(page.locator("#sky-fx")).toHaveAttribute("aria-hidden", "true");
      await expect(page.locator("#sky-fx")).toHaveCSS("pointer-events", "none");
      await expect(page.locator("#sky-fx .gull")).toHaveCount(3);
      await expect(page.locator("#sky-fx .smoke")).toHaveCount(3);
      await expect(page.locator("#sky-fx .shade")).toHaveCount(2);
      const sample = () => page.evaluate(() => ["#sky-fx .shade-a", "#sky-fx .smoke-a", "#sky-fx .gull-a"].map((q) => getComputedStyle(document.querySelector(q)).transform));
      const first = await sample();
      await page.waitForTimeout(1600);
      const second = await sample();
      expect(second[0]).not.toBe(first[0]);
      expect(second[1]).not.toBe(first[1]);
      expect(second[2]).not.toBe(first[2]);
      // same size as the picture, so the percentages line up with the buildings and the sky
      const sizes = await page.evaluate(() => ({ fx: [document.getElementById("sky-fx").offsetWidth, document.getElementById("sky-fx").offsetHeight], inner: [document.getElementById("map-inner").offsetWidth, document.getElementById("map-inner").offsetHeight] }));
      expect(sizes.fx).toEqual(sizes.inner);
    });

    test("for visitors who want less motion, the sky effects are off too; and they pause off screen", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${base}/index.html?lang=zh`);
      await expect(page.locator("#map-stage")).toHaveClass(/fx-ready/);
      await expect(page.locator("#sky-fx")).toBeHidden();
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await expect(page.locator("#sky-fx")).toBeVisible();
      await page.evaluate(() => { document.body.style.minHeight = "6000px"; window.scrollTo(0, 4000); });
      await expect(page.locator("#map-stage")).toHaveClass(/idle/, { timeout: 4000 });
      await expect(page.locator("#sky-fx .smoke-a")).toHaveCSS("animation-play-state", /paused/);
    });

    test("the glints pause while the map is off screen", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await expect(page.locator("#map-stage")).toHaveClass(/fx-ready/);
      await page.locator("#start").scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => { document.body.style.minHeight = "6000px"; window.scrollTo(0, 4000); });
      await expect(page.locator("#map-stage")).toHaveClass(/idle/, { timeout: 4000 });
      await expect(page.locator(".fx-a")).toHaveCSS("animation-play-state", /paused/);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.locator("#map-stage")).not.toHaveClass(/idle/, { timeout: 4000 });
    });
  });
}
