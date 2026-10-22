import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/bedroom/";
const QA = process.env.ROOMVERSE_QA === "1" ? "docs/qa/roomverse-bedroom-bed" : null;

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
  expect(info.vertices).toBeLessThan(16000); // whole-room budget (stage 1 uses a small part of it)
  expect(info.lights).toBe(3);
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
  expect(vertices).toBeLessThan(16000);
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
    await page.locator("#stage").screenshot({ path: `${QA}/bed-${width}.png` });
  }
});
