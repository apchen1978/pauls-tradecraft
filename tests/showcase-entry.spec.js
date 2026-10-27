import { mkdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { resolve, extname } from "node:path";
import { expect, test } from "@playwright/test";

const destinations = [
  "roomverse-3d", "trade-street", "ai-funnel", "enterprise-ai-path", "feeling-to-room", "teammate-type", "secrets-on-the-corner",
  "take-the-lantern-apart", "match-the-approved-lamp", "room-mode-remote",
];
mkdirSync("output/showcase-entry", { recursive: true });

for (const width of [390, 768, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} ${width}: choose a work directly or follow the suggested start`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(`/?lang=${lang}#showcase`);
      const section = page.locator("#showcase");
      await expect(section.getByRole("heading", { level: 2 })).toHaveText(lang === "zh" ? "互動作品" : "Interactive Works");
      await expect(section.locator("article")).toHaveCount(destinations.length);
      for (const [index, destination] of destinations.entries()) {
        const card = section.locator("article").nth(index);
        if (destination === "roomverse-3d") {
          // ROOMVERSE is a series card: one cover and one button per open room, in order Room 01, Room 02, Room 03.
          const covers = card.locator("a:has(img)"), buttons = card.locator("a:not(:has(img))");
          await expect(covers).toHaveCount(3); await expect(buttons).toHaveCount(3);
          for (const [i, path] of ["/prototype/roomverse-3d/", "/prototype/roomverse-3d/bedroom/", "/prototype/roomverse-3d/kitchen/"].entries()) {
            await expect(covers.nth(i)).toHaveAttribute("href", `${path}?from=home&lang=${lang}`); // the home cover opens each room in golden hour
            await expect(buttons.nth(i)).toHaveAttribute("href", `${path}?from=home&lang=${lang}`);
            await expect(covers.nth(i).locator("img")).toHaveCount(1);
          }
          await expect(card.getByRole("heading", { level: 4 })).toHaveCount(3);
          await expect(card.locator("h3 + p")).not.toBeEmpty();
          await expect(card.locator("h3 + p + p")).not.toBeEmpty();
          continue;
        }
        const cover = card.locator("a:has(img)");
        const cta = card.locator("a:not(:has(img))");
        await expect(cover).toHaveCount(1);
        await expect(cover).toHaveAttribute("href", `/prototype/${destination}/?lang=${lang}`);
        await expect(cover).toHaveAttribute("tabindex", "-1");
        await expect(cover).toHaveAttribute("aria-hidden", "true");
        await expect(cover.locator("img")).toHaveCount(1);
        await expect(cta).toHaveCount(1);
        await expect(cta).toHaveAttribute("href", `/prototype/${destination}/?lang=${lang}`);
        // Every card now has a visible activity and a takeaway, including the corner.
        await expect(card.locator("h3 + p")).not.toBeEmpty();
        await expect(card.locator("h3 + p + p")).not.toBeEmpty();
      }
      const feelingFirst = section.locator("article").nth(4);
      await expect(feelingFirst.locator("h3 + p")).toHaveText(lang === "zh"
        ? "先認識一位女生今天的處境，再替她選一個回家的方向。"
        : "Meet one woman’s day, then pick a direction for her to come home to.");
      await expect(feelingFirst.locator("h3 + p + p")).toHaveText(lang === "zh"
        ? "看見 AI 如何快速給三個方向，也看見人如何取捨、深化成能生活的細節。"
        : "See how AI can offer three directions quickly, and how a person chooses and deepens them into details you can live with.");
      await section.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `output/showcase-entry/after-${lang}-${width}.png` });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      const start = section.getByRole("link", { name: lang === "zh" ? "從《街角的秘密》開始" : "Try Secrets on the Corner" });
      const popupPromise = page.waitForEvent("popup");
      await start.click();
      const popup = await popupPromise;
      await expect(popup).toHaveURL(url => url.pathname === "/prototype/secrets-on-the-corner/" && url.searchParams.get("lang") === lang);
      await expect(popup.locator("h1")).toContainText(lang === "zh" ? "街角的秘密" : "Secrets on the Corner");
      await popup.close();
    });
  }
}

for (const lang of ["zh", "en"]) {
  test(`${lang}: December Lights leads into the lamp story with matching language and destination copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/prototype/teammate-type/?c=AAA&lang=${lang}`);
    const next = page.locator("#next-work-link");
    await expect(next).toHaveAttribute("href", `/prototype/take-the-lantern-apart/?lang=${lang}`);
    await next.click();
    await expect(page).toHaveURL(new RegExp(`/prototype/take-the-lantern-apart/\\?lang=${lang}$`));
    await expect(page.locator("#next-link")).toHaveAttribute("href", `/prototype/match-the-approved-lamp/?lang=${lang}`);
    const body = page.locator('[data-i18n="nextBody"]');
    await expect(body).toContainText(lang === "zh" ? "當初點頭" : "approved");
    await expect(body).not.toContainText(/貿易街|Trade Street/);
  });
}

test.describe("existing next-work routes", () => {
  let server;
  let base;
  test.beforeAll(async () => {
    // Match deployment: Trade Street lives in prototype/, the other pages in dist/.
    const root = process.cwd();
    const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp" };
    server = createServer((req, res) => {
      const pathname = new URL(req.url, "http://localhost").pathname;
      const relative = pathname.replace(/^\/+/, "");
      let file = resolve(root, pathname.startsWith("/prototype/trade-street/") ? relative : `dist/${relative}`);
      if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
      if (statSync(file).isDirectory()) file = resolve(file, "index.html");
      if (!existsSync(file)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "Content-Type": `${mime[extname(file)] || "application/octet-stream"}; charset=utf-8` });
      res.end(readFileSync(file));
    });
    await new Promise(done => server.listen(0, "127.0.0.1", done));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  test.afterAll(async () => { await new Promise(done => server.close(done)); });

  for (const lang of ["zh", "en"]) {
    test(`${lang}: next-work routes exist for all six works and retain language`, async ({ page, request }) => {
      const routes = [
        ["teammate-type", [["#next-work-link", "take-the-lantern-apart"]]],
        ["secrets-on-the-corner", [["#trade-bridge-link", "take-the-lantern-apart"], ["#trade-secondary-link", "trade-street"]]],
        ["take-the-lantern-apart", [["#next-link", "match-the-approved-lamp"]]],
        ["match-the-approved-lamp", [["#link-street", "trade-street"], ["#link-lamp", "take-the-lantern-apart"]]],
        ["trade-street", [["#loop-lamp", "take-the-lantern-apart"], ["#loop-corner", "secrets-on-the-corner"]]],
        ["room-mode-remote", [["#next-stop-link", "match-the-approved-lamp"]]],
      ];
      for (const [work, links] of routes) {
        await page.goto(`${base}/prototype/${work}/?lang=${lang}`);
        if (work === "room-mode-remote") {
          await page.locator("#choice-list button").first().click();
          await page.locator("#next-button").click();
          await page.locator("#choice-list button").first().click();
          await page.locator("#next-button").click();
        }
        for (const [selector, destination] of links) {
          const link = page.locator(selector);
          const href = `/prototype/${destination}/?lang=${lang}`;
          await expect(link).toHaveAttribute("href", href);
          await expect(link).not.toBeEmpty();
          expect((await request.get(`${base}${href}`)).status()).toBe(200);
        }
      }
    });
  }
});
