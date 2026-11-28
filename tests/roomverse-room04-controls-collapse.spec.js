import { test, expect } from "@playwright/test";

// Paul 2026-11-18: in full screen the view and time chips fold down to a slim strip with the handle still showing, and come back, on desktop and phone.
for (const width of [1440, 390]) {
  test(`Room 04 full-screen controls fold away and come back at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(180000);
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/prototype/roomverse-3d/cafe/?lang=zh&hint=0");
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room04, null, { timeout: 120000 });
    const toggle = page.locator("#controlsToggle"), controls = page.locator("#immersiveControls");
    await expect(toggle, "no handle outside full screen").toBeHidden();
    await page.locator("#immersiveEnter").click();
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true"); // opens expanded
    await expect(toggle).toHaveText("▾ 收合");
    await expect(page.locator("#views")).toBeVisible(); await expect(page.locator("#moods")).toBeVisible();
    const open = await controls.boundingBox();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveText("▴ 展開");
    await expect(page.locator("#views")).toBeHidden(); await expect(page.locator("#moods")).toBeHidden();
    const slim = await controls.boundingBox(), handle = await toggle.boundingBox();
    expect(slim.height, "a slim strip").toBeLessThan(16);
    expect(open.height - slim.height, "the view is freed").toBeGreaterThan(60);
    expect(handle.y + handle.height, "the handle sits on the strip, on screen").toBeLessThanOrEqual(slim.y + 2);
    expect(handle.y).toBeGreaterThan(0);
    expect(await page.evaluate(() => sessionStorage.getItem("room04.controls.collapsed"))).toBe("1");
    await page.screenshot({ path: testInfo.outputPath(`collapsed-${width}.png`) });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#views")).toBeVisible();
    const back = await toggle.boundingBox(), bar = await controls.boundingBox();
    expect(Math.abs(back.y + back.height - bar.y), "the handle rides the top edge of the open bar").toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
  });
}
