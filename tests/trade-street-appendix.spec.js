import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { LEGS, TERMS, TERM_ORDER, summaryOf } from "../prototype/trade-street/appendix/appendix.js";

// The appendix lives in a folder of the game, so the same single-folder server is used as for the cast page.
const ROOT = resolvePath(fileURLToPath(new URL("../prototype/trade-street", import.meta.url)));
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webp": "image/webp" };
const SHOTS = process.env.TRADE_STREET_SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let server;
let base;

test.beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
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

// What the card shows right now: who carries each leg, and where the pin stands.
async function shown(page) {
  return page.evaluate(() => ({
    legs: [...document.querySelectorAll("#strip .leg")].map((li) => (li.classList.contains("s") ? "s" : li.classList.contains("b") ? "b" : "?")).join(""),
    risk: Number(document.querySelector("#strip .risk").style.getPropertyValue("--x")),
    checked: [...document.querySelectorAll("#pick button")].filter((b) => b.getAttribute("aria-checked") === "true").map((b) => b.dataset.term),
  }));
}

for (const width of [390, 1440]) {
  test.describe(`appendix card at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    test("zh: the card opens on FCA, every term redraws the six legs and the pin from the same table, and nothing leaves the site", async ({ page }) => {
      const outside = [];
      const problems = [];
      page.on("request", (request) => { if (!request.url().startsWith(base) && !request.url().startsWith("data:")) outside.push(request.url()); });
      page.on("pageerror", (error) => problems.push(String(error)));
      page.on("console", (message) => { if (message.type() === "error") problems.push(message.text()); });
      await page.goto(`${base}/appendix/index.html?lang=zh`);
      await expect(page.getByRole("heading", { level: 1, name: "貿易條件速查卡" })).toBeVisible();
      await expect(page.locator("#boundary")).toContainText("不含具體天數、費用或比例");
      await expect(page.locator("#pick button")).toHaveCount(5);
      await expect(page.locator("#strip .leg")).toHaveCount(6);
      expect(await shown(page)).toEqual({ legs: TERMS.fca.legs, risk: TERMS.fca.risk, checked: ["fca"] });
      for (const id of TERM_ORDER) {
        await page.locator(`#pick button[data-term="${id}"]`).click();
        expect(await shown(page)).toEqual({ legs: TERMS[id].legs, risk: TERMS[id].risk, checked: [id] });
        await expect(page.locator("#term-code")).toHaveText(TERMS[id].code);
        await expect(page.locator("#one-line")).toHaveText(TERMS[id].zh.one);
        await expect(page.locator("#chips")).toContainText(TERMS[id].zh.riskAt);
        await expect(page.locator("#live")).toHaveText(summaryOf(id, "zh"));
        expect(page.url()).toContain(`#${id}`);
      }
      // insurance is shown as required only for CIF
      await page.locator('#pick button[data-term="cif"]').click();
      await expect(page.locator("#chips")).toContainText("賣方（最低險別 ICC (C)）");
      await page.locator('#pick button[data-term="ddp"]').click();
      await expect(page.locator("#chips")).toContainText("條款沒有要求");
      await noOverflow(page);
      expect(outside).toEqual([]);
      expect(problems).toEqual([]);
      if (SHOTS) {
        for (const id of TERM_ORDER) {
          await page.locator(`#pick button[data-term="${id}"]`).click();
          await page.waitForTimeout(800); // let the colour and pin transitions finish before the picture is taken
          await page.locator("#card").screenshot({ path: `${SHOTS}/appendix-${width}-zh-${id}.png` });
        }
        await page.screenshot({ path: `${SHOTS}/appendix-${width}-zh-top.png` });
        await page.screenshot({ path: `${SHOTS}/appendix-${width}-zh-full.png`, fullPage: true });
      }
    });

    test("en: English text, the language and the way back to the game are kept", async ({ page }) => {
      await page.goto(`${base}/appendix/index.html?lang=en`);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("heading", { level: 1, name: "The trade-terms card" })).toBeVisible();
      await expect(page.locator("#strip .leg").first()).toContainText("Prepare the goods");
      await expect(page.locator("#live")).toHaveText(summaryOf("fca", "en"));
      await expect(page.locator("#play-top")).toHaveAttribute("href", "../?lang=en");
      await expect(page.locator("#cast-link")).toHaveAttribute("href", "../cast/?lang=en");
      await expect(page.locator("#home")).toHaveAttribute("href", "/?lang=en#showcase");
      await noOverflow(page);
      if (SHOTS) {
        await page.locator("#card").screenshot({ path: `${SHOTS}/appendix-${width}-en-fca.png` });
        await page.screenshot({ path: `${SHOTS}/appendix-${width}-en-full.png`, fullPage: true });
      }
    });

    test("the language buttons switch the page and the address, and keep the chosen term", async ({ page }) => {
      await page.goto(`${base}/appendix/index.html#cif`);
      expect((await shown(page)).checked).toEqual(["cif"]);
      await page.locator('#lang-group button[data-lang="en"]').click();
      await expect(page.getByRole("heading", { level: 1, name: "The trade-terms card" })).toBeVisible();
      expect(page.url()).toContain("lang=en");
      expect(page.url()).toContain("#cif");
      expect((await shown(page)).checked).toEqual(["cif"]);
      await expect(page.locator("#term-name")).toHaveText("Cost, Insurance and Freight");
      await page.locator('#lang-group button[data-lang="zh"]').click();
      await expect(page.locator("#term-name")).toHaveText("成本、保險費加運費");
      expect(page.url()).not.toContain("lang=en");
    });

    test("the arrow keys walk along the five terms, one tab stop for the group", async ({ page }) => {
      await page.goto(`${base}/appendix/index.html#exw`);
      await page.locator('#pick button[data-term="exw"]').focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.locator('#pick button[data-term="fca"]')).toBeFocused();
      expect((await shown(page)).checked).toEqual(["fca"]);
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await expect(page.locator('#pick button[data-term="ddp"]')).toBeFocused();
      expect(await page.locator('#pick button[tabindex="0"]').count()).toBe(1);
    });

    test("choosing a situation in the how-to-choose list switches the card", async ({ page }) => {
      await page.goto(`${base}/appendix/index.html?lang=zh`);
      await page.locator("#how button", { hasText: "整船散裝海運" }).click();
      expect((await shown(page)).checked).toEqual(["fob"]);
      await page.locator("#how button", { hasText: "完全不想碰運輸與清關" }).click();
      expect((await shown(page)).checked).toEqual(["ddp"]);
      await expect(page.locator("#card")).toBeInViewport();
    });

    test("the container gap shows the four stops of the game and both pins", async ({ page }) => {
      await page.goto(`${base}/appendix/index.html?lang=zh`);
      await expect(page.locator("#gap li")).toHaveText(["第 7 站進港", "第 8 站報關", "第 9 站查驗", "第 10 站裝船"]);
      await expect(page.locator("#gap .flag")).toHaveText(["FCA 風險在這裡", "FOB 風險在這裡"]);
      if (SHOTS) await page.locator(".street").screenshot({ path: `${SHOTS}/appendix-${width}-zh-street.png` });
    });

    test("the game links to the card from the start screen and the wrap-up, in the visitor's language", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=en`);
      await expect(page.locator("#see-appendix")).toHaveText("Appendix: the trade-terms card");
      await page.locator("#see-appendix").click();
      await expect(page.getByRole("heading", { level: 1, name: "The trade-terms card" })).toBeVisible();
      await page.locator("#play-bottom").click();
      await expect(page.getByRole("heading", { level: 1, name: "Trade Street" })).toBeVisible();
      await page.goto(`${base}/index.html?lang=zh`);
      await expect(page.locator("#see-appendix")).toHaveAttribute("href", "appendix/");
      await expect(page.locator("#appendix-link")).toHaveAttribute("href", "appendix/");
    });

    test("with reduced motion the pin and the legs change at once", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${base}/appendix/index.html?lang=zh`);
      expect(await page.locator("#strip .risk").evaluate((node) => getComputedStyle(node).transitionDuration)).toMatch(/^0s/);
      expect(await page.locator("#strip .leg").first().evaluate((node) => getComputedStyle(node).transitionDuration)).toMatch(/^0s/);
    });

    test("every leg has a name in both languages and both sides are visible without colour (a word on each leg)", async ({ page }) => {
      await page.goto(`${base}/appendix/index.html?lang=zh`);
      for (const id of TERM_ORDER) {
        await page.locator(`#pick button[data-term="${id}"]`).click();
        const words = await page.locator("#strip .leg .who").allInnerTexts();
        expect(words).toEqual([...TERMS[id].legs].map((who) => (who === "s" ? "賣方" : "買方")));
      }
      expect(LEGS.length).toBe(6);
    });
  });
}
