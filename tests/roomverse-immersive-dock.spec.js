import { test, expect } from "@playwright/test";

// Desktop full screen (Paul, 2026-11-17): the controls were a full-width strip with a dark gradient that hid the bottom of the room in Rooms 01-03.
// On a desktop window they are now a compact centred plate with a button that folds them away; phones keep the old strip.
const ROOMS = [
  { id: "room01", url: "/prototype/roomverse-3d/", hook: "__room" },
  { id: "room02", url: "/prototype/roomverse-3d/bedroom/", hook: "__bedroom" },
  { id: "room03", url: "/prototype/roomverse-3d/kitchen/", hook: "__room03" },
];

async function enterFullScreen(page, room, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(`${room.url}?lang=en`);
  const enter = page.locator("#enter");
  if (await enter.isVisible().catch(() => false)) await enter.click();
  await page.waitForFunction((hook) => !!window[hook], room.hook, { timeout: 120000 });
  await page.locator("#immersiveEnter").click({ force: true });
  await expect(page.locator(".room")).toHaveClass(/is-immersive/);
}

for (const room of ROOMS) {
  test(`${room.id} desktop full screen: a compact controls plate that can be folded away and brought back`, async ({ page }) => {
    test.setTimeout(150000);
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    await enterFullScreen(page, room, 1440, 900);
    const controls = page.locator("#immersiveControls");
    const toggle = page.locator(".dock-toggle");
    await expect(toggle, "the fold button is there on a desktop window").toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const open = await controls.boundingBox();
    expect(open.width, "the plate is only as wide as its buttons, not the whole window").toBeLessThan(1440 * 0.85);
    expect(open.height, "a plate of at most two rows of buttons").toBeLessThan(135);
    expect(open.x, "centred").toBeGreaterThan(100);
    expect(Math.abs(open.x + open.width / 2 - 720), "centred").toBeLessThan(6);
    // Fold it away: the whole bottom of the room is free, and the button stays to bring it back.
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(controls, "the plate is folded away").toBeHidden();
    await expect(toggle, "the button stays").toBeVisible();
    const folded = await toggle.boundingBox();
    expect(folded.y + folded.height, "the button sits in the corner").toBeGreaterThan(900 - 24);
    // The choice is remembered in this browser, then bring it back.
    expect(await page.evaluate(() => localStorage.getItem("roomverse.dock.collapsed"))).toBe("1");
    await toggle.click();
    await expect(controls).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("roomverse.dock.collapsed"))).toBe("0");
    expect(errors).toEqual([]);
  });

  test(`${room.id} phone full screen keeps its own strip: no fold button, full-width controls`, async ({ page }) => {
    test.setTimeout(150000);
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    await enterFullScreen(page, room, 390, 844);
    await expect(page.locator(".dock-toggle"), "no fold button on a phone-sized window").toBeHidden();
    const strip = await page.locator("#immersiveControls").boundingBox();
    expect(strip.width, "the phone strip is still the full width").toBeGreaterThanOrEqual(388);
    expect(errors).toEqual([]);
  });
}
