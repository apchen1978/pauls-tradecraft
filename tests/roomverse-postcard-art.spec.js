import { expect, test } from "@playwright/test";
import { readFile, stat } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const MOODS = ["rain", "family", "tech", "chic", "slow", "tv"];

for (const { width, lang } of [{ width: 390, lang: "zh" }, { width: 1440, lang: "en" }]) {
  test(`${width}px ${lang}: each feeling downloads its own illustrated postcard`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(`${PAGE}?lang=${lang}&mood=rain`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    const save = page.getByRole("button", { name: lang === "zh" ? "存成明信片" : "Save as a postcard" });
    if (!(await save.isVisible())) await page.locator("#panelToggle").click();

    for (const mood of MOODS) {
      await page.evaluate((value) => window.__room.set("mood", value), mood);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        save.click(),
      ]);
      expect(download.suggestedFilename()).toBe(lang === "zh" ? "ROOMVERSE-3D-插畫明信片.webp" : "ROOMVERSE-3D-illustrated-postcard.webp");
      const expected = await readFile(`public/prototype/roomverse-3d/postcard/roomverse-postcard-${mood}-v1.webp`);
      const actual = await readFile(await download.path());
      expect(actual.equals(expected)).toBe(true);
      expect((await stat(`public/prototype/roomverse-3d/postcard/roomverse-postcard-${mood}-v1.webp`)).size).toBeLessThanOrEqual(300000);
      if (mood === "family") {
        await download.saveAs(testInfo.outputPath(`${lang}-${width}-download.webp`));
        await page.screenshot({ path: testInfo.outputPath(`${lang}-${width}-download-ui.png`) });
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("a missing illustrated postcard falls back to a label-free-of-feeling 3D capture", async ({ page }) => {
  await page.route("**/roomverse-postcard-rain-v1.webp", (route) => route.abort());
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const save = page.getByRole("button", { name: "存成明信片" });
  if (!(await save.isVisible())) await page.locator("#panelToggle").click();
  await page.evaluate(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    window.__postcardWriting = [];
    CanvasRenderingContext2D.prototype.fillText = function (value, ...args) {
      window.__postcardWriting.push(value);
      return original.call(this, value, ...args);
    };
  });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    save.click(),
  ]);
  expect(download.suggestedFilename()).toBe("ROOMVERSE-3D-明信片.png");
  const data = await readFile(await download.path());
  expect(data.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect((await page.evaluate(() => window.__postcardWriting)).join(" ")).not.toContain("下雨天想窩在家裡");
});
