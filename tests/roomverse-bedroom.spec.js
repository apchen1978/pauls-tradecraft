import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/bedroom/";
const QA = process.env.ROOMVERSE_QA === "1" ? "docs/qa/roomverse-bedroom-fixes3" : null;
const ARRIVAL_QA = process.env.ROOMVERSE_QA === "1" ? "docs/qa/room01-return-arrival" : null;
const IMMERSIVE_QA = process.env.ROOM02_IMMERSIVE_QA;
if (IMMERSIVE_QA) mkdirSync(IMMERSIVE_QA, { recursive: true });
const immersiveShot = async (page, name) => { if (IMMERSIVE_QA) await page.screenshot({ path: `${IMMERSIVE_QA}/${name}.png` }); };

async function enter(page, { lang = "zh", width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom);
}

test.describe("Room 02 mobile immersive", () => {
  test.use({ deviceScaleFactor: 2 });

  test("portrait fills the viewport, preserves controls, and restores the page", async ({ page }) => {
    const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
    await enter(page, { width: 390 });
    await expect(page.locator("#immersiveEnter")).toBeVisible();
    await immersiveShot(page, "portrait-before");
    const before = await page.evaluate(() => ({ height: document.querySelector(".room").getBoundingClientRect().height, canvas: [document.querySelector("#stage canvas").width, document.querySelector("#stage canvas").height] }));
    expect(before.canvas).toEqual([537, 735]);
    await page.locator("#immersiveEnter").click();
    await expect(page.locator(".room")).toHaveClass(/is-immersive/);
    await page.waitForFunction(() => document.querySelector("#stage canvas").height === Math.round(innerHeight * 1.5));
    const full = await page.evaluate(() => { const r = document.querySelector(".room").getBoundingClientRect(), s = document.querySelector("#stage").getBoundingClientRect(), c = document.querySelector("#stage canvas"); return { room: [r.width, r.height], stage: [s.width, s.height], canvas: [c.width, c.height], scroll: getComputedStyle(document.documentElement).overflow, bodyWidth: document.body.scrollWidth, viewportWidth: innerWidth }; });
    expect(full.room).toEqual([390, 844]); expect(full.stage).toEqual([390, 844]);
    expect(full.canvas).toEqual([585, 1266]); expect(full.scroll).toBe("hidden"); expect(full.bodyWidth).toBeLessThanOrEqual(full.viewportWidth);
    await immersiveShot(page, "portrait-full-day");
    await page.locator('#moodRow button[data-mood="series"]').click();
    await page.waitForFunction(() => window.__bedroom.info().mood === "series");
    await immersiveShot(page, "portrait-full-night");
    await page.locator('#viewRow button[data-look="tv"]').click();
    await page.waitForFunction(() => window.__bedroom.looks().name === "tv");
    const yaw = await page.evaluate(() => window.__bedroom.controls.look.yaw);
    const canvas = page.locator("#stage canvas"), box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 }); await page.mouse.up();
    expect(await page.evaluate(() => window.__bedroom.controls.look.yaw)).not.toBe(yaw);
    await page.keyboard.press("Escape");
    await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
    await expect(page.locator("#immersiveEnter")).toBeVisible();
    await page.waitForFunction((h) => document.querySelector("#stage canvas").height === h, before.canvas[1]);
    expect(await page.evaluate(() => ({ height: document.querySelector(".room").getBoundingClientRect().height, overflow: getComputedStyle(document.documentElement).overflow }))).toEqual({ height: before.height, overflow: "visible" });
    await immersiveShot(page, "portrait-after");
    expect(errors).toEqual([]);
  });

  test("landscape and browser back restore the room; desktop has no entry", async ({ page }) => {
    const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(`${PAGE}?lang=en`); await page.locator("#enter").click(); await page.waitForFunction(() => window.__bedroom);
    await immersiveShot(page, "landscape-before");
    await expect(page.locator("#immersiveEnter")).toBeVisible();
    await page.locator("#immersiveEnter").click();
    await expect(page.locator("#immersiveExit")).toBeVisible();
    const state = await page.evaluate(() => ({ width: document.querySelector(".room").getBoundingClientRect().width, height: document.querySelector(".room").getBoundingClientRect().height, canvas: [document.querySelector("#stage canvas").width, document.querySelector("#stage canvas").height], overflow: document.documentElement.scrollWidth - innerWidth }));
    expect(state).toEqual({ width: 844, height: 390, canvas: [1266, 585], overflow: 0 });
    await immersiveShot(page, "landscape-full-day");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => document.querySelector("#stage canvas").height === 1266);
    await expect(page.locator(".room")).toHaveClass(/is-immersive/);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForFunction(() => document.querySelector("#stage canvas").width === 1266);
    await page.locator('#moodRow button[data-mood="series"]').click();
    await page.waitForFunction(() => window.__bedroom.info().mood === "series");
    await immersiveShot(page, "landscape-full-night");
    await page.goBack(); await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
    await immersiveShot(page, "landscape-after");
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator("#immersiveEnter")).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("the immersive door reaches Room 01", async ({ page }) => {
    const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
    await enter(page, { width: 390 });
    await page.locator("#immersiveEnter").click();
    await page.locator("#immersiveDoor").click();
    await expect(page).toHaveURL(/roomverse-3d\/?\?lang=zh&from=room02/, { timeout: 15000 });
    expect(errors).toEqual([]);
  });

  test("browser back keeps a Room 01 arrival in Room 02", async ({ page }) => {
    const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${PAGE}?lang=zh&from=room01`);
    await page.waitForFunction(() => window.__bedroom);
    await expect(page.locator("#immersiveEnter")).toBeVisible();
    await page.locator("#immersiveEnter").click();
    await page.goBack();
    await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
    await expect(page).toHaveURL(/bedroom\/?\?lang=zh&from=room01/);
    expect(errors).toEqual([]);
  });
});
// The room opens standing in the middle; tests about the corner looks walk to the corner first.
async function toCorner(page) {
  await page.locator('#viewRow button[data-look="work"]').click();
  await page.waitForFunction(() => !window.__bedroom.info().centred && window.__bedroom.camera.position.y > 1.95 && window.__bedroom.looks().name === "work", null, { timeout: 8000 });
  await page.waitForTimeout(200);
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
  expect(info.zones).toEqual(["zone-sleep-rug", "zone-lounge-rug"]); // no rug under the desk chair: nobody lays one there
  expect(info.vertices).toBeLessThan(62000); // whole-room budget: two Room 01 models (sofa, plant) take about 9,500, rounded furniture edges about 5,000, the coffee bar GLB about 1,600, the Hunyuan sofa about 6,000; fully loaded (cushions, mug, robot, coffee bar) the room measures about 52,000 (sneaker boxes, oak table and the harbour frame joined the sofa) and the sofa swap itself added only 2,200
  expect(info.lights).toBe(9); // daylight (3) plus the bedside lamp and the screen, which glow for real in the moods, the desk downlight and three more (the track light: plaque, bed, print)
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
  await toCorner(page);
  const before = await page.evaluate(() => window.__bedroom.info().camera);
  const box = await page.locator("#stage canvas").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 900, box.y + box.height / 2 + 600, { steps: 8 });
  await page.mouse.up();
  await page.waitForFunction(() => { const y = window.__bedroom.controls.look.yaw, prev = window.__lastYaw; window.__lastYaw = y; return prev === y; }, null, { timeout: 8000, polling: 200 }); // the release glide has finished
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
  expect(x1 - x0).toBeGreaterThan(1.8); // a 1.5 m double bed plus the bedside table
  expect(x1).toBeLessThanOrEqual(2.001); // inside the east wall (the duvet drape just touches it; 1 mm for float error)
  expect(z0).toBeGreaterThan(-2.501); // inside the north wall
  expect(z1 - z0).toBeLessThan(2.55); expect(z1 - z0).toBeGreaterThan(2.3); // a 2.3 m mattress (a 2 m sleeper fits with room for the pillow) on a slightly larger frame, plus the headboard
  expect(x0).toBeGreaterThan(-.1); // the bedside table stays well clear of the door side of the room
  expect(y1).toBeLessThan(1.1); // headboard under the window sill height + a little, never blocks the glass
  expect(vertices).toBeLessThan(62000);
});

test("the work zone: desk at 75 cm, ultrawide monitor above it, chair seat at 48 cm, all inside the room and clear of the bed", async ({ page }) => {
  await enter(page);
  const { desk, work, vertices } = await page.evaluate(() => window.__bedroom.info());
  expect(desk.top).toBeCloseTo(.75, 2);
  expect(desk.seat).toBeCloseTo(.48, 2);
  const m = desk.monitor, mw = Math.max(m.max[0] - m.min[0], m.max[2] - m.min[2]);
  expect(mw).toBeCloseTo(1.19, 1); // a 49-inch 32:9 curved panel is about 119 cm wide
  expect(m.min[1]).toBeGreaterThan(.8); // the panel floats above the desk, not through it
  expect(m.max[1]).toBeLessThan(1.3);
  for (const n of ["desk", "chair"]) {
    const { min, max } = work[n];
    expect(min[0]).toBeGreaterThan(-2.001); expect(max[0]).toBeLessThan(.6); // west half, never reaches the bed (x > .85)
    expect(min[2]).toBeGreaterThan(-2.501); expect(max[2]).toBeLessThan(-.5);
    expect(min[1]).toBeGreaterThan(-.001);
  }
  expect(vertices).toBeLessThan(62000);
});

test("the lounge: real sofa and table heights, 33 cm gap, TV on a low console, shelf under the ceiling, nothing crosses the bed or the door", async ({ page }) => {
  await enter(page);
  const { lounge, tvPanel, shelfClash, vertices } = await page.evaluate(() => window.__bedroom.info());
  const sofa = lounge.sofa;
  expect(sofa.max[0] - sofa.min[0]).toBeGreaterThan(.7); expect(sofa.max[0] - sofa.min[0]).toBeLessThan(1.05); // seat depth plus back, under a metre
  expect(sofa.max[2] - sofa.min[2]).toBeCloseTo(1.6, 1); // a 2-seater, 160 cm wide
  expect(sofa.max[1]).toBeGreaterThan(.7); expect(sofa.max[1]).toBeLessThan(1.0); // back at about 80-90 cm
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
  expect(vertices).toBeLessThan(62000);
});

test("lived-in details: posters hang above the TV inside the wall, the plant stands clear of desk and TV", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.info().posters.loaded);
  let { posters, plant, tvPanel, work, lounge } = await page.evaluate(() => window.__bedroom.info());
  expect(posters.set).toBe("C");
  expect(posters.min[1]).toBeGreaterThan(1.4); // over the desk, well above the monitor
  expect(posters.min[2]).toBeGreaterThan(work.desk.min[2] - .1); expect(posters.max[2]).toBeLessThan(work.desk.max[2] + .1); // within the desk's length
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

test("six moods: buttons switch window, blind and lamps, and no mood is blown out or crushed to black", async ({ page }) => {
  await enter(page);
  await expect(page.locator("#moodRow button[data-mood]")).toHaveCount(6); await expect(page.locator("#moodRow button[data-shuffle]")).toHaveCount(1);
  const expected = { focus: ["day", .18], weekend: ["day", .45], golden: ["day", .08], night: ["night", .18], sunday: ["day", .62], series: ["night", .5] };
  for (const [mood, [time, blind]] of Object.entries(expected)) {
    await page.locator(`#moodRow button[data-mood="${mood}"]`).click();
    await page.waitForFunction(([m, t]) => window.__bedroom.info().mood === m && window.__bedroom.windowArt().loaded && window.__bedroom.windowArt().time === t, [mood, time]); // the night picture arrives a moment after the button
    await expect(page.locator(`#moodRow button[data-mood="${mood}"]`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#why")).not.toBeEmpty();
    const { info, art, light } = await page.evaluate(() => ({ info: window.__bedroom.info(), art: window.__bedroom.windowArt(), light: window.__bedroom.brightness() }));
    expect(art.time, mood).toBe(time);
    expect(info.blind, mood).toBeCloseTo(blind, 2);
    expect(light, mood).toBeGreaterThan(30);
    expect(light, mood).toBeLessThan(215);
  }
});

test("series night ceiling fixture is visibly off while every other mood keeps its original finish and geometry", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await enter(page);
  await page.waitForFunction(() => {
    const info = window.__bedroom.info();
    return Object.values(info.painted).every(Boolean) && window.__bedroom.robotState().loaded && info.vertices > 59000;
  }, null, { timeout: 60000 });
  let previous = -1, stable = 0;
  while (stable < 4) {
    const vertices = await page.evaluate(() => window.__bedroom.info().vertices);
    stable = vertices === previous ? stable + 1 : 0;
    previous = vertices;
    await page.waitForTimeout(250);
  }
  const initial = await page.evaluate(() => window.__bedroom.info());
  const expected = { focus: [1.05, .55, 4.8], weekend: [.3, .34, 4.5], golden: [0, .18, 3.4], night: [0, 0, 1.5], sunday: [0, .2, 2.5], series: [0, 0, 0] };
  for (const [mood, [intensity, glow, fill]] of Object.entries(expected)) {
    await page.evaluate((name) => window.__bedroom.setMood(name), mood);
    const { ceilingLamp, fillIntensity, vertices, meshes } = await page.evaluate(() => window.__bedroom.info());
    expect(ceilingLamp.emissiveIntensity, mood).toBeCloseTo(intensity, 5);
    expect(ceilingLamp.glowOpacity, `${mood} ceiling pool`).toBeCloseTo(glow, 5);
    expect(ceilingLamp.color, mood).toBe("#f4efe6");
    expect(fillIntensity, `${mood} room fill`).toBeCloseTo(fill, 5);
    expect(vertices, `${mood} vertex count`).toBe(initial.vertices);
    expect(meshes, `${mood} mesh count`).toBe(initial.meshes);
  }
  expect(errors).toEqual([]);
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

test("round-1 swaps: every button changes the room, and the basketball print hangs over the bed without ever doubling", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.info().posters.loaded);
  let info = await page.evaluate(() => window.__bedroom.info());
  expect(info.bedPoster).toBe("A1-v2");
  const bp = info.bedPosterBox;
  expect(bp.min[2]).toBeGreaterThan(-2.501); expect(bp.max[2]).toBeLessThan(-2.45); // flat on the window wall
  expect(bp.min[1]).toBeGreaterThan(1.05); // clear above the headboard (top at 1.01 m)
  expect(bp.max[1]).toBeLessThan(2.3);
  expect(bp.min[0]).toBeGreaterThan(.85); // clear of the window frame (x up to .85) ...
  expect(bp.max[0]).toBeLessThan(2.0); // ... and inside the east wall
  const choices = await page.evaluate(() => window.__bedroom.choices);
  for (const [kind, values] of Object.entries(choices)) {
    for (const v of [...values.slice(1), values[0]]) {
      await page.locator(`#swapGroups button[data-kind="${kind}"][data-choice="${v}"]`).click();
      await page.waitForFunction(([k, x]) => window.__bedroom.info().choices[k] === x, [kind, v]);
      await expect(page.locator(`#swapGroups button[data-kind="${kind}"][data-choice="${v}"]`)).toHaveAttribute("aria-pressed", "true");
    }
  }
  await page.locator('#swapGroups button[data-kind="posters"][data-choice="A"]').click();
  await page.waitForFunction(() => window.__bedroom.info().choices.posters === "A");
  expect((await page.evaluate(() => window.__bedroom.info())).bedPoster).toBe("C2-v1"); // the sport set is on the TV wall, so the bed wall changes
  await page.locator('#swapGroups button[data-kind="window"][data-choice="linen"]').click();
  expect((await page.evaluate(() => window.__bedroom.info())).curtains).toBe(true);
  await page.locator('#swapGroups button[data-kind="wall"][data-choice="slate"]').click();
  expect((await page.evaluate(() => window.__bedroom.info())).featureWall).toBe("#66717e");
});

