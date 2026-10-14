import { expect, test } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const screenshotDirectory = resolve("output", "playwright", "street-corner-v0.2");

async function reachComparisonResult(page, lang, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.addInitScript(() => {
    window.__cardText = [];
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      if (this.canvas.width === 1200) window.__cardText.push(String(text));
      return fillText.call(this, text, ...args);
    };
  });

  await page.goto(`/prototype/secrets-on-the-corner/?lang=${lang}&period=weekday`);
  await page.locator("#impression-skip").click();
  const comparison = page.locator("#scenario-comparison");
  await expect(comparison).toBeHidden();
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-clue="queue"]').click();
  await expect(comparison).toBeHidden();

      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  // The time switch now appears only after all four details have been seen, folded under a summary.
  for (const clue of ["window", "bags", "lamp"]) {
    await page.locator(`[data-clue="${clue}"]`).click();
    if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  }
  await expect(page.locator("#scenario-tools")).toBeVisible();
  await page.locator("#scenario-tools > summary").click();
  await page.locator('[data-scenario="weekend"]').click();
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-clue="queue"]').click();
  await expect(comparison).toBeVisible();
  await expect(page.locator("#comparison-weekday")).toContainText(lang === "zh" ? "平日傍晚" : "weekday evening");
  await expect(page.locator("#comparison-weekend")).toContainText(lang === "zh" ? "週末傍晚" : "weekend evening");

      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-clue="bags"]').click();
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-question="reason"]').click();
      if (!(await page.locator("#result-more").getAttribute("open") !== null)) await page.locator("#result-more > summary").click();
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#result-boundary")).toBeVisible();
  await expect(page.locator("#result-boundary")).toContainText(lang === "zh" ? "虛構情境" : "fictional scenario");
  await expect(page.locator("#result .result-boundary")).toHaveCount(1);
}

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`street corner deepening ${lang} ${width}px, interaction, download, and screenshots`, async ({ page }) => {
      await reachComparisonResult(page, lang, width);
      await mkdir(screenshotDirectory, { recursive: true });
      const context = page.locator(".business-context");
      const prefix = `${lang}-${width}`;

      await expect(page.locator(".business-chain")).not.toHaveAttribute("open", "");
      await context.screenshot({ path: resolve(screenshotDirectory, `${prefix}-collapsed.png`) });

      await page.locator(".business-chain summary").click();
      await expect(page.locator(".business-chain")).toHaveAttribute("open", "");
      await expect(page.locator(".business-chain-steps li")).toHaveCount(4);
      await expect(page.locator(".business-chain-bridge")).toContainText(lang === "zh" ? "詢盤不等於訂單" : "an inquiry is not an order");
      await context.screenshot({ path: resolve(screenshotDirectory, `${prefix}-expanded.png`) });

      const downloadPromise = page.waitForEvent("download");
      await page.locator("#download").click();
      const download = await downloadPromise;
      const path = await download.path();
      expect(path).toBeTruthy();
      const png = await readFile(path);
      expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(1700);

      const canvasText = await page.evaluate(() => window.__cardText);
      expect(canvasText.join(lang === "zh" ? "" : " ")).toContain(lang === "zh" ? "兩個時段的對照" : "Two moments compared");
      expect(canvasText.join(" ").match(lang === "zh" ? /這是虛構情境/g : /This is a fictional scenario/g)).toHaveLength(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }
}
