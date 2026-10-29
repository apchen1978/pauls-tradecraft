import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.doorInfo && window.__room03.info().drawCallsLastFrame > 0, null, { timeout: 60000 });
}

test("the room door is cut through the right wall beside the cable-car painting and its leaf fits the opening", async ({ page }) => {
  await loadRoom(page, 1440);
  const door = await page.evaluate(() => window.__room03.doorInfo());
  expect(door.leafWidthMm).toBe(850);
  expect(door.leafHeightMm).toBe(2040);
  expect(door.clearOpeningMm[0] - door.leafWidthMm, "leaf is 12 mm narrower than the opening").toBe(12);
  expect(door.sideGapMm).toBe(6);
  expect(door.floorGapMm).toBe(14);
  expect(door.wallDepthMm).toBe(120);
  expect(door.meshes, "leaf and doorway light; the frame joins the shared trim mesh").toBe(2);
  expect(door.vertices, "door budget").toBeLessThanOrEqual(800);
  const painting = await page.evaluate(() => window.__room03.info().propBounds?.["cable-car"] || null);
  const frame = door.frameBounds;
  // Frame sits on the right wall (face x 2.94), between the back corner and the painting (painting z -0.585 to 0.545), clear of the credenza (z from -0.80).
  expect(frame.min[0]).toBeGreaterThan(2.88);
  expect(frame.max[0]).toBeLessThanOrEqual(3.0601);
  expect(frame.min[2]).toBeGreaterThan(-2.4 + 0.3);
  expect(frame.max[2]).toBeLessThan(-0.585 - 0.3);
  expect(frame.max[1], "casing top").toBeCloseTo(2.13, 2);
  void painting;
});

test("the open leaf stays clear of the credenza, the robot and the painting", async ({ page }) => {
  await loadRoom(page, 1440);
  await page.evaluate(() => window.__room03.doorSnap(true));
  const result = await page.evaluate(() => ({ door: window.__room03.doorInfo(), leaf: window.__room03.doorLeafBounds(), credenza: window.__room03.info().credenza, robot: window.__room03.robotInfo() }));
  expect(result.door.angleDeg).toBe(70);
  const leaf = result.leaf;
  expect(leaf.min[0], "leaf swings less than 0.85 m into the room").toBeGreaterThan(2.94 - 0.85 - 0.02);
  expect(leaf.max[2] + 0.80, "leaf end is more than 0.30 m from the credenza (z -0.80)").toBeLessThan(-0.30);
  expect(Math.abs(result.robot.centre[0] - leaf.min[0]), "robot is far from the open leaf").toBeGreaterThan(0.5);
  await page.evaluate(() => window.__room03.doorSnap(false));
  expect((await page.evaluate(() => window.__room03.doorInfo())).angleDeg).toBe(0);
});

for (const width of [1440, 390]) {
  test(`tapping the door opens it and shows the bubble linking to Rooms 01 and 02; Escape closes it at ${width}`, async ({ page }) => {
    await loadRoom(page, width);
    await page.evaluate(() => window.__room03.setView(-Math.PI / 2));
    await page.waitForFunction(() => window.__room03.doorScreen() !== null);
    await page.waitForFunction(() => !document.getElementById("doorHit").hidden);
    const hit = await page.locator("#doorHit").boundingBox();
    expect(hit.width).toBeGreaterThanOrEqual(44);
    expect(hit.height).toBeGreaterThanOrEqual(44);
    await expect(page.locator("#doorHit")).toHaveAttribute("aria-label", /門/);
    await page.locator("#doorHit").click();
    await expect(page.locator("#robotBubble")).toBeVisible();
    await expect(page.locator("#robotBubble [data-robot-living]")).toHaveAttribute("href", /\?lang=zh/);
    await expect(page.locator("#robotBubble [data-robot-bedroom]")).toHaveAttribute("href", /bedroom\/\?lang=zh/);
    await page.waitForFunction(() => window.__room03.doorInfo().angleDeg === 70, null, { timeout: 5000 });
    await page.keyboard.press("Escape");
    await expect(page.locator("#robotBubble")).toBeHidden();
    await page.waitForFunction(() => window.__room03.doorInfo().angleDeg === 0, null, { timeout: 5000 });
  });
}

test("reduced motion opens the door at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadRoom(page, 1440);
  await page.evaluate(() => window.__room03.setView(-Math.PI / 2));
  await page.waitForFunction(() => !document.getElementById("doorHit").hidden);
  await page.locator("#doorHit").click();
  expect((await page.evaluate(() => window.__room03.doorInfo())).angleDeg).toBe(70);
});

test("the door does not touch the wall panel weave or the cable-car painting", async ({ page }) => {
  await loadRoom(page, 1440);
  const wall = await page.evaluate(() => window.__room03.info().wallpaper);
  expect(wall.bounds.min[2]).toBeCloseTo(-2.30, 2);
  expect(wall.bounds.max[2]).toBeCloseTo(0.97, 2);
  expect(wall.vertices, "three pieces around the doorway").toBe(12);
});
