import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "docs/qa/home-interactive-heading";
const samples = [
  { name: "390-zh", width: 390, height: 844, lang: "zh" },
  { name: "390-en", width: 390, height: 844, lang: "en" },
  { name: "1440-zh", width: 1440, height: 1000, lang: "zh" },
  { name: "1440-en", width: 1440, height: 1000, lang: "en" },
];

const variants = {
  before: { eyebrow: "text-moss", head: "text-ink" },
  A: { eyebrow: "text-amber", head: "text-amber" },
  B: { eyebrow: "text-amber", head: "bg-gradient-to-r from-ink to-amber bg-clip-text text-transparent" },
};

for (const sample of samples) {
  test(`showcase heading colours stay readable and do not overflow (${sample.name})`, async ({ page }) => {
    await mkdir(output, { recursive: true });
    await page.setViewportSize({ width: sample.width, height: sample.height });
    await page.goto(`/?lang=${sample.lang}`, { waitUntil: "networkidle" });
    const section = page.locator("#showcase");
    await section.scrollIntoViewIfNeeded();
    const eyebrow = section.locator("p").first();
    const head = page.locator("#showcase-heading");
    const all = ["text-moss", "text-ink", "text-amber", "bg-gradient-to-r", "from-ink", "to-amber", "bg-clip-text", "text-transparent"];
    for (const [key, v] of Object.entries(variants)) {
      await eyebrow.evaluate((n, [rm, add]) => { n.classList.remove(...rm); n.classList.add(...add.split(" ")); }, [all, v.eyebrow]);
      await head.evaluate((n, [rm, add]) => { n.classList.remove(...rm); n.classList.add(...add.split(" ")); }, [all, v.head]);
      const box = await section.boundingBox();
      await page.screenshot({ path: `${output}/${key}-${sample.name}.png`, fullPage: true, clip: { x: 0, y: box.y + (await page.evaluate(() => window.scrollY)), width: sample.width, height: sample.width > 700 ? 340 : 300 } });
      const m = await page.evaluate(() => {
        const h = document.querySelector("#showcase-heading");
        return { scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, hw: h.scrollWidth, cw: h.clientWidth };
      });
      expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth);
      expect(m.hw).toBeLessThanOrEqual(m.cw + 1);
    }
    // shipped state = A
    await eyebrow.evaluate((n, [rm, add]) => { n.classList.remove(...rm); n.classList.add(add); }, [all, "text-amber"]);
    await head.evaluate((n, [rm, add]) => { n.classList.remove(...rm); n.classList.add(add); }, [all, "text-amber"]);
    const colors = await page.evaluate(() => ({
      e: getComputedStyle(document.querySelector("#showcase p")).color,
      h: getComputedStyle(document.querySelector("#showcase-heading")).color,
    }));
    expect(colors.e).toBe("rgb(138, 106, 43)");
    expect(colors.h).toBe("rgb(138, 106, 43)");
  });
}
