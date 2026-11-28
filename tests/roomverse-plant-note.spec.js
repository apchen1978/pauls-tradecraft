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

test.describe("phone touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("rotating to the planter and tapping its note opens the note dialogue", async ({ page }) => {
    await page.goto(`${PAGE}?lang=zh`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room?.plantNoteInfo && window.__room?.plantNoteHint, null, { timeout: 60000 });
    await page.waitForTimeout(2500);
    const canvas = page.locator("canvas").first();
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 90, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect.poll(() => page.evaluate(() => window.__room.plantNoteHint().inFrame), { timeout: 5000 }).toBe(true);
    const note = await page.evaluate(() => window.__room.plantNoteInfo());
    await page.locator("#robotBubble").evaluate((bubble) => { bubble.hidden = false; });
    await page.touchscreen.tap(note.screen[0] + 36, note.screen[1] + 18); // a small real-world finger offset is still within the note's touch target
    await expect.poll(() => page.evaluate(() => window.__room.plantNoteInfo().caption), { timeout: 3000 }).toContain("便條 1/3");
    expect(await page.evaluate(() => window.__room.plantNoteInfo().caption)).toContain("出門前，記得澆花");
  });
});

// Paul 2026-11-20: the small Post-it by the window did not open its dialogue when tapped. A finger wobbles: a touch tap that drifts up to about 12 px is still a tap, and a finger's target is wider (60 px) than a mouse's (44 px).
test("Room 01 plant note: a finger tap that wobbles 10 px, 55 px off the note's centre, still opens the dialogue", async ({ browser }) => {
  test.setTimeout(150000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage(); const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/prototype/roomverse-3d/?lang=zh&hint=0");
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room?.plantNoteInfo, null, { timeout: 100000 }); await page.waitForTimeout(2500);
  await page.evaluate(() => window.__room.doorView()); await page.waitForTimeout(1800); // the doorway view shows the note on a phone
  const info = await page.evaluate(() => window.__room.plantNoteInfo()); const [x, y] = info.screen;
  expect(x > 20 && x < 370 && y > 20 && y < 820, "the note is on screen in the doorway view").toBe(true);
  await page.evaluate(([x, y]) => { const c = document.querySelector("#stage canvas"); const ev = (type, cx, cy) => c.dispatchEvent(new PointerEvent(type, { pointerType: "touch", isPrimary: true, clientX: cx, clientY: cy, bubbles: true })); ev("pointerdown", x + 45, y); ev("pointerup", x + 55, y); }, [x, y]);
  await page.waitForTimeout(600);
  expect((await page.evaluate(() => window.__room.plantNoteInfo())).visible, "the dialogue is shown").toBe(true);
  expect(errors.filter((m) => !m.includes("setPointerCapture")), "no page errors (the orbit controls complain about a synthetic pointer id, which a real finger never does)").toEqual([]);
  await context.close();
});
