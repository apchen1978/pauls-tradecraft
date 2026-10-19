import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "docs/qa/hero-work-titles-gold";
const samples = [
  { name: "390x844-zh", width: 390, height: 844, lang: "zh" },
  { name: "390x844-en", width: 390, height: 844, lang: "en" },
  { name: "360x740-en", width: 360, height: 740, lang: "en" },
  { name: "1440x1000-zh", width: 1440, height: 1000, lang: "zh" },
];

for (const sample of samples) {
  test(`hero work titles use the kicker color and preserve layout (${sample.name})`, async ({ page }) => {
    await mkdir(output, { recursive: true });
    await page.setViewportSize({ width: sample.width, height: sample.height });
    await page.goto(`/?lang=${sample.lang}`, { waitUntil: "networkidle" });
    const titles = page.locator('[data-testid="hero-works"] a > span > span:first-child');
    await expect(titles).toHaveCount(3);
    await expect(page.locator("#top > div.relative p.text-amber")).toBeVisible();

    // Restore the exact previous utility class for a reviewable before/after pair.
    await titles.evaluateAll((nodes) => nodes.forEach((node) => {
      node.classList.remove("text-amber");
      node.classList.add("text-ink");
    }));
    await page.screenshot({ path: `${output}/before-${sample.name}.png` });
    await titles.evaluateAll((nodes) => nodes.forEach((node) => {
      node.classList.remove("text-ink");
      node.classList.add("text-amber");
    }));
    await page.screenshot({ path: `${output}/after-${sample.name}.png` });

    const colors = await page.evaluate(() => {
      const kicker = document.querySelector("#top > div.relative p.text-amber");
      const titles = [...document.querySelectorAll('[data-testid="hero-works"] a > span > span:first-child')];
      return {
        kicker: getComputedStyle(kicker).color,
        titles: titles.map((node) => getComputedStyle(node).color),
        cardClass: document.querySelector('[data-testid="hero-works"] a').className,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    expect(colors.titles).toEqual([colors.kicker, colors.kicker, colors.kicker]);
    expect(colors.cardClass).toContain("bg-white/85");
    expect(colors.scrollWidth).toBeLessThanOrEqual(sample.width);
  });
}
