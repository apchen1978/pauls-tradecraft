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

test("Room 03 a glowing ring points at the record player until it is tapped, then the first tap only says hello", async ({ page }) => {
  test.setTimeout(150000);
  const errors = await openRoom(page);
  // The "Record player" button walks the camera in to a close look at the credenza end.
  await page.locator("#recordView").click();
  await expect.poll(async () => (await page.evaluate(() => window.__room03.recordViewInfo()))?.distance ?? 99, { timeout: 8000, message: "the camera walks in to the record view" }).toBeLessThan(1.4);
  const view = await page.evaluate(() => window.__room03.recordViewInfo());
  expect(view.distance, "close enough to see the grooves, not inside the furniture").toBeGreaterThan(0.55);
  await expect(page.locator("#vinylRing"), "the ring appears a few seconds after the room opens").toBeVisible({ timeout: 20000 });
  // A tap on the platter's edge counts, not only the exact centre.
  const ring = await page.locator("#vinylRing").boundingBox();
  const hit = await page.evaluate(() => { const r = window.__room03; const rect = r.camera && document.querySelector("canvas").getBoundingClientRect(); const v = r.camera; const p = { x: 2.77 + 0.1, y: 0.875, z: 0.53 }; const q = new v.position.constructor(p.x, p.y, p.z).project(v); return { x: rect.left + (q.x + 1) * rect.width / 2, y: rect.top + (1 - q.y) * rect.height / 2 }; });
  expect(Math.hypot(hit.x - (ring.x + ring.width / 2), hit.y - (ring.y + ring.height / 2)), "the platter edge is farther from the ring centre than a ring radius").toBeGreaterThan(20);
  await page.mouse.click(hit.x, hit.y);
  await expect(page.locator("#vinylRing"), "the ring goes away once the record player has been found").toBeHidden();
  expect((await page.evaluate(() => window.__room03.recordPlayerInfo())).hintSeen).toBe(true);
  // Step 1 loads no sound: no audio files and no piano samples are requested by this tap.
  const audioRequests = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => e.name).filter((n) => /\.mp3|piano/i.test(n)));
  expect(audioRequests).toEqual([]);
  // Leaving the close view (here by the entry-wall button) restores the normal orbit.
  await page.locator("#plaqueView").click();
  expect(await page.evaluate(() => window.__room03.recordViewInfo())).toBeNull();
  expect(errors).toEqual([]);
});
