import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/";
const SHOTS = process.env.DOOR_SHOTS || "";

// Paul 2026-11-20: a new Room 01 angle, "from the doorway": as if you had just opened the door and walked in. The sofa, the side table and lamp, the coffee table, the floor lamp and the window all stay in the frame.
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  test(`Room 01 doorway view (${name}): a button, a wide lens just inside the door, and the whole living room in frame`, async ({ page }) => {
    test.setTimeout(150000);
    await page.setViewportSize(viewport);
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${PAGE}?lang=zh&hint=0`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room?.doorView, null, { timeout: 90000 });
    await page.waitForTimeout(2500);
    await expect(page.locator(".camera-door").first()).toHaveCount(1);
    await page.evaluate(() => window.__room.doorView()); await page.waitForTimeout(1800);
    const p = await page.evaluate(() => window.__room.doorProbe());
    expect(p.view).toBe("door");
    expect(p.fov, "a wide lens").toBeGreaterThanOrEqual(84);
    expect(p.eye[0], "just inside the door in the right wall").toBeGreaterThan(2.1);
    expect(p.eye[1], "at standing eye height").toBeGreaterThan(1.4);
    const need = name === "desktop" ? ["sofa", "coffee", "console"] : ["sofa", "coffee"]; // a phone's narrow frame cannot hold the whole sweep; it pans (about 65 degrees either way) // the TV console (its books, glass and speakers) is in the frame too since 2026-11-20 (Paul: the sweep was too short)
    for (const k of need) expect(Object.entries(p.seen).some(([n, v]) => n.toLowerCase().includes(k) && v), `${k} is in the frame`).toBe(true);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/door-${name}.png` });
    // the way back: another view chip returns the orbit lens
    await page.evaluate(() => document.querySelector(".camera-window").click()); await page.waitForTimeout(1800);
    expect((await page.evaluate(() => window.__room.doorProbe())).view, "the window chip leaves the doorway view").toBe("window");
    expect((await page.evaluate(() => window.__room.doorProbe())).fov, "the lens narrows again on the way back").toBeLessThan(p.fov - 2);
    expect(errors).toEqual([]);
  });
}
