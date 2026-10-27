import { test, expect } from "@playwright/test";

test("Room 03 opens inside the room with unrestricted rotation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/prototype/roomverse-3d/kitchen/?lang=zh");
  await page.waitForFunction(() => window.__room03?.info().yardLoaded);
  const state = await page.evaluate(() => {
    const { camera, controls } = window.__room03;
    return { position: camera.position.toArray(), target: controls.target.toArray(), min: controls.minAzimuthAngle, max: controls.maxAzimuthAngle, pan: controls.enablePan };
  });
  expect(Math.abs(state.position[0])).toBeLessThan(3);
  expect(Math.abs(state.position[2])).toBeLessThan(2.4);
  expect(state.target).toEqual([0, 1.48, 0]);
  expect(state.min).toBe(-Infinity);
  expect(state.max).toBe(Infinity);
  expect(state.pan).toBe(false);
});

for (const fullscreen of [false, true]) {
  test(`dragging can complete a full turn${fullscreen ? " in fullscreen" : ""}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/prototype/roomverse-3d/kitchen/?lang=zh");
    await page.waitForFunction(() => window.__room03?.info().yardLoaded);
    if (fullscreen) {
      await page.locator("#immersiveEnter").click();
      await expect(page.locator("#immersiveExit")).toBeVisible();
    }
    const canvas = page.locator("#stage canvas");
    const rect = await canvas.boundingBox();
    const initial = await page.evaluate(() => window.__room03.camera.position.toArray());
    const seen = [];
    for (let i = 0; i < 4; i++) {
      const x = rect.x + 10, y = rect.y + rect.height * 0.5;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + rect.height / 4, y, { steps: 8 });
      await page.mouse.up();
      seen.push(await page.evaluate(() => window.__room03.camera.position.toArray()));
    }
    const separation = (a, b) => Math.hypot(...a.map((n, i) => n - b[i]));
    expect(separation(initial, seen[1])).toBeGreaterThan(2);
    expect(separation(initial, seen[3])).toBeLessThan(0.1);
    if (fullscreen) {
      await page.keyboard.press("Escape");
      await expect(page.locator("html")).not.toHaveClass(/room-immersive/);
    }
  });
}
