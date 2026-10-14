import { expect, test } from "@playwright/test";
import { FACTIONS, TONES, TYPES } from "../prototype/teammate-type/app.js";

// Card 022 (December Lights) face v2: the empty "play this scene" state, one voice at a time, and the team motto.
const BAD = {
  zh: "這組字母還找不到對應的角色，檢查一下朋友的三個字母。",
  en: "These letters haven't found a role yet. Check the three letters your friend sent.",
};
const NEED = { zh: "先選一個角色", en: "Pick a role first" };
const LABEL = {
  zh: ["搞笑", "溫和", "文青", "長處"],
  en: ["Funny", "Gentle", "Literary", "Strength"],
};

for (const lang of ["zh", "en"]) {
  test(`${lang}: play-this-scene is disabled with a hint when nothing is chosen, and a wrong code still gets the old message`, async ({ page }) => {
    await page.goto(`/prototype/teammate-type/?c=AAA&lang=${lang}`);
    const open = page.locator("#duo-open");
    const status = page.locator("#duo-status");
    await expect(open).toBeDisabled();
    await expect(status).toHaveText(NEED[lang]);
    await expect(status).not.toHaveText(BAD[lang]);

    await page.locator("#duo-code").fill("ZZZ");
    await expect(open).toBeEnabled();
    await open.click();
    await expect(status).toHaveText(BAD[lang]);

    await page.locator("#duo-code").fill("");
    await expect(open).toBeDisabled();
    await expect(status).toHaveText(NEED[lang]);

    await page.locator("#duo-pick").selectOption("cocoa");
    await expect(page.locator("#duo-stage")).toBeVisible();
    await expect(status).not.toHaveText(BAD[lang]);
  });

  test(`${lang}: one voice at a time, funny first, nothing written to the address or the browser`, async ({ page }) => {
    await page.goto(`/prototype/teammate-type/?c=AAA&lang=${lang}`);
    const buttons = page.locator("#tones button");
    await expect(buttons).toHaveText(LABEL[lang]);
    const urlBefore = page.url();
    await expect(page.locator("#lines .line")).toHaveCount(1);
    await expect(page.locator("#lines .line-funny")).toBeVisible();
    await expect(buttons.nth(0)).toHaveAttribute("aria-pressed", "true");

    for (let i = 0; i < TONES.length; i += 1) {
      await buttons.nth(i).click();
      await expect(page.locator("#lines .line")).toHaveCount(1);
      await expect(page.locator(`#lines .line-${TONES[i]}`)).toBeVisible();
      await expect(page.locator(`#lines .line-${TONES[i]} .line-body`)).toContainText(TYPES.umbrella[lang][TONES[i]]);
      for (let j = 0; j < TONES.length; j += 1) {
        await expect(buttons.nth(j)).toHaveAttribute("aria-pressed", i === j ? "true" : "false");
      }
      await expect(buttons.nth(i)).toBeFocused();
    }
    expect(page.url()).toBe(urlBefore);
    const stored = await page.evaluate(() => ({ local: localStorage.length, cookie: document.cookie }));
    expect(stored).toEqual({ local: 0, cookie: "" });

    await page.reload();
    await expect(page.locator("#tones button").nth(0)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#lines .line-funny")).toBeVisible();
  });

  test(`${lang}: the team motto sits under the team label`, async ({ page }) => {
    await page.goto(`/prototype/teammate-type/?c=AAA&lang=${lang}`);
    await expect(page.locator("#faction-motto")).toHaveText(FACTIONS[TYPES.umbrella.faction].motto[lang]);
  });
}

test("390: the card does not overflow sideways with the voice buttons and the motto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  for (const lang of ["zh", "en"]) {
    await page.goto(`/prototype/teammate-type/?c=AAA&lang=${lang}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
