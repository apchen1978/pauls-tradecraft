import { test, expect } from "@playwright/test";
import { mkdirSync, statSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOM03_QA;
if (QA) mkdirSync(QA, { recursive: true });

async function loadRoom(page, width = 1440, lang = "zh") {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => Boolean(window.__room03?.info));
  await page.waitForFunction(() => window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

async function shot(page, name) {
  if (QA) await page.locator(".room").screenshot({ path: `${QA}/${name}.png` });
}

async function expectMainRegionsInFrame(page) {
  const regions = await page.evaluate(() => window.__room03.info().projectedRegions);
  for (const [name, [x, y]] of Object.entries(regions)) {
    expect(x, `${name} should fit horizontally in the default camera`).toBeGreaterThan(-0.94);
    expect(x, `${name} should fit horizontally in the default camera`).toBeLessThan(0.94);
    expect(y, `${name} should fit vertically in the default camera`).toBeGreaterThan(-0.94);
    expect(y, `${name} should fit vertically in the default camera`).toBeLessThan(0.94);
  }
}

test.describe("Room 03 Bay Area Kitchen", () => {
  test("loads the direct noindex room with a rendered scene within the geometry budget", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await loadRoom(page);
    await expect(page).toHaveTitle("Room 03｜Bay Area Kitchen");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    await expect(page.locator("canvas")).toBeVisible();
    const info = await page.evaluate(() => window.__room03.info());
    console.log("Room 03 measured scene:", JSON.stringify(info));
    await expectMainRegionsInFrame(page);
    expect(info.mood).toBe("golden");
    expect(info.dimensions).toEqual({ width: 6, depth: 4.8, height: 2.7 });
    expect(info.vertices).toBeGreaterThan(3000);
    expect(info.vertices).toBeLessThanOrEqual(25000);
    expect(info.meshes).toBeLessThan(60);
    expect(info.categories.structure.vertices).toBeGreaterThan(0);
    expect(info.categories["dining-table"].vertices).toBeGreaterThan(0);
    expect(info.categories.yard.vertices).toBe(4);
    expect(info.pixelRatio).toBe(1.5);
    expect(statSync("public/prototype/roomverse-3d/kitchen/courtyard-v1.webp").size).toBeLessThanOrEqual(150 * 1024);
    expect(errors).toEqual([]);
    await shot(page, "desktop-golden-zh");
  });

  test("switches moods and language while preserving one consistent room title", async ({ page }) => {
    await loadRoom(page);
    await page.getByRole("button", { name: "夜晚" }).click();
    await expect(page.getByRole("button", { name: "夜晚" })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    await shot(page, "desktop-night-zh");
    await page.locator("#lang").click();
    await expect(page.locator("h1")).toHaveText("Room 03｜Bay Area Kitchen");
    await expect(page.getByRole("button", { name: "Golden hour" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    if (QA) await page.screenshot({ path: `${QA}/english-page.png`, fullPage: true });
  });

  test("fits a 390px screen and fake fullscreen exits by button, Escape, and browser back", async ({ page }) => {
    await loadRoom(page, 390);
    await expectMainRegionsInFrame(page);
    const pageWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client);
    await shot(page, "mobile-golden-zh");
    await page.locator('#moods button[data-mood="night"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    await shot(page, "mobile-night-zh");
    await page.locator('#moods button[data-mood="golden"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("golden");
    await page.locator("#immersiveEnter").click();
    await expect(page.locator(".room")).toHaveClass(/is-immersive/);
    await page.waitForFunction(() => window.__room03.info().canvas[0] === Math.round(innerWidth * 1.5));
    await shot(page, "mobile-fullscreen-golden");
    await page.keyboard.press("Escape");
    await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
    await page.locator("#immersiveEnter").click();
    await page.goBack();
    await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
  });

  test("keeps mobile night ambience varied and the wok-door reveal brighter than its closed panel", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await loadRoom(page, 390);
    await page.locator('#moods button[data-mood="night"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    const upper = await page.evaluate(() => window.__room03.samplePixels({ left: 0.05, top: 0.01, width: 0.9, height: 0.23 }));
    await shot(page, "mobile-night-pixel-checked");
    await loadRoom(page, 1440);
    await page.locator('#moods button[data-mood="night"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("night");
    const door = await page.evaluate(() => {
      const info = window.__room03.info();
      return {
        reveal: window.__room03.sampleNdc(info.projectedRegions.doorReveal, 0.006),
        panel: window.__room03.sampleNdc(info.projectedRegions.doorPanel, 0.006),
        projectedRegions: info.projectedRegions,
      };
    });
    await shot(page, "desktop-night-pixel-checked");
    const metrics = { upper, door };
    console.log("Room 03 night pixel checks:", JSON.stringify(metrics));
    expect(upper.meanLuminance, "upper field should not be crushed to near black").toBeGreaterThan(20);
    expect(upper.luminanceStdDev, "mobile upper field should contain visible lighting and wood variation").toBeGreaterThan(6);
    expect(upper.blue - upper.red, "mobile upper field should not read as a solid blue slab").toBeLessThan(55);
    expect(door.reveal.meanLuminance, "warm-lit reveal should outshine the closed door panel").toBeGreaterThan(door.panel.meanLuminance + 12);
    expect(errors).toEqual([]);
  });

  test("keeps the bounded entry camera outside room walls while orbiting", async ({ page }) => {
    await loadRoom(page);
    const positions = [];
    for (let i = 0; i < 12; i++) positions.push(await page.evaluate((angle) => window.__room03.setView(angle), i * Math.PI / 6).then(() => page.evaluate(() => window.__room03.info().camera)));
    for (const [x, y, z] of positions) {
      expect(Math.abs(x)).toBeLessThan(3);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(2.7);
      expect(z).toBeGreaterThan(2.4);
    }
  });
});
