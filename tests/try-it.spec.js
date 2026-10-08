import { expect, test } from "@playwright/test";

const CASES = [
  { lang: "zh", cta: "試算毛利", panel: "#profit-calculator" },
  { lang: "zh", cta: "走一遍六道關卡", panel: "#trade-decision-workflow" },
  { lang: "en", cta: "Try the margin", panel: "#profit-calculator" },
  { lang: "en", cta: "Walk the six gates", panel: "#trade-decision-workflow" },
];

for (const width of [390, 1440]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    for (const c of CASES) {
      test(`${c.lang}: "${c.cta}" opens its tool in place and moves focus`, async ({ page }) => {
        const external = [];
        page.on("request", (request) => {
          if (!request.url().startsWith("http://127.0.0.1:4173")) external.push(request.url());
        });
        await page.goto(`/?lang=${c.lang}`);
        const entry = page.locator("#try-it");
        await entry.scrollIntoViewIfNeeded();
        await entry.getByRole("button", { name: c.cta }).click();
        const panel = page.locator(c.panel);
        await expect(panel).toBeVisible();
        await expect(panel).toBeFocused();
        expect(page.url()).toContain("127.0.0.1:4173");
        expect(external).toEqual([]);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test("both entries are reachable by keyboard and show a fictional-data note", async ({ page }) => {
      await page.goto("/?lang=zh");
      const entry = page.locator("#try-it");
      await expect(entry.getByRole("button")).toHaveCount(2);
      await entry.getByRole("button").first().focus();
      await expect(entry.getByRole("button").first()).toBeFocused();
      await expect(entry.getByText("虛構")).toBeVisible();
    });
  });
}

test("390: both entry buttons are visible after one screen of scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?lang=zh");
  await page.waitForTimeout(1500);
  const scrollY = await page.evaluate(() => window.scrollY);
  const buttons = page.locator("#try-it").getByRole("button");
  for (let i = 0; i < 2; i += 1) {
    const box = await buttons.nth(i).boundingBox();
    const bottom = box.y + scrollY + box.height;
    expect(bottom).toBeLessThan(844 * 2);
  }
});
