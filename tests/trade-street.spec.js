import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DECISIONS, resolve, SCENARIOS, STYLES } from "../prototype/trade-street/game.js";
import { CAST } from "../prototype/trade-street/game.js";
import { SHORT, UI } from "../prototype/trade-street/app.js";

// The page is a single folder, served here on its own (the shared preview does not copy it yet).
const ROOT = resolvePath(fileURLToPath(new URL("../prototype/trade-street", import.meta.url)));
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
let server;
let base;

test.beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
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

async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

// Walk the whole route. `letters` are the six choices; a decision station asks for one.
async function walk(page, letters) {
  await page.locator("#start").click();
  let d = 0;
  for (let i = 0; i < 12; i += 1) {
    if (await page.locator("#choices").isVisible()) {
      await page.locator(`#choices button[data-option="${letters[d]}"]`).click();
      d += 1;
    }
    await page.locator("#next").click();
  }
}

for (const width of [390, 1440]) {
  test.describe(`trade street at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 900 } });

    test("zh: entry shows the boundary, three situations, and a start button on the first screen; no outside requests", async ({ page }) => {
      const outside = [];
      const problems = [];
      page.on("request", (request) => { if (!request.url().startsWith(base) && !request.url().startsWith("data:")) outside.push(request.url()); });
      page.on("pageerror", (error) => problems.push(String(error)));
      page.on("console", (message) => { if (message.type() === "error" && !/favicon/.test(message.text())) problems.push(message.text()); });
      await page.goto(`${base}/index.html?lang=zh`);
      await expect(page.getByRole("heading", { level: 1, name: "貿易街" })).toBeVisible();
      await expect(page.locator("#boundary")).toContainText("教學示意");
      await expect(page.locator("#scn button")).toHaveCount(3);
      await expect(page.locator("#scn button[aria-checked='true']")).toHaveCount(1);
      const box = await page.locator("#start").boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height);
      await expect(page.locator("#route-entry li")).toHaveCount(12);
      await noOverflow(page);
      expect(outside).toEqual([]);
      expect(problems).toEqual([]);
    });

    test("a full run reaches the result the rules predict, and the address records it", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await page.locator("#scn button[data-scenario='rush']").click();
      await walk(page, ["B", "A", "B", "A", "A", "B"]);
      const res = resolve("rush", "BABAAB");
      await expect(page.locator("#result")).toBeVisible();
      await expect(page.locator("#tier")).toHaveText(UI.zh.tier[res.tier].name, { timeout: 8000 });
      await expect(page.locator("#card-name")).toHaveText(CAST[res.character].zh.name);
      await expect(page.locator("#handover")).toHaveText(UI.zh.handover[res.handover]);
      await expect(page.locator("#picks li")).toHaveCount(6);
      expect(page.url()).toContain("s=rush");
      expect(page.url()).toContain("c=BABAAB");
      await expect(page.locator("#cast li")).toHaveCount(8);
      await noOverflow(page);
    });

    test("a costly choice shows its cost and the person who answers; choosing again works", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await page.locator("#scn button[data-scenario='peak']").click();
      await page.locator("#start").click();
      await page.locator("#next").click(); // stop 1 is a story stop
      await expect(page.locator("#choices")).toBeVisible();
      await expect(page.locator("#next")).toBeDisabled();
      await page.locator("#choices button[data-option='C']").click();
      await expect(page.locator("#feedback")).toContainText("用掉 2 格");
      await expect(page.locator("#feedback")).toContainText(SCENARIOS.peak.zh.name);
      await expect(page.locator("#feedback")).toContainText("老廠：");
      await expect(page.locator("#buffer")).toContainText("緩衝格 0 / 2");
      await page.locator("#change").click();
      await expect(page.locator("#feedback")).toBeHidden();
      await page.locator("#choices button[data-option='B']").click();
      await expect(page.locator("#feedback")).toContainText("沒有用掉緩衝格");
      await expect(page.locator("#buffer")).toContainText("緩衝格 2 / 2");
      await noOverflow(page);
    });

    test("after the ship sails, the last decision changes the documents, not the voyage", async ({ page }) => {
      const outcome = [];
      for (const last of ["A", "C"]) {
        await page.goto(`${base}/index.html?lang=zh`);
        await page.locator("#scn button[data-scenario='holiday']").click();
        await walk(page, ["B", "A", "B", "A", "A", last]);
        await expect(page.locator("#tier")).toBeVisible({ timeout: 8000 });
        outcome.push({ tier: await page.locator("#tier").innerText(), handover: await page.locator("#handover").innerText() });
      }
      expect(outcome[0].tier).toBe(outcome[1].tier);
      expect(outcome[0].handover).not.toBe(outcome[1].handover);
    });

    test("at stop 11 the page says the ship has already sailed", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await page.locator("#start").click();
      let d = 0;
      for (let i = 0; i < 10; i += 1) {
        if (await page.locator("#choices").isVisible()) { await page.locator("#choices button[data-option='A']").click(); d += 1; }
        await page.locator("#next").click();
      }
      await expect(page.locator("#progress")).toContainText("第 11 站");
      await expect(page.locator("#scn-note")).toContainText("船已經開了");
      expect(d).toBe(5);
    });

    test("a shared address opens the result directly; a bad one opens the entry", async ({ page }) => {
      await page.goto(`${base}/index.html?s=holiday&c=CCCCCC`);
      const res = resolve("holiday", "CCCCCC");
      await expect(page.locator("#result")).toBeVisible();
      await expect(page.locator("#tier")).toHaveText(UI.zh.tier[res.tier].name);
      await expect(page.locator("#card-name")).toHaveText(CAST[res.character].zh.name);
      await noOverflow(page);
      await page.goto(`${base}/index.html?s=holiday&c=XXXXXX`);
      await expect(page.locator("#entry")).toBeVisible();
      await expect(page.locator("#result")).toBeHidden();
    });

    test("en: English text, roles instead of personal names, and the card says it is a teaching sketch", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=en&s=peak&c=ABABAB`);
      const res = resolve("peak", "ABABAB");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("heading", { level: 1, name: "Trade Street" })).toBeVisible();
      await expect(page.locator("#tier")).toHaveText(UI.en.tier[res.tier].name);
      await expect(page.locator("#card-name")).toHaveText(CAST[res.character].en.name);
      await expect(page.locator("#card-boundary")).toContainText("Teaching sketch");
      await expect(page.locator("#style-line")).toContainText(STYLES[res.style].en.name);
      await expect(page.locator("#cast li").first()).toContainText("Yuzai");
      await noOverflow(page);
    });

    test("keyboard: a choice can be made and moved past with Enter", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await page.locator("#start").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#play")).toBeVisible();
      await page.locator("#next").focus();
      await page.keyboard.press("Enter"); // to stop 2
      await page.locator("#choices button[data-option='A']").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#feedback")).toBeVisible();
      await expect(page.locator("#next")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#progress")).toContainText("第 3 站");
    });

    test("the map is a picture that loads, the phone gets the phone map, and the twelve stops are tappable dots on it", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      const info = await page.evaluate(() => { const img = document.getElementById("map-img"); return { loaded: img.complete && img.naturalWidth > 0, src: img.currentSrc, alt: img.alt }; });
      expect(info.loaded).toBe(true);
      expect(info.alt.length).toBeGreaterThan(20);
      if (page.viewportSize().width < 640) expect(info.src).toContain("mobile"); else expect(info.src).not.toContain("mobile");
      await expect(page.locator("#hotspots .hot")).toHaveCount(12);
      const stage = await page.locator("#map-stage").boundingBox();
      for (let i = 0; i < 12; i += 1) {
        const box = await page.locator(`#hotspots .hot[data-station="${i}"]`).boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(stage.x);
        expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width + 1);
        expect(box.y).toBeGreaterThanOrEqual(stage.y);
        expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
        expect(box.width).toBeGreaterThanOrEqual(26);
      }
      await expect(page.locator("#hotspots .hot").nth(2)).toHaveAttribute("aria-label", "第 3 站：SO");
      await noOverflow(page);
    });

    test("tapping a stop on the map shows who is there, without starting the game", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await page.locator('#hotspots .hot[data-station="6"]').click();
      await expect(page.locator("#preview")).toBeVisible();
      await expect(page.locator("#preview-name")).toHaveText("單單");
      await expect(page.locator("#preview-title")).toContainText("報關");
      await expect(page.locator("#entry")).toBeVisible();
      await expect(page.locator("#play")).toBeHidden();
      await page.locator("#preview-close").click();
      await expect(page.locator("#preview")).toBeHidden();
      await expect(page.locator('#hotspots .hot[data-station="6"]')).toBeFocused();
      await noOverflow(page);
    });

    test("while playing, the map shrinks to a window that follows the current stop, and people appear as pictures", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await page.locator("#start").click();
      await expect(page.locator("#map-stage.playing")).toBeVisible();
      await expect(page.locator('#hotspots .hot[data-station="0"]')).toHaveClass(/now/);
      const stageHeight = (await page.locator("#map-stage").boundingBox()).height;
      expect(stageHeight).toBeLessThan(260);
      const top1 = await page.locator("#map-inner").evaluate((node) => node.style.top);
      await page.locator("#next").click();
      await expect(page.locator('#hotspots .hot[data-station="1"]')).toHaveClass(/now/);
      await expect(page.locator('#hotspots .hot[data-station="0"]')).toHaveClass(/done/);
      const top2 = await page.locator("#map-inner").evaluate((node) => node.style.top);
      expect(top2).not.toBe(top1);
      // the person speaking is a picture
      await expect.poll(() => page.evaluate(() => { const img = document.querySelector("#avatar img"); return Boolean(img && img.complete && img.naturalWidth > 0); })).toBe(true);
      await expect(page.locator("#speaker-name")).toHaveText("阿代");
      await noOverflow(page);
    });

    test("the result card shows the whole figure of the matching person, and the cast shows eight pictures", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh&s=holiday&c=ABABAB`);
      const res = resolve("holiday", "ABABAB");
      await expect(page.locator("#card-name")).toHaveText(CAST[res.character].zh.name);
      await expect.poll(() => page.evaluate(() => { const img = document.getElementById("card-figure"); return Boolean(!img.hidden && img.complete && img.naturalWidth > 0 && img.naturalHeight > img.naturalWidth); })).toBe(true);
      await expect.poll(() => page.evaluate(() => document.querySelectorAll("#cast .avatar img").length)).toBe(8);
      await expect(page.locator("#map-stage")).toBeHidden();
      await noOverflow(page);
    });

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the entry explains in plain words that exporting is a relay, and the result ends with what you saw`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}`);
        await expect(page.locator("#primer-title")).toBeVisible();
        if (!(await page.locator("#primer").evaluate((n) => n.open))) await page.locator("#primer-title").click();
        await expect(page.locator("#primer-body")).toBeVisible();
        await expect(page.locator("#primer-title")).toHaveText(lang === "zh" ? /一群人在接力/ : /is a relay/);
        await expect(page.locator("#primer-body")).toContainText(lang === "zh" ? "貨代（替你安排運輸的公司）" : "forwarder (the company that arranges transport for you)");
        await noOverflow(page);
        await walk(page, ["B", "A", "A", "A", "A", "B"]);
        await expect(page.locator("#result")).toBeVisible();
        await expect(page.locator("#takeaway")).toBeVisible();
        await expect(page.locator("#takeaway-list li")).toHaveCount(3);
        const href = await page.locator("#takeaway-link").getAttribute("href");
        expect(href).toContain("../one-container-12-steps/");
        if (lang === "en") expect(href).toContain("lang=en");
        await noOverflow(page);
      });
    }

    test("if the pictures cannot load, the game still works with initials", async ({ page }) => {
      await page.route("**/assets/**/*.webp", (route) => route.abort());
      await page.goto(`${base}/index.html?lang=zh`);
      await walk(page, ["B", "A", "A", "A", "A", "B"]);
      await expect(page.locator("#result")).toBeVisible();
      await expect(page.locator("#tier")).toBeVisible({ timeout: 8000 });
      await expect(page.locator("#card-figure")).toBeHidden();
      await expect(page.locator("#cast li")).toHaveCount(8);
      await expect(page.locator("#cast .avatar").first()).not.toHaveClass(/has-img/);
      await expect(page.locator("#cast .avatar").first()).toHaveText(/\S/);
      await noOverflow(page);
    });

    test("the voyage card downloads as a picture", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh&s=rush&c=CBACBA`);
      const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#download").click()]);
      expect(download.suggestedFilename()).toBe("trade-street-rush-CBACBA.png");
      await expect(page.locator("#status")).toHaveText(UI.zh.downloaded);
    });

    test("with reduced motion the voyage result appears at once", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${base}/index.html?lang=zh`);
      await walk(page, ["A", "A", "A", "A", "A", "A"]);
      await expect(page.locator("#tier")).toBeVisible({ timeout: 1000 });
      await expect(page.locator("#result-lights .lamp.green")).toHaveCount(4);
    });
  });
}

test("the twelve stops are named in both languages and every decision step has a name", () => {
  expect(SHORT.zh).toHaveLength(12);
  expect(SHORT.en).toHaveLength(12);
  for (const decision of DECISIONS) expect(SHORT.zh[decision.step - 1]).toBeTruthy();
});
