import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const evidence = "docs/qa/ai-lab-home-entry";
const samples = [
  { lang: "zh", width: 390, height: 844, name: "mobile-zh" },
  { lang: "en", width: 390, height: 844, name: "mobile-en" },
  { lang: "zh", width: 1440, height: 1000, name: "desktop-zh" },
  { lang: "en", width: 1440, height: 1000, name: "desktop-en" },
];

for (const sample of samples) {
  test(`AI Lab is a vivid, full-size homepage feature (${sample.name})`, async ({ page }) => {
    await page.setViewportSize({ width: sample.width, height: sample.height });
    await page.goto(`/?lang=${sample.lang}`, { waitUntil: "networkidle" });
    const section = page.locator("#ai-lab");
    await section.evaluate((element) => {
      const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - headerHeight - 12 });
    });
    const strings = sample.lang === "zh"
      ? { title: "AI 不只會回答。它能和你一起，把事情做完。", cta: "走進實驗室", gallery: "畫廊 × AI", music: "Music Lounge × AI" }
      : { title: "AI doesn't just answer. It works with you to get things done.", cta: "Enter the lab", gallery: "Gallery × AI", music: "Music Lounge × AI" };
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(strings.title);
    await expect(section.getByRole("link", { name: strings.cta })).toHaveAttribute("href", `/ai-lab/?lang=${sample.lang}`);
    await expect(section.getByRole("link", { name: strings.gallery })).toHaveAttribute("href", `/gallery/?lang=${sample.lang}`);
    await expect(section.getByRole("link", { name: strings.music })).toHaveAttribute("href", `/music-lounge/?lang=${sample.lang}`);
    const art = section.locator("figure img");
    await expect.poll(() => art.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const artBounds = await art.boundingBox();
    expect(artBounds.width).toBeGreaterThan(sample.width === 390 ? 300 : 500);
    await mkdir(evidence, { recursive: true });
    await section.screenshot({ path: `${evidence}/${sample.name}.png` });
  });
}
