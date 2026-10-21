import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { PART_TWO } from "../public/ai-lab/enterprise.js";

const shots = join(process.cwd(), "docs", "qa", "ai-lab-enterprise-roadmap");
mkdirSync(shots, { recursive: true });

const HREFS = ["#c13", "#c14", "#c15", "#c16", "#c17"];

test("enterprise roadmap copy is the five chapter themes, in both languages", () => {
  expect(PART_TWO.zh.rolloutTitle).toBe("企業導入五步");
  expect(PART_TWO.en.rolloutTitle).toBe("Five steps to bring AI into a company");
  expect(PART_TWO.zh.rollout.map((step) => step.href)).toEqual(HREFS);
  expect(PART_TWO.en.rollout.map((step) => step.href)).toEqual(HREFS);
  expect(PART_TWO.zh.rollout.map((step) => step.label)).toEqual([
    "權限",
    "先讓人用，再讓 agent 上場",
    "一句話變成工具",
    "把判斷寫下來",
    "工具登記冊",
  ]);
  expect(PART_TWO.en.rollout.map((step) => step.label)).toEqual([
    "Permissions",
    "People first, then agents",
    "A sentence becomes a tool",
    "Write the judgment down",
    "The tool register",
  ]);
  const blob = [
    PART_TWO.zh.rolloutTitle, PART_TWO.en.rolloutTitle,
    PART_TWO.zh.rolloutLead, PART_TWO.en.rolloutLead,
    ...PART_TWO.zh.rollout.map((step) => step.label),
    ...PART_TWO.en.rollout.map((step) => step.label),
  ].join("\n");
  expect(blob).not.toMatch(/ROI|轉換率|成交率|保證|guarantee|老闆|老板|owner|boss|前職|Former role/i);
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
    test(`enterprise roadmap ${lang} at ${width}px: five links, direction, screenshots`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/ai-lab/?lang=${lang}#part2`);

      const x = PART_TWO[lang];
      await expect(page.locator("#rollout-title")).toHaveText(x.rolloutTitle);
      await expect(page.locator("#rollout-lead")).toHaveText(x.rolloutLead);
      const links = page.locator("#rollout-steps a");
      await expect(links).toHaveCount(5);
      await expect(page.locator("#rollout .rollout-arrow")).toHaveCount(4);

      for (const [index, step] of x.rollout.entries()) {
        const link = links.nth(index);
        await expect(link).toHaveAttribute("href", step.href);
        await expect(link).toContainText(step.label);
        await expect(page.locator(step.href)).toHaveCount(1);
        const box = await link.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
      }

      const direction = await page.locator("#rollout-steps").evaluate((node) => getComputedStyle(node).flexDirection);
      expect(direction).toBe(width === 390 ? "column" : "row");
      const first = await links.nth(0).boundingBox();
      const second = await links.nth(1).boundingBox();
      if (width === 390) expect(second.y).toBeGreaterThan(first.y + first.height - 1);
      else expect(second.x).toBeGreaterThan(first.x + first.width * 0.5);

      const order = await page.evaluate(() => {
        const rollout = document.querySelector("#rollout");
        const chapter = document.querySelector("#c13");
        return {
          inside: Boolean(rollout.closest("#part2")),
          before: Boolean(rollout.compareDocumentPosition(chapter) & Node.DOCUMENT_POSITION_FOLLOWING),
        };
      });
      expect(order.inside).toBe(true);
      expect(order.before).toBe(true);
      await noOverflow(page);
      await page.locator("#part2").screenshot({ path: join(shots, `${lang}-${width}.png`) });

      await links.nth(4).click();
      await expect(page).toHaveURL(/#c17$/);
      await expect(page.locator("#c17")).toBeAttached();
    });
  }
}
