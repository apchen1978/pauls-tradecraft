import { mkdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const shotDir = "docs/qa/feeling-to-room";
mkdirSync(shotDir, { recursive: true });
const contexts = [["zh",390],["en",390],["zh",1440],["en",1440]];

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
  await page.evaluate(() => window.scrollTo(0,0));
  const missingAlt = await page.locator("img").evaluateAll(images => images.filter(img => !img.alt.trim()).map(img => img.src));
  expect(missingAlt).toEqual([]);
}

for (const [lang,width] of contexts) {
  test(`${lang} ${width}: three-step Feeling First experience and responsive screenshots`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`/prototype/feeling-to-room/?lang=${lang}`);
    await expect(page.locator("h1")).toHaveText(lang === "zh" ? "心情先行" : "Feeling First");
    await expect(page.locator("#progress-text")).toHaveText(lang === "zh" ? "第 1／3 步" : "Step 1 of 3");
    await expect(page.locator("[data-mood]")).toHaveCount(2);
    await expect(page.locator("[data-mood=rain]")).toBeInViewport();
    await expect(page.locator("[data-mood=chic]")).toBeInViewport();
    await expect(page.locator('[data-action="continue-mood"]')).toBeInViewport();
    await expect(page.locator("[data-mood] img").first()).not.toHaveAttribute("loading", "lazy");
    if (width === 390) {
      const moodBottoms = await page.locator("[data-mood]").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().bottom));
      expect(Math.max(...moodBottoms)).toBeLessThan(844);
    }
    await checkImages(page);
    await noOverflow(page);
    await page.screenshot({ path: `${shotDir}/${lang}-${width}-step1.png` });

    const start = await page.evaluate(() => performance.now());
    await page.locator("[data-mood=rain]").click();
    const elapsed = await page.evaluate(startAt => performance.now() - startAt, start);
    expect(elapsed).toBeLessThan(300);
    await expect(page.locator("[data-mood=rain]")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-action="continue-mood"]')).toBeEnabled();
    await page.locator('[data-action="continue-mood"]').click();
    await expect(page.locator("#progress-text")).toHaveText(lang === "zh" ? "第 2／3 步" : "Step 2 of 3");
    await expect(page.getByText(lang === "zh" ? "AI 初稿（預置示範）" : "AI draft · prepared example").first()).toBeVisible();
    await expect(page.locator('input[name="draft"]')).toHaveCount(3);
    await checkImages(page);
    await noOverflow(page);
    await page.screenshot({ path: `${shotDir}/${lang}-${width}-step2.png`, fullPage: true });

    await page.locator(".draft-choice").nth(1).click();
    await page.locator(".reason-choice").nth(0).click();
    await expect(page.locator('[data-action="reveal"]')).toBeEnabled();
    await page.locator(`[data-lang="${lang === "zh" ? "en" : "zh"}"]`).click();
    const nextLang = lang === "zh" ? "en" : "zh";
    await expect(page.locator("#progress-text")).toHaveText(nextLang === "zh" ? "第 2／3 步" : "Step 2 of 3");
    await expect(page.locator('input[name="draft"][value="2"]')).toBeChecked();
    await expect(page.locator('input[name="reason"][value="0"]')).toBeChecked();
    await page.locator(`[data-lang="${lang}"]`).click();
    await expect(page.locator("#progress-text")).toHaveText(lang === "zh" ? "第 2／3 步" : "Step 2 of 3");
    await expect(page.locator('input[name="draft"][value="2"]')).toBeChecked();
    await expect(page.locator('input[name="reason"][value="0"]')).toBeChecked();
    await page.locator('[data-action="reveal"]').click();
    await expect(page.locator("#progress-text")).toHaveText(lang === "zh" ? "第 3／3 步" : "Step 3 of 3");
    await expect(page.locator(".refinement-list li")).toHaveCount(3);
    await expect(page.locator('[data-action="roomverse"]')).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=${lang}&mood=rain`);
    await checkImages(page);
    await noOverflow(page);
    await page.screenshot({ path: `${shotDir}/${lang}-${width}-step3.png`, fullPage: true });

    await page.locator(`[data-lang="${lang}"]`).click();
    await expect(page.locator("#progress-text")).toHaveText(lang === "zh" ? "第 3／3 步" : "Step 3 of 3");
    await expect(page.locator(".refinement-list li")).toHaveCount(3);
    await page.locator('[data-action="restart"]').click();
    await expect(page.locator("#progress-text")).toHaveText(lang === "zh" ? "第 1／3 步" : "Step 1 of 3");
    await expect(page.locator("[data-mood]")).toHaveCount(2);
    await noOverflow(page);
  });
}

test("implementation stays preset-only and does not persist visitor choices", async () => {
  const source=readFileSync("public/prototype/feeling-to-room/app.js","utf8");
  expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
});

for (const mood of ["rain", "chic"]) {
  for (const draft of [1,2,3]) {
    test(`fixed result: ${mood} mood, draft ${draft}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/prototype/feeling-to-room/?lang=en");
      await page.locator(`[data-mood="${mood}"]`).click();
      await page.locator('[data-action="continue-mood"]').click();
      await page.locator(".draft-choice").nth(draft-1).click();
      await page.locator(".reason-choice").nth(2).click();
      await page.locator('[data-action="reveal"]').click();
      await expect(page.locator(".refinement-list li")).toHaveCount(3);
      await expect(page.locator(".selected-reason")).toContainText("Easy to care for");
      await expect(page.locator('[data-action="roomverse"]')).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=en&mood=${mood === "rain" ? "rain" : "chic"}`);
      await checkImages(page);
      await noOverflow(page);
    });
  }
}
