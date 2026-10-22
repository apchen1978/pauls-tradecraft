import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/bedroom/";
const QA = process.env.ROOMVERSE_QA === "1" ? "docs/qa/roomverse-bedroom-moods" : null;

async function enter(page, { lang = "zh", width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom);
}

test("studio shell has the planned size, window, door and three floor zones", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await enter(page);
  const info = await page.evaluate(() => window.__bedroom.info());
  expect(info.room).toEqual({ w: 4, d: 5, h: 2.6 });
  expect(info.floor.w).toBeCloseTo(4, 2);
  expect(info.floor.d).toBeCloseTo(5, 2);
  expect(info.window).toEqual({ w: 1.6, h: 1.3, sill: .9, x: 0 });
  expect(info.door.w).toBeCloseTo(.9, 2);
  expect(info.door.h).toBeCloseTo(2.05, 2);
  expect(info.zones).toEqual(["zone-sleep-rug", "zone-work-mat", "zone-lounge-rug"]);
  expect(info.vertices).toBeLessThan(24000); // whole-room budget: two Room 01 models (sofa, plant) take about 9,500 of it
  expect(info.lights).toBe(5); // daylight (3) plus the bedside lamp and the screen, which glow for real in the moods
  expect(errors).toEqual([]);
});

test("camera starts and stays inside the room across the whole orbit arc", async ({ page }) => {
  await enter(page);
  const { camera, reach } = await page.evaluate(() => ({ camera: window.__bedroom.info().camera, reach: window.__bedroom.reach() }));
  for (const [x, y, z] of [camera, reach.min, reach.max]) {
    expect(Math.abs(x)).toBeLessThan(1.95);
    expect(Math.abs(z)).toBeLessThan(2.45);
    expect(y).toBeGreaterThan(.3);
    expect(y).toBeLessThan(2.5);
  }
});

test("dragging turns the head within a limit and the camera never moves", async ({ page }) => {
  await enter(page);
  const before = await page.evaluate(() => window.__bedroom.info().camera);
  const box = await page.locator("#stage canvas").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 900, box.y + box.height / 2 + 600, { steps: 8 });
  await page.mouse.up();
  const after = await page.evaluate(() => { const c = window.__bedroom.controls; return { cam: window.__bedroom.info().camera, dy: c.look.yaw - c.look0.yaw, dp: c.look.pitch - c.look0.pitch, lim: c.limit }; });
  expect(after.cam).toEqual(before);
  expect(Math.abs(after.dy)).toBeCloseTo(after.lim.yaw, 3); // pushed to the end of the allowed turn, not beyond it
  expect(Math.abs(after.dp)).toBeCloseTo(after.lim.pitch, 3);
});

test("the painted window view loads for day and night and always fills the window", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.windowArt().loaded);
  let art = await page.evaluate(() => window.__bedroom.windowArt());
  expect(art.time).toBe("day");
  expect(art.pixels).toEqual([1600, 1000]);
  expect(art.covers).toEqual([true, true, true]); // home, and both ends of the orbit arc
  expect(await page.evaluate(() => window.__bedroom.setTime("night"))).toBe(true);
  art = await page.evaluate(() => window.__bedroom.windowArt());
  expect(art.time).toBe("night");
  expect(art.pixels).toEqual([1600, 1000]);
});

test("the bed has real sizes, stands on the floor beside the wall and clears the window and door", async ({ page }) => {
  await enter(page);
  const { bed, vertices } = await page.evaluate(() => window.__bedroom.info());
  const [x0, y0, z0] = bed.min, [x1, y1, z1] = bed.max;
  expect(bed.mattressTop).toBeCloseTo(.48, 2);
  expect(y0).toBeCloseTo(0, 2); // legs on the floor
  expect(x1 - x0).toBeGreaterThan(1.5); // bed 1.1 m plus the bedside table
  expect(x1).toBeLessThanOrEqual(2.0); // inside the east wall
  expect(z0).toBeGreaterThan(-2.501); // inside the north wall
  expect(z1 - z0).toBeLessThan(2.1); // 2 m bed, nothing hangs further out
  expect(x0).toBeGreaterThan(.3); // the bedside table stays well clear of the door side of the room
  expect(y1).toBeLessThan(1.1); // headboard under the window sill height + a little, never blocks the glass
  expect(vertices).toBeLessThan(24000);
});

