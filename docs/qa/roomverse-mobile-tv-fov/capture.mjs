// Mobile TV-wall fov review. Needs the Vite dev server (source modules), not the production bundle:
//   npx vite --host 127.0.0.1 --port 4188
//   node docs/qa/roomverse-mobile-tv-fov/capture.mjs
// Before frames are the parent scene (391ec84) served in place of app.js. After frames are the working tree.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const root = "docs/qa/roomverse-mobile-tv-fov";
const base = process.env.ROOM_QA_URL || "http://127.0.0.1:4188";
const baselineRef = "391ec84";
const baseline = execFileSync("git", ["show", `${baselineRef}:public/prototype/roomverse-3d/app.js`], { encoding: "utf8", maxBuffer: 4_000_000 });
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const sizes = [
  { name: "390x844", width: 390, height: 844 },
  { name: "390x740", width: 390, height: 740 },
  { name: "360x740", width: 360, height: 740 },
  { name: "1440x900", width: 1440, height: 900 },
];
const views = [["window", 0], ["mid", 135], ["tv", 180]];
const report = [];

async function shot(page, name) {
  await page.locator("#stage canvas").screenshot({ path: `${root}/${name}.png` });
}

async function openRoom(page, lang) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(`${base}/prototype/roomverse-3d/index.html?lang=${lang}&mood=rain&wall=original`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(async () => {
    await window.__room.loadTvWallTextures();
    await window.__room.loadDoorTexture();
    await window.__room.loadConsoleDecor();
    if (window.__room.loadRightWallArt) await window.__room.loadRightWallArt();
  });
  await page.waitForTimeout(400);
  return errors;
}

for (const size of sizes) {
  for (const lang of ["zh", "en"]) {
    for (const mode of ["before", "after"]) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      if (mode === "before") {
        await page.route("**/prototype/roomverse-3d/app.js*", (route) => route.fulfill({
          status: 200, contentType: "text/javascript", body: baseline,
        }));
      }
      const errors = await openRoom(page, lang);
      const layout = await page.evaluate(() => {
        const box = document.querySelector("#stage").getBoundingClientRect();
        return { stageWidth: box.width, stageHeight: box.height, aspect: box.width / box.height, scrollWidth: document.documentElement.scrollWidth, innerWidth };
      });
      for (const [view, angle] of views) {
        await page.evaluate((degrees) => window.__room.setOrbitAngle(degrees), angle);
        await shot(page, `${mode}-${lang}-${size.name}-${view}`);
      }
      let fov = null;
      if (mode === "after") {
        fov = {};
        for (const [view, angle] of views) {
          fov[view] = await page.evaluate((degrees) => { window.__room.setOrbitAngle(degrees); return window.__room.fov(); }, angle);
        }
        if (layout.aspect < 0.8) {
          for (const value of [74, 76]) {
            const png = await page.evaluate((next) => {
              window.__room.setOrbitAngle(180);
              window.__room.paintFov(next);
              return document.querySelector("#stage canvas").toDataURL("image/png");
            }, value);
            await writeFile(`${root}/compare-${lang}-${size.name}-fov${value}.png`, Buffer.from(png.split(",")[1], "base64"));
          }
          await page.evaluate(() => window.__room.setOrbitAngle(180));
        }
      }
      if (lang === "zh" || lang === "en") {
        await page.evaluate(() => window.__room.setOrbitAngle(180));
        await page.screenshot({ path: `${root}/full-${mode}-${lang}-${size.name}-tv.png`, fullPage: true });
      }
      report.push({ mode, lang, ...size, ...layout, fov, errors, overflow: layout.scrollWidth > layout.innerWidth + 1 });
      await context.close();
    }
  }
}
await writeFile(`${root}/measurements.json`, JSON.stringify({ baselineRef, report }, null, 2) + "\n");
await browser.close();
console.log("captured", report.length, "rooms");
