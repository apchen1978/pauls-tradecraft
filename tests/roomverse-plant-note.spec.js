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

// Paul 2026-11-11: a few pixels is easy to miss, so once a turn of the view settles with the note in frame, one line says "Tap: the little note on the plant pot."
// It is not shown while the note is off screen (the default phone view), and only once per visit.
test("a turn that brings the note into frame shows one hint, once; no hint while it is off screen", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room && window.__room.plantNoteHint, null, { timeout: 60000 });
  await page.waitForTimeout(3000);
  const hint = () => page.evaluate(() => window.__room.plantNoteHint());
  expect((await hint()).shown, "no hint before the visitor turns the view").toBe(false);
  const box = await page.locator("canvas").first().boundingBox();
  const drag = async (dx) => { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2, { steps: 6 }); await page.mouse.up(); };
  await drag(-60); // toward the plant: the view turns and the note comes further into frame
  await expect.poll(async () => (await hint()).shown, { timeout: 4000 }).toBe(true);
  expect((await hint()).caption).toContain("花盆上的小便條");
  await page.waitForTimeout(5200);
  expect((await hint()).visible, "the line fades away").toBe(false);
  await drag(40); await page.waitForTimeout(1500);
  expect((await hint()).visible, "never shown a second time").toBe(false);
});

test("at 390 px the default view has the plant off screen, so no hint is shown", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room && window.__room.plantNoteHint, null, { timeout: 60000 });
  await page.waitForTimeout(3000);
  const s = await page.evaluate(() => window.__room.plantNoteHint());
  expect(s.inFrame, "the plant is off screen in the default phone view").toBe(false);
  expect(s.shown).toBe(false);
});
