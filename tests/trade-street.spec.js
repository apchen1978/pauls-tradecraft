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
  for (let i = 0; i < 14; i += 1) {
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
      await expect(page.locator("#route-entry li")).toHaveCount(14);
      await noOverflow(page);
      expect(outside).toEqual([]);
      expect(problems).toEqual([]);
    });

    test("the harbour picture is on the first screen, with the Start button still in view", async ({ page }) => {
      for (const lang of ["zh", "en"]) {
        await page.goto(`${base}/index.html?lang=${lang}`);
        await expect(page.locator("#map-stage")).toBeVisible();
        const map = await page.locator("#map-stage").boundingBox();
        const start = await page.locator("#start").boundingBox();
        const height = page.viewportSize().height;
        // the picture starts above the fold (at least 150px of it showing), and the Start button is still in view
        expect(height - map.y).toBeGreaterThanOrEqual(150);
        expect(start.y + start.height).toBeLessThanOrEqual(height);
        await noOverflow(page);
      }
    });

    test("en: the Start button is also on the first screen", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=en`);
      const box = await page.locator("#start").boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height);
    });

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the result names the one stop you were most likely to miss, with a newcomer tip, and the address is unchanged`, async ({ page }) => {
        // holiday, port-entry choice A costs a cell but is the good choice: it must not be named; the off-course choice at stop 8 is
        await page.goto(`${base}/index.html?lang=${lang}&s=holiday&c=AAAACA`);
        await expect(page.locator("#miss")).toBeVisible();
        await expect(page.locator("#miss-head")).toContainText(lang === "zh" ? "最可能漏的一站：8. 報關" : "most likely to miss this time: 8. Customs");
        await expect(page.locator("#miss-tip-label")).toContainText(lang === "zh" ? "業界常見" : "common practice");
        await expect(page.locator("#miss-tip")).not.toBeEmpty();
        // peak, all A: nothing used buffer, so it points at a stop the game never plays (6 or 13)
        await page.goto(`${base}/index.html?lang=${lang}&s=peak&c=AAAAAA`);
        await expect(page.locator("#miss-head")).toContainText(lang === "zh" ? "沒有走偏的選擇" : "went off course");
        await expect(page.locator("#miss-head")).toContainText(/(6\. |13\. )/);
        await noOverflow(page);
        expect(page.url()).toContain("s=peak&c=AAAAAA");
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the result is not a dead end: it points to the lamp and the street corner in the same language`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}&s=peak&c=AAAAAA`);
        await expect(page.locator("#loop")).toBeVisible();
        await expect(page.locator("#loop-lamp")).toHaveAttribute("href", `/prototype/take-the-lantern-apart/?lang=${lang}`);
        await expect(page.locator("#loop-corner")).toHaveAttribute("href", `/prototype/secrets-on-the-corner/?lang=${lang}`);
        await expect(page.locator("#loop-lamp")).toContainText(lang === "zh" ? "一盞燈的約定" : "A Lamp, As Promised");
        await expect(page.locator("#loop-corner")).toContainText(lang === "zh" ? "街角的秘密" : "Secrets on the Corner");
        const other = lang === "zh" ? "en" : "zh";
        await page.locator(`[data-lang="${other}"]`).first().click();
        await expect(page.locator("#loop-lamp")).toHaveAttribute("href", `/prototype/take-the-lantern-apart/?lang=${other}`);
        await noOverflow(page);
        expect(page.url()).toContain("s=peak&c=AAAAAA");
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the two extra stops are marked as common practice, carry their point, and sit under the stop heading`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}`);
        await page.locator("#start").click();
        for (let i = 0; i < 5; i += 1) {
          if (await page.locator("#choices").isVisible()) await page.locator("#choices .choice").first().click();
          await page.locator("#next").click();
        }
        await expect(page.locator("#progress")).toContainText(lang === "zh" ? "第 6 站" : "Stop 6");
        await expect(page.locator("#extra-tag")).toBeVisible();
        await expect(page.locator("#extra-tag")).toContainText(lang === "zh" ? "業界常見的補充站" : "common extra stop");
        await expect(page.locator("#choices")).toBeHidden();
        await expect(page.locator("#brief")).toContainText(lang === "zh" ? "截港前" : "before the port cut-off");
        await expect(page.locator("#brief .handoff h3")).toContainText(lang === "zh" ? "業界常見" : "common practice");
        // heading order: the stop title is a level-2 heading and the hand-over heading sits below it
        const order = await page.evaluate(() => [...document.querySelectorAll("#station-title, #brief .handoff h3")].map((node) => node.tagName));
        expect(order).toEqual(["H2", "H3"]);
        await page.locator("#next").click();
        await expect(page.locator("#extra-tag")).toBeHidden();
        await noOverflow(page);
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: hand-over block: shown on the read-only stops, held back on decision stops until a choice, never repeats the risk line`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}`);
        await page.locator("#start").click();
        await page.locator("#next").click(); // stop 1 -> 2
        await expect(page.locator("#brief .handoff")).toHaveCount(0); // stop 2 is a decision: nothing before the choice
        await page.locator("#choices button[data-option=\"A\"]").click();
        await expect(page.locator("#feedback .handoff")).toHaveCount(1);
        await expect(page.locator("#feedback .handoff p")).toHaveCount(4); // free choice: three lines plus the newcomer tip; the risk line is not shown elsewhere
        await page.locator("#next").click();
        await page.locator("#choices button[data-option=\"A\"]").click();
        await page.locator("#next").click(); // stop 4: read-only
        await expect(page.locator("#brief .handoff")).toHaveCount(1);
        await expect(page.locator("#brief .handoff p")).toHaveCount(3);
        await expect(page.locator("#brief")).not.toContainText(lang === "zh" ? "卡住會怎樣" : "If it goes wrong");
        await noOverflow(page);
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: newcomer hints: a legend for the four lights, a note that stop 1 has nothing to choose, and what the buffer line says`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}`);
        await page.locator("#start").click();
        await expect(page.locator("#lights-legend-play")).toContainText(lang === "zh" ? "✕ 用掉 2 格以上" : "✕ two or more used");
        await expect(page.locator("#first-note")).toBeVisible();
        await expect(page.locator("#first-note")).toContainText(lang === "zh" ? "這一站不用選" : "Nothing to choose at this stop");
        await page.locator("#next").click();
        await expect(page.locator("#first-note")).toBeHidden();
        await page.goto(`${base}/index.html?lang=${lang}&s=rush&c=BBBBBB`);
        await expect(page.locator("#lights-legend-result")).toBeVisible();
        await expect(page.locator("#buffer-line")).toContainText(lang === "zh" ? "這一趟沒用到緩衝格" : "used no buffer cells");
        await expect(page.locator("#buffer-line")).toContainText(lang === "zh" ? "遊戲代幣" : "game token");
        await page.goto(`${base}/index.html?lang=${lang}&s=rush&c=CCAAAA`);
        await expect(page.locator("#buffer-line")).toContainText(lang === "zh" ? /用掉 [1-9] 格緩衝/ : /used [1-9] buffer cells?/);
        await noOverflow(page);
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the numbered list under the map opens the same stop preview as the dot, and closing it returns focus to the list`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}`);
        const buttons = page.locator("#route-entry .route-btn");
        await expect(buttons).toHaveCount(14);
        await buttons.nth(2).click();
        await expect(page.locator("#preview")).toBeVisible();
        await expect(page.locator("#preview-title")).toContainText("3.");
        await expect(page.locator("#route-entry li").nth(2)).toHaveClass(/now/);
        await expect(page.locator('#hotspots .hot[data-station="2"]')).toHaveClass(/now/);
        await buttons.nth(7).click();
        await expect(page.locator("#preview-title")).toContainText("8.");
        await expect(page.locator("#route-entry li.now")).toHaveCount(1);
        await page.locator("#preview-close").click();
        await expect(page.locator("#preview")).toBeHidden();
        await expect(buttons.nth(7)).toBeFocused();
        await expect(page.locator("#route-entry li.now")).toHaveCount(0);
        await noOverflow(page);
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: learn more: "what are these four moments" explains the cut-offs in the page's own words, and a step's wording note shows`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}`);
        await page.locator("#start").click();
        const help = page.locator("#lights-help-play");
        await expect(help).toBeVisible();
        await expect(help.locator("summary")).toHaveText(lang === "zh" ? "這四個時間點是什麼？" : "What are these four moments?");
        await expect(help.locator(".lights-help-body")).toBeHidden();
        await help.locator("summary").click();
        await expect(help.locator(".lights-help-body")).toBeVisible();
        await expect(help.locator("li")).toHaveCount(4);
        await expect(help).toContainText(lang === "zh" ? "截單" : "Document cut-off");
        await expect(help).toContainText(lang === "zh" ? "截港" : "Port cut-off");
        // step 1 has no wording note worth showing; step 3 (SO) does
        await expect(page.locator("#brief")).not.toContainText(lang === "zh" ? "用語小註" : "A note on the words");
        await page.locator("#next").click();
        await page.locator('#choices button[data-option="A"]').click();
        await page.locator("#next").click();
        await expect(page.locator("#station-title")).toContainText(lang === "zh" ? "SO" : "SO");
        await expect(page.locator("#brief")).toContainText(lang === "zh" ? "用語小註" : "A note on the words");
        await expect(page.locator("#brief")).toContainText(lang === "zh" ? "Shipping Order" : "Shipping Order");
        await noOverflow(page);
      });

      test(`${lang}: the stop preview shows the wording note for a step that has one`, async ({ page }) => {
        await page.goto(`${base}/index.html?lang=${lang}`);
        await page.locator("#route-entry .route-btn").nth(6).click();
        await expect(page.locator("#preview-cross")).toBeVisible();
        await expect(page.locator("#preview-cross")).toContainText(lang === "zh" ? "用語小註" : "A note on the words");
        await page.locator("#route-entry .route-btn").nth(0).click();
        await expect(page.locator("#preview-cross")).toBeHidden();
      });
    }

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

    test("option order is shuffled per play, labels stay A-B-C by position, and the order holds while going back", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      const seen = new Set();
      for (let play = 0; play < 12; play += 1) {
        await page.locator("#start").click();
        await page.locator("#next").click(); // stop 1 is a story stop
        const ids = await page.locator("#choices button").evaluateAll((nodes) => nodes.map((n) => n.dataset.option));
        expect([...ids].sort()).toEqual(["A", "B", "C"]);
        await expect(page.locator("#choices .letter")).toHaveText(["A", "B", "C"]);
        seen.add(ids.join(""));
        await page.locator("#back").click(); // back to stop 1
        await page.locator("#next").click();
        expect(await page.locator("#choices button").evaluateAll((nodes) => nodes.map((n) => n.dataset.option))).toEqual(ids);
        await page.goto(`${base}/index.html?lang=zh`);
      }
      expect(seen.size).toBeGreaterThan(1);
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

    test("at stop 12 the page says the ship has already sailed", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await page.locator("#start").click();
      let d = 0;
      for (let i = 0; i < 11; i += 1) {
        if (await page.locator("#choices").isVisible()) { await page.locator("#choices button[data-option='A']").click(); d += 1; }
        await page.locator("#next").click();
      }
      await expect(page.locator("#progress")).toContainText("第 12 站");
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

    test("the map is a picture that loads, the phone gets the phone map, and the fourteen stops are tappable dots on it", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      const info = await page.evaluate(() => { const img = document.getElementById("map-img"); return { loaded: img.complete && img.naturalWidth > 0, src: img.currentSrc, alt: img.alt }; });
      expect(info.loaded).toBe(true);
      expect(info.alt.length).toBeGreaterThan(20);
      if (page.viewportSize().width < 640) expect(info.src).toContain("mobile"); else expect(info.src).not.toContain("mobile");
      await expect(page.locator("#hotspots .hot")).toHaveCount(14);
      const stage = await page.locator("#map-stage").boundingBox();
      for (let i = 0; i < 14; i += 1) {
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
      await page.locator('#hotspots .hot[data-station="7"]').click();
      await expect(page.locator("#preview")).toBeVisible();
      await expect(page.locator("#preview-name")).toHaveText("單單");
      await expect(page.locator("#preview-title")).toContainText("報關");
      await expect(page.locator("#entry")).toBeVisible();
      await expect(page.locator("#play")).toBeHidden();
      await page.locator("#preview-close").click();
      await expect(page.locator("#preview")).toBeHidden();
      await expect(page.locator('#hotspots .hot[data-station="7"]')).toBeFocused();
      // an added stop says it is a common extra stop
      await page.locator('#hotspots .hot[data-station="5"]').click();
      await expect(page.locator("#preview-extra")).toBeVisible();
      await expect(page.locator("#preview-title")).toContainText("VGM");
      await page.locator("#preview-close").click();
      await expect(page.locator("#preview-extra")).toBeHidden();
      await noOverflow(page);
    });

    test("while playing, the map shrinks to a window that follows the current stop, and people appear as pictures", async ({ page }) => {
      await page.goto(`${base}/index.html?lang=zh`);
      await page.locator("#start").click();
      await expect(page.locator("#map-stage.playing")).toBeVisible();
      await expect(page.locator('#hotspots .hot[data-station="0"]')).toHaveClass(/now/);
      const stageHeight = (await page.locator("#map-stage").boundingBox()).height;
      // a window onto the map, clearly smaller than the whole picture it shows (compare to the picture itself, not to the entry layout)
      const pictureHeight = (await page.locator("#map-inner").boundingBox()).height;
      expect(stageHeight).toBeLessThan(pictureHeight * 0.7);
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
        const caseHref = await page.locator("#takeaway-case").getAttribute("href");
        expect(caseHref).toContain("/cases/first-container/");
        if (lang === "en") expect(caseHref).toContain("lang=en");
        await expect(page.locator("#more-asks")).toBeVisible();
        await expect(page.locator("#more-asks .more-body")).toBeHidden();
        await page.locator("#more-asks summary").click();
        await expect(page.locator("#more-asks li")).toHaveCount(5);
        await expect(page.locator("#more-asks")).toContainText(lang === "zh" ? "截單、截關（結關）、截港" : "document cut-off, the customs cut-off");
        await page.locator("#more-danger summary").click();
        await expect(page.locator("#more-danger li")).toHaveCount(4);
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

test("the fourteen stops are named in both languages and every decision step has a name", () => {
  expect(SHORT.zh).toHaveLength(14);
  expect(SHORT.en).toHaveLength(14);
  for (const decision of DECISIONS) expect(SHORT.zh[decision.step - 1]).toBeTruthy();
});

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`decision impact path at ${width}px (${lang}): comparison is temporary and the handovers stay readable`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`${base}/index.html?lang=${lang}`);
      await page.locator("#start").click();
      await page.locator("#next").click(); // booking
      await page.locator('#choices button[data-option="A"]').click();
      await page.locator("#next").click(); // SO
      await page.locator('#choices button[data-option="A"]').click();

      const urlBefore = page.url();
      const bufferBefore = await page.locator("#buffer").getAttribute("aria-label");
      const answerBefore = await page.locator("#feedback > p").allTextContents();
      const trigger = page.locator("#feedback .ripple-trigger");
      await expect(trigger).toBeVisible();
      await trigger.click();
      await expect(page.locator("#ripple-panel .ripple-stage")).toHaveCount(3);
      await page.locator('#ripple-panel [data-ripple-option="B"]').click();
      await expect(page.locator("#ripple-panel .ripple-status")).toContainText(lang === "zh" ? "逐項核對" : "line by line");
      await page.locator("#ripple-panel .ripple-controls .ripple-step").nth(1).click();
      await expect(page.locator("#ripple-panel .ripple-counter")).toContainText(lang === "zh" ? "第 2 棒" : "Handover 2");
      await page.locator('#ripple-panel [data-ripple-option="C"]').click();
      await expect(page.locator("#ripple-panel .ripple-status")).toContainText(lang === "zh" ? "沿用上次安排" : "previous plan is reused");

      expect(page.url()).toBe(urlBefore);
      expect(await page.locator("#buffer").getAttribute("aria-label")).toBe(bufferBefore);
      expect(await page.locator("#feedback > p").allTextContents()).toEqual(answerBefore);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test("decision impact path keeps manual review available with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/index.html?lang=en`);
  await page.locator("#start").click();
  await page.locator("#next").click();
  await page.locator('#choices button[data-option="A"]').click();
  await page.locator("#next").click();
  await page.locator('#choices button[data-option="A"]').click();
  await page.locator("#feedback .ripple-trigger").click();
  await expect(page.locator("#ripple-panel .ripple-play")).toBeDisabled();
  await expect(page.locator("#ripple-panel .ripple-reduced")).toBeVisible();
  await page.locator("#ripple-panel .ripple-controls .ripple-step").nth(1).click();
  await expect(page.locator("#ripple-panel .ripple-counter")).toContainText("Handover 2");
});
