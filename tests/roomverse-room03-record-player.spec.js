import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/?lang=en";

async function openRoom(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(PAGE);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.robotInfo().ready, null, { timeout: 120000 });
  return errors;
}

test("Room 03 the credenza record player is a real, supported object (step 1: no sound)", async ({ page }) => {
  test.setTimeout(150000);
  const errors = await openRoom(page);
  const info = await page.evaluate(() => window.__room03.recordPlayerInfo());
  // Real size: a compact deck, 320 x 420 mm footprint, a 276 mm platter.
  expect(info.dimensionsMm).toEqual([320, 42, 420]);
  expect(info.platterMm).toBe(276);
  // Feet are embedded in what they stand on and in what they carry (paul's physics rules): no floating, no gap.
  expect(info.footIntoTopMm, "feet start inside the oak top").toBeGreaterThanOrEqual(2);
  expect(info.footIntoPlinthMm, "feet run into the plinth").toBeGreaterThanOrEqual(5);
  // The stylus rests just above the record, not through it and not floating high.
  expect(info.tonearmEndAboveVinylMm).toBeGreaterThanOrEqual(0);
  expect(info.tonearmEndAboveVinylMm).toBeLessThanOrEqual(12);
  // It sits on the credenza top (0.815 m) and stays on the credenza.
  expect(info.bounds.min[1]).toBeGreaterThanOrEqual(0.8);
  expect(info.bounds.max[1]).toBeLessThanOrEqual(0.95);
  expect(info.bounds.min[0]).toBeGreaterThan(2.55);
  expect(info.bounds.max[0]).toBeLessThan(3.0);
  // The cable-car keepsake moved to the nook console and rests on it with no gap.
  expect(Math.abs(info.nookKeepsake.consoleGapMm), "the cable car rests on the nook console (within 1 mm)").toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("Room 03 a glowing ring points at the record player; each tap walks the record: Brooklyn Windowsill, Afternoon Lane, stopped", async ({ page }) => {
  test.setTimeout(240000);
  const errors = await openRoom(page);
  const audioFiles = () => page.evaluate(() => performance.getEntriesByType("resource").map((e) => e.name).filter((n) => /\.mp3/i.test(n)));
  expect(await audioFiles(), "no piano sample files (mp3) are fetched before the first tap").toEqual([]);
  const state = () => page.evaluate(() => window.__room03.recordMusicState());
  // The "Record player" button walks the camera in to a close look at the credenza end.
  await page.locator("#recordView").click();
  await expect.poll(async () => (await page.evaluate(() => window.__room03.recordViewInfo()))?.distance ?? 99, { timeout: 8000, message: "the camera walks in to the record view" }).toBeLessThan(1.4);
  const view = await page.evaluate(() => window.__room03.recordViewInfo());
  expect(view.distance, "close enough to see the grooves, not inside the furniture").toBeGreaterThan(0.55);
  await expect(page.locator("#vinylRing"), "the ring appears a few seconds after the room opens").toBeVisible({ timeout: 20000 });
  // A tap on the platter's edge counts, not only the exact centre.
  const ring = await page.locator("#vinylRing").boundingBox();
  const spot = await page.evaluate(() => { const v = window.__room03.camera; const rect = document.querySelector("canvas").getBoundingClientRect(); const q = new v.position.constructor(2.77 + 0.1, 0.875, 0.53).project(v); return { x: rect.left + (q.x + 1) * rect.width / 2, y: rect.top + (1 - q.y) * rect.height / 2 }; });
  expect(Math.hypot(spot.x - (ring.x + ring.width / 2), spot.y - (ring.y + ring.height / 2)), "the platter edge is farther from the ring centre than a ring radius").toBeGreaterThan(20);
  // Tap 1: Brooklyn Windowsill (Room 02's piece).
  await page.mouse.click(spot.x, spot.y);
  await expect(page.locator("#vinylRing"), "the ring goes away once the record player has been found").toBeHidden();
  expect((await page.evaluate(() => window.__room03.recordPlayerInfo())).hintSeen).toBe(true);
  await expect.poll(async () => (await state()).windowsill.playing, { timeout: 8000, message: "the first tap starts the music" }).toBe(true);
  expect((await state()).side).toBe(0);
  expect((await state()).windowsill.title).toBe("布魯克林窗台");
  await expect.poll(async () => (await state()).windowsill.piano, { timeout: 20000, message: "the real piano samples load after the tap" }).toBe(true);
  await expect.poll(async () => (await state()).windowsill.notes, { timeout: 15000 }).toBeGreaterThan(12);
  expect((await audioFiles()).length, "the piano samples were fetched by the tap").toBeGreaterThan(0);
  // Tap 2: Afternoon Lane (Room 04's piece), and the first piece stops.
  await page.waitForTimeout(1200);
  await page.mouse.click(spot.x, spot.y);
  await expect.poll(async () => (await state()).side, { timeout: 8000 }).toBe(1);
  expect((await state()).windowsill.playing, "the first piece has stopped").toBe(false);
  await expect.poll(async () => (await state()).lane.playing, { timeout: 8000 }).toBe(true);
  expect((await state()).lane.title).toBe("午後弄堂");
  await expect.poll(async () => (await state()).lane.notes, { timeout: 15000 }).toBeGreaterThan(8);
  // Tap 3: stopped.
  await page.waitForTimeout(1200);
  await page.mouse.click(spot.x, spot.y);
  await expect.poll(async () => (await state()).side, { timeout: 8000 }).toBe(-1);
  expect((await state()).lane.playing).toBe(false);
  expect((await state()).windowsill.playing).toBe(false);
  // Leaving the close view (here by the entry-wall button) restores the normal orbit.
  await page.locator("#plaqueView").click();
  expect(await page.evaluate(() => window.__room03.recordViewInfo())).toBeNull();
  expect(errors).toEqual([]);
});

test("Room 03 (Card I) the platter turns and the arm drops onto the vinyl only while a piece plays", async ({ page }) => {
  test.setTimeout(240000);
  const errors = await openRoom(page);
  const motion = async () => (await page.evaluate(() => window.__room03.recordPlayerInfo())).motion;
  const stopped = await motion();
  expect(stopped.playing).toBe(false);
  expect(stopped.looping, "no animation loop while stopped").toBe(false);
  expect(stopped.armAngle).toBeCloseTo(stopped.armRest, 3);
  expect(stopped.stylusFromCentreMm, "parked: the stylus is clear of the platter").toBeGreaterThan(stopped.platterRadiusMm + 8);
  // Physics: the rest post stands in the deck top and its top meets the tube's underside (0-2 mm).
  expect(stopped.restIntoDeckMm).toBeGreaterThanOrEqual(0); expect(stopped.restIntoDeckMm).toBeLessThanOrEqual(2);
  expect(stopped.restTopToTubeMm).toBeGreaterThanOrEqual(-2); expect(stopped.restTopToTubeMm).toBeLessThanOrEqual(0);
  await page.locator("#recordView").click();
  await expect.poll(async () => (await page.evaluate(() => window.__room03.recordViewInfo()))?.distance ?? 99, { timeout: 8000 }).toBeLessThan(1.4);
  await page.waitForTimeout(1200);
  const spot = await page.evaluate(() => { const v = window.__room03.camera; const rect = document.querySelector("canvas").getBoundingClientRect(); const q = new v.position.constructor(2.77, 0.87, 0.475).project(v); return { x: rect.left + (q.x + 1) * rect.width / 2, y: rect.top + (1 - q.y) * rect.height / 2 }; });
  await page.mouse.click(spot.x, spot.y);
  await expect.poll(async () => (await page.evaluate(() => window.__room03.recordMusicState())).side, { timeout: 8000 }).toBe(0);
  await expect.poll(async () => (await motion()).armAngle, { timeout: 5000, message: "the arm swings onto the record" }).toBeCloseTo(stopped.armPlay, 3);
  const playing = await motion();
  expect(playing.looping).toBe(true);
  expect(playing.stylusFromCentreMm, "the stylus lands on the vinyl").toBeLessThan(playing.vinylRadiusMm - 5);
  expect(playing.stylusFromCentreMm, "on the grooves, not the label").toBeGreaterThan(playing.labelRadiusMm + 5);
  await page.waitForTimeout(600);
  expect((await motion()).platterAngle, "the platter turns").not.toBeCloseTo(playing.platterAngle, 2);
  // The stylus still rests on the vinyl, as in step 1.
  const info = await page.evaluate(() => window.__room03.recordPlayerInfo());
  expect(info.tonearmEndAboveVinylMm).toBeGreaterThanOrEqual(0); expect(info.tonearmEndAboveVinylMm).toBeLessThanOrEqual(12);
  await page.evaluate(() => window.__room03.stopRecord());
  await expect.poll(async () => (await motion()).looping, { timeout: 5000, message: "the loop ends once the arm is parked" }).toBe(false);
  expect((await motion()).armAngle).toBeCloseTo(stopped.armRest, 3);
  expect(errors).toEqual([]);
});
