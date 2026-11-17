import { test, expect } from "@playwright/test";

// Card I (2026-11-18): Room 02's record turns and its tonearm swings from the rest post onto the record while the music plays, and goes back when it stops.
// A "Record player" look walks the camera to the deck. Nothing moves (and nothing loops) while the record is stopped.
const PAGE = "/prototype/roomverse-3d/bedroom/?lang=en";

test("Room 02 the record turns and the arm drops onto the vinyl only while the music plays", async ({ page }) => {
  test.setTimeout(240000);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(PAGE);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom?.deckMotion, null, { timeout: 120000 });
  await page.waitForTimeout(6000); // the arrival walk
  await page.locator('#viewRow button[data-look="record"]').click();
  await expect(page.locator('#viewRow button[data-look="record"]')).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(1600);
  const deck = () => page.evaluate(() => window.__bedroom.deckMotion());
  const stopped = await deck();
  expect(stopped.view).toBe("record");
  expect(stopped.playing).toBe(false);
  expect(stopped.looping, "no animation loop while stopped").toBe(false);
  expect(stopped.armAngle).toBeCloseTo(stopped.armRest, 3);
  expect(stopped.stylusFromCentreMm, "parked: the stylus is off the platter").toBeGreaterThan(172 + 10);
  // Physics: the arm tube starts inside the pivot cap, the rest post stands in the top plate, the stylus touches the vinyl without sinking into it.
  expect(stopped.tubeIntoPivotMm).toBeGreaterThanOrEqual(0); expect(stopped.tubeIntoPivotMm).toBeLessThanOrEqual(2);
  expect(stopped.restIntoPlateMm).toBeGreaterThanOrEqual(0); expect(stopped.restIntoPlateMm).toBeLessThanOrEqual(2);
  expect(stopped.stylusAboveVinylMm).toBeGreaterThanOrEqual(0); expect(stopped.stylusAboveVinylMm).toBeLessThanOrEqual(12);
  const p = await page.evaluate(() => window.__bedroom.vinylPoint());
  await page.mouse.click(p.x, p.y);
  await expect.poll(async () => (await page.evaluate(() => window.__bedroom.recordState())).playing, { timeout: 8000 }).toBe(true);
  await expect.poll(async () => (await deck()).armAngle, { timeout: 5000, message: "the arm swings onto the record" }).toBeCloseTo(stopped.armPlay, 3);
  const playing = await deck();
  expect(playing.looping).toBe(true);
  expect(playing.stylusFromCentreMm, "the stylus lands on the vinyl").toBeLessThan(playing.recordRadiusMm - 5);
  expect(playing.stylusFromCentreMm, "on the grooves, not the label").toBeGreaterThan(playing.labelRadiusMm + 5);
  expect(playing.led, "the power lamp is lit while playing").toBeGreaterThan(stopped.led);
  await page.waitForTimeout(600);
  expect((await deck()).recordAngle, "the record turns").not.toBeCloseTo(playing.recordAngle, 2);
  await page.evaluate(() => window.__bedroom.stopRecord());
  await expect.poll(async () => (await deck()).looping, { timeout: 5000, message: "the loop ends after the arm is back" }).toBe(false);
  const after = await deck();
  expect(after.armAngle).toBeCloseTo(after.armRest, 3);
  expect(after.led).toBeCloseTo(stopped.led, 2);
  expect(errors).toEqual([]);
});