for (const width of [1440, 390]) {
  test(`the house plaque hangs whole on the window wall and the overview shows all of it (${width})`, async ({ page }) => {
    await enter(page, { width });
    await page.waitForFunction(() => window.__bedroom.info().plaque.loaded);
    const { plaque, plaqueInView, desk } = await page.evaluate(() => window.__bedroom.info());
    expect(plaque.min[2]).toBeGreaterThan(-2.501); expect(plaque.max[2]).toBeLessThan(-2.45); // flat on the wall
    expect(plaque.min[0]).toBeGreaterThan(-2.0); expect(plaque.max[0]).toBeLessThan(-.86); // between the west wall and the window frame
    expect(plaque.min[1]).toBeGreaterThan(desk.monitor.max[1] + .2); // well above the monitor
    expect(plaqueInView).toBe(true);
  });
}

test("all 29 painted surfaces load (floor, wall, rugs, oak, fabrics, window frame and day/night foreground, ceiling glow, console skin, window dressings, screen, coffee machine, five book rows)", async ({ page }) => {
  const failed = [];
  page.on("requestfailed", (r) => failed.push(r.url()));
  page.on("response", (r) => { if (r.status() >= 400) failed.push(r.status() + " " + r.url()); });
  await enter(page);
  await page.waitForFunction(() => Object.keys(window.__bedroom.info().painted).length >= 29, null, { timeout: 60000 });
  const painted = await page.evaluate(() => window.__bedroom.info().painted);
  expect(Object.values(painted).every(Boolean)).toBe(true);
  expect(failed).toEqual([]);
  const { vertices } = await page.evaluate(() => window.__bedroom.info());
  expect(vertices).toBeLessThan(62000);
});

