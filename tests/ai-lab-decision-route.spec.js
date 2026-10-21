import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { NAV_CHAPTERS, TEXT } from "../public/ai-lab/content.js";
import { DEEP } from "../public/ai-lab/deep.js";
import { LATEST_TEXT } from "../public/ai-lab/latest.js";
import { ADOPTION, PART_TWO } from "../public/ai-lab/enterprise.js";

const PAGE = "/ai-lab/";
const screenshots = join(process.cwd(), "docs", "qa", "ai-lab-decision-route");
mkdirSync(screenshots, { recursive: true });

test("chapter 16 is in the nav once, and the scored teaching line is gone", () => {
  expect(NAV_CHAPTERS.filter(({ id }) => id === "c16")).toEqual([{ id: "c16", mark: "16" }]);
  expect(TEXT.zh.rail).toHaveLength(NAV_CHAPTERS.length);
  expect(TEXT.en.rail).toHaveLength(NAV_CHAPTERS.length);
  const closing = JSON.stringify(DEEP.zh.c12.closing) + JSON.stringify(DEEP.en.c12.closing);
  expect(closing).not.toMatch(/85/);
  expect(DEEP.zh.c12.closing.join("\n")).toContain("Paul 覺得這次教學最值得的，是對方親眼看到了成果。");
  expect(DEEP.en.c12.closing.join("\n")).toContain("For Paul, the most worthwhile part was that the decision-maker saw the results first-hand.");
  const lesson = DEEP.en.c12.cases[1];
  expect(lesson.what).toBe("Teach decision-makers to manage AI, not to write code first.");
  expect(lesson.found.startsWith("Decision-makers get dizzy")).toBe(true);
  expect(lesson.fix.startsWith("Start from what the decision-maker already does well")).toBe(true);
});

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`decision route ${lang} at ${width}px: fast path, two contact entries, screenshots`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${PAGE}?lang=${lang}`);
      const x = TEXT[lang];
      const fast = page.locator("#fast-route");
      const toc = page.locator("#toc");
      await expect(fast).toBeVisible();
      await expect(page.locator("#fast-route-title")).toHaveText(x.fastRoute.title);
      expect(await fast.evaluate((node) => {
        const tocNode = document.getElementById("toc");
        return Boolean(tocNode && (node.compareDocumentPosition(tocNode) & Node.DOCUMENT_POSITION_FOLLOWING));
      })).toBe(true);
      await expect(toc).toBeVisible();

      const steps = page.locator("#fast-route-steps a");
      await expect(steps).toHaveCount(8);
      const expected = [
        ["#c2", "02", x.c2.title],
        ["#c3", "03", x.c3.title],
        [`/ai-lab/enquiry-demo/?lang=${lang}`, "", x.fastRoute.enquiry],
        ["#c12", "12", DEEP[lang].c12.title],
        [`/ai-lab/guide/?lang=${lang}`, "", x.fastRoute.guide],
        ["#adopt", "", ADOPTION[lang].title],
        ["#c13", "13", PART_TWO[lang].title],
        ["#contact-cta", "", x.ctaTitle],
      ];
      for (const [index, [href, mark, label]] of expected.entries()) {
        await expect(steps.nth(index)).toHaveAttribute("href", href);
        await expect(steps.nth(index).locator(".n")).toHaveText(mark);
        await expect(steps.nth(index).locator(".fast-label")).toHaveText(label);
      }
      const heights = await steps.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
      for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
      const arrowsInside = await steps.evaluateAll((nodes) => nodes.map((link) => {
        const arrow = link.querySelector(".fast-arrow");
        if (!arrow || arrow.textContent !== "→") return false;
        const linkBox = link.getBoundingClientRect();
        const arrowBox = arrow.getBoundingClientRect();
        const pad = Number.parseFloat(getComputedStyle(link).paddingRight);
        return arrowBox.right <= linkBox.right - pad + 0.5 && arrowBox.left >= linkBox.left && arrowBox.left > linkBox.left + 24;
      }));
      expect(arrowsInside).toEqual([true, true, true, true, true, true, true, true]);

      await expect(page.locator("#cta-title")).toHaveText(x.ctaTitle);
      const choices = page.locator("#cta-choices a");
      await expect(choices).toHaveCount(2);
      for (const [index, choice] of x.ctaChoices.entries()) {
        await expect(choices.nth(index)).toHaveAttribute("href", `/?lang=${lang}#contact`);
        await expect(choices.nth(index).locator("strong")).toHaveText(choice.title);
        await expect(choices.nth(index).locator("span")).toHaveText(choice.body);
      }
      const choiceHeights = await choices.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
      for (const height of choiceHeights) expect(height).toBeGreaterThanOrEqual(44);

      await expect(page.locator("#latest-kicker")).toHaveText(LATEST_TEXT[lang].kicker);
      await expect(page.locator("#spirit-end a[href='#c4']")).toHaveCount(1);
      await expect(page.locator("#rail [data-target='c16']")).toHaveCount(1);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      await fast.screenshot({ path: join(screenshots, `${lang}-${width}-fast-route.png`) });
      await page.locator("#contact-cta").screenshot({ path: join(screenshots, `${lang}-${width}-cta.png`) });
    });
  }
}
