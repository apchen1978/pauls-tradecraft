import { expect, test } from "@playwright/test";
import { resolveChoices, TYPES } from "../prototype/teammate-type/app.js";

// Card 022 (December Lights): the "代價：／Cost:" line on the result card, between the profile lines and the voice buttons.
const LABEL = { zh: "代價：", en: "Cost: " };
const LETTERS = "ABCDEFGH";
const CODE = {};
for (const a of LETTERS) for (const b of LETTERS) for (const c of LETTERS) {
  const type = resolveChoices(`${a}${b}${c}`)?.type;
  if (type && !CODE[type]) CODE[type] = `${a}${b}${c}`;
}

test("every one of the sixteen roles has a code to open", () => {
  expect(Object.keys(CODE).sort()).toEqual(Object.keys(TYPES).sort());
  expect(Object.keys(CODE)).toHaveLength(16);
});

for (const id of Object.keys(TYPES)) {
  test(`${id}: the cost line shows in zh and en, follows the language switch, and sits between the profile and the voices`, async ({ page }) => {
    await page.goto(`/prototype/teammate-type/?c=${CODE[id]}&lang=zh`);
    const cost = page.locator("#cost");
    await expect(cost).toBeVisible();
    await expect(cost).toHaveText(`${LABEL.zh}${TYPES[id].zh.cost}`);
    await page.locator('#lang-group button[data-set-lang="en"]').click();
    await expect(cost).toHaveText(`${LABEL.en}${TYPES[id].en.cost}`);
    await page.locator('#lang-group button[data-set-lang="zh"]').click();
    await expect(cost).toHaveText(`${LABEL.zh}${TYPES[id].zh.cost}`);
    // order on the card: profile, then cost, then the voice buttons
    const y = async (selector) => (await page.locator(selector).boundingBox()).y;
    expect(await y("#profile")).toBeLessThan(await y("#cost"));
    expect(await y("#cost")).toBeLessThan(await y("#tones"));
  });
}

test("cost lines carry no digits and none of the retired words", () => {
  for (const id of Object.keys(TYPES)) {
    for (const lang of ["zh", "en"]) {
      const text = TYPES[id][lang].cost;
      expect(text, `${id} ${lang}`).not.toMatch(/\d/);
      expect(text, `${id} ${lang}`).not.toMatch(/魔法|法師|法術|咒|巫|遠燈鎮|fairy|magic|spell/i);
    }
  }
});

for (const width of [390, 1440]) {
  test.describe(`cost line at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 900 } });

    for (const lang of ["zh", "en"]) {
      test(`${lang}: no sideways scroll and at most two lines for all sixteen roles`, async ({ page }) => {
        for (const id of Object.keys(TYPES)) {
          await page.goto(`/prototype/teammate-type/?c=${CODE[id]}&lang=${lang}`);
          await expect(page.locator("#cost")).toBeVisible();
          const measured = await page.locator("#cost").evaluate((node) => {
            const style = getComputedStyle(node);
            const box = node.getBoundingClientRect();
            return { height: box.height, lineHeight: parseFloat(style.lineHeight), padding: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom), overflow: document.documentElement.scrollWidth > window.innerWidth };
          });
          const lines = Math.round((measured.height - measured.padding) / measured.lineHeight);
          expect(lines, `${id} ${lang} at ${width}`).toBeLessThanOrEqual(2);
          expect(measured.overflow, `${id} ${lang} at ${width}`).toBe(false);
        }
      });
    }
  });
}

test("the download card still downloads with the cost line on it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  for (const [lang, button] of [["zh", "下載角色卡"], ["en", "Download card"]]) {
    await page.goto(`/prototype/teammate-type/?c=${CODE.finisher}&lang=${lang}`);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: button }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(`teammate-${CODE.finisher}.png`);
  }
});
