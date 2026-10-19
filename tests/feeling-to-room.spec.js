import { mkdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const qaDir = "docs/qa/feeling-first-tv-night";
const sheQaDir = "docs/qa/feeling-first-she";
mkdirSync(qaDir, { recursive: true });
mkdirSync(sheQaDir, { recursive: true });
const contexts = [["zh",390],["en",390],["zh",1440],["en",1440]];
const moods = ["rain", "chic", "family", "tech", "tv"];
const roomPresets = {
  rain: { wall: "sand", rug: "ivory", curtain: "linen", print: "rain" },
  chic: { wall: "original", rug: "ivory", curtain: "rose", print: "hills" },
  family: { wall: "sand", rug: "stripe", curtain: "sage", print: "hills" },
  tech: { wall: "mist", rug: "stripe", curtain: "linen", print: "moon" },
  tv: { wall: "sand", rug: "ivory", curtain: "linen", print: "moon" },
};

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

async function noMalePronounForPerson(page) {
  const copy = await page.evaluate(() => {
    const visible = document.body.innerText.replaceAll("其他", "");
    const labels = [...document.querySelectorAll("[aria-label]")].map(node => node.getAttribute("aria-label") || "").join(" ").replaceAll("其他", "");
    return { visible, labels };
  });
  expect(copy.visible).not.toContain("他");
  expect(copy.labels).not.toContain("他");
}

async function noOrphanLines(page, lang) {
  const findings = await page.evaluate(language => {
    const selectors = ["h1", ".dek", ".step-title", ".step-note", ".mood-copy span", ".draft-body strong", ".draft-body small", ".reason-fieldset legend", ".reason-choice span", ".result-caption", ".result-summary", ".selected-reason", ".refinement-list strong", ".refinement-list span", ".roomverse-note"];
    const issues = [];
    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        const lines = new Map();
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          let offset = 0;
          for (const character of Array.from(node.nodeValue)) {
            const range = document.createRange();
            range.setStart(node, offset);
            range.setEnd(node, offset + character.length);
            const rect = range.getBoundingClientRect();
            offset += character.length;
            if (!rect.height) continue;
            const key = Math.round(rect.top);
            lines.set(key, (lines.get(key) || "") + character);
          }
        }
        for (const [top, rawLine] of lines) {
          const line = rawLine.trim();
          if (!line) continue;
          const units = language === "zh"
            ? Array.from(line).length
            : (line.match(/[A-Za-z]+(?:[’'][A-Za-z]+)*/g) || []).length;
          if (units === 1) issues.push({ selector, text: element.textContent.trim(), line, top });
        }
      }
    }
    return issues;
  }, lang);
  expect(findings, JSON.stringify(findings)).toEqual([]);
}

async function checkImages(page) {
  const images = page.locator("img");
  for (let i=0;i<await images.count();i++) {
    const image=images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  const missingAlt = await page.locator("img").evaluateAll(images => images.filter(img => !img.alt.trim()).map(img => img.src));
  expect(missingAlt).toEqual([]);
  await page.evaluate(() => window.scrollTo(0,0));
}

for (const [lang,width] of contexts) {
  test(`${lang} ${width}: five story cards are visible and responsive`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`/prototype/feeling-to-room/?lang=${lang}`);
    await expect(page.locator("h1")).toHaveText(lang === "zh" ? "先有fu，再有家" : "Feeling First");
    await expect(page.locator("#step-heading")).toHaveText(lang === "zh" ? "替她選一個方向" : "Who is coming home today?");
    if (lang === "zh") await expect(page.locator('[data-action="continue-mood"]')).toHaveText("看三個方向");
    await expect(page.locator("#progress-text")).toHaveText(lang === "zh" ? "第 1／3 步" : "Step 1 of 3");
    await expect(page.locator("[data-mood]")).toHaveCount(5);
    await expect(page.locator(".mood-card img")).toHaveCount(5);
    await expect(page.locator(".mood-card img").first()).not.toHaveAttribute("loading", "lazy");
    await expect(page.locator('.mood-card img[src*="person-"]')).toHaveCount(5);
    await expect(page.locator('.step-panel input[type="color"], .step-panel input[type="range"]')).toHaveCount(0);
    if (lang === "zh") await expect(page.locator(".step-panel")).not.toContainText("風格");
    const columns = await page.locator(".mood-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(width === 390 ? 2 : 6);
    await expect(page.locator("[data-mood]").nth(1)).toBeInViewport();
    const cardRows = await page.locator("[data-mood]").evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().top)));
    if (width === 390) {
      expect(cardRows[0]).toBe(cardRows[1]);
      expect(cardRows[2]).toBe(cardRows[3]);
      expect(cardRows[4]).toBeGreaterThan(cardRows[3]);
    } else {
      expect(cardRows[0]).toBe(cardRows[1]);
      expect(cardRows[1]).toBe(cardRows[2]);
      expect(cardRows[3]).toBe(cardRows[4]);
      expect(cardRows[3]).toBeGreaterThan(cardRows[2]);
    }
    const firstRow = await page.locator("[data-mood]").evaluateAll(nodes => nodes.slice(0,2).map(node => {
      const rect = node.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    }));
    expect(firstRow, JSON.stringify(await page.locator("[data-mood]").evaluateAll(nodes => nodes.slice(0,2).map(node => {
      const rect = node.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, height: rect.height, viewport: innerHeight };
    })))).toEqual([true, true]);
    await checkImages(page);
    await noOverflow(page);
    await page.screenshot({ path: `${qaDir}/${lang}-${width}-step1.png` });
  });
}

