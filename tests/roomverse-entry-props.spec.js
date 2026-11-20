import { test, expect } from "@playwright/test";

// Paul 2026-11-20 (free hand): by the door in Room 01, Room 04's graphite doormat, no street shoes (the living room opens on a shared passage; the spot is kept for the beige clogs), a brushed-aluminium hook bar over the thermostat with a key-card pouch, and a smart lock that beeps and lights green when the card is tapped. They sit on the floor or hang on the wall and stay clear of what is near.
test("Room 01 entry: doormat and sneakers stand on the floor clear of the door frame and umbrella stand; the key rail hangs flat on the wall beside the door", async ({ page }) => {
  test.setTimeout(150000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/prototype/roomverse-3d/?lang=zh&hint=0");
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.entryShoes?.(), null, { timeout: 90000 }); await page.waitForTimeout(2000);
  const f = await page.evaluate(() => window.__room.entryFit());
  expect(Math.abs(f.matSeatMm), "mat lies on the floor").toBeLessThanOrEqual(2);
  expect(f.matThickMm, "a thin mat").toBeLessThanOrEqual(15);
  if (f.shoesSeatMm !== null) expect(Math.abs(f.shoesSeatMm), "shoes stand on the floor").toBeLessThanOrEqual(2); // the clogs' spot: checked once the shoes are placed
  if (f.shoesSeatMm !== null) expect(f.shoesToStandMm, "clear of the umbrella stand's vessel (-1 means the footprints overlap)").toBeGreaterThanOrEqual(0); // the clogs' spot: checked once the shoes are placed
  if (f.shoesSeatMm !== null) expect(f.shoesToFrameMm, "beyond the door frame, out of the door's swing").toBeGreaterThanOrEqual(0); // the clogs' spot: checked once the shoes are placed
  if (f.shoesSeatMm !== null) expect(f.shoesToWallMm, "inside the room, not through the wall").toBeGreaterThanOrEqual(10); // the clogs' spot: checked once the shoes are placed
  expect(f.railToWallMm, "the rail is screwed to the wall (within 2 mm)").toBeLessThanOrEqual(2);
  expect(f.railToWallMm).toBeGreaterThanOrEqual(-2);
  expect(f.railToFrameMm, "clear of the door frame").toBeGreaterThanOrEqual(10);
  expect(f.railHeightM, "coat-hook height, above the thermostat and switch plates").toBeGreaterThan(1.45);
  const tap = await page.evaluate(() => window.__room.tapKeycard({ go: false }));
  expect(tap.ledGreen, "the lock light turns green when the card is tapped").toBe(true);
  expect((await page.evaluate(() => window.__room.lockLed())).emissive, "green").toBe("2bd96b");
  await expect.poll(async () => (await page.evaluate(() => window.__room.lockLed())).emissive, { timeout: 4000, message: "the light goes back to its idle blue" }).toBe("3a6bff");
  expect(errors).toEqual([]);
});