test("the work zone: desk at 75 cm, ultrawide monitor above it, chair seat at 48 cm, all inside the room and clear of the bed", async ({ page }) => {
  await enter(page);
  const { desk, work, vertices } = await page.evaluate(() => window.__bedroom.info());
  expect(desk.top).toBeCloseTo(.75, 2);
  expect(desk.seat).toBeCloseTo(.48, 2);
  const m = desk.monitor, mw = Math.max(m.max[0] - m.min[0], m.max[2] - m.min[2]);
  expect(mw).toBeCloseTo(.8, 1); // a 34-inch ultrawide is about 80 cm wide
  expect(m.min[1]).toBeGreaterThan(.8); // the panel floats above the desk, not through it
  expect(m.max[1]).toBeLessThan(1.3);
  for (const n of ["desk", "chair"]) {
    const { min, max } = work[n];
    expect(min[0]).toBeGreaterThan(-2.001); expect(max[0]).toBeLessThan(.6); // west half, never reaches the bed (x > .85)
    expect(min[2]).toBeGreaterThan(-2.501); expect(max[2]).toBeLessThan(-.5);
    expect(min[1]).toBeGreaterThan(-.001);
  }
  expect(vertices).toBeLessThan(24000);
});

test("the lounge: real sofa and table heights, 33 cm gap, TV on a low console, shelf under the ceiling, nothing crosses the bed or the door", async ({ page }) => {
  await enter(page);
  const { lounge, tvPanel, shelfClash, vertices } = await page.evaluate(() => window.__bedroom.info());
  const sofa = lounge.sofa, table = lounge["coffee-table"];
  expect(sofa.max[0] - sofa.min[0]).toBeGreaterThan(.7); expect(sofa.max[0] - sofa.min[0]).toBeLessThan(1.05); // seat depth plus back, under a metre
  expect(sofa.max[2] - sofa.min[2]).toBeCloseTo(1.6, 1); // a 2-seater, 160 cm wide
  expect(sofa.max[1]).toBeGreaterThan(.7); expect(sofa.max[1]).toBeLessThan(1.0); // back at about 80-90 cm
  expect(sofa.min[0] - table.max[0]).toBeGreaterThan(.2); // room to walk and to put legs
  expect(sofa.min[0] - table.max[0]).toBeLessThan(.5);
  expect(table.max[1]).toBeLessThan(.5);
  expect(tvPanel.min[1]).toBeGreaterThan(.45); // panel sits above the 45 cm console
  expect(tvPanel.max[1] - tvPanel.min[1]).toBeCloseTo(.55, 1);
  expect(lounge.bookshelf.max[1]).toBeLessThan(2.3); // the box and plant stored on top stay well under the 2.6 m ceiling
  expect(shelfClash).toEqual([]); // no book, frame, box or plant passes through a shelf board
  for (const [n, b] of Object.entries(lounge)) {
    expect(b.min[0], n).toBeGreaterThan(-2.001); expect(b.max[0], n).toBeLessThan(2.0);
    expect(b.max[2], n).toBeLessThan(2.5); expect(b.min[1], n).toBeGreaterThan(-.001);
  }
  expect(lounge.sofa.min[2]).toBeGreaterThan(-.45); // sofa starts past the foot of the bed (z = -0.46)
  expect(lounge.bookshelf.max[0]).toBeLessThan(-1.65); // stays clear of the door frame (x from -1.6)
  expect(vertices).toBeLessThan(24000);
});

test("lived-in details: posters hang above the TV inside the wall, the plant stands clear of desk and TV", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.info().posters.loaded);
  let { posters, plant, tvPanel, work, lounge } = await page.evaluate(() => window.__bedroom.info());
  expect(posters.set).toBe("C");
  expect(posters.min[1]).toBeGreaterThan(tvPanel.max[1] + .2); // a clear gap above the TV
  expect(posters.max[1]).toBeLessThan(2.3);
  expect(posters.min[0]).toBeGreaterThan(-2.001); expect(posters.max[0]).toBeLessThan(-1.95); // flat on the west wall
  expect(plant.min[1]).toBeGreaterThan(-.001); expect(plant.min[1]).toBeLessThan(.01); // on the floor
  expect(plant.min[0]).toBeGreaterThan(-2.0);
  expect(plant.min[2]).toBeGreaterThan(work.desk.max[2]); // between the desk ...
  expect(plant.max[2]).toBeLessThan(lounge["tv-unit"].min[2]); // ... and the TV
  for (const set of ["A", "B"]) {
    expect(await page.evaluate((s) => window.__bedroom.setPosters(s), set)).toBe(true);
    expect((await page.evaluate(() => window.__bedroom.info().posters)).set).toBe(set);
  }
});

