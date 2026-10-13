import { expect, test } from "@playwright/test";

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`Secrets on the Corner: ${lang} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.addInitScript(() => {
        window.__cardText = [];
        const fillText = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
          if (this.canvas.width === 1200 && this.canvas.height === 1700) window.__cardText.push(String(text));
          return fillText.call(this, text, ...args);
        };
      });
      await page.goto(`/?lang=${lang}#showcase`);
      const showcase = page.locator("#showcase");
      const title = lang === "zh" ? "街角的秘密" : "Secrets on the Corner · 街角的秘密";
      const card = showcase.getByRole("heading", { name: title }).locator("xpath=ancestor::article[1]");
      await expect(card).toBeVisible();
      await expect(showcase.locator("article").nth(2)).toContainText(title);
      await expect(card.locator("img")).toHaveAttribute("src", "/prototype/secrets-on-the-corner/assets/queue-mobile.webp");
      await expect(page.locator("#garage").getByRole("heading", { name: title })).toHaveCount(0);
      const link = card.getByRole("link", { name: lang === "zh" ? "走進街角" : "Enter the street" });
      await expect(link).toHaveAttribute("href", new RegExp(`/prototype/secrets-on-the-corner/\\?lang=${lang}$`));

      await page.goto(`/prototype/secrets-on-the-corner/?lang=${lang}`);
      await expect(page.locator("h1")).toHaveText(lang === "zh" ? "街角的秘密" : "Secrets on the Corner");
      await expect(page.locator(".draft-label")).toHaveText(lang === "zh" ? "互動示範" : "Interactive demo");
      await expect(page.locator(".disclosure")).toContainText(lang === "zh" ? "成效未驗證" : "outcomes not validated");
      await expect(page.locator("#trade-bridge-link")).toHaveAttribute("href", `/prototype/trade-street/?lang=${lang}`);
      await expect(page.locator("#route-progress")).toContainText(lang === "zh" ? "0/6" : "0 of 6");
      await page.locator('[data-scenario="weekend"]').click();
      await expect(page).toHaveURL(/period=weekend/);
      await page.locator('[data-clue="queue"]').click();
      await expect(page.locator("#note-content")).toContainText(lang === "zh" ? "週末傍晚" : "weekend evening");
      await page.locator('[data-scenario="weekday"]').click();
      await expect(page).toHaveURL(/period=weekday/);
      await expect(page.locator(".question").first()).toBeDisabled();
      await page.locator('[data-clue="queue"]').click();
      await page.locator('[data-clue="bags"]').click();
      await expect(page.locator(".question").first()).toBeEnabled();
      await expect(page.locator('[data-question="reason"] .question-lens')).toContainText(lang === "zh" ? "紙袋" : "bags");
      await expect(page.locator('[data-question="capacity"] .question-lens')).toContainText(lang === "zh" ? "還沒看櫥窗" : "Haven't looked at the window");
      await page.locator('[data-clue="window"]').click();
      await expect(page.locator('[data-question="capacity"] .question-lens')).toContainText(lang === "zh" ? "你看過櫥窗" : "You noticed the window");

      await page.locator('[data-question="capacity"]').click();
      await expect(page.locator("#result-lens")).toContainText(lang === "zh" ? "你看過櫥窗" : "You noticed the window");
      await expect(page.locator(".alternative")).toHaveCount(2);
      await page.locator('[data-alternative="0"]').click();
      const first = await page.locator("#alternative-detail").innerText();
      await page.locator('[data-alternative="1"]').click();
      const second = await page.locator("#alternative-detail").innerText();
      expect(first).not.toBe(second);
      await expect(page.locator("#followup")).toBeVisible();
      await expect(page.locator(".followup-option")).toHaveCount(2);
      await page.locator('[data-followup="0"]').click();
      await expect(page.locator("#route-progress")).toContainText(lang === "zh" ? "1/6" : "1 of 6");
      const firstSignal = await page.locator("#followup-detail").innerText();
      await page.locator('[data-followup="1"]').click();
      expect(await page.locator("#followup-detail").innerText()).not.toBe(firstSignal);
      await page.locator('[data-scenario="weekend"]').click();
      await expect(page.locator("#result")).toBeHidden();
      await expect(page.locator("#route-progress")).toContainText(lang === "zh" ? "1/6" : "1 of 6");
      await page.locator('[data-question="capacity"]').click();
      const download = page.waitForEvent("download");
      await page.locator("#download").click();
      await expect(await download).toBeTruthy();
      await expect.poll(() => page.evaluate(() => window.__cardText)).toContain(lang === "zh" ? "仍不能說" : "Still unproven");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }
}
