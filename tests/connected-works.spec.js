import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

// The shared preview only serves what vite builds; the deploy copies prototype/ and cases/ in. This spec maps the same two
// roots itself so the three pages can be walked through the way a visitor does.
const REPO = resolvePath(fileURLToPath(new URL("..", import.meta.url)));
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".pdf": "application/pdf" };
let server;
let base;

function locate(pathname) {
  const clean = decodeURIComponent(pathname);
  const root = clean.startsWith("/prototype/") ? REPO : join(REPO, "public");
  let file = resolvePath(join(root, clean));
  if (!file.startsWith(root)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  return existsSync(file) ? file : null;
}

test.beforeAll(async () => {
  server = createServer((req, res) => {
    const file = locate(new URL(req.url || "/", "http://localhost").pathname);
    if (!file) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    createReadStream(file).pipe(res);
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  await new Promise((done) => server.close(done));
});

for (const lang of ["zh", "en"]) {
  test(`${lang}: the first-container case, the 12 steps and Trade Street lead into each other`, async ({ page }) => {
    // case -> 12 steps and case -> Trade Street
    await page.goto(`${base}/cases/first-container/?lang=${lang}`);
    const view = page.locator(`div[data-lang-view="${lang}"]`).first();
    const toSteps = view.locator('a[href^="/prototype/one-container-12-steps/"]');
    const toStreet = view.locator('a[href^="/prototype/trade-street/"]');
    await expect(toSteps).toHaveCount(1);
    await expect(toStreet).toHaveCount(1);
    expect(await toSteps.getAttribute("href")).toContain(`lang=${lang}`);
    expect(await toStreet.getAttribute("href")).toContain(`lang=${lang}`);

    // 12 steps -> Trade Street, and it lands there in the same language
    await page.goto(`${base}/prototype/one-container-12-steps/?lang=${lang}`);
    const play = page.locator('#actions a[href^="/prototype/trade-street/"]');
    await expect(play).toHaveCount(1);
    await expect(play).toContainText(lang === "zh" ? "貿易街" : "Trade Street");
    await play.click();
    await expect(page).toHaveURL(new RegExp(`/prototype/trade-street/\\?lang=${lang}`));
    await expect(page.locator("#title")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", lang === "zh" ? "zh-Hant" : "en");

    // Trade Street result -> the case, same language
    await page.goto(`${base}/prototype/trade-street/?lang=${lang}&s=rush&c=AAAAAA`);
    const back = page.locator("#takeaway-case");
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/cases\/first-container\//);
    await expect(page.locator(`div[data-lang-view="${lang}"]`).first().locator("h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