test("phone first screen: moods sit in a tidy two-column grid (six moods and the random button, which spans the last row), the swap options start collapsed and open on tap, the intro is short", async ({ page }) => {
  await enter(page, { width: 390 });
  const boxes = await page.locator("#moodRow button").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width)]; }));
  expect(boxes).toHaveLength(7);
  expect(boxes[0][1]).toBe(boxes[1][1]); expect(boxes[2][1]).toBe(boxes[3][1]); expect(boxes[4][1]).toBe(boxes[5][1]); expect(boxes[6][1]).toBeGreaterThan(boxes[4][1]); // three rows of two, then the random button on its own row
  expect(boxes[2][1]).toBeGreaterThan(boxes[0][1]);
  expect(boxes[0][0]).toBe(boxes[2][0]); expect(boxes[0][2]).toBe(boxes[1][2]); // aligned columns, equal widths
  expect(await page.locator("#swaps").evaluate((d) => d.open)).toBe(false);
  await expect(page.locator('#swapGroups button').first()).toBeHidden();
  await page.locator("#swapsTitle").click();
  await expect(page.locator('#swapGroups button').first()).toBeVisible();
  expect((await page.locator("#lead").innerText()).length).toBeLessThan(110);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true); // no sideways scroll
  await enter(page, { width: 1440 });
  expect(await page.locator("#swaps").evaluate((d) => d.open)).toBe(true); // open on wide screens
});

