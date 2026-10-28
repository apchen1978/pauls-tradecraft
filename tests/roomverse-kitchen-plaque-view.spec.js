import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });
const MOODS = ["golden", "movie", "night", "dinner", "sunday", "thanksgiving"];

async function loadRoom(page, width, lang = "zh") {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().plaque.status === "loaded");
  await page.waitForFunction(() => window.__room03.info().furniture.table === "glb" && window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

// Paul 2026-10-29: the "Christ is the Head of this House" plaque must be present in every mood (Room 02 has it too).
for (const width of [1440, 390]) {
  test(`the house plaque is shown, readable and unobstructed in all six moods at ${width}px`, async ({ page }) => {
    await loadRoom(page, width);
    for (const mood of MOODS) {
      await page.evaluate((name) => window.__room03.setMood(name), mood);
      await page.locator("#plaqueView").click();
      const plaque = await page.evaluate(() => window.__room03.info().plaque);
      expect(plaque.visible, `${mood} plaque visible`).toBe(true);
      expect(plaque.status, `${mood} plaque painting loaded`).toBe("loaded");
      expect(plaque.inView, `${mood} plaque in frame at the entry wall view`).toBe(true);
      expect(plaque.unobstructed, `${mood} plaque not hidden by anything`).toBe(true);
      if (QA) await page.locator(".room").screenshot({ path: `${QA}/plaque-view-${width}-${mood}.png` });
    }
  });
}

test("the entry-wall button turns the orbit to 180 degrees, leaves the standing view, and is labelled in both languages", async ({ page }) => {
  await loadRoom(page, 390);
  const button = page.locator("#plaqueView");
  await expect(button).toBeVisible();
  await expect(button).toHaveText("看入口牆");
  expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
  const center = page.locator("#centerView");
  await center.click();
  await expect(center).toHaveAttribute("aria-pressed", "true");
  await button.click();
  await expect(center, "standing view is left").toHaveAttribute("aria-pressed", "false");
  const azimuth = await page.evaluate(() => window.__room03.controls.getAzimuthalAngle());
  expect(Math.abs(Math.abs(azimuth) - Math.PI), "orbit faces the entry wall").toBeLessThan(0.05);
  expect(await page.evaluate(() => window.__room03.centerViewInfo())).toBeNull();
  await page.locator("#lang").click();
  await expect(button).toHaveText("Entry wall");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "no horizontal overflow at 390 px").toBeLessThanOrEqual(0);
  const [a, b] = [await center.boundingBox(), await button.boundingBox()];
  expect(a.x + a.width, "the two view buttons do not overlap").toBeLessThanOrEqual(b.x);
});
