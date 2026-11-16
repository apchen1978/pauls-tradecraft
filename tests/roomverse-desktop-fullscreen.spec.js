import { expect, test } from "@playwright/test";

// Paul, 2026-11-17: the desktop versions of the rooms need the "full screen" button too (Rooms 01 to 03 showed it only on phones and short landscape screens; Room 04 already had it).
// At 1440 x 900 every room shows the button, a real click on it covers the whole window, the exit button works, and nothing else covers the button (Room 03's door tap target once did).
const ROOMS = [
  ["Room 01", "/prototype/roomverse-3d/?lang=zh", true],
  ["Room 02", "/prototype/roomverse-3d/bedroom/?lang=zh", true],
  ["Room 03", "/prototype/roomverse-3d/kitchen/?lang=zh", false],
  ["Room 04", "/prototype/roomverse-3d/cafe/?lang=zh&hint=0", true],
];

for (const [name, path, hasEnter] of ROOMS) {
  test(`${name} desktop: the full-screen button fills the window and the exit button brings the page back`, async ({ page }) => {
    test.setTimeout(150000);
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    if (hasEnter) await page.locator("#enter").click();
    const enter = page.locator("#immersiveEnter");
    await expect(enter, "the button shows on a desktop screen").toBeVisible({ timeout: 90000 });
    await page.waitForTimeout(2500);
    await enter.click(); // a real click: nothing may cover the button
    const room = page.locator(".room");
    await expect(room).toHaveClass(/is-immersive/);
    const box = await room.boundingBox();
    expect(Math.round(box.width), "the room fills the window").toBe(1440);
    expect(Math.round(box.height)).toBe(900);
    const exit = page.locator("#immersiveExit");
    await expect(exit).toBeVisible();
    await exit.click();
    await expect(room).not.toHaveClass(/is-immersive/);
    await expect(enter).toBeVisible();
    expect(errors).toEqual([]);
  });
}
