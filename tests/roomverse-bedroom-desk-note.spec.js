import { test, expect } from "@playwright/test";

// Paul 2026-11-11: note 2/3 of the three-room note set (set A, everyday). A yellow sticky note on the monitor's upper-left bezel; tapping it reads the line.
const PAGE = "/prototype/roomverse-3d/bedroom/";

test("the desk note sits on the monitor bezel and reads its line, in the reader's language", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom);
  await page.waitForTimeout(2500);
  // like Room 03's close-up corner, the desk look says where to tap, and a finger-wide miss still counts
  await page.evaluate(async () => { await window.__bedroom.lookTo("work"); });
  await expect.poll(() => page.evaluate(() => window.__bedroom.propStory().text), { timeout: 5000 }).toContain("小便條");
  const tapNote = async () => {
    const target = await page.evaluate(() => window.__bedroom.storyTargets()["desk-note"]);
    expect(target, "the note is a tap target").toBeTruthy();
    const box = await page.locator("canvas").first().boundingBox();
    await page.mouse.click(box.x + ((target.x + 1) / 2) * box.width + 18, box.y + ((1 - target.y) / 2) * box.height + 10); // 18 px right, 10 px down: a finger, not a pixel
  };
  await tapNote();
  await expect.poll(() => page.evaluate(() => window.__bedroom.propStory().text), { timeout: 3000 }).toContain("便條 2/3");
  await expect.poll(() => page.evaluate(() => window.__bedroom.propStory().text)).toContain("今晚早點睡");
  await page.locator("#lang").click();
  await tapNote();
  await expect.poll(() => page.evaluate(() => window.__bedroom.propStory().text), { timeout: 3000 }).toContain("Note 2/3");
});
