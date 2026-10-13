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
  zh: { title: "工廠秘密菜單", boundary: "示意的假設，不代表任何特定工廠、客戶或市場驗證。" },
  en: { title: "Factory Secret Menu", boundary: "Illustrative hypotheses, not a specific factory, customer or market validation." },
};

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${width}px ${lang}: the Garage lists the Factory Secret Menu and the link carries the language`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?lang=${lang}#garage`);
      await page.locator("#garage-more > summary").click();
      const heading = page.locator("#garage").getByRole("heading", { name: CARD[lang].title, exact: true });
      await expect(heading).toBeVisible();
      const card = heading.locator("xpath=ancestor::*[self::li or self::article][1]");
      await expect(card).toContainText(CARD[lang].boundary);
      const href = await card.getByRole("link").first().getAttribute("href");
      expect(href).toContain("/prototype/factory-secret-menu/");
      expect(href).toContain(`lang=${lang}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test.describe("the page itself", () => {
  const url = (lang) => `${base}/prototype/factory-secret-menu/${lang ? `?lang=${lang}` : ""}`;

  test("opens in the language of the link (Chinese by default), the toggle switches both ways and keeps the choice", async ({ page }) => {
    const problems = [];
    page.on("pageerror", (error) => problems.push(String(error)));
    await page.goto(url());
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
    await expect(page.locator("#eyebrow")).toHaveText("工廠秘密菜單");
    await page.goto(url("en"));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#eyebrow")).toHaveText("Factory Secret Menu");
    await page.locator('.choice[data-key="smallrun"]').click();
    await page.locator('.pressure[data-pressure="proof"]').click();
    await expect(page.locator("#verb")).toContainText("small runs stop looking");
    await page.locator("#langZh").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
    await expect(page.locator("#verb")).toContainText("小批量");
    await expect(page.locator('.choice[data-key="smallrun"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('.pressure[data-pressure="proof"]')).toHaveAttribute("aria-pressed", "true");
    expect(problems).toEqual([]);
  });

  for (const lang of ["zh", "en"]) {
    test(`${lang}: choose a verb and a pressure, combine, and read the limits of the facts`, async ({ page }) => {
      await page.goto(url(lang));
      await page.locator('.choice[data-key="test"]').click();
      await page.locator('.pressure[data-pressure="speed"]').click();
      await expect(page.locator("#recipe")).not.toHaveClass(/ready/);
      await page.locator("#recombine").click();
      await expect(page.locator("#recipe")).toHaveClass(/ready/);
      await expect(page.locator("#recipeTitle")).toHaveText(lang === "zh" ? "一個商業可能性，不是結論" : "A commercial possibility, not a conclusion");
      await expect(page.locator("#recipeInput")).toContainText(lang === "zh" ? "可觸摸的測試" : "tangible testing");
      await expect(page.locator("#recipeUnknown")).not.toBeEmpty();
      await expect(page.locator("#recipeDecision")).not.toBeEmpty();
      await expect(page.locator("#truth")).toBeHidden();
      await page.locator("#reveal").click();
      await expect(page.locator("#truth")).toBeVisible();
      await expect(page.locator("#truth")).toContainText(lang === "zh" ? "未知" : "Unknown");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("on a phone nothing overflows in either language", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const lang of ["zh", "en"]) {
      await page.goto(url(lang));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});