test("TV corner: a rug in front of the TV, a game console resting inside the open bay of the cabinet", async ({ page }) => {
  await enter(page);
  const info = await page.evaluate(() => window.__bedroom.tvCorner());
  expect(info.rug.min[1]).toBeGreaterThan(0); expect(info.rug.max[1]).toBeLessThan(.02); // lies on the floor
  expect(info.rug.min[0]).toBeGreaterThan(info.unit.max[0] - .05); // starts right in front of the cabinet
  expect(info.rug.min[2]).toBeGreaterThan(-.01); expect(info.rug.max[2]).toBeLessThan(2.45); // inside the room, away from the door wall
  const c = info.console;
  expect(c.max[0] - c.min[0]).toBeGreaterThan(.26); expect(c.max[0] - c.min[0]).toBeLessThan(.32); // about 30 cm deep along the cabinet
  expect(c.max[1] - c.min[1]).toBeLessThan(.07); // a slim slab (5.3 cm plus the top plate)
  expect(c.min[1]).toBeGreaterThan(info.shelfTop - .002); // sits on the bay floor, not through it
  expect(c.max[1]).toBeLessThan(info.topUnderside); // fits under the cabinet top with the pad on it
  expect(c.min[2]).toBeGreaterThan(info.unit.min[2]); expect(c.max[2]).toBeLessThan(info.unit.max[2]); // inside the cabinet footprint
});

test("rugs: each lies on the floor inside the room, none overlap, the runner clears the bed and the bedside table", async ({ page }) => {
  await enter(page);
  const r = await page.evaluate(() => window.__bedroom.rugs());
  const rugs = ["sleep", "lounge", "tv"];
  for (const n of rugs) {
    const b = r[n];
    expect(b.min[1], n).toBeGreaterThan(0); expect(b.max[1], n).toBeLessThan(.02);
    expect(b.min[0], n).toBeGreaterThan(-2.001); expect(b.max[0], n).toBeLessThan(2.001);
    expect(b.min[2], n).toBeGreaterThan(-2.501); expect(b.max[2], n).toBeLessThan(2.501);
  }
  for (let i = 0; i < rugs.length; i++) for (let j = i + 1; j < rugs.length; j++) {
    const a = r[rugs[i]], b = r[rugs[j]];
    const overlap = a.min[0] < b.max[0] && a.max[0] > b.min[0] && a.min[2] < b.max[2] && a.max[2] > b.min[2];
    expect(overlap, `${rugs[i]} vs ${rugs[j]}`).toBe(false);
  }
  expect(r.sleep.max[0]).toBeLessThan(r.bed.min[0] - .02); // beside the bed, not under it
  expect(r.sleep.min[2]).toBeGreaterThan(r.bedside.max[2]); // starts past the bedside table
});

test("phone: the room opens in the middle facing the window and plaque; the look buttons turn to the TV wall, the bed side and the desk", async ({ page }) => {
  await enter(page, { width: 390 });
  const inFrame = (v) => v.z < 1 && v.minX > -1.02 && v.maxX < 1.02 ? true : (v.z < 1 && v.x > -.9 && v.x < .9);
  expect(await page.evaluate(() => window.__bedroom.info().centred)).toBe(true);
  await expect(page.locator('#viewRow button[data-look="center"]')).toHaveAttribute("aria-pressed", "true");
  let v = await page.evaluate(() => window.__bedroom.inView(["window-glass", "house-plaque"]));
  for (const n of ["window-glass", "house-plaque"]) expect(inFrame(v[n]), "opening look: " + n).toBe(true);
  await page.locator('#viewRow button[data-look="tv"]').click();
  await page.waitForFunction(() => Math.abs(window.__bedroom.looks().yaw - .43) < .005, null, { timeout: 5000 });
  v = await page.evaluate(() => window.__bedroom.inView(["tv-panel", "bookshelf"]));
  expect(v["tv-panel"].x).toBeGreaterThan(-.7); expect(v["tv-panel"].x).toBeLessThan(.7); // the TV is near the middle of the frame
  await expect(page.locator('#viewRow button[data-look="tv"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('#viewRow button[data-look="bed"]').click();
  await page.waitForFunction(() => Math.abs(window.__bedroom.looks().yaw + .4) < .005, null, { timeout: 5000 });
  v = await page.evaluate(() => window.__bedroom.inView(["bed-mattress"]));
  expect(v["bed-mattress"].x).toBeGreaterThan(-.7); expect(v["bed-mattress"].x).toBeLessThan(.7);
  await page.locator('#viewRow button[data-look="work"]').click();
  await page.waitForFunction((w) => Math.abs(window.__bedroom.looks().yaw - w) < .005, .1, { timeout: 5000 }); // this test is the 390 phone: its desk look is [.1, .1, 1.4]; the desktop one is [.22, .12, 1.35]
  v = await page.evaluate(() => window.__bedroom.inView(["desk-top", "window-glass", "house-plaque"]));
  for (const n of ["desk-top", "window-glass", "house-plaque"]) expect(inFrame(v[n]), "desk look: " + n).toBe(true);
  expect(await page.evaluate(() => window.__bedroom.info().camera)).toEqual([1.8, 2.05, 2.38]); // the corner looks share one camera spot
});

test("window: the painted frame replaces the boxes, the foreground layer sits outside and stays under the city picture's reach", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.windowParts().sash && window.__bedroom.windowParts().foreground);
  const w = await page.evaluate(() => window.__bedroom.windowParts());
  expect(w.boxesHidden).toBe(true); // the plain frame boxes are gone once the painted frame shows
  expect(w.sashBox.max[2]).toBeLessThan(-2.4); // the frame is in the wall plane (north wall at z = -2.5)
  expect(w.fgBox.max[2]).toBeLessThan(-2.5); // the foreground is outside the wall
  expect(w.fgBox.min[2]).toBeGreaterThan(-3.7); // and in front of the city plane (z = -3.7)
  expect(w.fgBox.min[1]).toBeLessThan(.95); expect(w.fgBox.max[1]).toBeGreaterThan(2.2); // it covers the whole window height
});

