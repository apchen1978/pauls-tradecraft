import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

for (const width of [1440, 390]) {
  test(`the Room 03 robot stands on the floor in the opening view and its bubble links to Rooms 01 and 02 at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`${PAGE}?lang=zh`);
    await page.waitForFunction(() => window.__room03?.robotInfo?.().ready, null, { timeout: 60000 });
    const robot = await page.evaluate(() => window.__room03.robotInfo());
    expect(robot.heightMm, "same 46 cm robot as Rooms 01 and 02").toBeGreaterThanOrEqual(440);
    expect(robot.heightMm).toBeLessThanOrEqual(480);
    expect(Math.abs(robot.floorGapMm), "feet on the floor").toBeLessThanOrEqual(1);
    expect(robot.belt, "its own colour: a lemon-yellow belt (Room 01 sage, Room 02's door robot terracotta)").toBe("#e3b23c");
    if (width === 390) await page.evaluate(() => window.__room03.setView(0.5));
    const hit = page.locator("#robotHit");
    await expect(hit, "a tap target over the robot").toBeVisible();
    expect(await hit.getAttribute("aria-label")).toContain("機器人");
    const box = await hit.boundingBox();
    expect(Math.min(box.width, box.height), "touch target at least 44 px").toBeGreaterThanOrEqual(44);
    await hit.click();
    const bubble = page.locator("#robotBubble");
    await expect(bubble).toBeVisible();
    const links = await bubble.locator("a").evaluateAll((anchors) => anchors.map((a) => new URL(a.href).pathname));
    expect(links).toEqual(["/prototype/roomverse-3d/", "/prototype/roomverse-3d/bedroom/"]);
  });
}
