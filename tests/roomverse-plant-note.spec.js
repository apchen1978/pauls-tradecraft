import { test, expect } from "@playwright/test";

// Paul 2026-11-11: note 1/3 of the three-room note set (set A). A yellow sticky note on the front of the living room's plant pot; a tap within a finger's width of it
// (34 px on screen) reads the line, in the reader's language.
const PAGE = "/prototype/roomverse-3d/";

test("the plant note reads its line on a tap near it, and follows the language", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room && window.__room.plantNoteInfo, null, { timeout: 60000 });
  await page.waitForTimeout(3000);
  const read = () => page.evaluate(() => window.__room.plantNoteInfo());
  const first = await read();
  expect(first.ndcZ, "the note is in front of the camera").toBeLessThan(1);
  expect(first.visible, "nothing is showing before a tap").toBe(false);
  await page.mouse.click(first.screen[0] + 20, first.screen[1] + 12); // off centre, like a finger
  await expect.poll(async () => (await read()).caption, { timeout: 3000 }).toContain("便條 1/3");
  expect((await read()).caption).toContain("出門前，記得澆花");
  await page.waitForTimeout(300);
  await page.locator("#lang").click();
  await page.waitForTimeout(500);
  await page.mouse.click(first.screen[0], first.screen[1]);
  await expect.poll(async () => (await read()).caption, { timeout: 3000 }).toContain("Note 1/3");
});
