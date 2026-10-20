// Run from the repo root against its preview server: node docs/qa/roomverse-right-wall-art/measure.mjs
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const DIR = "docs/qa/roomverse-right-wall-art";
const sources = {
  before: execFileSync("git", ["show", "38b076b:public/prototype/roomverse-3d/app.js"], { encoding: "utf8" }),
  after: await readFile("public/prototype/roomverse-3d/app.js", "utf8"),
};
const browser = await chromium.launch({ channel: "chrome" });
const rows = [], parity = [];
async function enter(version, width, throttle) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: width === 390 ? 2 : 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  let moduleRouteHits = 0;
  await page.route(/\/prototype\/roomverse-3d\/app\.js(?:\?.*)?$/, (route) => {
    moduleRouteHits++;
    return route.fulfill({ contentType: "application/javascript", body: sources[version] });
  });
  await page.addInitScript(() => {
    let room;
    document.addEventListener("click", (e) => { if (e.target.closest("#enter")) window.__qaEntry = performance.now(); }, true);
    Object.defineProperty(window, "__room", { configurable: true, get: () => room, set: (value) => {
      room = value;
      window.__qaReadyMs = performance.now() - window.__qaEntry;
      window.__qaArtBuiltAtReady = room.rightWallArt?.().built ?? false;
      window.__qaArtFeatureAvailable = typeof room.rightWallArt === "function";
    } });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (throttle) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("http://127.0.0.1:4175/prototype/roomverse-3d/?lang=zh&mood=rain");
  const artRequests = [];
  page.on("request", (r) => { if (r.url().includes("right-wall-harbor")) artRequests.push(r.url()); });
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const metrics = await page.evaluate(() => ({ ms: __qaReadyMs, artBuiltAtReady: __qaArtBuiltAtReady, artFeatureAvailable: __qaArtFeatureAvailable }));
  assert.equal(moduleRouteHits, 1, "The cache-versioned app module must be intercepted exactly once");
  assert.equal(metrics.artFeatureAvailable, version === "after", "The baseline must actually be the version without the new artwork");
  return { context, page, metrics: { version, width, ...metrics, moduleRouteHits, artRequestsBeforeReady: artRequests.length } };
}

for (const width of [1440, 390]) {
  // Warm both shader paths once; then interleave five cold-context pairs on the same browser/device.
  for (const version of ["before", "after"]) { const r = await enter(version, width, true); await r.context.close(); }
  for (let pair = 0; pair < 5; pair++) {
    for (const version of pair % 2 ? ["after", "before"] : ["before", "after"]) {
      const r = await enter(version, width, true); rows.push({ pair, ...r.metrics }); await r.context.close();
    }
    console.log(`CPU4 ${width}: pair ${pair + 1}/5 done`);
  }
}
for (const width of [1440, 390]) {
  for (const version of ["before", "after"]) {
    const { context, page } = await enter(version, width, false);
    await page.evaluate(() => Promise.all([__room.loadTvWallTextures(), __room.loadDoorTexture(), __room.loadConsoleDecor(), __room.loadRightWallArt?.()]));
    await page.waitForLoadState("networkidle");
    for (const [mood, wall] of [["tv", "wine"], ["rain", "original"], ["family", "olive"]]) {
      await page.evaluate(([m, w]) => { __room.set("mood", m); __room.set("wall", w); __room.setOrbitAngle(270); }, [mood, wall]);
      await page.locator("#stage").screenshot({ path: `${DIR}/${version}-${mood}-${width}-front.jpg`, type: "jpeg", quality: 92 });
    }
    await page.evaluate(() => __room.setOrbitAngle(0));
    await page.locator("#stage canvas").screenshot({ path: `${DIR}/${version}-sofa-${width}.png` });
    const card = await page.evaluate(async () => {
      const c = __room.postcard(), pixels = c.getContext("2d").getImageData(0, 0, c.width, c.height);
      const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", pixels.data))].map((v) => v.toString(16).padStart(2, "0")).join("");
      return { hash, image: c.toDataURL().split(",")[1] };
    });
    await writeFile(`${DIR}/${version}-postcard-${width}.png`, Buffer.from(card.image, "base64"));
    parity.push({ version, width, postcardPixelHash: card.hash });
    await context.close();
  }
}
const median = (v) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)];
const medians = [1440, 390].map((width) => {
  const before = median(rows.filter((r) => r.width === width && r.version === "before").map((r) => r.ms));
  const after = median(rows.filter((r) => r.width === width && r.version === "after").map((r) => r.ms));
  return { width, beforeMs: before, afterMs: after, deltaMs: after - before };
});
const result = { baseline: "38b076b", browser: browser.version(), cpuSlowdown: 4, cache: "disabled, fresh context per trial", metric: "entry click event to __room assignment after the initial rendered room", rows, medians, parity };
await writeFile(`${DIR}/performance-and-parity.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ medians, parity }, null, 2));
await browser.close();
