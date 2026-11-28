import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/?lang=en";

async function openRoom(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(PAGE);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.robotInfo().ready, null, { timeout: 120000 });
  return errors;
}

// Paul 2026-11-19: US (Decora) outlets a Bay Area kitchen would use. A GFCI on the backsplash beside the sink, empty; a duplex on the entry wall behind the window-side floor lamp with the
// lamp's cord plugged in; the record player's cord already ends in a plug (see roomverse-room03-record-player.spec.js). All three share one build, and the two new ones are one mesh.
test("Room 03 outlets: a GFCI by the sink and a lamp outlet with the floor lamp's cord plugged in", async ({ page }) => {
  const errors = await openRoom(page);
  const info = await page.evaluate(() => window.__room03.outletsInfo());
  // The backsplash GFCI: 165 mm above the counter, 0.5 mm into the tile, nothing plugged in.
  expect(info.counter.kind).toBe("gfci");
  expect(info.counter.centreAboveCounterMm).toBe(165);
  expect(info.counter.plateIntoTileMm).toBeGreaterThan(0);
  expect(info.counter.plateIntoTileMm).toBeLessThanOrEqual(1);
  // The lamp outlet stands 360 mm above the floor; its cord leaves the lamp pole (starts inside it), lies on the floor (0 to 1 mm above it) and ends inside the plug's neck.
  expect(info.lamp.centreAboveFloorMm).toBe(360);
  expect(info.lamp.startInsidePoleMm, "the cord starts inside the lamp pole").toBeGreaterThanOrEqual(1);
  expect(info.lamp.lowestAboveFloorMm, "the cord lies on the floor").toBeGreaterThanOrEqual(0);
  expect(info.lamp.lowestAboveFloorMm, "the cord lies on the floor").toBeLessThanOrEqual(1.5);
  expect(info.lamp.endInsideNeck, "the cord ends inside the plug's neck").toBe(true);
  expect(info.lamp.endAboveNeckBottomMm).toBeGreaterThanOrEqual(3);
  expect(info.vertices).toBeGreaterThan(1500);
  expect(errors).toEqual([]);
});