test("four moods: buttons switch window, blind and lamps, and no mood is blown out or crushed to black", async ({ page }) => {
  await enter(page);
  await expect(page.locator("#moodRow button")).toHaveCount(4);
  const expected = { focus: ["day", .18], weekend: ["day", .45], night: ["night", .18], sunday: ["day", .62] };
  for (const [mood, [time, blind]] of Object.entries(expected)) {
    await page.locator(`#moodRow button[data-mood="${mood}"]`).click();
    await page.waitForFunction((m) => window.__bedroom.info().mood === m && window.__bedroom.windowArt().loaded, mood);
    await expect(page.locator(`#moodRow button[data-mood="${mood}"]`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#why")).not.toBeEmpty();
    const { info, art, light } = await page.evaluate(() => ({ info: window.__bedroom.info(), art: window.__bedroom.windowArt(), light: window.__bedroom.brightness() }));
    expect(art.time, mood).toBe(time);
    expect(info.blind, mood).toBeCloseTo(blind, 2);
    expect(light, mood).toBeGreaterThan(30);
    expect(light, mood).toBeLessThan(215);
  }
});

test("vinyl corner: console under the sill, records inside their cubbies, record on the platter, clear of desk, chair and bed", async ({ page }) => {
  await enter(page);
  const { vinyl, work, bed } = await page.evaluate(() => window.__bedroom.info());
  expect(vinyl.min[1]).toBeGreaterThan(-.001); expect(vinyl.min[1]).toBeLessThan(.01); // legs on the floor
  expect(vinyl.max[1]).toBeLessThan(.9); // speakers stay under the 90 cm window sill
  expect(vinyl.min[2]).toBeGreaterThan(-2.501); // against the north wall, not through it
  expect(vinyl.sleevesMinY).toBeGreaterThan(.144); // standing on the lower board (top face 14.5 cm) ...
  expect(vinyl.sleevesMaxY).toBeLessThan(.476); // ... and under the top board (lower face 47.5 cm)
  expect(vinyl.recordY).toBeGreaterThan(.584); // the record lies on the platter, not inside it
  expect(vinyl.min[0]).toBeGreaterThan(work.desk.max[0]); // east of the desk
  expect(vinyl.max[2]).toBeLessThan(work.chair.min[2] + .001); // the chair stays in front of it
  expect(vinyl.max[0]).toBeLessThan(bed.min[0]); // west of the bedside table
});

test("the page switches between Chinese and English", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await expect(page.locator(".mark")).toContainText("ROOMVERSE 3D");
  await expect(page).toHaveTitle(/ROOMVERSE 3D｜空間幻境/);
  await expect(page.locator("#roomNo")).toHaveText("Room 02 · Night Shift");
  await expect(page.locator("#title")).toHaveText("Room 02 都市青年Style");
  await page.locator("#lang").click();
  await expect(page.locator("#roomNo")).toHaveText("Room 02 · Night Shift");
  await expect(page.locator("#title")).toHaveText("Room 02 · Urban Youth Style");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("QA screenshots (set ROOMVERSE_QA=1)", async ({ page }) => {
  test.skip(!QA, "only when collecting QA images");
  for (const width of [1440, 390]) {
    await enter(page, { width });
    await page.waitForTimeout(600);
    await page.locator("#stage").screenshot({ path: `${QA}/focus-${width}.png` });
    for (const mood of ["weekend", "night", "sunday"]) {
      await page.locator(`#moodRow button[data-mood="${mood}"]`).click();
      await page.waitForFunction((m) => window.__bedroom.info().mood === m && window.__bedroom.windowArt().loaded, mood);
      await page.waitForTimeout(300);
      await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}.png` });
    }
    await page.locator("#moods").screenshot({ path: `${QA}/mood-buttons-${width}.png` });
  }
});
