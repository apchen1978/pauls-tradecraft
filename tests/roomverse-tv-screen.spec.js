import { expect, test } from "@playwright/test";
import { mkdir, stat } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const ASSET = "tv-screen-night-v1.webp";
const TEXTURE_FILES = ["tv-oak-v1.webp", "tv-door-v1.webp", "tv-frame-v1.webp", "tv-backing-v1.webp", ASSET];
const MOODS = ["rain", "family", "tech", "chic", "slow", "tv"];
const OUTPUT = "docs/qa/roomverse-tv-screen-wine";
async function openPanel(page) {
  const toggle = page.locator("#panelToggle");
  if (await toggle.isVisible() && await toggle.getAttribute("aria-expanded") === "false") await toggle.click();
}

test("series night uses wine only as a default; explicit and later wall choices stay in control", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${PAGE}?lang=zh&mood=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await openPanel(page);
  const wallOptions = page.locator("#panel .opts").nth(1);
  await expect(wallOptions.locator('button[data-key="wine"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page).not.toHaveURL(/wall=/);

  await page.locator("#panel .opts").first().locator('button[data-key="rain"]').click();
  await expect(wallOptions.locator('button[data-key="original"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator("#panel .opts").first().locator('button[data-key="tv"]').click();
  await expect(page).toHaveURL(/wall=wine/);
  await expect(wallOptions.locator('button[data-key="wine"]')).toHaveAttribute("aria-pressed", "true");

  await wallOptions.locator('button[data-key="original"]').click();
  await page.locator("#panel .opts").first().locator('button[data-key="rain"]').click();
  await page.locator("#panel .opts").first().locator('button[data-key="tv"]').click();
  await expect(wallOptions.locator('button[data-key="original"]')).toHaveAttribute("aria-pressed", "true");

  await page.goto(`${PAGE}?lang=zh&mood=tv&wall=original`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await openPanel(page);
  await expect(page.locator("#panel .opts").nth(1).locator('button[data-key="original"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#panel .opts").nth(1).locator('button[data-key="wine"]')).toHaveAttribute("aria-pressed", "false");

  await page.goto(`${PAGE}?lang=zh&mood=tv&wall=unknown`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await openPanel(page);
  await expect(page.locator("#panel .opts").nth(1).locator('button[data-key="wine"]')).toHaveAttribute("aria-pressed", "true");

  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await openPanel(page);
  await expect(page.locator("#panel .opts").nth(1).locator('button[data-key="original"]')).toHaveAttribute("aria-pressed", "true");
});

test("random wall choice and the room tour preserve the visitor's wall", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh&mood=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await openPanel(page);
  await page.locator(".shuffle").click();
  const selectedWall = await page.locator("#panel .opts").nth(1).locator('button[aria-pressed="true"]').getAttribute("data-key");
  expect(selectedWall).not.toBe("wine");
  await page.locator("#panel .opts").first().locator('button[data-key="rain"]').click();
  await page.locator("#panel .opts").first().locator('button[data-key="tv"]').click();
  await expect(page.locator("#panel .opts").nth(1).locator(`button[data-key="${selectedWall}"]`)).toHaveAttribute("aria-pressed", "true");

  await page.locator(".director").click();
  await page.waitForFunction(() => window.__room.director().playing, null, { timeout: 10000 });
  await page.waitForTimeout(1200);
  await page.locator(".director-stop").click();
  await expect(page.locator("#panel .opts").nth(1).locator(`button[data-key="${selectedWall}"]`)).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(new RegExp(`wall=${selectedWall}`));
});

test("original screen artwork is delayed, small, and safely falls back when it fails", async ({ page }) => {
  expect((await stat(`public/prototype/roomverse-3d/tex/${ASSET}`)).size).toBeLessThan(60000);
  const requests = [];
  page.on("request", (request) => { if (TEXTURE_FILES.some((file) => request.url().endsWith(file))) requests.push(request.url()); });
  await page.goto(`${PAGE}?lang=zh&mood=tv`);
  expect(requests).toEqual([]);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => window.__room.tvScreen().loaded)).toBe(false);
  await openPanel(page);
  await page.locator(".camera-tv").click();
  await page.waitForFunction(() => window.__room.tvScreen().loaded, null, { timeout: 30000 });
  const screen = await page.evaluate(() => window.__room.tvScreen());
  expect(screen.file).toBe(ASSET);
  expect(screen.width).toBe(1024);
  expect(screen.height).toBe(576);
  expect(requests.filter((url) => url.endsWith(ASSET))).toHaveLength(1);
});

test("a failed TV screen image keeps the original dark screen", async ({ page }) => {
  await page.route(`**/${ASSET}`, (route) => route.abort());
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const fallbackBefore = await page.evaluate(() => window.__room.tvScreen());
  expect(fallbackBefore.loaded).toBe(false);
  expect(await page.evaluate(() => window.__room.loadTvWallTextures())).toBe(true);
  const fallbackAfter = await page.evaluate(() => window.__room.tvScreen());
  expect(fallbackAfter.loaded).toBe(false);
  expect(fallbackAfter.file).toBe(null);
  expect(fallbackAfter.brightness).toBeCloseTo(fallbackBefore.brightness, 5);
});

test("TV screen brightness follows all six feelings and preserves the wall through postcards", async ({ page }) => {
  await mkdir(OUTPUT, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=zh&mood=rain&view=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room?.tvWallTexturesReady(), null, { timeout: 60000 });
  await openPanel(page);
  const levels = {};
  const defaultWalls = { rain: "original", family: "olive", tech: "mist", chic: "blush", slow: "sand", tv: "wine" };
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    for (const mood of MOODS) {
      await page.locator("#panel .opts").first().locator(`button[data-key="${mood}"]`).click();
      await page.waitForTimeout(700);
      await expect(page.locator("#panel .opts").nth(1).locator(`button[data-key="${defaultWalls[mood]}"]`)).toHaveAttribute("aria-pressed", "true");
      await page.evaluate(() => window.__room.setOrbitAngle(180));
      levels[mood] = await page.evaluate(() => window.__room.tvScreen().brightness);
      await page.locator("#stage canvas").screenshot({ path: `${OUTPUT}/after-${mood}-tv-wall-${width}.png` });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.__room.setOrbitAngle(90));
  await page.locator("#stage canvas").screenshot({ path: `${OUTPUT}/after-tv-side-90-1440.png` });
  expect(levels.tv).toBeGreaterThan(Math.max(...Object.entries(levels).filter(([mood]) => mood !== "tv").map(([, level]) => level)));
  expect(levels.rain).toBeLessThanOrEqual(.11);
  expect(levels.family).toBeLessThanOrEqual(.09);

  const postcard = await page.evaluate(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    const labels = [];
    CanvasRenderingContext2D.prototype.fillText = function(text, ...rest) { labels.push(String(text)); return original.call(this, text, ...rest); };
    window.__room.postcard();
    CanvasRenderingContext2D.prototype.fillText = original;
    return labels;
  });
  expect(postcard.join(" ")).toContain("追劇夜");
  expect(postcard.join(" ")).toContain("深酒紅");
  await expect(page).toHaveURL(/wall=wine/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.goto(`${PAGE}?lang=en&mood=tv&wall=wine&view=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const englishPostcard = await page.evaluate(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    const labels = [];
    CanvasRenderingContext2D.prototype.fillText = function(text, ...rest) { labels.push(String(text)); return original.call(this, text, ...rest); };
    window.__room.postcard();
    CanvasRenderingContext2D.prototype.fillText = original;
    return labels;
  });
  expect(englishPostcard.join(" ")).toContain("Series night");
  expect(englishPostcard.join(" ")).toContain("Deep wine");
});
