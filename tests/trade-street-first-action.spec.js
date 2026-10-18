import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const ROOT = resolvePath(fileURLToPath(new URL("../prototype/trade-street", import.meta.url)));
const SHOTS = resolvePath("output/playwright/trade-street-first-action");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webp": "image/webp", ".png": "image/png" };
let server;
let base;

test.beforeAll(async () => {
  mkdirSync(SHOTS, { recursive: true });
  server = createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
    if (pathname === "/") pathname = "/index.html";
    const file = resolvePath(join(ROOT, pathname));
    if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    createReadStream(file).pipe(res);
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  await new Promise((done) => server.close(done));
});

async function expectNoHorizontalOverflow(page) {
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
}

async function measureSmallTargets(page) {
  return page.evaluate(() => [...document.querySelectorAll("button, a, summary")]
    .filter((node) => node.getClientRects().length && getComputedStyle(node).visibility !== "hidden")
    .map((node) => {
      const rect = node.getBoundingClientRect();
      return { label: (node.innerText || node.getAttribute("aria-label") || node.id || node.tagName).trim().replace(/\s+/g, " ").slice(0, 60), width: Math.round(rect.width), height: Math.round(rect.height) };
    })
    .filter((target) => target.width < 44 || target.height < 44));
}

for (const [width, height] of [[390, 844], [1440, 900]]) {
  test.describe(`trade street first action at ${width}px`, () => {
    test.use({ viewport: { width, height } });

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the first screen presents the situation before the primer`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}`);
        await expect(page.locator("#entry-title")).toBeInViewport();
        await expect(page.locator("#scn button").first()).toBeInViewport();
        await expect(page.locator("#primer")).toBeVisible();
        await expect(page.locator("#primer")).toHaveJSProperty("open", false);
        if (width === 390) await expectNoHorizontalOverflow(page);
        await page.screenshot({ path: resolvePath(SHOTS, `after-${lang}-${width}.png`) });
      });
    }
  });
}

test("desktop 1280×800 keeps all three situations in the first screen", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const lang of ["zh", "en"]) {
    await page.goto(`${base}/index.html?lang=${lang}`);
    await expect(page.locator("#entry-title")).toBeInViewport();
    for (const option of await page.locator("#scn button").all()) await expect(option).toBeInViewport();
    await expect(page.locator("#start")).toBeInViewport();
  }
});

test("scenario, start, and first answer each produce immediate visual feedback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/index.html?lang=zh`);

  const scenario = page.locator("#scn button").nth(1);
  const beforeScenario = await scenario.evaluate((node) => ({ background: getComputedStyle(node).backgroundColor, border: getComputedStyle(node).borderColor }));
  await scenario.click({ timeout: 300 });
  await expect(scenario).toHaveAttribute("aria-checked", "true", { timeout: 300 });
  const afterScenario = await scenario.evaluate((node) => ({ background: getComputedStyle(node).backgroundColor, border: getComputedStyle(node).borderColor }));
  expect(afterScenario).not.toEqual(beforeScenario);

  await page.locator("#start").click({ timeout: 300 });
  await expect(page.locator("#entry")).toBeHidden({ timeout: 300 });
  await expect(page.locator("#play")).toBeVisible({ timeout: 300 });
  await expect(page.locator("#primer")).toBeHidden({ timeout: 300 });
  await expect(page.locator("#progress")).toContainText("第 1 站", { timeout: 300 });

  while (!(await page.locator("#choices button").count())) await page.locator("#next").click();
  const answer = page.locator("#choices button").first();
  const beforeAnswer = await answer.evaluate((node) => ({ background: getComputedStyle(node).backgroundColor, border: getComputedStyle(node).borderColor }));
  await answer.click({ timeout: 300 });
  await expect(answer).toHaveClass(/picked/, { timeout: 300 });
  const afterAnswer = await answer.evaluate((node) => ({ background: getComputedStyle(node).backgroundColor, border: getComputedStyle(node).borderColor }));
  expect(afterAnswer).not.toEqual(beforeAnswer);
  await expect(page.locator("#feedback")).toBeVisible({ timeout: 300 });
  await expect(page.locator("#next")).toBeEnabled({ timeout: 300 });
  await expectNoHorizontalOverflow(page);
});

test("primer remains expandable after the scenario entry", async ({ page }) => {
  await page.goto(`${base}/index.html?lang=en`);
  await expect(page.locator("#primer")).toBeVisible();
  await page.locator("#primer-title").click();
  await expect(page.locator("#primer")).toHaveJSProperty("open", true);
  await expect(page.locator("#primer-body")).toBeVisible();
});

test("390px entry and answer controls meet the 44px target size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const lang of ["zh", "en"]) {
    await page.goto(`${base}/index.html?lang=${lang}`);
    const entrySmallTargets = await measureSmallTargets(page);
    console.log(`trade-street 390px ${lang} entry controls: ${JSON.stringify({ total: await page.locator("button:visible, a:visible, summary:visible").count(), below44: entrySmallTargets.length, labels: entrySmallTargets })}`);
    expect(entrySmallTargets).toEqual([]);

    await page.locator("#start").click();
    while (!(await page.locator("#choices button").count())) await page.locator("#next").click();
    const answerSmallTargets = await measureSmallTargets(page);
    console.log(`trade-street 390px ${lang} answer controls: ${JSON.stringify({ total: await page.locator("button:visible, a:visible, summary:visible").count(), below44: answerSmallTargets.length, labels: answerSmallTargets })}`);
    expect(answerSmallTargets).toEqual([]);
    await expectNoHorizontalOverflow(page);
  }
});
