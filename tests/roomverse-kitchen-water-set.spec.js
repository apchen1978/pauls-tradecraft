import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, width = 1440) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(
    () => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.info().furniture.table === "glb",
    null,
    { timeout: 90000 },
  );
}

test("daylight water set is clear glass, three-quarters full, and clear of the chair back", async ({ page }) => {
  await loadRoom(page, 1440);
  const info = await page.evaluate(() => window.__room03.info());
  const set = info.waterSet;
  expect(set, "daylight exposes the water set").toBeTruthy();
  expect(set.form).toBe("glass-pitcher-with-lemon-water-and-two-tumblers");
  // Moved toward the table centre (was 0.50, 0.27) so the default camera no longer reads the pitcher against the cream chair.
  expect(set.position[0], "pitcher sits left of the right-hand chair").toBeLessThanOrEqual(0.36);
  expect(set.position[2], "pitcher sits forward of the kitchen-side chairs").toBeGreaterThanOrEqual(0.36);
  expect(set.chairOffsetXMm).toBeGreaterThanOrEqual(140);
  expect(set.gapMm, "set sits on the table").toBeGreaterThanOrEqual(-2);
  expect(set.gapMm).toBeLessThanOrEqual(2);
  expect(set.pitcherBowlClearanceMm, "pitcher clears the lemon bowl").toBeGreaterThanOrEqual(80);
  expect(set.bowlClearanceMm, "AABB between bowl and set stays positive").toBeGreaterThanOrEqual(10);
  expect(set.pitcherFillRatio).toBeGreaterThanOrEqual(0.70);
  expect(set.pitcherFillRatio).toBeLessThanOrEqual(0.80);
  expect(set.tumblerCount).toBe(2);
  for (const ratio of set.tumblerFillRatios) {
    expect(ratio).toBeGreaterThanOrEqual(0.70);
    expect(ratio).toBeLessThanOrEqual(0.80);
  }
  expect(set.lemonSliceCount).toBe(2);
  expect(set.hasContactShadow).toBe(true);
  expect(set.glass.type).toBe("MeshPhysicalMaterial");
  expect(set.glass.transmission, "transmission is off: it would re-render the whole room").toBe(0);
  expect(set.glass.opacity, "low opacity, not a milky shell").toBeGreaterThan(0.12);
  expect(set.glass.opacity).toBeLessThanOrEqual(0.28);
  expect(set.glass.clearcoat).toBeGreaterThanOrEqual(0.8);
  expect(set.glass.hasEnv, "glass takes the room reflection map").toBe(true);
  expect(info.reflections.materials.waterSetGlass?.hasEnv).toBe(true);
  expect(info.reflections.sceneEnvironment, "env map stays scoped to materials").toBe(false);
  expect(info.propBounds["tabletop-water-set"]).toBeTruthy();
});

test("dinner and thanksgiving hide the water set with the lemon bowl", async ({ page }) => {
  await loadRoom(page, 1440);
  for (const mood of ["dinner", "thanksgiving"]) {
    await page.evaluate((name) => window.__room03.setMood(name), mood);
    const hidden = await page.evaluate(() => window.__room03.info().moodSlots.tabletopCenterpiece);
    expect(hidden.visible, `${mood} hides the centerpiece slot`).toBe(false);
  }
  await page.evaluate(() => window.__room03.setMood("daylight"));
  const day = await page.evaluate(() => window.__room03.info().moodSlots.tabletopCenterpiece);
  expect(day.visible).toBe(true);
});
