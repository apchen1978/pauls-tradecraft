import { expect, test } from "@playwright/test";

const DEMO = "https://apchen1978.github.io/quote-lens-demo/";

const COPY = {
  zh: {
    title: "Quote Lens — 賺錢不等於現金夠用",
    question: "這張報價賺錢，但你要先墊多少現金、什麼時候墊？",
    cta: "試用互動示範",
    labels: ["虛構情境", "互動原型"],
    href: DEMO,
  },
  en: {
    title: "Quote Lens — Profit Is Not Cash",
    question: "This quote is profitable, but how much cash do you have to front, and when?",
    cta: "Try the interactive demo",
    labels: ["Fictional scenarios", "Interactive prototype"],
    href: `${DEMO}?lang=en`,
  },
};

for (const width of [390, 1440]) {
  test.describe(`Quote Lens card at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the card states the business problem first, labels itself a fictional prototype, and links to the demo`, async ({ page }) => {
        const external = [];
        page.on("request", (request) => {
          if (!request.url().startsWith("http://127.0.0.1:4173")) external.push(request.url());
        });
        const c = COPY[lang];
        await page.goto(`/?lang=${lang}#quote-lens`);
        const card = page.locator("#quote-lens");
        await expect(card).toHaveCount(1);
        await card.scrollIntoViewIfNeeded();
        await expect(card.getByRole("heading", { level: 3, name: c.title })).toBeVisible();
        await expect(card).toContainText(c.question);
        await expect(card.locator("img").first()).toBeVisible();
        for (const label of c.labels) await expect(card).toContainText(label);
        await expect(card).toContainText(c.cta);
        const link = card.locator("a[href]").first();
        await expect(link).toHaveAttribute("href", c.href);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
        // the card sits in the experiments and prototypes section, not in the curated commercial wall
        await expect(page.locator("#works-catalog, #works").locator("#quote-lens")).toHaveCount(1);
        // nothing is fetched from outside the site while the portfolio loads (the demo is a link, not an embed)
        expect(external).toEqual([]);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the flagship "also explore" row links to the card, and the card leads the experiments`, async ({ page }) => {
        await page.goto(`/?lang=${lang}`);
        const nav = page.locator("#works-also-explore-nav");
        await expect(nav.locator('a[href="#quote-lens"]')).toHaveCount(1);
        // the two existing links are still there
        await expect(nav.locator('a[href="#global-business-development"]')).toHaveCount(1);
        await expect(nav.locator('a[href="#trade-profit-navigator"]')).toHaveCount(1);
        // in the experiments group the card now comes before the desktop pet (DOM order; on wide screens they can share a row)
        const cardFirst = await page.evaluate(() => {
          const a = document.getElementById("quote-lens");
          const b = document.getElementById("mg-desktop-pet");
          return Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
        });
        expect(cardFirst).toBe(true);
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the Trade Profit Navigator card carries a visible link to the Quote Lens demo`, async ({ page }) => {
        await page.goto(`/?lang=${lang}`);
        const link = page.locator('#trade-profit-navigator a[href^="https://apchen1978.github.io/quote-lens-demo/"]');
        await expect(link).toHaveCount(1);
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute("href", lang === "en" ? `${DEMO}?lang=en` : DEMO);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
        await expect(link).toContainText(lang === "en" ? "interactive prototype" : "互動原型");
        // the card's own primary link is unchanged
        await expect(page.locator('#trade-profit-navigator a[href*="trade-profit-navigator-demo"]').first()).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    for (const lang of ["zh", "en"]) {
      test(`${lang}: each "also explore" link carries a one-line question, and the links still work`, async ({ page }) => {
        await page.goto(`/?lang=${lang}`);
        const nav = page.locator("#works-also-explore-nav");
        const expected = lang === "zh"
          ? ["這個商機，值得先投入資源嗎？", "利潤還撐得住嗎？", "現金墊得起嗎？"]
          : ["Is this opportunity worth committing resources to first?", "Does the margin still hold?", "Can you afford to front the cash?"];
        for (const q of expected) await expect(nav).toContainText(q);
        for (const href of ["#global-business-development", "#trade-profit-navigator", "#quote-lens"]) {
          await expect(nav.locator(`a[href="${href}"]`)).toHaveCount(1);
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test("the card does not displace the existing experiments", async ({ page }) => {
      await page.goto("/?lang=zh");
      for (const id of ["mg-desktop-pet", "game", "simulations", "expense", "architecture-decision", "quote-lens"]) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }
    });
  });
}
