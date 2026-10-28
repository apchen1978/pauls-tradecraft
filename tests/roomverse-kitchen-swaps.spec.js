import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

const FRAMES = {
  "cable-car": ["cable-car", "fog-bridge", "marin-hills", "poster-sun"],
  "redwood-path": ["redwood-path", "ferry-building", "oak-street", "poster-arch", "poster-leaf"],
  "lamp-wall": ["moon-hills", "hills-sun", "botanical-window"],
};

async function loadRoom(page, width, lang = "zh") {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().wallArtLoaded && window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
  await expect(page.locator("#swaps")).toBeVisible();
}

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

for (const width of [1440, 390]) {
  test(`every painting option paints its frame, fetches only when chosen and costs no geometry at ${width}px`, async ({ page }) => {
    const printRequests = [];
    page.on("request", (request) => { // The lamp-wall frame's own default picture loads with the room, so only its alternatives count as "chosen" downloads.
    if (request.url().includes("room03-print-") || /room03-lamp-wall-(hills|botanical)/.test(request.url())) printRequests.push(request.url()); });
    await loadRoom(page, width);
    expect(printRequests, "no replacement print is downloaded until one is chosen").toEqual([]);
    const base = await page.evaluate(() => window.__room03.info());
    expect(await page.evaluate(() => window.__room03.artOptions())).toEqual(FRAMES);
    expect(base.wallArtChoice).toEqual({ "cable-car": "cable-car", "redwood-path": "redwood-path", "lamp-wall": "moon-hills" });
    await page.locator("#swaps summary").click();
    const baseMean = base.wallArtMean;
    for (const [frame, options] of Object.entries(FRAMES)) {
      const seen = [];
      for (const option of options) {
        const before = JSON.stringify((await page.evaluate(() => window.__room03.info())).wallArtMean[frame]);
        await page.locator(`#swapGroups button[data-frame="${frame}"][data-art="${option}"]`).click();
        await page.waitForFunction(({ frame, option, before, original }) => {
          const info = window.__room03.info();
          if (info.wallArtChoice[frame] !== option) return false;
          const mean = info.wallArtMean[frame];
          // The original picture is done when the region is back to its first reading; another picture, when it moved off the previous one.
          return option === Object.keys(window.__room03.artOptions()[frame])[0]
            ? Math.hypot(mean[0] - original[0], mean[1] - original[1], mean[2] - original[2]) < 4
            : JSON.stringify(mean) !== before;
        }, { frame, option, before, original: baseMean[frame] }, { timeout: 15000 });
        await page.waitForTimeout(150);
        const info = await page.evaluate(() => window.__room03.info());
        expect(info.wallArtChoice[frame], `${frame} choice`).toBe(option);
        expect(info.vertices, `${option}: vertices unchanged`).toBe(base.vertices);
        expect(info.meshes, `${option}: meshes unchanged`).toBe(base.meshes);
        expect(info.drawCallsLastFrame, `${option}: draw calls unchanged`).toBe(base.drawCallsLastFrame);
        seen.push([option, info.wallArtMean[frame]]);
        const pressed = await page.locator(`#swapGroups button[data-frame="${frame}"][aria-pressed="true"]`).getAttribute("data-art");
        expect(pressed, `${option}: pressed state`).toBe(option);
        if (QA) await page.locator(".room").screenshot({ path: `${QA}/swap-${width}-${option}.png` });
      }
      // The first option is the original picture: choosing it again must restore the original look.
      expect(distance(seen[0][1], baseMean[frame]), `${frame}: original restored`).toBeLessThan(4);
      // Every other option reads clearly different from the original.
      for (const [option, mean] of seen.slice(1)) expect(distance(mean, baseMean[frame]), `${option} differs from the original`).toBeGreaterThan(6);
    }
    expect(printRequests.length, "each print is fetched once per choice, never all at once").toBeGreaterThanOrEqual(9);
  });
}

test("the swap panel is labelled in both languages and stays out of fullscreen", async ({ page }) => {
  await loadRoom(page, 390);
  await expect(page.locator("#swapsTitle")).toHaveText("換搭配");
  await page.locator("#swaps summary").click();
  await expect(page.locator('#swapGroups button[data-art="fog-bridge"]')).toHaveText("霧中金門大橋");
  await page.locator("#lang").click();
  await expect(page.locator("#swapsTitle")).toHaveText("Swap the look");
  await expect(page.locator('#swapGroups button[data-art="fog-bridge"]')).toHaveText("Golden Gate in fog");
  for (const button of await page.locator("#swapGroups button").all()) expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "no horizontal overflow at 390 px").toBeLessThanOrEqual(0);
  await page.locator("#immersiveEnter").click();
  await expect(page.locator("#swaps")).toBeHidden();
});
