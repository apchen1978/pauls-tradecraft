import { test, expect } from "@playwright/test";

// Paul 2026-11-18: with a mouse, the mist-blue "Shanghai Slowly Cafe" cup by the record player glows on hover and a click takes the visitor to Room 04; a drag does not; phones are unchanged.
const PAGE = "/prototype/roomverse-3d/kitchen/?lang=zh";
async function openRoom(page) {
  const errors = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(PAGE);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.robotInfo().ready, null, { timeout: 120000 });
  await page.locator("#recordView").click();
  await expect.poll(async () => (await page.evaluate(() => window.__room03.recordViewInfo()))?.distance ?? 99, { timeout: 8000 }).toBeLessThan(1.4);
  await page.waitForTimeout(1500);
  return errors;
}
const cupPoint = (page) => page.evaluate(() => { const r = window.__room03, c = r.cupPortal().centre, v = new r.camera.position.constructor(...c).project(r.camera), rect = document.querySelector("canvas").getBoundingClientRect(); return { x: rect.left + (v.x + 1) * rect.width / 2, y: rect.top + (1 - v.y) * rect.height / 2 }; });

test("Room 03 desktop: the Slowly Cafe cup glows on hover, a drag stays, a click goes to Room 04", async ({ page }) => {
  test.setTimeout(200000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await openRoom(page);
  expect((await page.evaluate(() => window.__room03.cupPortal())).fine).toBe(true);
  const cup = await cupPoint(page);
  await page.mouse.move(cup.x - 200, cup.y); await page.mouse.move(cup.x, cup.y, { steps: 4 });
  await expect.poll(async () => (await page.evaluate(() => window.__room03.cupPortal())).hovering).toBe(true);
  await expect(page.locator("#cupPortalTip")).toBeVisible(); await expect(page.locator("#cupPortalTip")).toHaveText("去 Shanghai Slowly Cafe →");
  expect(await page.evaluate(() => document.querySelector("canvas").style.cursor)).toBe("pointer");
  await page.mouse.move(cup.x - 250, cup.y - 150, { steps: 3 });
  await expect(page.locator("#cupPortalTip")).toBeHidden();
  // a drag that starts on the cup turns the camera and stays in Room 03
  await page.mouse.move(cup.x, cup.y); await page.mouse.down(); await page.mouse.move(cup.x + 60, cup.y + 10, { steps: 5 }); await page.mouse.move(cup.x, cup.y, { steps: 5 }); await page.mouse.up();
  await page.waitForTimeout(800);
  expect(page.url()).toContain("/kitchen/");
  expect(errors).toEqual([]);
  // a click goes to the cafe
  const fresh = await cupPoint(page);
  await Promise.all([page.waitForURL(/\/roomverse-3d\/cafe\/\?lang=zh/, { timeout: 15000 }), page.mouse.click(fresh.x, fresh.y)]);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test("Room 03 phone: tapping the cup does nothing new", async ({ page }) => {
    test.setTimeout(200000);
    await openRoom(page);
    expect((await page.evaluate(() => window.__room03.cupPortal())).fine).toBe(false);
    const cup = await cupPoint(page);
    await page.touchscreen.tap(cup.x, cup.y);
    await page.waitForTimeout(1500);
    expect(page.url()).toContain("/kitchen/");
    await expect(page.locator("#cupPortalTip")).toBeHidden();
  });
});
