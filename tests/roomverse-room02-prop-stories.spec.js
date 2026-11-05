import { test, expect } from "@playwright/test";

// Tapping the bedside pocket, the vinyl corner or the bookshelf shows one short line (Room 03's entry nook does the same). Zero geometry.
const PAGE = "/prototype/roomverse-3d/bedroom/";
const LOOKS = { "bedside-pocket": ["bed"], "vinyl-corner": ["center", "work", "tv", "bed"], bookshelf: ["tv", "center", "bed", "work"] };

test("tapping a small prop in Room 02 reads a line about it", async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom, null, { timeout: 90000 });
  await page.waitForTimeout(2500);
  const stage = page.locator("#stage canvas");
  let tapped = 0;
  for (const [key, looks] of Object.entries(LOOKS)) {
    let done = false;
    for (const look of looks) {
      await page.evaluate((name) => window.__bedroom.lookTo(name), look);
      await page.waitForTimeout(1200);
      const t = await page.evaluate((k) => window.__bedroom.storyTargets()[k], key);
      if (!(Math.abs(t.x) < 0.85 && Math.abs(t.y) < 0.85 && t.z < 1)) continue;
      const box = await stage.boundingBox();
      await page.mouse.click(box.x + (t.x + 1) / 2 * box.width, box.y + (1 - t.y) / 2 * box.height);
      await page.waitForTimeout(400);
      const story = await page.evaluate(() => window.__bedroom.propStory());
      if (story.visible && story.key === key) { expect(story.text.length).toBeGreaterThan(6); done = true; break; }
    }
    if (done) tapped++;
    expect(done, `a tap on ${key} shows its story`).toBe(true);
  }
  expect(tapped).toBe(3);
  await expect(page.locator("#propStory")).toHaveAttribute("aria-live", "polite");
});
