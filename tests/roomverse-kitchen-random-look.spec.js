import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().wallArtLoaded && window.__room03.info().yardLoaded);
  await expect(page.locator("#randomLook")).toBeEnabled();
}

for (const width of [1440, 390]) {
  test(`random room packs change finishes without changing geometry, mood or draw calls at ${width}px`, async ({ page }) => {
    await loadRoom(page, width);
    const base = await page.evaluate(() => ({ info: window.__room03.info(), finish: window.__room03.surfaceFinishInfo() }));
    expect(base.finish).toEqual({ wall: "mist", floor: "terrazzo", rug: "jute" });
    expect(base.info.materialColors.wall).toBe("#d0deea");

    await page.locator("#randomLook").click();
    await expect(page.locator("#randomLookStatus")).not.toHaveText(/預設搭配/);
    const firstFinish = await page.evaluate(() => window.__room03.surfaceFinishInfo());
    expect(firstFinish).not.toEqual(base.finish);
    const after = await page.evaluate(() => window.__room03.info());
    expect(after.vertices).toBe(base.info.vertices);
    expect(after.meshes).toBe(base.info.meshes);
    expect(after.drawCallsLastFrame).toBeLessThanOrEqual(base.info.drawCallsLastFrame);

    await page.locator('#moods button[data-mood="movie"]').click();
    await expect.poll(() => page.evaluate(() => window.__room03.info().mood)).toBe("movie");
    expect(await page.evaluate(() => window.__room03.surfaceFinishInfo())).toEqual(firstFinish);

    if (width === 390) {
      await page.locator("#immersiveEnter").click();
      const shuffle = page.locator(".room #randomLook");
      await expect(shuffle).toBeVisible();
      expect((await shuffle.boundingBox()).height).toBeGreaterThanOrEqual(44);
      await shuffle.click();
      const nextFinish = await page.evaluate(() => window.__room03.surfaceFinishInfo());
      expect(nextFinish).not.toEqual(firstFinish);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "no horizontal page overflow").toBeLessThanOrEqual(0);
  });
}

test("manual wall, floor and rug options stay synchronized with the selected state", async ({ page }) => {
  await loadRoom(page, 390);
  await page.locator("#swaps summary").click();
  await page.locator('#swapGroups button[data-frame="wallColor"][data-art="sage"]').click();
  await page.locator('#swapGroups button[data-frame="floor"][data-art="cork"]').click();
  await page.locator('#swapGroups button[data-frame="rug"][data-art="stripe"]').click();
  expect(await page.evaluate(() => window.__room03.surfaceFinishInfo())).toEqual({ wall: "sage", floor: "cork", rug: "stripe" });
  await expect(page.locator("#randomLookStatus")).toContainText("自訂組合");
  await expect(page.locator('#swapGroups button[data-frame="floor"][aria-pressed="true"]')).toHaveAttribute("data-art", "cork");
  await expect(page.locator('#swapGroups button[data-frame="wallColor"][aria-pressed="true"]')).toHaveAttribute("data-art", "sage");
  await expect(page.locator('#swapGroups button[data-frame="rug"][aria-pressed="true"]')).toHaveAttribute("data-art", "stripe");
});

test("entry nook wall follows the selected room palette with three alternatives and no scene-cost change", async ({ page }) => {
  await loadRoom(page, 1440);
  const base = await page.evaluate(() => ({ info: window.__room03.info(), finish: window.__room03.surfaceFinishInfo(), nook: window.__room03.entryHallWallColor() }));
  expect(base.finish.wall).toBe("mist");
  expect(base.nook).toBe("#e9bdb9"); // Preserve the existing pink nook under the default mist-blue room palette.

  const variants = { cream: "#e6ddcc", sage: "#cbd2c0", oat: "#d9cbb6" };
  for (const [wall, expectedColor] of Object.entries(variants)) {
    await page.evaluate((wall) => window.__room03.setSurfaceFinish({ wall }), wall);
    const state = await page.evaluate(() => ({ info: window.__room03.info(), finish: window.__room03.surfaceFinishInfo(), nook: window.__room03.entryHallWallColor() }));
    expect(state.finish.wall).toBe(wall);
    expect(state.nook).toBe(expectedColor);
    expect(state.info.vertices).toBe(base.info.vertices);
    expect(state.info.meshes).toBe(base.info.meshes);
    expect(state.info.drawCallsLastFrame).toBe(base.info.drawCallsLastFrame);
  }

  await page.evaluate(() => window.__room03.setSurfaceFinish({ wall: "mist" }));
  expect(await page.evaluate(() => window.__room03.entryHallWallColor())).toBe(base.nook);
});
