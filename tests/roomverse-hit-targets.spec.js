import { test, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const QA = "docs/qa/roomverse-hit-targets";

for (const lang of ["zh", "en"]) {
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    test(`${lang} ${width}px: transparent targets are at least 44px and options remain usable`, async ({ page }) => {
      await mkdir(QA, { recursive: true });
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${PAGE}?lang=${lang}&mood=tv&view=tv`);
      await page.locator("#enter").click();
      await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
      const toggle = page.locator("#panelToggle");
      if (await toggle.isVisible()) await toggle.click();
      await page.waitForTimeout(250);

      const metrics = await page.evaluate(() => {
        const expanded = (button) => {
          const rect = button.getBoundingClientRect();
          const style = getComputedStyle(button, "::before");
          const top = Math.abs(parseFloat(style.top) || 0), right = Math.abs(parseFloat(style.right) || 0);
          const bottom = Math.abs(parseFloat(style.bottom) || 0), left = Math.abs(parseFloat(style.left) || 0);
          return { visualWidth: rect.width, visualHeight: rect.height, hitWidth: rect.width + left + right, hitHeight: rect.height + top + bottom };
        };
        const groups = [...document.querySelectorAll("#panel .opts")].map((group) => ({
          name: group.previousElementSibling?.textContent ?? "",
          buttons: [...group.querySelectorAll("button")].map((button) => ({ label: button.textContent, ...expanded(button) })),
        }));
        const language = expanded(document.querySelector("#lang"));
        const tvView = document.querySelector(".camera-tv").getBoundingClientRect();
        return {
          viewport: { width: innerWidth, height: innerHeight },
          language,
          groups,
          tvView: { top: tvView.top, bottom: tvView.bottom, visualHeight: tvView.height },
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(metrics.documentWidth).toBe(width);
      expect(metrics.language.hitWidth).toBeGreaterThanOrEqual(44);
      expect(metrics.language.hitHeight).toBeGreaterThanOrEqual(44);
      expect(metrics.groups).toHaveLength(5);
      for (const group of metrics.groups) {
        expect(group.buttons.length, group.name).toBeGreaterThan(1);
        for (const button of group.buttons) {
          expect(button.hitWidth, `${group.name}: ${button.label}`).toBeGreaterThanOrEqual(44);
          expect(button.hitHeight, `${group.name}: ${button.label}`).toBeGreaterThanOrEqual(44);
        }
      }
      if (lang === "en" && width === 390) expect(metrics.tvView.bottom).toBeLessThanOrEqual(height);

      const before = JSON.parse(await readFile(`${QA}/before-${lang}-${width}.json`, "utf8"));
      expect(metrics.language.visualWidth).toBeCloseTo(before.languageToggle.width, 2);
      expect(metrics.language.visualHeight).toBeCloseTo(before.languageToggle.height, 2);
      expect(metrics.tvView.visualHeight).toBeCloseTo(before.tvView.height, 2);
      expect(metrics.tvView.bottom).toBeCloseTo(before.tvView.bottom, 2);
      expect(metrics.groups).toHaveLength(before.groups.length);
      for (const [groupIndex, group] of metrics.groups.entries()) {
        expect(group.buttons).toHaveLength(before.groups[groupIndex].buttons.length);
        for (const [buttonIndex, button] of group.buttons.entries()) {
          const oldButton = before.groups[groupIndex].buttons[buttonIndex];
          expect(button.visualWidth, `${group.name}: ${button.label} width stays unchanged`).toBeCloseTo(oldButton.width, 2);
          expect(button.visualHeight, `${group.name}: ${button.label} height stays unchanged`).toBeCloseTo(oldButton.height, 2);
        }
      }
      await writeFile(`${QA}/after-${lang}-${width}.json`, JSON.stringify({ before, after: metrics }, null, 2));
      await page.screenshot({ path: `${QA}/after-${lang}-${width}.png`, fullPage: true, animations: "disabled" });

      // Tap the transparent area just above one option in each group; the selected value must change.
      for (const group of await page.locator("#panel .opts").all()) {
        const target = group.locator("button").first();
        await group.locator("button").nth(1).click();
        await target.scrollIntoViewIfNeeded();
        const rect = await target.boundingBox();
        await page.mouse.click(rect.x + rect.width / 2, rect.y - 5);
        await expect(target).toHaveAttribute("aria-pressed", "true");
      }

      const languageButton = page.locator("#lang");
      await languageButton.scrollIntoViewIfNeeded();
      const languageRect = await languageButton.boundingBox();
      const originalLabel = await languageButton.textContent();
      await page.mouse.click(languageRect.x + languageRect.width / 2, languageRect.y - 5);
      await expect(languageButton).not.toHaveText(originalLabel);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

test("English 390x740 keeps the TV-wall button in the first screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${PAGE}?lang=en&mood=tv&view=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const rect = await page.locator(".camera-tv").boundingBox();
  expect(rect).not.toBeNull();
  expect(rect.y + rect.height).toBeLessThanOrEqual(740);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: `${QA}/after-en-390x740-tv-button.png`, fullPage: false, animations: "disabled" });
  await writeFile(`${QA}/after-en-390x740-tv-button.json`, JSON.stringify({ viewport: { width: 390, height: 740 }, button: rect }, null, 2));
});
