import { test, expect } from "@playwright/test";
import { START } from "../public/ai-lab/start.js";

// The "start here" section opens the AI Lab (Paul 2026-11-28): a picture-first way in for people who think AI is hard, before the chapters.

test("start: zh and en carry the same shape", () => {
  const z = START.zh, e = START.en;
  for (const key of ["chat", "steps", "ease", "note"]) expect(e[key].length, key).toBe(z[key].length);
  expect(z.steps.length).toBe(3);
  for (const s of [...z.steps, ...e.steps]) { expect(s.h.length).toBeGreaterThan(4); expect(s.say.length).toBeGreaterThan(4); }
  expect(z.chat.map((m) => m.who)).toEqual(e.chat.map((m) => m.who));
});

for (const [lang, width] of [["zh", 1440], ["en", 1440], ["zh", 390]]) {
  test(`start (${lang} ${width}): the section comes before the spirit chapter, shows three steps and does not scroll sideways`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
    const page = await context.newPage();
    await page.goto(`/ai-lab/?lang=${lang}`);
    const x = START[lang];
    await expect(page.locator("#start-title")).toHaveText(x.title);
    await expect(page.locator("#start-steps li")).toHaveCount(3);
    await expect(page.locator("#start-chat .start-bubble")).toHaveCount(x.chat.length);
    await expect(page.locator("#start-ease li")).toHaveCount(x.ease.length);
    await expect(page.locator("#start-note li")).toHaveCount(x.note.length);
    const order = await page.evaluate(() => { const a = document.getElementById("start"), b = document.getElementById("spirit"); return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); });
    expect(order, "start comes before spirit").toBe(true);
    await expect(page.locator("#start-next")).toHaveAttribute("href", "#spirit");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}
