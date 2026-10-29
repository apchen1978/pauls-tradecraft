import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });
const OPTIONS = ["grasscloth-oat", "grasscloth-sage", "grasscloth-charcoal", "none"];

async function loadRoom(page, width, lang = "zh") {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().wallArtLoaded && window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
  await expect(page.locator("#swaps")).toBeVisible();
}

// Paul 2026-10-29: Bay Area designers use wallpaper, and the current taste is texture over pattern (grasscloth); one wall of Room 03 gets it, on by default.
test("grasscloth covers the right-hand wall behind the counter, clear of the painting, with one panel and no download", async ({ page }) => {
  const requests = [];
  page.on("request", (request) => { if (/grass|wallpaper/i.test(request.url())) requests.push(request.url()); });
  await loadRoom(page, 1440);
  const info = await page.evaluate(() => window.__room03.info());
  const wall = info.wallpaper;
  expect(requests, "the weave is drawn on a canvas: nothing to download").toEqual([]);
  expect(wall.choice).toBe("grasscloth-oat");
  expect(wall.visible).toBe(true);
  expect(wall.vertices, "one plane").toBe(4);
  expect(wall.bounds.min[0], "stands 4 mm in front of the wall face at x 2.94").toBeCloseTo(2.936, 3);
  const frame = info.wallArtBounds;
  expect(frame.min[2] - wall.bounds.max[2], "stops at least 5 cm short of the cable-car frame").toBeGreaterThanOrEqual(0.05);
  expect(wall.bounds.size[1], "floor trim to under the beam").toBeGreaterThan(2.2);
  expect(wall.bounds.size[1]).toBeLessThan(2.4);
  expect(wall.bounds.min[1], "above the baseboard").toBeGreaterThanOrEqual(0.09);
  expect(wall.bounds.max[1], "below the ceiling beams at 2.48").toBeLessThan(2.48);
  expect(wall.bounds.min[2], "from the back wall").toBeGreaterThanOrEqual(-2.34);
  expect(wall.seamMetres, "one wallpaper roll width").toBeCloseTo(0.69, 2);
  expect(wall.repeat[0] * wall.seamMetres, "tiles span the panel width").toBeCloseTo(wall.bounds.size[2], 2);
  expect(info.meshes - 94, "one extra mesh over the Codex countertop baseline of 94").toBe(1);
  expect(info.vertices - 34057, "four grasscloth vertices + 2,241 wok-area polish vertices").toBe(2245);
  if (QA) {
    await page.evaluate(() => window.__room03.setView(270 * Math.PI / 180));
    await page.locator(".room").screenshot({ path: `${QA}/wallpaper-1440-270.png` });
  }
});

for (const width of [1440, 390]) {
  test(`the wallpaper options swap colour, hide with "none" and cost nothing more at ${width}px`, async ({ page }) => {
    await loadRoom(page, width);
    expect(await page.evaluate(() => window.__room03.wallpaperOptions())).toEqual(OPTIONS);
    await page.locator("#swaps summary").click();
    const colours = {};
    for (const option of OPTIONS) {
      await page.locator(`#swapGroups button[data-frame="wallpaper"][data-art="${option}"]`).click();
      await page.waitForFunction((name) => window.__room03.info().wallpaper.choice === name, option);
      const info = await page.evaluate(() => window.__room03.info());
      expect(info.wallpaper.visible, `${option}: visible only when a wallpaper is chosen`).toBe(option !== "none");
      expect(info.vertices, `${option}: geometry does not change with the choice`).toBe(36302);
      colours[option] = info.wallpaper.color;
      expect(await page.locator(`#swapGroups button[data-frame="wallpaper"][aria-pressed="true"]`).getAttribute("data-art")).toBe(option);
    }
    expect(new Set([colours["grasscloth-oat"], colours["grasscloth-sage"], colours["grasscloth-charcoal"]]).size, "three different colourways").toBe(3);
    await page.locator('#swapGroups button[data-frame="wallpaper"][data-art="none"]').click();
    const hidden = await page.evaluate(() => window.__room03.info());
    await page.locator('#swapGroups button[data-frame="wallpaper"][data-art="grasscloth-oat"]').click();
    const shown = await page.evaluate(() => window.__room03.info());
    expect(shown.drawCallsLastFrame - hidden.drawCallsLastFrame, "at most one draw call, only when the wall is in view").toBeLessThanOrEqual(1);
    expect(shown.drawCallsLastFrame - hidden.drawCallsLastFrame).toBeGreaterThanOrEqual(0);
  });
}

test("the wallpaper group is labelled in both languages", async ({ page }) => {
  await loadRoom(page, 390);
  await page.locator("#swaps summary").click();
  await expect(page.locator('#swapGroups .swap-group[data-frame="wallpaper"] h3')).toHaveText("右側牆壁紙");
  await expect(page.locator('#swapGroups button[data-art="grasscloth-oat"]')).toHaveText("草織（燕麥）");
  await page.locator("#lang").click();
  await expect(page.locator('#swapGroups .swap-group[data-frame="wallpaper"] h3')).toHaveText("Right-wall wallpaper");
  await expect(page.locator('#swapGroups button[data-art="none"]')).toHaveText("None (cream wall)");
  for (const button of await page.locator('#swapGroups button[data-frame="wallpaper"]').all()) expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});
