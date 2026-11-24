import { expect, test } from "@playwright/test";

const roomverse = "/prototype/roomverse-3d/";

test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

for (const [print, mood] of [["amber-fig", "golden"], ["alishan-cloud-sea", "rain"]]) {
  test(`Room 01 opens ${print} from a shared room link`, async ({ page }) => {
    const file = `wall-print-${print}-v1.webp`;
    const image = page.waitForResponse((response) => response.url().endsWith(`/${file}`));
    await page.goto(`${roomverse}?lang=en&mood=${mood}&print=${print}`);
    await page.locator("#enter").click();
    expect((await image).ok()).toBe(true);
    await expect.poll(() => page.evaluate(() => window.__room?.framedPictures().sofa)).toBe(file);
  });
}

test("Room 02 loads the blue-hour portrait when the night mood is selected", async ({ page }) => {
  await page.goto(`${roomverse}bedroom/?lang=en`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom);
  expect(await page.evaluate(() => window.__bedroom.info().painted["room02-blue-hour-frame-v1.webp"])).toBeUndefined();
  await page.locator('#moodRow button[data-mood="night"]').click();
  const shown = () => page.evaluate(() => window.__bedroom.info().brooklynPrint);
  await expect.poll(shown).toBe("room02-blue-hour-frame-v1.webp");
  await page.locator('#moodRow button[data-mood="focus"]').click();
  await expect.poll(shown).toMatch(/^room02-city-brooklyn(?:-mobile)?-v1\.webp$/);
});

test("Room 03 paints the new still life into the existing lamp-wall atlas", async ({ page }) => {
  await page.goto(`${roomverse}kitchen/?lang=en`);
  await page.waitForFunction(() => window.__room03?.info().wallArtLoaded);
  const read = () => page.evaluate(() => window.__room03.info().wallArtMean["lamp-wall"]);
  const before = await read();
  const image = page.waitForResponse((response) => response.url().endsWith("/room03-lamp-wall-blue-plate-lemons-v1.webp"));
  await page.evaluate(() => window.__room03.setArtwork("lamp-wall", "blue-plate-lemons"));
  expect((await image).ok()).toBe(true);
  await expect.poll(read).not.toEqual(before);
});

test("Room 04 loads the rainy lane as a third gallery set", async ({ page }) => {
  await page.goto(`${roomverse}cafe/?lang=en&gallery=c`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room04?.info().art.includes("room04-print-rain-lane-v1.webp"));
  expect(await page.evaluate(() => window.__room04.info().look.gallery)).toBe("c");
  expect(await page.evaluate(() => window.__room04.lookGroups().gallery)).toEqual(["a", "b", "c"]);
});
