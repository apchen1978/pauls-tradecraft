import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const REPO = resolvePath(fileURLToPath(new URL("..", import.meta.url)));
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
let server;
let base;

test.beforeAll(async () => {
  server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
    let file = resolvePath(join(REPO, pathname));
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file.startsWith(REPO) || !existsSync(file)) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    createReadStream(file).pipe(res);
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  await new Promise((done) => server.close(done));
});

const CARD = {
  zh: { title: "機會重構：看見更多可能，少做一點承諾", boundary: "虛構公司、腳本式互動，不是市場證據。" },
  en: { title: "Opportunity Reframing: see more, commit to less", boundary: "A fictional company and a scripted interaction, not market evidence." },
};

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${width}px ${lang}: the Garage lists Opportunity Reframing and the link carries the language`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?lang=${lang}#garage`);
      // the Garage shows three experiments first; the rest sit under its "all experiments" toggle
      await page.locator("#garage-more > summary").click();
      const heading = page.locator("#garage").getByRole("heading", { name: CARD[lang].title });
      await expect(heading).toBeVisible();
      const card = heading.locator("xpath=ancestor::*[self::li or self::article][1]");
      await expect(card).toContainText(CARD[lang].boundary);
      const href = await card.getByRole("link").first().getAttribute("href");
      expect(href).toContain("/prototype/garage-opportunity-reframing-002/");
      expect(href).toContain(`lang=${lang}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test.describe("the page itself", () => {
  const url = (lang) => `${base}/prototype/garage-opportunity-reframing-002/${lang ? `?lang=${lang}` : ""}`;

  test("opens in the language of the link, English by default, and the toggle still works", async ({ page }) => {
    const problems = [];
    page.on("pageerror", (error) => problems.push(String(error)));
    await page.goto(url("zh"));
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
    await expect(page.locator("#langZh")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#pageTitle")).toContainText("看見更多可能");
    await page.goto(url());
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#pageTitle")).toContainText("See more possibilities");
    await page.locator("#langZh").click();
    await expect(page.locator("#pageTitle")).toContainText("看見更多可能");
    await page.locator("#langEn").click();
    await expect(page.locator("#pageTitle")).toContainText("See more possibilities");
    expect(problems).toEqual([]);
  });

  test("the challenge step still runs after choosing a hypothesis", async ({ page }) => {
    await page.goto(url("en"));
    await page.locator('[data-hypothesis="h2"]').click();
    await page.locator("#challengeButton").click();
    await expect(page.locator("#result.visible")).toBeVisible();
    await expect(page.locator("#transition.visible")).toBeVisible();
  });
});
