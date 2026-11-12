import { test, expect } from "@playwright/test";
import { LEDGER } from "./helpers/room04-ledger.js";

const PAGE = "/prototype/roomverse-3d/cafe/";

async function open(page, width, lang = "zh") {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => window.__room04, null, { timeout: 120000 });
  return errors;
}

test("the Room 04 ledger is internally consistent", () => {
  const last = LEDGER.history[LEDGER.history.length - 1];
  expect(last.vertices, "the newest history line is the current scene").toBe(LEDGER.scene.vertices);
  expect(last.meshes).toBe(LEDGER.scene.meshes);
  expect(last.desktopCalls).toBe(LEDGER.openingDrawCalls.desktop);
  expect(last.phoneCalls).toBe(LEDGER.openingDrawCalls.phone);
  expect(LEDGER.scene.vertices).toBeLessThanOrEqual(LEDGER.caps.vertices);
  expect(LEDGER.scene.meshes).toBeLessThanOrEqual(LEDGER.caps.meshes);
});

for (const [width, key] of [[1440, "desktop"], [390, "phone"]]) {
  test(`Room 04 blockout opens at ${width}px inside its budget, with real sizes`, async ({ page }) => {
    const errors = await open(page, width);
    const info = await page.evaluate(() => window.__room04.info());
    expect(errors).toEqual([]);
    expect(info.title).toBe("Room 04｜Shanghai, Slowly");
    expect(info.mood).toBe("morning");
    expect(info.vertices).toBe(LEDGER.scene.vertices);
    expect(info.meshes).toBe(LEDGER.scene.meshes);
    expect(info.drawCalls, `opening draw calls at ${width}px`).toBeLessThanOrEqual(LEDGER.caps[`${key}Calls`]);
    // A standing cafe counter, a 3:2 street window, and a robot whose upper half clears the counter.
    expect(info.counter.heightMm).toBe(1050);
    expect(info.window.widthMm / info.window.heightMm).toBeCloseTo(1.5, 5);
    expect(info.robot.aboveCounterMm).toBeGreaterThanOrEqual(350);
    await expect(page.locator("#stage canvas")).toHaveAttribute("aria-label", "Room 04 咖啡廳的 3D 粗模");
    await expect(page.locator("#status")).toBeHidden();
  });
}

test("Room 04 switches language and keeps the choice in the address", async ({ page }) => {
  await open(page, 1440);
  await expect(page.locator("#subtitle")).toHaveText("慢慢的上海");
  await page.locator("#lang").click();
  await expect(page.locator("#subtitle")).toHaveText("A cafe in Shanghai");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(new URL(page.url()).searchParams.get("lang")).toBe("en");
  await expect(page.locator("#otherRooms")).toHaveAttribute("href", "/prototype/roomverse-3d/?lang=en");
});
