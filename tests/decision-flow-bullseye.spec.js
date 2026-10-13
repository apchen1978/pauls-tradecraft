import { expect, test } from "@playwright/test";

async function openFlow(page, lang = "zh") {
  await page.goto(`/?lang=${lang}`);
  const figure = page.locator(".decision-flow").first();
  await figure.scrollIntoViewIfNeeded();
  return figure;
}

test.describe("market-signal animation ends on a bullseye (desktop)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const lang of ["zh", "en"]) {
    test(`${lang}: the arrow is replaced by a target; the released signal hits it and the animation completes`, async ({ page }) => {
      const problems = [];
      page.on("pageerror", (error) => problems.push(String(error)));
      const figure = await openFlow(page, lang);
      await expect(figure).toHaveAttribute("data-complete", "true", { timeout: 15000 });
      await expect(page.locator(".decision-flow__arrow")).toHaveCount(0);
      await expect(page.locator(".decision-flow__target .decision-flow__ring")).toHaveCount(2);
      await expect(page.locator(".decision-flow__target .decision-flow__bull")).toHaveCount(1);
      const state = await page.evaluate(() => {
        const target = document.querySelector(".decision-flow__target");
        const hit = document.querySelector(".decision-flow__hit-ring");
        const signal = document.querySelector('.decision-flow__signal[data-fate="3"]');
        return { targetOpacity: Number(getComputedStyle(target).opacity), hitOpacity: Number(getComputedStyle(hit).opacity), signalOpacity: Number(getComputedStyle(signal).opacity) };
      });
      expect(state.targetOpacity).toBe(1);
      expect(state.hitOpacity).toBe(0);
      expect(state.signalOpacity).toBe(0);
      expect(problems).toEqual([]);
    });
  }

  test("with reduced motion the target is simply there, finished", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const figure = await openFlow(page);
    await expect(figure).toHaveAttribute("data-complete", "true");
    await expect(page.locator(".decision-flow__target")).toBeVisible();
    expect(await page.evaluate(() => Number(getComputedStyle(document.querySelector(".decision-flow__target")).opacity))).toBe(1);
  });
});

test.describe("market-signal animation on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the last stage's marker is ringed like a target, and nothing overflows", async ({ page }) => {
    const figure = await openFlow(page);
    // on a phone the steps open on tap
    await page.locator('[aria-controls="decision-flow-more"]').first().click();
    const content = await page.evaluate(() => getComputedStyle(document.querySelector(".decision-flow__stage:nth-child(5)"), "::after").content);
    expect(content).toBe('""');
    await expect(figure).toHaveAttribute("data-complete", "true", { timeout: 15000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
