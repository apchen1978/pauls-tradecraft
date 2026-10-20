import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const root = "docs/qa/roomverse-door";
const base = process.env.ROOM_QA_URL || "http://127.0.0.1:4186";
const baseline = execFileSync("git", ["show", "03edca7:public/prototype/roomverse-3d/app.js"], { encoding: "utf8", maxBuffer: 2000000 });
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
async function capture(page, name, full = false) {
  const bytes = full ? await page.screenshot() : await page.locator("#stage").screenshot();
  execFileSync("python", ["-c", "import sys,io; from PIL import Image; Image.open(io.BytesIO(sys.stdin.buffer.read())).convert('RGB').save(sys.argv[1],'WEBP',quality=88,method=6)", `${root}/${name}.webp`], { input: bytes });
}
for (const width of [1440, 390]) {
  for (const mode of ["before", "after"]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    if (mode === "before") await page.route("**/app.js?*", (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: baseline }));
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${base}/prototype/roomverse-3d/index.html?lang=zh&mood=rain&wall=original`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    await page.evaluate(async () => { await window.__room.loadTvWallTextures(); if (window.__room.loadDoorTexture) await window.__room.loadDoorTexture(); });
    for (const [view, angle] of [["window", 0], ["tv", 180], ["door", 270]]) {
      await page.evaluate((a) => window.__room.setOrbitAngle(a), angle);
      await capture(page, `${mode}-rain-original-${view}-${width}`);
    }
    if (mode === "after") {
      for (const wall of ["pine", "stripe", "botanical"]) {
        await page.evaluate((value) => window.__room.set("wall", value), wall);
        await page.waitForTimeout(400);
        await capture(page, `after-rain-${wall}-door-${width}`);
        await page.evaluate(() => window.__room.setOrbitAngle(0));
        await capture(page, `after-rain-${wall}-window-${width}`);
        await page.evaluate(() => window.__room.setOrbitAngle(270));
      }
      await page.evaluate(() => window.__room.set("wall", "original"));
      for (const mood of ["family", "tv"]) {
        await page.evaluate((value) => window.__room.set("mood", value), mood);
        await page.waitForTimeout(500);
        await capture(page, `after-${mood}-original-door-${width}`);
      }
      await page.evaluate(() => window.__room.setOrbitAngle(0));
      const data = await page.evaluate(() => window.__room.postcard().toDataURL("image/png"));
      await writeFile(`${root}/postcard-${width}.png`, Buffer.from(data.split(",")[1], "base64"));
      report.push({ width, mode, door: await page.evaluate(() => window.__room.roomDoor()), errors,
        noOverflow: await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth) });
      for (const lang of ["zh", "en"]) {
        if (lang === "en") await page.locator("#lang").click();
        await page.evaluate(() => window.__room.setOrbitAngle(270));
        await capture(page, `after-${lang}-door-page-${width}`, true);
      }
    } else {
      await page.evaluate(() => { window.__room.set("mood", "tv"); window.__room.setOrbitAngle(0); });
      await page.waitForTimeout(500);
      const data = await page.evaluate(() => window.__room.postcard().toDataURL("image/png"));
      await writeFile(`${root}/before-postcard-${width}.png`, Buffer.from(data.split(",")[1], "base64"));
      report.push({ width, mode, errors });
    }
    await context.close();
  }
}
await writeFile(`${root}/visual-checks.json`, JSON.stringify(report, null, 2) + "\n");
await browser.close();
console.log("Door QA captures complete");
