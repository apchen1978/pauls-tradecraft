import { test, expect } from "@playwright/test";

// The Room 02 and Room 03 robots say one short line when the visitor switches mood (Room 01 already does). Nothing is said on first load,
// and the line is a remark, not a travel prompt, so the "choose a room" button stays hidden for it.
const ROOMS = [
  { name: "Room 03", path: "/prototype/roomverse-3d/kitchen/", bubble: "#robotBubble", moodButton: '[data-mood="golden"]', line: /夕陽|流理台/, links: ".robot-links" },
  { name: "Room 02", path: "/prototype/roomverse-3d/bedroom/", bubble: "#robotBubble", moodButton: '[data-mood="night"]', line: /夜深|小聲/, links: "[data-travel-door-action]", enter: true },
];

for (const room of ROOMS) {
  test(`${room.name}: the robot says a mood line after a mood click, not on load`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${room.path}?lang=zh`);
    if (room.enter) await page.locator("#enter").click(); // Room 02 starts behind an enter button
    await page.waitForFunction(() => Boolean(window.__room03 || window.__bedroom), null, { timeout: 90000 });
    await page.waitForTimeout(2500);
    await expect(page.locator(room.bubble)).toBeHidden();
    await page.locator(room.moodButton).click();
    await expect(page.locator(room.bubble)).toBeVisible();
    await expect(page.locator(room.bubble)).toContainText(room.line);
    await expect(page.locator(`${room.bubble} ${room.links}`)).toBeHidden();
  });
}