test("ceiling lamp and its glow sit on the ceiling; the console and pad skins lie on top of their shapes; the night foreground matches the day one", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.batch4().ready, null, { timeout: 60000 });
  const b = await page.evaluate(() => window.__bedroom.batch4());
  expect(b.lamp.max[1]).toBeLessThanOrEqual(2.601); expect(b.lamp.min[1]).toBeGreaterThan(2.2); // the ring lamp hangs under the ceiling, inside the room
  expect(Math.abs((b.lamp.min[0] + b.lamp.max[0]) / 2 - (b.glow.min[0] + b.glow.max[0]) / 2)).toBeLessThan(.02); // the pool of light is centred on the lamp,
  expect(Math.abs((b.lamp.min[2] + b.lamp.max[2]) / 2 - (b.glow.min[2] + b.glow.max[2]) / 2)).toBeLessThan(.02); // in both directions
  expect(b.glow.min[1]).toBeGreaterThan(2.59); expect(b.glow.max[1]).toBeLessThan(2.61); // a flat sheet under the ceiling
  expect(b.skin.min[1]).toBeGreaterThan(b.consoleTop - .002); expect(b.skin.max[1]).toBeLessThan(b.consoleTop + .01); // on the console's top plate
  expect(b.skin.min[0]).toBeGreaterThan(b.console.min[0] - .01); expect(b.skin.max[0]).toBeLessThan(b.console.max[0] + .01); // not wider than the console
  expect(b.fgNightLoaded).toBe(true);
  expect(await page.evaluate(() => window.__bedroom.setTime("night"))).toBe(true);
  const n = await page.evaluate(() => window.__bedroom.batch4());
  expect(n.fgIsNight).toBe(true);
});

test("bed soft goods: the duvet drapes over the mattress without touching the frame, the pillow rests on the mattress and not under the duvet", async ({ page }) => {
  await enter(page);
  const b = await page.evaluate(() => window.__bedroom.bedSoft());
  expect(b.duvet.min[1]).toBeGreaterThan(b.frame.max[1] + .02); // hangs clear above the frame top
  expect(b.duvet.max[1]).toBeLessThan(b.mattress.max[1] + .12); // a duvet is a few cm thick, not a block
  expect(b.duvet.min[0]).toBeGreaterThan(b.mattress.min[0] - .09); expect(b.duvet.max[0]).toBeLessThan(b.mattress.max[0] + .09); // hangs at the mattress edge
  expect(b.pillow.min[1]).toBeGreaterThan(b.mattress.max[1] - .03); expect(b.pillow.max[1]).toBeLessThan(b.mattress.max[1] + .2);
  expect(b.pillow.max[2]).toBeLessThan(b.duvet.min[2] + .32); // the pillow is at the head end; Codex's duvet turns back 25 cm at the head, so its fold begins under the pillow's front edge (the pillow crown is above the fold)
  expect(b.cushion).toBeNull(); // the grey cushion on the pillow was taken out
  expect(b.throw.min[1]).toBeGreaterThan(b.frame.max[1] + .02); // the throw hangs over the mattress edge but stays clear above the frame
  expect(b.throw.max[1]).toBeLessThan(b.duvet.max[1] + .06); // it lies on the duvet, not a slab above it
  expect(b.throw.min[0]).toBeGreaterThan(b.mattress.min[0] - .12); expect(b.throw.max[0]).toBeLessThan(b.mattress.max[0] + .12); // hangs at the sides
  expect(b.throw.max[2] - b.throw.min[2]).toBeLessThan(.45); // a 36 cm strip, not a blanket
});

test("the TV is a glossy dark glass when off and plays a film or the console home on request", async ({ page }) => {
  await enter(page);
  expect(await page.evaluate(() => window.__bedroom.tvState())).toMatchObject({ mode: "off", reflection: true });
  await page.locator('#swapGroups button[data-kind="tv"][data-choice="film"]').click();
  await page.waitForFunction(() => window.__bedroom.tvState().mode === "film");
  await page.locator('#swapGroups button[data-kind="tv"][data-choice="game"]').click();
  await page.waitForFunction(() => window.__bedroom.tvState().mode === "game");
  await page.locator('#swapGroups button[data-kind="tv"][data-choice="auto"]').click();
  await page.locator('#moodRow button[data-mood="weekend"]').click();
  await page.waitForFunction(() => window.__bedroom.tvState().mode === "film"); // "follow the mood": a film on the weekend mood
});