for (const mood of moods) {
  for (const lang of ["zh", "en"]) {
    test(`${lang}: ${mood} story completes all steps and links to the matching room`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/prototype/feeling-to-room/?lang=${lang}`);
      await page.locator(`[data-mood="${mood}"]`).click();
      await expect(page.locator(`[data-mood="${mood}"]`)).toHaveAttribute("aria-pressed", "true");
      await page.locator('[data-action="continue-mood"]').click();
      await expect(page.locator("#step-heading")).toHaveText(lang === "zh" ? "她會先挑哪一個？" : "Pick a direction for them");
      await expect(page.locator('input[name="draft"]')).toHaveCount(3);
      if (mood === "family" && lang === "zh") {
        await checkImages(page);
        await page.screenshot({ path: `${qaDir}/family-390-step2.png`, fullPage: true });
        await page.screenshot({ path: `${qaDir}/zh-390-step2-text.png`, fullPage: true });
      }
      if (mood === "tv") {
        await checkImages(page);
        await page.screenshot({ path: `${qaDir}/${lang}-390-step2.png`, fullPage: true });
      }

      await page.locator(".draft-choice").nth(1).click();
      await page.locator(".reason-choice").nth(0).click();
      const nextLang = lang === "zh" ? "en" : "zh";
      await page.locator(`[data-lang="${nextLang}"]`).click();
      await expect(page.locator('input[name="draft"][value="2"]')).toBeChecked();
      await expect(page.locator('input[name="reason"][value="0"]')).toBeChecked();
      await page.locator(`[data-lang="${lang}"]`).click();
      await expect(page.locator('[data-action="reveal"]')).toBeEnabled();
      await page.locator('[data-action="reveal"]').click();
      await expect(page.locator("#step-heading")).toHaveText(lang === "zh" ? "把方向收斂成能生活的細節" : "Turn the direction into livable details");
      await expect(page.locator(".refinement-list li")).toHaveCount(3);
      await expect(page.locator(".result-caption")).toContainText(lang === "zh" ? "她進門的第一個感覺" : "Their first feeling on entering");
      await expect(page.locator(".result-image")).toHaveAttribute("src", new RegExp(`tv-result|mood-${mood}|room-${mood === "family" ? "sunny" : mood === "tech" ? "tech-night" : mood === "rain" ? "rug" : "chic-city"}`));
      const roomMood = mood === "tv" ? "tech" : mood;
      const params = new URLSearchParams({ lang, mood: roomMood, ...roomPresets[mood], from: "fu", who: mood });
      await expect(page.locator(".roomverse-note")).toHaveText(mood === "tv"
        ? (lang === "zh" ? "3D 房間目前還沒有電視牆，先帶你感受這種夜晚的氣氛；電視牆之後會補上。" : "The 3D room does not have a TV wall yet. It gives you the evening mood for now; the TV wall will come later.")
        : (lang === "zh"
          ? "3D 房間帶你感受這種氣氛：光線、牆色、地毯、窗簾與掛畫；家具大小、收納和線材整理，只在上面的文字說明裡。"
          : "The 3D room gives you the feeling: light, wall colour, rug, curtains and the wall print. Furniture size, storage and cable tidying appear only in the notes above."));
      await expect(page.locator('[data-action="roomverse"]')).toHaveAttribute("href", `/prototype/roomverse-3d/?${params}`);
      await expect(page.locator('[data-action="roomverse"]')).toHaveText(lang === "zh" ? "走進她的 ROOMVERSE 3D 房間" : "Step into her ROOMVERSE 3D room");
      await checkImages(page);
      await noOverflow(page);
      if (mood === "tv") {
        await page.screenshot({ path: `${qaDir}/${lang}-390-step3.png`, fullPage: true });
        if (lang === "zh") await page.screenshot({ path: `${qaDir}/zh-390-step3-text.png`, fullPage: true });
      }
      if (mood === "tv" && lang === "zh") {
        await expect(page.locator(".result-image")).toHaveAttribute("src", /tv-result\.webp$/);
        await expect(page.locator(".result-image")).toHaveAttribute("alt", /立式家用機器人/);
        await expect(page.locator(".roomverse-note")).toContainText("3D 房間目前還沒有電視牆");
      }
    });
  }
}

test("first-step people cards look distinct from the room-first ROOMVERSE remote", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/prototype/feeling-to-room/?lang=zh");
  await checkImages(page);
  await page.screenshot({ path: `${qaDir}/.compare-feeling-first.png` });
  await page.goto("/prototype/room-mode-remote/?lang=zh");
  await expect.poll(() => page.locator("#room-canvas").evaluate(canvas => canvas.toDataURL().length)).toBeGreaterThan(10000);
  await page.screenshot({ path: `${qaDir}/.compare-room-mode-remote.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test("no one-character or one-word lines in visitor copy at four widths and both languages", async ({ page }) => {
  for (const [lang,width] of [["zh",390],["en",390],["zh",414],["en",414],["zh",768],["en",768],["zh",1440],["en",1440]]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto(`/prototype/feeling-to-room/?lang=${lang}`);
    await noOrphanLines(page, lang);
    for (const mood of moods) {
      await page.locator(`[data-mood="${mood}"]`).click();
      await page.locator('[data-action="continue-mood"]').click();
      await noOrphanLines(page, lang);
      await page.locator(".draft-choice").first().click();
      await page.locator(".reason-choice").first().click();
      await page.locator('[data-action="reveal"]').click();
      await noOrphanLines(page, lang);
      await page.locator('[data-action="restart"]').click();
    }
  }
});

test("Chinese visitor copy refers to the pictured person as 她 across all three steps", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/prototype/feeling-to-room/?lang=zh");
  await noMalePronounForPerson(page);
  await checkImages(page);
  await page.screenshot({ path: `${sheQaDir}/zh-390-step1.png`, fullPage: true });
  await page.locator('[data-mood="family"]').click();
  await page.locator('[data-action="continue-mood"]').click();
  await noMalePronounForPerson(page);
  await checkImages(page);
  await page.screenshot({ path: `${sheQaDir}/zh-390-step2.png`, fullPage: true });
  await page.locator(".draft-choice").first().click();
  await page.locator(".reason-choice").first().click();
  await page.locator('[data-action="reveal"]').click();
  await noMalePronounForPerson(page);
  await expect(page.locator(".result-caption")).toContainText("她進門的第一個感覺");
  await checkImages(page);
  await page.screenshot({ path: `${sheQaDir}/zh-390-step3.png`, fullPage: true });
});

test("the experience remains fixed-content and does not persist visitor choices", async () => {
  const source=readFileSync("public/prototype/feeling-to-room/app.js","utf8");
  expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
  expect(source).not.toMatch(/===\s*["']rain["']/);
});
