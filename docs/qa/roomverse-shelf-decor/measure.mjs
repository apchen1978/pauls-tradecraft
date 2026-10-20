// Run against this branch's preview on port 4175. Does not mutate the scene or baseline sources.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const DIR = "docs/qa/roomverse-shelf-decor";
const RAW = "output/roomverse-shelf-decor-raw-postcards";
await mkdir(RAW, { recursive: true });
const baseline = "db19d39"; // PR #399 before the scale refinement.
const sources = { before: execFileSync("git", ["show", `${baseline}:public/prototype/roomverse-3d/app.js`], { encoding: "utf8" }), after: await readFile("public/prototype/roomverse-3d/app.js", "utf8") };
const browser = await chromium.launch({ channel: "chrome" });
const rows = [], parity = [], requestSets = [], shelfCounts = [];
async function enter(version, width, cpu) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: width === 390 ? 2 : 1, reducedMotion: "reduce" });
  const page = await context.newPage(); let hits = 0; const requests = [];
  page.on("request", (r) => requests.push(new URL(r.url()).pathname));
  await page.route(/\/prototype\/roomverse-3d\/app\.js(?:\?.*)?$/, (route) => { hits++; return route.fulfill({ contentType: "application/javascript", body: sources[version] }); });
  await page.addInitScript(() => {
    let room;
    document.addEventListener("click", (e) => { if (e.target.closest("#enter")) window.__entryTime = performance.now(); }, true);
    Object.defineProperty(window, "__room", { configurable: true, get: () => room, set: (value) => {
      room = value; window.__readyMs = performance.now() - window.__entryTime;
      window.__hasShelf = typeof room.shelfDecor === "function";
      window.__shelfCountAtReady = room.shelfDecor?.().objects.length ?? 0;
    } });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (cpu) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("http://127.0.0.1:4175/prototype/roomverse-3d/?lang=zh&mood=rain");
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room);
  const metrics = await page.evaluate(() => ({ ms: __readyMs, hasShelf: __hasShelf, shelfCountAtReady: __shelfCountAtReady }));
  assert.equal(hits, 1); assert.equal(metrics.hasShelf, true); assert.equal(metrics.shelfCountAtReady, 0);
  return { context, page, requests, metrics: { width, version, hits, ...metrics } };
}
for (const width of [1440, 390]) {
  for (const version of ["before", "after"]) { const r = await enter(version, width, true); await r.context.close(); }
  for (let pair = 0; pair < 5; pair++) {
    for (const version of pair % 2 ? ["after", "before"] : ["before", "after"]) {
      const r = await enter(version, width, true); rows.push({ pair, ...r.metrics }); await r.context.close();
    }
    console.log(`${width} CPU4 pair ${pair + 1}/5`);
  }
}
for (const width of [1440, 390]) {
  for (const version of ["before", "after"]) {
    const { context, page, requests } = await enter(version, width, false);
    await page.evaluate(() => Promise.all([__room.loadConsoleDecor(), __room.loadDoorTexture(), __room.loadRightWallArt()]));
    const shelfCount = await page.evaluate(() => __room.shelfDecor().objects.length);
    assert.equal(shelfCount, version === "before" ? 8 : 11);
    shelfCounts.push({ width, version, objectsAfterIdle: shelfCount });
    await page.waitForLoadState("networkidle");
    requestSets.push({ width, version, urls: [...new Set(requests)].sort() });
    for (const [mood, wall] of [["tv", "wine"], ["rain", "original"], ["family", "olive"]]) {
      await page.evaluate(([m, w]) => { __room.set("mood", m); __room.set("wall", w); __room.setOrbitAngle(180); }, [mood, wall]);
      await page.locator("#stage").screenshot({ path: `${DIR}/${version}-${mood}-${width}-front.jpg`, type: "jpeg", quality: 92 });
      if (mood === "tv") for (const angle of [170, 190]) {
        await page.evaluate((a) => __room.setOrbitAngle(a), angle);
        await page.locator("#stage").screenshot({ path: `${DIR}/${version}-${mood}-${width}-side-${angle}.jpg`, type: "jpeg", quality: 92 });
      }
      await page.evaluate(() => __room.setOrbitAngle(0));
      const card = await page.evaluate(async () => {
        const c = __room.postcard(), p = c.getContext("2d").getImageData(0, 0, c.width, c.height);
        const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", p.data))].map((v) => v.toString(16).padStart(2, "0")).join("");
        return { width: c.width, height: c.height, hash, png: c.toDataURL().split(",")[1] };
      });
      await writeFile(`${RAW}/${version}-${mood}-${width}-postcard.png`, Buffer.from(card.png, "base64"));
      const { png, ...record } = card; parity.push({ viewport: width, version, mood, ...record });
    }
    await context.close();
  }
}
const median = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const medians = [1440, 390].map((width) => {
  const before = median(rows.filter((r) => r.width === width && r.version === "before").map((r) => r.ms));
  const after = median(rows.filter((r) => r.width === width && r.version === "after").map((r) => r.ms));
  return { width, beforeMs: before, afterMs: after, deltaMs: after - before };
});
await writeFile(`${DIR}/performance-and-parity.json`, JSON.stringify({ baseline, browser: browser.version(), cpu: 4, metric: "entry click to __room assignment after first render; fresh context, cache disabled, one warmup each version and five interleaved pairs", rows, medians, requestSets, shelfCounts, parity }, null, 2));
const postcardPairs = parity.filter((row) => row.version === "after").map((after) => {
  const before = parity.find((row) => row.version === "before" && row.viewport === after.viewport && row.mood === after.mood);
  return { viewport: after.viewport, mood: after.mood, pixelsEqual: before.hash === after.hash, size: [after.width, after.height], beforeHash: before.hash, afterHash: after.hash };
});
await writeFile(`${DIR}/postcard-parity.json`, JSON.stringify({ baseline, pairs: postcardPairs }, null, 2));
console.log(JSON.stringify(medians)); await browser.close();
