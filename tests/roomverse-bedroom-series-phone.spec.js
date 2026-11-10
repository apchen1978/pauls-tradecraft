import { test, expect } from "@playwright/test";

// Paul 2026-11-11: in series night the bedside phone is turned face up and its screen lights a notification now and then; tapping it reads the message.
// Every other mood keeps it face down and costs nothing (the screen and glow planes are hidden).
const PAGE = "/prototype/roomverse-3d/bedroom/";

async function enter(page, { lang = "zh", width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom);
  await page.waitForTimeout(1500);
}

const phoneState = (page) => page.evaluate(() => window.__bedroom.info().bedsidePhone);

test("series night turns the bedside phone face up and pulses a notification; other moods keep it face down", async ({ page }) => {
  await enter(page);
  expect(await phoneState(page), "focus: face down, dark").toMatchObject({ faceUp: false, screenEmissive: 0, glowOpacity: 0 });
  await page.evaluate(async () => { await window.__bedroom.setMood("series"); });
  expect((await phoneState(page)).faceUp, "series: face up").toBe(true);
  // A pulse is about 3.4 s long, every ~16 s, first one about 3 s after the mood is set: wait for the screen to light.
  await expect.poll(async () => (await phoneState(page)).glowOpacity, { timeout: 12000, intervals: [100] }).toBeGreaterThan(0.5);
  expect((await phoneState(page)).screenEmissive, "the screen rises with the glow (glow 0.5 means the screen is past 0.6)").toBeGreaterThan(0.6);
  await expect.poll(async () => (await phoneState(page)).glowOpacity, { timeout: 8000, intervals: [100] }).toBe(0);
  for (const mood of ["night", "weekend"]) {
    await page.evaluate(async (m) => { await window.__bedroom.setMood(m); }, mood);
    expect(await phoneState(page), `${mood}: back to face down and dark`).toMatchObject({ faceUp: false, screenEmissive: 0, glowOpacity: 0 });
  }
});

test("tapping the phone reads the message in series night and a quiet line in other moods, in the reader's language", async ({ page }) => {
  await enter(page);
  const tapPhone = async () => {
    const target = await page.evaluate(() => window.__bedroom.storyTargets()["bedside-phone"]);
    const box = await page.locator("canvas").first().boundingBox();
    await page.mouse.click(box.x + ((target.x + 1) / 2) * box.width, box.y + ((1 - target.y) / 2) * box.height);
  };
  await page.evaluate(async () => { await window.__bedroom.lookTo("bed"); });
  await page.waitForTimeout(2200);
  await tapPhone();
  await expect.poll(() => page.evaluate(() => window.__bedroom.propStory().text), { timeout: 3000 }).toContain("面朝下");
  await page.evaluate(async () => { await window.__bedroom.setMood("series"); });
  await tapPhone();
  await expect.poll(() => page.evaluate(() => window.__bedroom.propStory().text), { timeout: 3000 }).toContain("到家了嗎");
  await page.locator("#lang").click();
  await expect.poll(() => page.evaluate(() => window.__bedroom.propStory().text), { timeout: 3000 }).toContain("Home yet");
});

test("with reduced motion the series-night phone stays lit instead of pulsing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page);
  await page.evaluate(async () => { await window.__bedroom.setMood("series"); });
  await page.waitForTimeout(500);
  expect(await phoneState(page)).toMatchObject({ faceUp: true });
  const first = await phoneState(page);
  await page.waitForTimeout(3500);
  const later = await phoneState(page);
  expect(first.screenEmissive).toBeGreaterThan(0.8);
  expect(later).toMatchObject({ screenEmissive: first.screenEmissive, glowOpacity: first.glowOpacity });
});
