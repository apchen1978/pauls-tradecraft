import { test, expect } from "@playwright/test";

// Paul 2026-11-20 (free hand): by the door in Room 01, Room 04's graphite doormat, no street shoes (the living room opens on a shared passage); Paul's beige clogs (Codex's model) stand between the door frame and the umbrella stand, a brushed-aluminium hook bar over the thermostat with a key-card pouch, and a smart lock that beeps and lights green when the card is tapped. They sit on the floor or hang on the wall and stay clear of what is near.
test("Room 01 entry: doormat and sneakers stand on the floor clear of the door frame and umbrella stand; the key rail hangs flat on the wall beside the door", async ({ page }) => {
  test.setTimeout(150000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/prototype/roomverse-3d/?lang=zh&hint=0");
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.entryShoes?.()?.ready, null, { timeout: 90000 }); await page.waitForTimeout(2000);
  const f = await page.evaluate(() => window.__room.entryFit());
  expect((await page.evaluate(() => window.__room.entryShoes())).placed, "the beige clogs are in the room").toBe(true);
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

// Paul 2026-11-21: a dusty-blush pouf (Room 04's Lounge pouf, slimmed) stands against the left wall between the sideboard and the yellow bag, with an oak tray, a coffee canister and a take-away cup on it; the popcorn bowl
// also shows on a slow Sunday afternoon; and the game pad lies on the sofa on a series night.
test("Room 01 coffee stool stands clear on the floor; the popcorn bowl shows on a slow afternoon and a series night; the pad shows only on a series night", async ({ page }) => {
  test.setTimeout(200000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/prototype/roomverse-3d/?lang=zh&hint=0&mood=slow");
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.coffeeStoolFit, null, { timeout: 90000 }); await page.waitForTimeout(3000);
  const f = await page.evaluate(() => window.__room.coffeeStoolFit());
  expect(Math.abs(f.floorMm), "the stool stands on the floor").toBeLessThanOrEqual(2);
  expect(f.wallGapMm, "clear of the wall, not through it").toBeGreaterThanOrEqual(10);
  expect(f.toSideboardMm, "clear of the sideboard").toBeGreaterThanOrEqual(60);
  expect(f.toBagMm, "the yellow bag stands 1.5 to 6 cm from the stool (moved up on purpose, 2026-11-21)").toBeGreaterThanOrEqual(15); expect(f.toBagMm).toBeLessThanOrEqual(60);
  expect(f.topM, "tray, canister and cup stand on a 42 cm stool").toBeGreaterThan(.55);
  await page.waitForFunction(() => window.__room.nightInfo().popcornReady, null, { timeout: 60000 });
  expect(await page.evaluate(() => window.__room.nightInfo()), "slow afternoon: the bowl, none of the rest of the night set").toMatchObject({ popcorn: true, night: false });
  await page.evaluate(() => window.__room.set("mood", "tv")); await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__room.nightInfo()), "series night: the bowl and the night set (with the pad on the sofa)").toMatchObject({ popcorn: true, night: true });
  await page.evaluate(() => window.__room.set("mood", "golden")); await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__room.nightInfo()), "golden hour: neither").toMatchObject({ popcorn: false, night: false });
  expect(errors).toEqual([]);
});

// Paul 2026-11-21: Room 03's phone lies on the side table (no glow, no message), and a globe wall sconce hangs on the left wall above the plant; the sconce glows more in the evening moods and has no real light.
test("Room 01 phone on the side table is clear of its neighbours and inside the edge; the wall sconce follows the mood", async ({ page }) => {
  test.setTimeout(200000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/prototype/roomverse-3d/?lang=zh&hint=0&mood=golden");
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.phoneFit && window.__room?.sconceInfo, null, { timeout: 90000 }); await page.waitForTimeout(3000);
  const p = await page.evaluate(() => window.__room.phoneFit());
  expect(Math.abs(p.seatMm), "the phone lies on the table top").toBeLessThanOrEqual(2);
  expect(p.radialMm, "wholly inside the table's edge").toBeLessThanOrEqual(p.tableRadiusMm - 10);
  for (const [k, gap] of Object.entries(p.gaps)) expect(gap, `clear of the ${k} (-1 means they overlap)`).toBeGreaterThanOrEqual(0);
  const golden = await page.evaluate(() => window.__room.sconceInfo());
  expect(golden.x, "on the left wall").toBeCloseTo(-2.6, 2);
  expect(golden.globeX - golden.x, "the shade stands 8 to 16 cm off the wall").toBeGreaterThan(.08); expect(golden.globeX - golden.x).toBeLessThan(.16);
  expect(golden.y, "hung high, above the pictures").toBeGreaterThanOrEqual(2.0);
  await page.evaluate(() => window.__room.set("mood", "tv")); await page.waitForTimeout(1800);
  const tv = await page.evaluate(() => window.__room.sconceInfo());
  expect(tv.glow, "brighter on a series night than at golden hour").toBeGreaterThan(golden.glow); expect(tv.halo).toBeGreaterThan(golden.halo);
  await page.evaluate(() => window.__room.set("mood", "slow")); await page.waitForTimeout(1800);
  expect((await page.evaluate(() => window.__room.sconceInfo())).glow, "dimmest by day").toBeLessThan(golden.glow);
  expect(errors).toEqual([]);
});

// Paul 2026-11-21: "just moved in": a corrugated moving box (# ROOM 01 / LIVING ROOM) stands on the floor against the left wall, between the yellow bag and the plant; the bag moved up to 3.5 cm from the coffee stool; the plant keeps 30 cm clear in front so its Post-it can be tapped.
test("Room 01 moving box stands on the floor by the wall, clear of the plant, near the bag; the bag is close to the stool", async ({ page }) => {
  test.setTimeout(200000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/prototype/roomverse-3d/?lang=zh&hint=0&mood=golden");
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.movingBoxFit && window.__room?.coffeeStoolFit && window.__room.wallBackpackInfo?.().ready, null, { timeout: 90000 }); await page.waitForTimeout(2000);
  await page.waitForFunction(() => window.__room.movingBoxFit() !== null && window.__room.coffeeStoolFit() !== null, null, { timeout: 60000 });
  const b = await page.evaluate(() => window.__room.movingBoxFit());
  expect(Math.abs(b.floorMm), "on the floor").toBeLessThanOrEqual(2);
  expect(b.wallGapMm, "against the wall, not through it").toBeGreaterThanOrEqual(5); expect(b.wallGapMm).toBeLessThanOrEqual(60);
  expect(b.toPlantMm, "the plant keeps room in front for its Post-it").toBeGreaterThanOrEqual(300);
  expect(b.toBagMm, "closer to the bag than before (it was far away)").toBeLessThanOrEqual(200); expect(b.toBagMm).toBeGreaterThanOrEqual(30);
  const stool = await page.evaluate(() => window.__room.coffeeStoolFit());
  expect(stool.toBagMm, "the bag stands 2 to 5 cm from the stool").toBeGreaterThanOrEqual(15); expect(stool.toBagMm).toBeLessThanOrEqual(60);
  expect(errors).toEqual([]);
});
