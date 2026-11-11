import { test, expect } from "@playwright/test";

// Paul 2026-11-11: Room 03 gets a phone too. In the movie mood it lies face up on the dining table and its screen lights a notification now and
// then; tapping it (finger-sized radius) reads the message. Every other mood hides it, so it costs nothing there.
const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, { lang = "zh", width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0 && window.__room03.info().furniture.table === "glb", null, { timeout: 90000 });
}
const phone = (page) => page.evaluate(() => window.__room03.tablePhoneInfo());

test("movie mood puts the phone on the table and pulses a notification; other moods hide it", async ({ page }) => {
  await loadRoom(page);
  expect(await phone(page), "daylight: no phone").toMatchObject({ visible: false, glowVisible: false, screenEmissive: 0, glowOpacity: 0 });
  await page.evaluate(() => window.__room03.setMood("movie"));
  expect((await phone(page)).visible, "movie: on the table").toBe(true);
  await expect.poll(async () => (await phone(page)).glowOpacity, { timeout: 12000, intervals: [100] }).toBeGreaterThan(0.4);
  expect((await phone(page)).screenEmissive, "the screen rises with the glow").toBeGreaterThan(0.5);
  await expect.poll(async () => (await phone(page)).glowOpacity, { timeout: 8000, intervals: [100] }).toBe(0);
  for (const mood of ["night", "dinner", "daylight"]) {
    await page.evaluate((m) => window.__room03.setMood(m), mood);
    expect(await phone(page), `${mood}: gone and dark`).toMatchObject({ visible: false, glowVisible: false, screenEmissive: 0, glowOpacity: 0 });
  }
});

test("tapping near the phone reads the message in the reader's language; a far tap does not", async ({ page }) => {
  for (const [lang, snippet] of [["zh", "晚餐幫你留了一份在爐上"], ["en", "kept a plate warm"]]) {
    await loadRoom(page, { lang });
    await page.evaluate(() => window.__room03.setMood("movie"));
    await page.waitForTimeout(1200);
    const box = await page.locator("canvas").first().boundingBox();
    const at = (await phone(page)).screen;
    await page.mouse.click(at[0] + 110, at[1]);
    await page.waitForTimeout(300);
    expect((await phone(page)).caption, "110 px away is a miss").not.toContain(snippet);
    await page.mouse.click(at[0] + 22, at[1] + 12);
    await expect.poll(async () => (await phone(page)).caption).toContain(snippet);
    expect(box.width).toBeGreaterThan(300);
  }
});

test("at 390 px the phone is on screen in movie mood and reads on tap", async ({ page }) => {
  await loadRoom(page, { width: 390 });
  await page.evaluate(() => window.__room03.setMood("movie"));
  await page.waitForTimeout(1200);
  const at = (await phone(page)).screen, box = await page.locator("canvas").first().boundingBox();
  expect(at[0] > box.x && at[0] < box.x + box.width && at[1] > box.y && at[1] < box.y + box.height, `phone at ${at} inside ${JSON.stringify(box)}`).toBe(true);
  await page.mouse.click(at[0] + 15, at[1] + 8);
  await expect.poll(async () => (await phone(page)).caption).toContain("晚餐");
});
