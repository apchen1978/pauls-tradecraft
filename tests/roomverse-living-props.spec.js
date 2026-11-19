import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/";

async function openRoom(page, extra = "") {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${PAGE}?lang=zh&hint=0${extra}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room?.propFit, null, { timeout: 90000 });
  await page.waitForTimeout(2500);
  return errors;
}

// Paul 2026-11-20 (GrokBot's list 1, 2, 3): small lived-in things in the living room, all physical: they stand on a surface, inside its edge, clear of what is near.
test("Room 01 living props: the side-table mug, coaster and notebook, the console glass, the two pairs of slippers and the series-night coffee table all sit properly", async ({ page }) => {
  test.setTimeout(150000);
  const errors = await openRoom(page);
  const fit = await page.evaluate(() => window.__room.propFit());
  const s = fit.sideTable;
  // Paul 2026-11-20: the side table is 20% wider and carries the red mug (on a coaster printed with our name, steaming) and Room 04's notebook with its pen; the water glass moved to the TV console.
  for (const k of ["coasterSeatMm", "mugSeatMm", "notebookSeatMm"]) expect(Math.abs(s[k]), `${k}: stands on the table top`).toBeLessThanOrEqual(1.5);
  expect(s.tableRadiusMm, "the side table is about 20% wider than its old 275 mm").toBeGreaterThan(320);
  for (const k of ["coaster", "mug", "notebook"]) expect(s.outerRadiusMm[k], `${k} stays inside the table edge`).toBeLessThanOrEqual(s.tableRadiusMm - 12);
  for (const k of ["coasterToLamp", "mugToLamp", "notebookToLamp"]) expect(s.innerClearMm[k], `${k}: clear of the lamp's foot`).toBeGreaterThanOrEqual(15);
  expect(s.notebookToMugMm, "the notebook and the mug do not touch").toBeGreaterThanOrEqual(20);
  expect(s.steamLive, "the mug's steam is there").toBe(true);
  // The glass of water stands on the TV console between the books and the right-hand speaker.
  await expect.poll(async () => (await page.evaluate(() => window.__room.propFit())).consoleGlass.toBooksMm, { timeout: 60000, message: "the console decor loads after the room opens" }).not.toBeNull();
  const cg = (await page.evaluate(() => window.__room.propFit())).consoleGlass;
  expect(Math.abs(cg.seatMm), "the glass stands on the console").toBeLessThanOrEqual(1.5);
  expect(cg.insideConsole).toBe(true);
  expect(cg.toBooksMm, "clear of the books").toBeGreaterThanOrEqual(20); expect(cg.toSpeakerMm, "clear of the speaker").toBeGreaterThanOrEqual(20);
  // The two pairs on the rug: oatmeal scuffs at the sofa's right end, red flip-flops in front of the coffee table.
  for (const key of ["slippers", "flips"]) { expect(fit[key].onRug, `${key} are on the rug`).toBe(true); expect(Math.abs(fit[key].seatMm), `${key} rest on the rug`).toBeLessThanOrEqual(1.5); }
  expect(fit.flips.clearOfTableMm, "the flip-flops are clear of the coffee table").toBeGreaterThanOrEqual(50);
  // The arrival mood leaves the coffee table as it was; series night changes it.
  expect(fit.night.visible).toBe(false); expect(fit.night.laptopOpenVisible, "the open laptop is out in the day moods").toBe(true);
  expect(fit.night.popcornBowlInsideTable).toBe(true);
  await page.evaluate(() => window.__room.set("mood", "tv"));
  await expect.poll(async () => (await page.evaluate(() => window.__room.propFit())).night.visible, { timeout: 8000 }).toBe(true);
  const night = (await page.evaluate(() => window.__room.propFit())).night;
  expect(night.laptopOpenVisible, "the open laptop gives way to a closed one at night").toBe(false);
  expect(night.steamVisible, "the mug steams on series night").toBe(true);
  expect(night.laptopStandsOnTable, "the closed laptop stands on the table").toBeGreaterThanOrEqual(-1.5);
  expect(night.remoteSeat.seatY, "the remote lies on the sofa seat").toBeGreaterThan(0.3);
  await page.evaluate(() => window.__room.set("mood", "golden"));
  await expect.poll(async () => (await page.evaluate(() => window.__room.propFit())).night.visible, { timeout: 8000 }).toBe(false);
  expect(errors).toEqual([]);
});

// Paul 2026-11-20: when a visitor swaps the rug, the slippers must stay where they are (they belong to the room, not to the rug picture).
test("Room 01 living props: the slippers and flip-flops stay put and stay on the rug when the rug is swapped", async ({ page }) => {
  test.setTimeout(150000);
  const errors = await openRoom(page);
  const before = await page.evaluate(() => { const f = window.__room.propFit(); return { slippers: f.slippers.bounds, flips: f.flips.bounds }; });
  const rugs = await page.evaluate(() => [...document.querySelectorAll("#panel .opts")].map((g) => [...g.querySelectorAll("button")].map((b) => b.dataset.key)).find((keys) => keys.includes("medallion")) ?? ["stripe", "ivory", "medallion"]);
  for (const key of rugs) {
    await page.evaluate((k) => window.__room.set("rug", k), key);
    await page.waitForTimeout(400);
    const now = await page.evaluate(() => { const f = window.__room.propFit(); return { slippers: f.slippers.bounds, flips: f.flips.bounds, on: [f.slippers.onRug, f.flips.onRug] }; });
    expect(now.slippers, `the oatmeal slippers do not move with the ${key} rug`).toEqual(before.slippers);
    expect(now.flips, `the flip-flops do not move with the ${key} rug`).toEqual(before.flips);
    expect(now.on, `both pairs are still on the ${key} rug`).toEqual([true, true]);
  }
  expect(errors).toEqual([]);
});
