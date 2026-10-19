import { mkdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const qaDir = "docs/qa/feeling-first-people-stories";
mkdirSync(qaDir, { recursive: true });
const contexts = [["zh",390],["en",390],["zh",1440],["en",1440]];
const moods = ["rain", "chic", "family", "tech"];

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
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
  test(`${lang} ${width}: four story cards are visible and responsive`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`/prototype/feeling-to-room/?lang=${lang}`);
    await expect(page.locator("h1")).toHaveText(lang === "zh" ? "先有fu，再有家" : "Feeling First");
    await expect(page.locator("#step-heading")).toHaveText(lang === "zh" ? "今天，誰要回家？" : "Who is coming home today?");
    await expect(page.locator("#progress-text")).toHaveText(lang === "zh" ? "第 1／3 步" : "Step 1 of 3");
    await expect(page.locator("[data-mood]")).toHaveCount(4);
    await expect(page.locator(".mood-card img")).toHaveCount(4);
    await expect(page.locator(".mood-card img").first()).not.toHaveAttribute("loading", "lazy");
    await expect(page.locator('.mood-card img[src*="person-"]')).toHaveCount(4);
    await expect(page.locator('.step-panel input[type="color"], .step-panel input[type="range"]')).toHaveCount(0);
    if (lang === "zh") await expect(page.locator(".step-panel")).not.toContainText("風格");
    const columns = await page.locator(".mood-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(width === 390 ? 2 : 4);
    await expect(page.locator("[data-mood]").nth(3)).toBeInViewport();
    await expect(page.locator('[data-action="continue-mood"]')).toBeInViewport();
    await checkImages(page);
    await noOverflow(page);
    await page.screenshot({ path: `${qaDir}/${lang}-${width}-step1.png` });
    if (width === 390) {
      const cardBottoms = await page.locator("[data-mood]").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().bottom));
      expect(Math.max(...cardBottoms)).toBeLessThan(844);
    }
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
      await expect(page.locator("#step-heading")).toHaveText(lang === "zh" ? "替他挑一個方向" : "Pick a direction for them");
      await expect(page.locator('input[name="draft"]')).toHaveCount(3);
      if (mood === "family" && lang === "zh") {
        await checkImages(page);
        await page.screenshot({ path: `${qaDir}/family-390-step2.png`, fullPage: true });
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
      await expect(page.locator(".result-caption")).toContainText(lang === "zh" ? "他進門的第一個感覺" : "Their first feeling on entering");
      await expect(page.locator(".result-image")).toHaveAttribute("src", new RegExp(`mood-${mood}|room-${mood === "family" ? "sunny" : mood === "tech" ? "tech-night" : mood === "rain" ? "rug" : "chic-city"}`));
      await expect(page.locator('[data-action="roomverse"]')).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=${lang}&mood=${mood}`);
      await checkImages(page);
      await noOverflow(page);
      if (mood === "tech" && lang === "zh") await page.screenshot({ path: `${qaDir}/tech-390-step3.png`, fullPage: true });
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

test("the experience remains fixed-content and does not persist visitor choices", async () => {
  const source=readFileSync("public/prototype/feeling-to-room/app.js","utf8");
  expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
  expect(source).not.toMatch(/===\s*["']rain["']/);
});
