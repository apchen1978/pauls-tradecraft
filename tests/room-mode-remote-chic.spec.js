import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const PAGE = "/prototype/room-mode-remote/";
const rooms = [
  { key: "chic", file: "room-chic-v1", zh: "美式植紋與小夥伴", en: "Botanical walls, little companions" },
  { key: "chicRose", file: "room-chic-rose-v1", zh: "玫瑰晨光", en: "Rose morning" },
  { key: "chicDesk", file: "room-chic-desk-v1", zh: "筆電小角落", en: "A little laptop corner" },
  { key: "chicCity", file: "room-chic-city-v1", zh: "窗外是城市", en: "The city outside" },
  { key: "chicSun", file: "room-chic-sun-v1", zh: "暖陽慢生活", en: "A slower sunny day" },
];

async function selectRoom(page, width, lang, room) {
  if (width <= 800) {
    await page.locator("#mobile-scene-select").selectOption(room.key);
  } else {
    await page.getByRole("button", { name: lang === "zh" ? "粉領新貴風" : "Chic city professional", exact: true }).click();
    await page.locator("#choice-list .choice-option").filter({ hasText: room[lang] }).click();
  }
}

// Compare actual canvas pixels with the selected artwork, away from the two decor overlays.
async function matchesArtwork(page, filename, postcardData = null) {
  return page.evaluate(async ({ filename, postcardData }) => {
    const source = new Image();
    source.src = `./assets/${filename}`;
    await source.decode();
    const actual = postcardData ? document.createElement("canvas") : document.getElementById("room-canvas");
    if (postcardData) {
      const postcard = new Image();
      postcard.src = `data:image/png;base64,${postcardData}`;
      await postcard.decode();
      actual.width = postcard.width;
      actual.height = postcard.height;
      actual.getContext("2d").drawImage(postcard, 0, 0);
    }
    const width = postcardData ? 1120 : actual.width;
    const height = postcardData ? 1400 : actual.height;
    const offset = postcardData ? 40 : 0;
    const expected = document.createElement("canvas");
    expected.width = width;
    expected.height = height;
    expected.getContext("2d").drawImage(source, 0, 0, width, height);
    return [[0.1, 0.1], [0.5, 0.5], [0.35, 0.8]].every(([x, y]) => {
      const px = Math.round(width * x), py = Math.round(height * y);
      const a = [...actual.getContext("2d").getImageData(px + offset, py + offset, 1, 1).data];
      const b = [...expected.getContext("2d").getImageData(px, py, 1, 1).data];
      // GPU/CPU image scaling can round an 8-bit channel a couple of levels apart.
      return a.every((value, channel) => Math.abs(value - b[channel]) <= 3);
    });
  }, { filename, postcardData });
}

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} at ${width}px: all five chic rooms display their own artwork`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const errors = [], assets = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => { if (response.ok()) assets.push(new URL(response.url()).pathname); });
      await page.goto(`${PAGE}?lang=${lang}`);
      await expect(page.locator("#mobile-scene-select option[value='chicSun']")).toHaveCount(1);
      expect(assets.some((path) => /room-chic-(?:v1|rose|desk|city|sun)/.test(path))).toBe(false);
      let previousFilename;
      for (const room of rooms) {
        await selectRoom(page, width, lang, room);
        await expect(page.locator("#choice-list .choice-option[aria-pressed='true']")).toContainText(room[lang]);
        const filename = `${room.file}${width <= 800 ? "-mobile" : ""}.webp`;
        await expect.poll(() => assets.some((path) => path.endsWith(filename))).toBe(true);
        await expect.poll(() => matchesArtwork(page, filename)).toBe(true);
        if (previousFilename) expect(await matchesArtwork(page, previousFilename)).toBe(false);
        previousFilename = filename;
        await expect(page.locator("#room-canvas")).toHaveAttribute("aria-label", await page.locator("#scene-caption").textContent());
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        await page.screenshot({ path: testInfo.outputPath(`${room.key}-${lang}-${width}.png`), fullPage: true });
      }
      expect(assets.some((path) => path.endsWith("room-chic-plaque-v1.webp"))).toBe(true);
      expect(assets.some((path) => path.endsWith("room-chic-robot-v1.webp"))).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("all five chic selections survive language switching", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=zh`);
  for (const room of rooms) {
    await selectRoom(page, 390, "zh", room);
    await page.locator("#language-toggle").click();
    await expect(page).toHaveURL(/lang=en/);
    await expect(page.locator("#mobile-scene-select")).toHaveValue(room.key);
    await expect(page.locator("#choice-list .choice-option[aria-pressed='true']")).toContainText(room.en);
    await page.locator("#language-toggle").click();
    await expect(page.locator("#mobile-scene-select")).toHaveValue(room.key);
    await expect(page.locator("#choice-list .choice-option[aria-pressed='true']")).toContainText(room.zh);
  }
});

for (const room of rooms) {
  test(`${room.key} postcard contains the selected illustration`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${PAGE}?lang=zh`);
    await selectRoom(page, 390, "zh", room);
    await page.locator("#next-button").click();
    await page.locator("#choice-list .choice-option").first().click();
    await page.locator("#next-button").click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#next-button").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`room-mode-remote-${room.key}.png`);
    const path = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(path);
    const png = await readFile(path);
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 1830]);
    expect(await matchesArtwork(page, `${room.file}.webp`, png.toString("base64"))).toBe(true);
  });
}

test("resizing keeps the selected city room and swaps its responsive image", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=en`);
  const room = rooms.find(({ key }) => key === "chicCity");
  await selectRoom(page, 390, "en", room);
  for (const width of [390, 1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const filename = `${room.file}${width <= 800 ? "-mobile" : ""}.webp`;
    await expect.poll(() => matchesArtwork(page, filename)).toBe(true);
    await expect(page.locator("#mobile-scene-select")).toHaveValue(room.key);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  }
});