test("stand in the middle: the camera walks to the room's centre and the head turns a full circle; the wardrobe stands clear of the door and the switch", async ({ page }) => {
  await enter(page);
  const { wardrobe, room, door } = await page.evaluate(() => window.__bedroom.info());
  expect(wardrobe.max[2]).toBeLessThan(room.d / 2 + .01); expect(wardrobe.min[2]).toBeGreaterThan(room.d / 2 - .7); // against the south wall, at most 70 cm deep
  expect(wardrobe.min[0]).toBeGreaterThan(door.x + door.w / 2 + .1); expect(wardrobe.max[0]).toBeLessThan(room.w / 2 - .1); // clear of the door and of the east wall
  expect(wardrobe.min[0]).toBeGreaterThan(-.45); // the light switch plate (x = -0.54) stays free
  await toCorner(page); // the room opens in the middle, so walk to the corner and back
  await page.locator('#viewRow button[data-look="center"]').click();
  await page.waitForFunction(() => window.__bedroom.info().centred && window.__bedroom.camera.position.y < 1.7, null, { timeout: 8000 });
  await page.waitForTimeout(300);
  const cam = await page.evaluate(() => window.__bedroom.camera.position.toArray());
  expect(cam[1]).toBeGreaterThan(1.4); expect(cam[1]).toBeLessThan(1.7); // eye height
  expect(Math.abs(cam[0])).toBeLessThan(.6); expect(Math.abs(cam[2])).toBeLessThan(.6); // in the middle, not in a corner
  const yaw0 = await page.evaluate(() => window.__bedroom.controls.look.yaw);
  await page.evaluate(() => { for (let i = 0; i < 8; i++) window.__bedroom.controls.turn(Math.PI / 4, 0); }); // one full circle
  const yaw1 = await page.evaluate(() => window.__bedroom.controls.look.yaw);
  expect(yaw1 - yaw0).toBeGreaterThan(Math.PI * 2 - .01); // no stop along the way
  await page.locator('#viewRow button[data-look="work"]').click(); // and back to the corner
  await page.waitForFunction(() => !window.__bedroom.info().centred && window.__bedroom.camera.position.y > 1.95, null, { timeout: 8000 });
});

test("the linen curtains never cover the house plaque", async ({ page }) => {
  await enter(page);
  await page.locator('#swapGroups button[data-kind="window"][data-choice="linen"]').click();
  await page.waitForFunction(() => window.__bedroom.info().curtains === true);
  const { curtainPanels, plaque, work, vertices } = await page.evaluate(() => window.__bedroom.info());
  expect(curtainPanels.length).toBe(2);
  expect(vertices).toBeLessThan(62000);
  for (const c of curtainPanels) {
    expect(c.min[0] > plaque.max[0] || c.max[0] < plaque.min[0], "curtain x-range clear of the plaque").toBe(true);
    expect(c.vertices).toBe(455); // same 35 × 13 grid per panel; no added vertices
    expect(c.min[1]).toBeGreaterThanOrEqual(.01); // gentle hem ripple stays above the floor
    expect(c.max[1]).toBeLessThan(2.4); // top edge stays below the ceiling and rod area
    expect(c.max[0] <= work.desk.min[0] || c.min[0] >= work.desk.max[0], "curtain panel clear of the desk in x").toBe(true);
  }
});

test("two prints hang on the wall behind the sofa, over its length and above its back; the bed's head has two channels, none reaching the window sill", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.info().wallArt, null, { timeout: 30000 });
  const { wallArt, lounge, room, window: win } = await page.evaluate(() => window.__bedroom.info());
  expect(wallArt.max[0]).toBeLessThan(room.w / 2); expect(wallArt.min[0]).toBeGreaterThan(room.w / 2 - .05); // flat on the east wall
  expect(wallArt.min[1]).toBeGreaterThan(lounge.sofa.max[1] + .2); expect(wallArt.max[1]).toBeLessThan(room.h - .3); // above the sofa back, under the ceiling
  expect(wallArt.min[2]).toBeGreaterThan(lounge.sofa.min[2] - .15); expect(wallArt.max[2]).toBeLessThan(lounge.sofa.max[2] + .25); // over the sofa, a little wider than its 1.6 m (the Brooklyn picture is 1.84 m, wider than the three posters)
  const { headboardTop } = await page.evaluate(() => window.__bedroom.info());
  expect(headboardTop).toBeLessThan(win.sill - .05); // the sill sticks out of the wall beside the bed: nothing of the headboard may reach it
});

test("the centred south-wall view keeps the door and its robot in frame", async ({ page }) => {
  for (const width of [1440, 390]) {
    await enter(page, { width });
    await page.waitForFunction(() => window.__bedroom.robotState().loaded, null, { timeout: 30000 });
    await page.evaluate(() => window.__bedroom.controls.turn(Math.PI, 0));
    const frame = await page.evaluate(() => ({ door: window.__bedroom.doorState().ndc, robot: window.__bedroom.robotState().ndc }));
    for (const item of [frame.door, frame.robot]) {
      expect(Math.abs(item.x), "centered horizontally").toBeLessThan(.6);
      expect(Math.abs(item.y), "centered vertically").toBeLessThan(.65);
      expect(item.z, "visible in front of the camera").toBeLessThan(1);
    }
    if (ARRIVAL_QA) {
      const fs = await import("node:fs/promises");
      await fs.mkdir(ARRIVAL_QA, { recursive: true });
      await page.locator("#stage").screenshot({ path: `${ARRIVAL_QA}/room02-south-door-${width}.png` });
    }
  }
});

test("tap the door-side robot: it hops, turns to look at you and settles back where it was", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.robotState().loaded, null, { timeout: 30000 });
  await page.evaluate(() => { window.__bedroom.controls.turn(Math.PI, 0); window.__bedroom.controls.turn(0, 0); }); // face the new robot at the south door
  const r0 = await page.evaluate(() => window.__bedroom.robotState());
  expect(Math.abs(r0.ndc.x)).toBeLessThan(.95); expect(r0.ndc.z).toBeLessThan(1); // in the opening view
  await page.locator("#robotHitTarget").click();
  await page.waitForFunction(() => window.__bedroom.robotState().hopping, null, { timeout: 3000 });
  await page.waitForFunction(() => !window.__bedroom.robotState().hopping, null, { timeout: 5000 });
  const r1 = await page.evaluate(() => window.__bedroom.robotState());
  expect(r1.y).toBeCloseTo(r0.y, 5); expect(r1.yaw).toBeCloseTo(r0.yaw, 5); // back home
});

test("Room 02 return door, robot hint, and cancellable countdown", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.robotState().loaded, null, { timeout: 30000 });
  await expect(page.locator("#portalRow")).toBeVisible();
  const rb = await page.evaluate(() => ({ state: window.__bedroom.robotState(), path: window.__bedroom.info().portalPath }));
  expect(rb.state.position[0]).toBeLessThan(0); expect(rb.state.position[2]).toBeGreaterThan(1.2);
  expect(rb.path.hits).toEqual([]); expect(rb.path.matGap).toBeGreaterThan(0); expect(rb.path.clear).toBe(true);
  await page.evaluate(() => { window.__bedroom.controls.turn(Math.PI, 0); window.__bedroom.controls.turn(0, 0); });
  await expect(page.locator("#robotBubble")).toContainText("門後面是客廳");
  await expect(page.locator("#robotBubble")).toBeVisible();
});

