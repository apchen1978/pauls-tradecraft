import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/bedroom/";
const QA = process.env.ROOMVERSE_QA === "1" ? "docs/qa/roomverse-bedroom-shell" : null;

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

test("the page switches between Chinese and English", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await expect(page.locator("#title")).toHaveText("一個人住的套房，白天是這個樣子");
  await page.locator("#lang").click();
  await expect(page.locator("#title")).toHaveText("A studio for one, by day");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("QA screenshots (set ROOMVERSE_QA=1)", async ({ page }) => {
  test.skip(!QA, "only when collecting QA images");
  for (const width of [1440, 390]) {
    await enter(page, { width });
    await page.waitForTimeout(600);
    await page.locator("#stage").screenshot({ path: `${QA}/shell-${width}.png` });
  }
});
