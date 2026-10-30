import { test, expect } from "@playwright/test";
import { statSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;

async function loadRoom(page, width = 1440) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => Boolean(window.__room03?.info));
  await page.waitForFunction(() => window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().wallArtLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

async function capture(page, name) {
  if (QA) await page.locator(".room").screenshot({ path: `${QA}/${name}.png` });
}

test("loads the selected Bay Area wall art pair within the asset budget", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await loadRoom(page);
  const info = await page.evaluate(() => window.__room03.info());
  expect(info.wallArtAssets.cableCar.status).toBe("loaded");
  expect(info.wallArtAssets.redwoodPath.status).toBe("loaded");
  expect(info.wallArtAssets.canopyInRoom).toBe(false);
  expect(info.wallArtAssets.startedAfterFirstRender).toBe(true);
  expect(info.wallArtAssets.cableCar.textureSize).toEqual([800, 616]);
  expect(info.wallArtAssets.redwoodPath.textureSize).toEqual([800, 600]);
  expect(info.wallArtAssets.cableCar.bounds.size[1]).toBeCloseTo(0.94, 2);
  expect(info.wallArtAssets.cableCar.bounds.size[0]).toBeCloseTo(0.034, 2);
  expect(info.wallArtAssets.cableCar.bounds.size[2]).toBeCloseTo(1.2, 2);
  expect(info.wallArtAssets.redwoodPath.bounds.size[0]).toBeCloseTo(1.61, 2);
  expect(info.wallArtAssets.redwoodPath.bounds.size[1]).toBeCloseTo(1.21, 2);
  expect(info.wallArtAssets.redwoodPath.gapToScreen).toBeGreaterThanOrEqual(0.08);
  expect(info.wallArtAssets.redwoodPath.topBelowHorizontalBand).toBe(true);
  expect(statSync("public/prototype/roomverse-3d/kitchen/art/room03-bay-cable-car-v1.webp").size).toBeLessThanOrEqual(150000);
  expect(statSync("public/prototype/roomverse-3d/kitchen/art/room03-bay-redwood-path-v1.webp").size).toBeLessThanOrEqual(150000);
  expect(errors).toEqual([]);
  await capture(page, "round1-art-desktop-1440");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.__room03.resize());
  await page.evaluate(() => window.__room03.setView(Math.PI));
  const mobile = await page.evaluate(() => window.__room03.info());
  expect(mobile.wallArtAssets.redwoodPath.phone180Pixels.width).toBeGreaterThanOrEqual(50);
  await capture(page, "round1-redwood-mobile-180");
});

test("keeps the off screen and tabletop centerpiece independently switchable for a later mood", async ({ page }) => {
  await loadRoom(page);
  const before = await page.evaluate(() => window.__room03.info());
  expect(before.moodSlots.screen).toMatchObject({ name: "screen-content-surface", type: "MeshBasicMaterial", hasMap: false, off: true });
  // 2026-10-31: the TV became a 55 in wall-mounted panel (Paul: the 40 in one read as a picture frame); its left quarter hides inside the side wall.
  expect(before.moodSlots.screen.width).toBeCloseTo(1.2, 2);
  expect(before.moodSlots.screen.width).toBeLessThanOrEqual(1.3);
  expect(before.moodSlots.console.width).toBeGreaterThanOrEqual(1.15);
  expect(before.moodSlots.console.width).toBeLessThanOrEqual(1.35);
  expect(before.moodSlots.tabletopCenterpiece).toMatchObject({ name: "mood-slot-tabletop-centerpiece", visible: true, childCount: 1 });
  const state = await page.evaluate(() => {
    const { screen, tabletopCenterpiece } = window.__room03.moodSlots;
    const materialBefore = screen.material;
    tabletopCenterpiece.visible = false;
    const hidden = !tabletopCenterpiece.visible;
    tabletopCenterpiece.visible = true;
    return { hidden, restored: tabletopCenterpiece.visible, isolatedScreenMaterial: materialBefore === screen.material };
  });
  expect(state).toEqual({ hidden: true, restored: true, isolatedScreenMaterial: true });
});

test("uses a warm paper fallback instead of a black frame when selected artwork fails", async ({ page }) => {
  await page.route("**/art/room03-bay-*-v1.webp", (route) => route.abort());
  await loadRoom(page);
  const info = await page.evaluate(() => window.__room03.info());
  expect(info.wallArtAssets.cableCar.status).toBe("fallback");
  expect(info.wallArtAssets.redwoodPath.status).toBe("fallback");
  expect(info.wallArtAssets.cableCar.fallbackColor).toMatch(/^#[0-9a-f]{6}$/i);
  expect(info.wallArtAssets.redwoodPath.fallbackColor).toMatch(/^#[0-9a-f]{6}$/i);
  expect(info.wallArtAssets.cableCar.fallbackColor).not.toBe("#000000");
  expect(info.wallArtAssets.redwoodPath.fallbackColor).not.toBe("#000000");
});
