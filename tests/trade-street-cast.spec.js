import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { CAST, CAST_ORDER } from "../prototype/trade-street/game.js";

// The cast page lives in a folder of the game, so the same single-folder server is used (the shared preview does not copy it yet).
const ROOT = resolvePath(fileURLToPath(new URL("../prototype/trade-street", import.meta.url)));
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webp": "image/webp" };
const SHOTS = process.env.TRADE_STREET_SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let server;
let base;

test.beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    let file = resolvePath(join(ROOT, pathname));
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

async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

async function picturesLoaded(page) {
  return page.evaluate(() => [...document.querySelectorAll("#grid .figure img")].map((img) => img.complete && img.naturalWidth > 0));
}

for (const width of [390, 1440]) {
  test.describe(`cast page at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    test("zh: eight people, each with a picture, a role, props, style, catchphrase and stops; nothing leaves the site", async ({ page }) => {
      const outside = [];
      const problems = [];
      page.on("request", (request) => { if (!request.url().startsWith(base) && !request.url().startsWith("data:")) outside.push(request.url()); });
      page.on("pageerror", (error) => problems.push(String(error)));
      page.on("console", (message) => { if (message.type() === "error") problems.push(message.text()); });
      await page.goto(`${base}/cast/index.html?lang=zh`);
      await expect(page.getByRole("heading", { level: 1, name: "貿易街的人" })).toBeVisible();
      await expect(page.locator("#boundary")).toContainText("人物與名字都是虛構");
      await expect(page.locator("#grid article")).toHaveCount(8);
      await expect(page.locator("#roster a")).toHaveCount(8);
      for (const id of CAST_ORDER) {
        const card = page.locator(`#${id}`);
        await expect(card.getByRole("heading", { level: 2, name: CAST[id].zh.name })).toBeVisible();
        await expect(card).toContainText(CAST[id].zh.role);
        await expect(card.locator("dt")).toHaveText(["隨身", "做事風格", "口頭禪", "出沒的站"]);
        expect(await card.locator("img").getAttribute("alt")).toContain(CAST[id].zh.name);
      }
      // the guide is named 玉仔 and walks the whole street
      await expect(page.locator("#guide")).toContainText("玉仔");
      await expect(page.locator("#guide")).toContainText("全程帶路");
      await expect(page.locator("#forwarder")).toContainText("2 訂艙 · 11 提單");
      // the pictures below the first screen load as they come into view (lazy), so scroll through the cards first
      for (const id of CAST_ORDER) await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect.poll(async () => (await picturesLoaded(page)).filter(Boolean).length, { timeout: 10000 }).toBe(8);
      await page.evaluate(() => window.scrollTo(0, 0));
      await noOverflow(page);
      expect(outside).toEqual([]);
      expect(problems).toEqual([]);
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/cast-${width}-zh-top.png` });
    });

    test("en: English text, roles instead of personal names, and the play link keeps the language", async ({ page }) => {
      await page.goto(`${base}/cast/index.html?lang=en`);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("heading", { level: 1, name: "The People of Trade Street" })).toBeVisible();
      await expect(page.locator("#guide").getByRole("heading", { level: 2 })).toHaveText("The Guide");
      await expect(page.locator("#shipper").locator("dt")).toHaveText(["Carries", "Style", "Catchphrase", "Where to find them"]);
      await expect(page.locator("#play-top")).toHaveAttribute("href", "../?lang=en");
      await expect(page.locator("#home")).toHaveAttribute("href", "/?lang=en#garage");
      await noOverflow(page);
    });

    test("the language buttons switch the page and the address; a person's address scrolls to them", async ({ page }) => {
      await page.goto(`${base}/cast/index.html#shipper`);
      await expect(page.locator("#shipper")).toBeInViewport();
      await expect(page.locator("#shipper")).toHaveCSS("box-shadow", /rgba/);
      await page.locator('#lang-group button[data-lang="en"]').click();
      await expect(page.locator("#shipper").getByRole("heading", { level: 2 })).toHaveText("The Shipper");
      expect(page.url()).toContain("lang=en");
      expect(page.url()).toContain("#shipper");
      await page.locator('#lang-group button[data-lang="zh"]').click();
      await expect(page.locator("#shipper").getByRole("heading", { level: 2 })).toHaveText("艙長");
      expect(page.url()).not.toContain("lang=en");
    });

    test("the cast page and the game link to each other, in the visitor's language", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=en`);
      await page.locator("#see-cast").click();
      await expect(page.getByRole("heading", { level: 1, name: "The People of Trade Street" })).toBeVisible();
      await page.locator("#play-bottom").click();
      await expect(page.getByRole("heading", { level: 1, name: "Trade Street" })).toBeVisible();
      await expect(page.locator("#entry")).toBeVisible();
    });

    test("if the pictures cannot load, the names and descriptions are still all there", async ({ page }) => {
      await page.route("**/assets/*.webp", (route) => route.abort());
      await page.goto(`${base}/cast/index.html?lang=zh`);
      await expect(page.locator("#grid article")).toHaveCount(8);
      for (const id of CAST_ORDER) await expect(page.locator(`#${id}`)).toContainText(CAST[id].zh.name);
      await noOverflow(page);
    });

    test("every card sits side by side on a wide screen and stacks on a phone", async ({ page }) => {
      await page.goto(`${base}/cast/index.html?lang=zh`);
      const tops = [];
      for (const id of CAST_ORDER) tops.push(Math.round((await page.locator(`#${id}`).boundingBox()).y));
      if (width >= 1040) {
        expect(new Set(tops.slice(0, 4)).size).toBe(1);
        expect(new Set(tops.slice(4)).size).toBe(1);
      } else {
        expect(new Set(tops).size).toBe(8);
      }
      if (SHOTS) {
        await page.locator("#grid").screenshot({ path: `${SHOTS}/cast-${width}-zh-grid.png` });
        await page.goto(`${base}/cast/index.html?lang=en`);
        await page.locator("#grid").screenshot({ path: `${SHOTS}/cast-${width}-en-grid.png` });
      }
    });
  });
}