test("tapping the Room 02 robot starts a cancellable 1.2 second return", async ({ page }) => {
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.robotState().loaded, null, { timeout: 30000 });
  await page.evaluate(() => { window.__bedroom.controls.turn(Math.PI, 0); window.__bedroom.controls.turn(0, 0); });
  const state = await page.evaluate(() => ({ robot: window.__bedroom.robotState(), hit: (() => {const e=document.querySelector("#robotHitTarget"),r=e.getBoundingClientRect();return {hidden:e.hidden,left:e.style.left,top:e.style.top,rect:[r.x,r.y,r.width,r.height],display:getComputedStyle(e).display};})() }));
  expect(state.hit.hidden).toBe(false);
  await page.locator("#robotHitTarget").click();
  await expect(page.locator("#robotBubble")).toContainText("跟我來，我帶你回客廳");
  await page.waitForFunction(() => window.__bedroom.robotState().pending, null, { timeout: 3000 });
  await page.keyboard.press("Escape");
  await expect(page.locator("#robotBubble")).toBeHidden();
  await expect(page).toHaveURL(/bedroom\/?\?lang=zh$/);
  await expect(page.locator(".portal-fade")).toHaveCount(0);
});

test("a 390px visitor can tap the door-side robot and cancel by tapping blank room space", async ({ page }) => {
  await enter(page, { width: 390 });
  await page.waitForFunction(() => window.__bedroom.robotState().loaded, null, { timeout: 30000 });
  await page.evaluate(() => { window.__bedroom.controls.turn(Math.PI, 0); window.__bedroom.controls.turn(0, 0); });
  await expect(page.locator("#robotHitTarget")).toBeVisible();
  await page.locator("#robotHitTarget").click();
  await page.waitForFunction(() => window.__bedroom.robotState().pending, null, { timeout: 3000 });
  const stage=await page.locator("#stage canvas").boundingBox();
  await page.mouse.click(stage.x+12,stage.y+12);
  await expect(page.locator("#robotBubble")).toBeHidden();
  await expect(page).toHaveURL(/bedroom\/?\?lang=zh$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);
});

test("the door animation can be cancelled before its fade and restores the closed state", async ({ page }) => {
  await enter(page);
  await page.locator("#portalBtn").click();
  await page.waitForFunction(() => window.__bedroom.doorState().open, null, { timeout: 5000 });
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => window.__bedroom.doorState())).toMatchObject({ open: false, active: false, fading: false });
  await expect(page.locator(".portal-fade")).toHaveCount(0);
  await expect(page).toHaveURL(/bedroom\/?\?lang=zh$/);
});

test("390px reduced-motion visitors can tap the door itself to return", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page, { width: 390 });
  await page.evaluate(() => { window.__bedroom.controls.turn(Math.PI, 0); window.__bedroom.controls.turn(0, 0); });
  const door = await page.evaluate(() => window.__bedroom.doorState().ndc);
  const box = await page.locator("#stage canvas").boundingBox();
  await page.mouse.click(box.x+(door.x+1)*box.width/2,box.y+(1-door.y)*box.height/2);
  await page.waitForURL(/from=room02/, { timeout: 10000 });
});

test("reduced motion sends the door button directly to Room 01", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page);
  await page.locator("#portalBtn").click();
  await page.waitForURL(/from=room02/, { timeout: 10000 });
});

