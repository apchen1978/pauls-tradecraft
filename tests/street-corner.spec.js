import { expect, test } from "@playwright/test";

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`Secrets on the Corner: ${lang} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.addInitScript(() => {
        window.__cardText = [];
        const fillText = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
          if (this.canvas.width === 1200) window.__cardText.push(String(text));
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
      await expect(page.locator(".hero-prompt")).toHaveAttribute("href", "#first-impression");
      await expect(page.locator(".draft-label")).toHaveText(lang === "zh" ? "示意玩具，不是店家分析。" : "A toy, not a shop analysis.");
      await expect(page.locator(".disclosure")).toContainText(lang === "zh" ? "示意玩具，虛構情境" : "A toy set in a fictional scene");
      await expect(page.locator("#trade-bridge-link")).toHaveAttribute("href", `/prototype/take-the-lantern-apart/?lang=${lang}`);
      await expect(page.locator("#route-progress")).toBeEmpty();
      await page.locator('[data-impression="pickup"]').click();
      await expect(page.locator('[data-impression="pickup"]')).toHaveAttribute("aria-pressed", "true");
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-scenario="weekend"]').click();
      await expect(page).toHaveURL(/period=weekend/);
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-clue="queue"]').click();
      await expect(page.locator("#note-content")).toContainText(lang === "zh" ? "週末傍晚" : "weekend evening");
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-scenario="weekday"]').click();
      await expect(page).toHaveURL(/period=weekday/);
      await expect(page.locator(".question").first()).toBeDisabled();
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-clue="queue"]').click();
      await expect(page.locator("#impression-options")).toBeHidden();
      await expect(page.locator("#impression-status")).toContainText(lang === "zh" ? "預訂" : "pre-orders");
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-clue="bags"]').click();
      await expect(page.locator(".question").first()).toBeEnabled();
      await expect(page.locator('[data-question="reason"] .question-lens')).toContainText(lang === "zh" ? "紙袋" : "bags");
      await expect(page.locator('[data-question="capacity"] .question-lens')).toContainText(lang === "zh" ? "還沒看櫥窗" : "Haven't looked at the window");
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-clue="window"]').click();
      await expect(page.locator('[data-question="capacity"] .question-lens')).toContainText(lang === "zh" ? "你看過櫥窗" : "You noticed the window");

      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-question="capacity"]').click();
      if ((await page.locator("#result-more").getAttribute("open")) === null) await page.locator("#result-more > summary").click();
      await expect(page.locator("#result-reflection")).toBeVisible();
      await expect(page.locator("#reflection-before")).toContainText(lang === "zh" ? "預訂" : "pre-orders");
      await expect(page.locator("#reflection-now")).toContainText(lang === "zh" ? "工序" : "wait");
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
      await expect(page.locator("#route-progress")).toContainText(lang === "zh" ? "不同的追查方向" : "different ways");
      const firstSignal = await page.locator("#followup-detail").innerText();
      await page.locator('[data-followup="1"]').click();
      expect(await page.locator("#followup-detail").innerText()).not.toBe(firstSignal);
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-scenario="weekend"]').click();
      await expect(page.locator("#result")).toBeHidden();
      await expect(page.locator("#route-progress")).toContainText(lang === "zh" ? "不同的追查方向" : "different ways");
      if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
      await page.locator('[data-question="capacity"]').click();
      if ((await page.locator("#result-more").getAttribute("open")) === null) await page.locator("#result-more > summary").click();
      const download = page.waitForEvent("download");
      await page.locator("#download").click();
      await expect(await download).toBeTruthy();
      await expect.poll(() => page.evaluate(() => window.__cardText)).toContain(lang === "zh" ? "仍不能說" : "Still unproven");
      await expect.poll(() => page.evaluate(() => window.__cardText)).toContain(lang === "zh" ? "第一眼想到" : "First thought");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }
}

test("first impression can be skipped without blocking exploration", async ({ page }) => {
  await page.goto("/prototype/secrets-on-the-corner/?lang=zh");
  await page.locator('[data-impression="steady"]').click();
  await page.locator("#impression-skip").click();
  await expect(page.locator("#first-impression")).toBeHidden();
  await expect(page.locator(".hero-prompt")).toBeHidden();
  await expect(page.locator(".start-link")).toHaveAttribute("href", "#explore-title");
  if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-clue="queue"]').click();
  if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-clue="bags"]').click();
  if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-question="reason"]').click();
  if ((await page.locator("#result-more").getAttribute("open")) === null) await page.locator("#result-more > summary").click();
  await expect(page.locator("#result-reflection")).toBeHidden();
  await expect(page.locator("#result")).toBeVisible();
});

test("a glowing point opens an accessible note and restores focus on close", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/prototype/secrets-on-the-corner/?lang=zh");
  if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-clue="lamp"]').click();
  await expect(page.locator("#note-content h3")).toHaveText("路燈");
  await expect(page.locator("#note-content h3")).toBeFocused();
  await expect(page.locator("#field-note")).toBeInViewport({ ratio: 0.1 });
  await page.locator("#note-back").click();
  await expect(page.locator('[data-clue="lamp"]')).toBeFocused();
  await expect(page.locator("#field-note")).not.toBeVisible();
});

test("the recorded thought follows a language switch", async ({ page }) => {
  await page.goto("/prototype/secrets-on-the-corner/?lang=zh");
  await page.locator('[data-impression="steady"]').click();
  if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-clue="queue"]').click();
  if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-clue="bags"]').click();
  if (await page.locator("#field-note").isVisible()) await page.locator("#note-back").click();
  await page.locator('[data-question="reason"]').click();
  if ((await page.locator("#result-more").getAttribute("open")) === null) await page.locator("#result-more > summary").click();
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator("#reflection-before")).toHaveText("Business may be steady");
  await expect(page.locator("#reflection-now")).toHaveText("What is everyone waiting for?");
  await expect(page.locator("#impression-status")).toContainText("Business may be steady");
});
// Act two: Sunny answers only what the player asked, in the chosen order.
async function reachLetter(page, lang, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.addInitScript(() => {
    window.__cardText = []; window.__cardBounds = [];
    const draw = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, ...rest) {
      if (this.canvas.width === 1200) {
        window.__cardText.push(String(text));
        window.__cardBounds.push({ text: String(text), x, y, right: x + this.measureText(text).width, height: this.canvas.height });
      }
      return draw.call(this, text, x, y, ...rest);
    };
  });
  await page.goto(`/prototype/secrets-on-the-corner/?lang=${lang}`);
  await page.locator('#impression-skip').click();
  for (const id of ['queue', 'bags']) {
    await page.locator(`[data-clue="${id}"]`).click();
    await page.locator('#note-back').click();
    await expect(page.locator(`[data-clue="${id}"]`)).toBeFocused();
  }
  await page.locator('[data-question="reason"]').click();
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#result-more')).not.toHaveAttribute('open');
  await expect(page.locator('#result .result-body')).toBeVisible();
  await expect(page.locator('#result .letter-result')).toBeVisible();
}

for (const lang of ['zh', 'en']) {
  for (const width of [390, 768, 1440]) {
    test(`letter: reply, focus, unconfirmed facts and export ${lang} ${width}`, async ({ page }) => {
      await reachLetter(page, lang, width);
      const { mkdir, readFile } = await import('node:fs/promises');
      const { resolve } = await import('node:path');
      const dir = resolve('output/playwright/street-letter'); await mkdir(dir, { recursive: true });
      await page.screenshot({ path: resolve(dir, `${lang}-${width}-result-before.png`), fullPage: true });
      await expect(page.locator('#trade-bridge-link')).toHaveAttribute('href', `/prototype/take-the-lantern-apart/?lang=${lang}`);
      await expect(page.locator('#trade-secondary-link')).toHaveAttribute('href', `/prototype/trade-street/?lang=${lang}`);
      await page.locator('#letter-open').click();
      await expect(page.locator('#letter-dialog')).toBeVisible();
      await expect(page.locator('[data-letter-clue]')).toHaveCount(7);
      await expect(page.locator('[data-letter-clue] [data-letter-clue]')).toHaveCount(0);
      for (let repeat = 0; repeat < 3; repeat++) {
        await page.locator('[data-letter-clue="some"]').click();
        await expect(page.locator('#letter-note')).toContainText(lang === 'zh' ? '問法示例' : 'Example wording');
        await page.locator('#letter-note button').click();
        await expect(page.locator('[data-letter-clue="some"]')).toBeFocused();
      }
      await expect(page.locator('[data-letter-clue].explored')).toHaveCount(1);
      await expect(page.locator('#letter-compose')).toBeVisible();
      await page.screenshot({ path: resolve(dir, `${lang}-${width}-letter.png`) });
      for (const id of ['regular', 'same', 'trial', 'spec', 'delivery', 'pay']) {
        await page.locator(`[data-letter-clue="${id}"]`).click();
        const seen = await page.locator('#letter-note').innerText();
        if (id === 'pay') await page.locator('#letter-note').screenshot({ path: resolve(dir, `${lang}-${width}-note.png`) });
        await page.locator('#letter-note button').click();
        await page.locator(`[data-letter-clue="${id}"]`).click();
        expect(await page.locator('#letter-note').innerText()).toBe(seen);
        await page.locator('#letter-note button').click();
      }
      await expect(page.locator('#letter-compose')).toBeVisible();
      await page.locator('#letter-compose').click();
      await expect(page.locator('#reply-save')).toBeDisabled();
      for (const id of ['spec', 'pay']) await page.locator(`[data-reply-question="${id}"]`).click();
      await expect(page.locator('[data-reply-question="some"]')).toBeDisabled();
      await page.locator('[data-reply-action="up"][data-reply-id="pay"]').click();
      await expect(page.locator('#reply-preview li').first()).toContainText(lang === 'zh' ? '什麼時候方便結清' : 'When would you like to settle up');
      await page.locator('#reply-tone').selectOption('1');
      await expect(page.locator('#reply-preview')).toContainText(lang === 'zh' ? '很高興收到' : 'So glad');
      expect(await page.locator('main').innerText()).not.toMatch(/[0-9０-９]/);
      await page.screenshot({ path: resolve(dir, `${lang}-${width}-reply.png`) });
      const chosen = await page.locator('#reply-preview li').allTextContents();
      await page.locator('#reply-save').click();
      await expect(page.locator('#letter-open')).toBeFocused();
      await expect(page.locator('#letter-result-content')).toContainText(lang === 'zh' ? '幾天後，信箱裡又多了一封信。' : 'A few days later, another letter is waiting in the mailbox.');
      await expect(page.locator('#letter-result-content')).toContainText(lang === 'zh' ? '多少麵包' : 'How much bread');
      await expect(page.locator('#letter-result-content')).toContainText(lang === 'zh' ? '不是訂單' : 'not an order');
      await expect(page.locator('#letter-result-content')).toContainText(lang === 'zh' ? '之後再問' : 'Ask later');
      await page.locator('#letter-result-content .action-primary').click();
      await expect(page.locator('#sunny-reply-title')).toBeFocused();
      const paper = page.locator('.sunny-reply-paper');
      const paragraphs = await paper.locator('p').allTextContents();
      expect(paragraphs).toHaveLength(6);
      expect(paragraphs[1]).toContain(lang === 'zh' ? '每次送來附張單子' : 'Could you include a slip');
      expect(paragraphs[2]).toContain(lang === 'zh' ? '想要甜度再低一點' : 'A touch less sweet');
      expect(paragraphs.join('')).not.toContain(lang === 'zh' ? '送到後門就好' : 'The back door is fine');
      expect(paragraphs[5]).toContain(lang === 'zh' ? '最裡面那張桌子' : 'the very back of our café');
      expect(paragraphs.join('')).not.toMatch(/[0-9０-９]|魔法|法師|咒|巫|童話|\b(magic|wizard|spell|witch)\b/i);
      const downloadPromise = page.waitForEvent('download'); await page.locator('#download').click();
      const download = await downloadPromise;
      await download.saveAs(resolve(dir, `${lang}-${width}-card.png`));
      expect(download.suggestedFilename()).toBe(lang === 'zh' ? '街角的秘密-觀察卡.png' : 'secrets-on-the-corner-field-card.png');
      const png = await readFile(await download.path()); expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(1700);
      const lines = await page.evaluate(() => window.__cardText);
      const words = lines.join(lang === 'zh' ? '' : ' ').replace(/\s+/g, ' ');
      expect(chosen).toHaveLength(2);
      expect(words).toContain(lang === 'zh' ? '小葵回覆了' : 'Sunny replied');
      expect(words).toContain(lang === 'zh' ? '之後再問' : 'Ask later');
      expect(words).toContain(lang === 'zh' ? '什麼時候結清' : 'When to settle up');
      expect(words).not.toMatch(/[0-9０-９]/);
      for (const item of await page.evaluate(() => window.__cardBounds)) { expect(item.y).toBeLessThan(item.height - 20); expect(item.right).toBeLessThanOrEqual(1140); }
      await page.locator('#letter-result').screenshot({ path: resolve(dir, `${lang}-${width}-result.png`) });
      const other = lang === 'zh' ? 'en' : 'zh'; await page.locator(`[data-lang="${other}"]`).click();
      await expect(page.locator('#trade-bridge-link')).toHaveAttribute('href', `/prototype/take-the-lantern-apart/?lang=${other}`);
      await expect(page.locator('#letter-result-title')).toHaveText(other === 'zh' ? '信折好了，故事還沒結束' : "The letter is folded. The story isn't over.");
      await expect(page.locator('.sunny-reply-paper')).toContainText(other === 'zh' ? '每次送來附張單子' : 'Could you include a slip');
      await expect(page.locator('.sunny-reply-paper')).toContainText(other === 'zh' ? '暖燈工作室' : 'workshop with the warm light');
      await page.locator('#letter-open').click();
      await expect(page.locator('#reply-preview li').first()).toContainText(other === 'zh' ? '什麼時候方便結清' : 'When would you like to settle up');
      await page.keyboard.press('Escape'); await expect(page.locator('#letter-open')).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
      await page.locator('#try-again').click(); await page.locator('[data-question="reason"]').click();
      await expect(page.locator('#letter-result-content')).toBeHidden();
    });
  }
}

test('letter can be skipped, incomplete drafts are not exported, and motion stays optional', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await reachLetter(page, 'zh', 390);
  await page.locator('#letter-skip').click(); await expect(page.locator('#download')).toBeFocused();
  const downloadPromise = page.waitForEvent('download'); await page.locator('#download').click(); await downloadPromise;
  expect((await page.evaluate(() => window.__cardText)).join('')).not.toContain('外地來信');
  await page.locator('#letter-open').click();
  await page.locator('#letter-compose').click();
  await expect(page.locator('[data-reply-question]')).toHaveCount(7);
  await page.locator('#reply-back').click();
  await page.locator('[data-letter-clue="some"]').click();
  await page.keyboard.press('Escape'); await expect(page.locator('[data-letter-clue="some"]')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.locator('#letter-open')).toBeFocused();
  expect(await page.locator('main').innerText()).not.toMatch(/[0-9０-９]/);
  const text = await page.locator('main').innerText(); expect(text).not.toMatch(/成效未驗證|outcomes not validated|魔法|法師|咒|巫|童話|\b(magic|wizard|spell|witch)\b/i);
});

test('cancelling edits keeps the saved reply and its export intact', async ({ page }) => {
  await reachLetter(page, 'en', 390);
  await page.locator('#letter-open').click(); await page.locator('#letter-compose').click();
  await page.locator('[data-reply-question="some"]').click(); await page.locator('#reply-save').click();
  const saved = await page.locator('#letter-result-content').innerText();
  await page.locator('#letter-open').click();
  await page.locator('[data-reply-action="remove"][data-reply-id="some"]').click();
  await expect(page.locator('#reply-save')).toBeDisabled(); await page.keyboard.press('Escape');
  expect(await page.locator('#letter-result-content').innerText()).toBe(saved);
  const download = page.waitForEvent('download'); await page.locator('#download').click(); await download;
  const card = (await page.evaluate(() => window.__cardText)).join(' ');
  expect(card).toContain('How much bread');
  await page.locator('#letter-open').click(); await expect(page.locator('#reply-preview li')).toHaveCount(1);
});

for (const lang of ['zh', 'en']) {
  for (const width of [390, 1440]) {
    test(`Sunny answers one question only ${lang} ${width}`, async ({ page }) => {
      const { mkdir } = await import('node:fs/promises');
      const { resolve } = await import('node:path');
      const dir = resolve('output/playwright/street-letter'); await mkdir(dir, { recursive: true });
      await reachLetter(page, lang, width);
      await page.locator('#letter-open').click();
      await page.locator('#letter-compose').click();
      await expect(page.locator('#reply-title')).toContainText(lang === 'zh' ? '一定要先問' : 'must ask first');
      await page.locator('[data-reply-question="same"]').click();
      await page.locator('#reply-save').click();
      await page.locator('#letter-result-content .action-primary').click();
      const paper = page.locator('.sunny-reply-paper');
      const paragraphs = await paper.locator('p').allTextContents();
      expect(paragraphs).toHaveLength(5);
      expect(paragraphs[0]).toContain(lang === 'zh' ? '好好回答你' : "Here's my answer");
      expect(paragraphs[1]).toContain(lang === 'zh' ? '我說的『差不多』' : "By 'about the same'");
      expect(paragraphs[2]).toContain(lang === 'zh' ? '之後再一起問清楚' : 'work out together later');
      expect(paragraphs[2]).toContain(lang === 'zh' ? '什麼時候送' : 'When to deliver');
      expect(paragraphs.join('')).not.toContain(lang === 'zh' ? '每次大概是一個早上' : "Roughly what we'd sell");
      await expect(page.locator('#letter-result-content')).toContainText(lang === 'zh' ? '小葵回覆了' : 'Sunny replied');
      await page.locator('#letter-result').screenshot({ path: resolve(dir, `${lang}-${width}-one-question.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    });
  }
}
