import { test, expect } from "@playwright/test";

// Room 03 soft reflections (2026-11-05): a baked PMREM room is given ONLY to metals and glazes. scene.environment stays unset, so walls,
// floor and wood keep their lighting; no mesh or draw call is added. The env map is cheap; this guards that it stays scoped and mood-aware.
const PAGE = "/prototype/roomverse-3d/kitchen/";

test("metals and glazes carry the baked reflection, nothing else is lit by it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(PAGE);
  await page.waitForFunction(() => window.__room03?.info().drawCallsLastFrame > 0);
  const day = await page.evaluate(() => window.__room03.info().reflections);
  expect(day.envReady).toBe(true);
  expect(day.sceneEnvironment, "a scene-wide environment would relight the whole room").toBe(false);
  for (const key of ["wokSteel", "steel", "brass", "sinkSteel", "faucetSteel", "mugGlaze", "waterSetGlass"]) expect(day.materials[key]?.hasEnv, key).toBe(true);
  expect(day.materials.brass.intensity).toBeGreaterThan(0);
  await page.evaluate(() => window.__room03.setMood("night"));
  const night = await page.evaluate(() => window.__room03.info().reflections);
  expect(night.materials.brass.intensity, "reflections are weaker at night").toBeLessThan(day.materials.brass.intensity);
});