test("arriving through Room 01's door lands in golden hour", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh&from=room01`);
  await page.waitForFunction(() => window.__bedroom && window.__bedroom.info().mood === "golden", null, { timeout: 60000 });
  await expect(page.locator('#moodRow button[data-mood="golden"]')).toHaveAttribute("aria-pressed", "true");
});

test("the Room 02 door button returns to Room 01 and Room 01 opens normally from the return URL", async ({ page }) => {
  const errors=[]; page.on("pageerror",e=>errors.push(String(e))); page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  await enter(page);
  await page.locator("#portalBtn").click();
  await page.waitForURL(/from=room02/, { timeout: 12000 });
  await page.waitForFunction(() => window.__room, null, { timeout: 90000 });
  expect(errors).toEqual([]);
  await expect(page.locator("#poster")).toBeHidden();
  await expect(page.locator("#status")).toBeHidden();
});

test("the return portal label follows the selected language", async ({ page }) => {
  await enter(page);
  await expect(page.locator("#portalBtn")).toHaveText("推開那扇門 → Room 01");
  await page.locator("#lang").click();
  await expect(page.locator("#portalBtn")).toHaveText("Push the door → Room 01");
});

test("the page switches between Chinese and English", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await expect(page.locator(".mark")).toContainText("ROOMVERSE 3D");
  await expect(page).toHaveTitle(/ROOMVERSE 3D｜空間幻境/);
  await expect(page.locator("#roomNo")).toHaveText("Room 02 · Brooklyn Studio");
  await expect(page.locator("#title")).toHaveText("Room 02｜Brooklyn Studio");
  await page.locator("#lang").click();
  await expect(page.locator("#roomNo")).toHaveText("Room 02 · Brooklyn Studio");
  await expect(page.locator("#title")).toHaveText("Room 02 · Brooklyn Studio");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Room 02 door portal review frames (set ROOMVERSE_DOOR_QA=1)", async ({ page }) => {
  test.skip(process.env.ROOMVERSE_DOOR_QA !== "1", "only when collecting door portal review frames");
  const fs = await import("node:fs/promises");
  const out = "docs/qa/room02-door-back"; await fs.mkdir(out, { recursive: true });
  for (const width of [1440, 390]) for (const mood of ["focus", "night"]) {
    await enter(page, { width });
    if (mood === "night") { await page.evaluate(() => window.__bedroom.setMood("night")); await page.waitForTimeout(250); }
    await page.waitForFunction(() => window.__bedroom.robotState().loaded, null, { timeout: 30000 });
    await page.evaluate(() => { window.__bedroom.controls.turn(Math.PI, 0); window.__bedroom.controls.turn(0, 0); });
    // Slow only the captured transition so PNG encoding cannot skip the requested review states.
    await page.evaluate(() => {
      const rawNow = performance.now.bind(performance);
      const originalFrame = window.requestAnimationFrame.bind(window);
      const origin = rawNow();
      const scaled = (time) => origin + (time - origin) * .07;
      Object.defineProperty(performance, "now", { configurable: true, value: () => scaled(rawNow()) });
      window.requestAnimationFrame = (callback) => originalFrame((time) => callback(scaled(time)));
    });
    await page.locator("#portalBtn").click();
    const suffix = `${mood}-${width}`;
    await page.waitForFunction(() => Math.abs(window.__bedroom.doorState().angle) > .25, null, { timeout: 30000 });
    await page.locator("#stage").screenshot({ path: `${out}/opening-${suffix}.png` });
    await page.waitForFunction(() => Math.abs(window.__bedroom.doorState().angle) > 1.1, null, { timeout: 30000 });
    await page.locator("#stage").screenshot({ path: `${out}/glow-${suffix}.png` });
    await page.waitForFunction(() => window.__bedroom.doorState().elapsed > 2150, null, { timeout: 30000 });
    await page.locator("#stage").screenshot({ path: `${out}/pre-fade-${suffix}.png` });
    await page.evaluate(() => window.__bedroom.closePortal(true));
    await page.goto(`${PAGE}?lang=zh`);
  }
});

test("QA screenshots (set ROOMVERSE_QA=1)", async ({ page }) => {
  test.skip(!QA, "only when collecting QA images");
  for (const width of [1440, 390]) {
    await enter(page, { width });
    await page.waitForTimeout(600);
    await page.locator("#stage").screenshot({ path: `${QA}/focus-${width}.png` });
    await page.waitForTimeout(400); await page.screenshot({ path: `${QA}/page-${width}.png`, fullPage: true });
    for (const look of ["tv", "bed", "work"]) {
      await page.locator(`#viewRow button[data-look="${look}"]`).click(); await page.waitForTimeout(900);
      await page.locator("#stage").screenshot({ path: `${QA}/look-${look}-${width}.png` });
    }
    for (const mood of ["weekend", "night", "sunday"]) {
      await page.locator(`#moodRow button[data-mood="${mood}"]`).click();
      await page.waitForFunction((m) => window.__bedroom.info().mood === m && window.__bedroom.windowArt().loaded, mood);
      await page.waitForTimeout(300);
      await page.locator("#stage").screenshot({ path: `${QA}/${mood}-${width}.png` });
    }
    await page.locator("#moods").screenshot({ path: `${QA}/mood-buttons-${width}.png` });
    await page.locator('#moodRow button[data-mood="focus"]').click();
    await page.evaluate(() => { document.getElementById("swaps").open = true; });
    for (const [kind, v] of [["posters", "A"], ["wall", "terracotta"], ["rug", "oak"], ["window", "linen"], ["bedding", "clay"], ["led", "cyan"], ["desktop", "coffee"], ["screen", "grid"], ["sofa", "terracotta"], ["shelf", "airy"]]) await page.locator(`#swapGroups button[data-kind="${kind}"][data-choice="${v}"]`).click();
    await page.waitForFunction(() => window.__bedroom.info().choices.posters === "A");
    await page.waitForTimeout(300);
    await page.locator("#stage").screenshot({ path: `${QA}/swapped-${width}.png` });
    await page.evaluate(() => window.__bedroom.controls.turn(-.45, .05)); // look right, at the bed wall
    await page.locator("#stage").screenshot({ path: `${QA}/bed-wall-${width}.png` });
    await page.evaluate(() => { document.getElementById("swaps").open = true; });
    await page.locator("#swaps").screenshot({ path: `${QA}/swap-buttons-${width}.png` });
  }
});

test.describe("hi-dpi screens", () => {
  test.use({ deviceScaleFactor: 2.5 });
  for (const width of [1440, 390]) {
    test(`the canvas fits its box and renders at the screen's sharpness, not cropped and half-sharp (${width})`, async ({ page }) => {
      await enter(page, { width });
      const m = await page.evaluate(() => { const c = document.querySelector("#stage canvas"), r = c.getBoundingClientRect(), s = document.getElementById("stage").getBoundingClientRect(); return { cssW: r.width, cssH: r.height, stageW: s.width, stageH: s.height, bufW: c.width }; });
      expect(Math.abs(m.cssW - m.stageW)).toBeLessThan(1.5); expect(Math.abs(m.cssH - m.stageH)).toBeLessThan(1.5); // the same size as its box
      expect(m.bufW).toBeGreaterThan(m.cssW * 1.4); // and more buffer pixels than CSS pixels
    });
  }
});

test("Room 02 opens in golden hour when entered from the home cover; a direct visit keeps the focus day", async ({ page }) => {
  for (const [query, expected] of [["from=home", "golden"], ["", "focus"]]) {
    await page.goto(`${PAGE}?lang=zh${query ? `&${query}` : ""}`); await page.locator("#enter").click(); await page.waitForFunction(() => window.__bedroom);
    await expect(page.locator(`#moodRow button[data-mood="${expected}"]`), query || "direct visit").toHaveAttribute("aria-pressed", "true");
  }
});

test("the bed-wall triptych loads San Francisco, New York, and Brooklyn prints without changing scene geometry", async ({ page }) => {
  const cityResponses = new Map();
  page.on("response", (response) => {
    const match = response.url().match(/room02-city-(san-francisco|new-york|brooklyn)-v1\.webp/);
    if (match) cityResponses.set(match[1], response.status());
  });
  await enter(page);
  await page.waitForFunction(() => window.__bedroom.robotState().loaded, null, { timeout: 30000 });
  await expect.poll(() => cityResponses.size).toBe(3);
  const room = await page.evaluate(() => window.__bedroom.info());
  expect([...cityResponses.entries()].sort()).toEqual([["brooklyn", 200], ["new-york", 200], ["san-francisco", 200]]);
  expect(room).toMatchObject({ vertices: 59816, meshes: 311, mood: "focus" });
});
