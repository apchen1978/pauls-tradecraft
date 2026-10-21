import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { NAV_CHAPTERS, TEXT } from "../public/ai-lab/content.js";
import { ADOPTION } from "../public/ai-lab/enterprise.js";
import { ENQUIRY } from "../public/ai-lab/enquiry-demo/content.js";

const PAGE = "/ai-lab/";
const screenshotDir = join(process.cwd(), "docs", "qa", "ai-lab-roadmap");
mkdirSync(screenshotDir, { recursive: true });

test("chapter numbers stay put, and the five steps stay plain", () => {
  expect(NAV_CHAPTERS.map(({ id, mark }) => `${id}:${mark}`)).toEqual([
    "c0:00", "c1:01", "c2:02", "c3:03", "c4:04", "c5:05", "c6:06", "c7:07", "c8:08",
    "c9:09", "c10:10", "c11:11", "c12:12", "part2:II", "c13:13", "c14:14", "c15:15",
    "c16:16", "c17:17", "latest:NEW",
  ]);
  expect(TEXT.zh.rail).toHaveLength(NAV_CHAPTERS.length);
  expect(TEXT.en.rail).toHaveLength(NAV_CHAPTERS.length);
  expect(Object.keys(ADOPTION.zh)).toEqual(Object.keys(ADOPTION.en));
  expect(ADOPTION.zh.steps).toHaveLength(5);
  expect(ADOPTION.en.steps).toHaveLength(5);
  for (const lang of ["zh", "en"]) {
    expect(ADOPTION[lang].steps.map((step) => step.title)).toEqual([...new Set(ADOPTION[lang].steps.map((step) => step.title))]);
    for (const step of ADOPTION[lang].steps) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.body.length).toBeGreaterThan(step.title.length);
    }
  }
  const blob = JSON.stringify(ADOPTION);
  expect(blob).not.toMatch(/\d|ROI|轉換率|成交率|保證|guarantee|老闆|老板|中間層|\bA2A\b|\bCDD\b|前職|Former role|\bowner\b|\bboss\b|壁紙|牆紙|wallpaper|ChatGPT|Claude|Codex/i);
  expect(ADOPTION.zh.steps[0].body).toContain("窗簾");
  expect(ADOPTION.zh.steps[0].body).toContain("壁布");
  expect(ADOPTION.zh.steps[0].body).toContain("地毯");
  expect(ADOPTION.en.steps[0].body).toContain("curtains");
  expect(ADOPTION.en.steps[0].body).toContain("fabric-backed wallcovering");
  expect(ADOPTION.en.steps[0].body).toContain("rugs");
  expect(ADOPTION.zh.steps[3].body).toContain("幾週");
  expect(ADOPTION.en.steps[3].body).toContain("a few weeks");
});

async function noOverflow(page) {
  const sizes = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
  expect(sizes.document).toBe(0);
  expect(sizes.body).toBe(0);
}

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`adoption roadmap ${lang} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${PAGE}?lang=${lang}`);

      const x = ADOPTION[lang];
      const placedBeforeChapter = await page.evaluate(() => {
        const part = document.getElementById("part2");
        const adopt = document.getElementById("adopt");
        const chapter = document.getElementById("c13");
        if (!part || !adopt || !chapter) return false;
        const afterPart = Boolean(part.compareDocumentPosition(adopt) & Node.DOCUMENT_POSITION_FOLLOWING);
        return afterPart && adopt.nextElementSibling === chapter;
      });
      expect(placedBeforeChapter).toBe(true);
      await expect(page.locator("#c13-no")).toHaveText("13");
      await expect(page.locator("#rail [data-target='c13'] .mono")).toHaveText("13");
      await expect(page.locator("#rail [data-target='part2'] + [data-target='c13']")).toHaveCount(1);

      await expect(page.locator("#adopt-title")).toHaveText(x.title);
      await expect(page.locator("#adopt-lead")).toHaveText(x.lead);
      await expect(page.locator("#adopt-steps li")).toHaveCount(5);
      for (const [index, step] of x.steps.entries()) {
        const item = page.locator("#adopt-steps li").nth(index);
        await expect(item.locator("h3")).toHaveText(step.title);
        await expect(item.locator("p")).toHaveText(step.body);
        await expect(item.locator(".adopt-no")).toHaveText(String(index + 1));
      }
      await expect(page.locator("#adopt-note")).toHaveText(x.note);

      const links = page.locator("#adopt-links a");
      await expect(links).toHaveCount(2);
      await expect(links.nth(0)).toHaveAttribute("href", `/ai-lab/enquiry-demo/?lang=${lang}`);
      await expect(links.nth(0)).toHaveText(TEXT[lang].c3.journey);
      await expect(links.nth(1)).toHaveAttribute("href", "#contact-cta");
      await expect(links.nth(1)).toHaveText(TEXT[lang].ctaChoices[0].title);
      const linkHeights = await links.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
      for (const height of linkHeights) expect(height).toBeGreaterThanOrEqual(44);

      const route = page.locator("#fast-route-steps a[href='#adopt']");
      await expect(route.locator(".fast-label")).toHaveText(x.title);
      const nextHref = await route.evaluate((node) => node.closest("li")?.nextElementSibling?.querySelector("a")?.getAttribute("href"));
      expect(nextHref).toBe("#c13");
      expect((await route.boundingBox()).height).toBeGreaterThanOrEqual(44);

      await page.locator("#adopt").scrollIntoViewIfNeeded();
      await noOverflow(page);
      await page.locator("#adopt").screenshot({ path: join(screenshotDir, `${lang}-${width}.png`) });

      await links.nth(1).click();
      await expect(page.locator("#contact-cta")).toBeInViewport();
      await expect(page.locator("#cta-choices strong").first()).toHaveText(TEXT[lang].ctaChoices[0].title);

      await links.nth(0).click();
      await expect(page).toHaveURL(new RegExp(`/ai-lab/enquiry-demo/\\?lang=${lang}`));
      await expect(page.locator("#title")).toHaveText(ENQUIRY[lang].title);
      await noOverflow(page);
    });
  }
}
