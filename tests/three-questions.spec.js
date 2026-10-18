import { expect, test } from "@playwright/test";

// The three business questions: each names its business value, says its evidence level in plain words,
// links to the fuller evidence on this site, and the section hands over to "one deal" right below it.
const CARDS = {
  zh: [["lead", "找客戶", "/cases/overseas-lead-discovery/"], ["decision", "降風險", "/cases/commercial-decision-desk/"], ["margin", "守利潤", "#trade-profit-navigator"]],
  en: [["lead", "Find buyers", "/cases/overseas-lead-discovery/#en"], ["decision", "Reduce risk", "/cases/commercial-decision-desk/#en"], ["margin", "Protect margin", "#trade-profit-navigator"]],
};

async function emulateDesktopPointer(page) {
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const media = nativeMatchMedia(query);
      if (query !== "(hover: hover) and (pointer: fine) and (min-width: 1024px)") return media;
      return new Proxy(media, {
        get(target, property) {
          if (property === "matches") return true;
          const value = Reflect.get(target, property, target);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    };
  });
}

for (const lang of ["zh", "en"]) {
  test(`${lang} at 1440px: value tags, evidence lines, deeper links, and the hand-over to one deal`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await emulateDesktopPointer(page);
    await page.goto(`/?lang=${lang}`);
    await page.waitForFunction(() => Boolean(window.lenisVersion));
    const section = page.locator("#three-questions");
    const cards = section.locator("ol > li");
    await expect(cards).toHaveCount(3);
    for (const [i, [key, value, href]] of CARDS[lang].entries()) {
      const card = cards.nth(i);
      await expect(card).toContainText(value);
      await expect(card.locator(`#three-questions-${key}-detail`)).toContainText(lang === "zh" ? "證據：示範" : "Evidence: demo");
      await expect(card.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    // no outcome claims in the evidence lines
    await expect(section).not.toContainText(/ROI|轉換率|成交率/);
    await expect(section.locator('a[href="#one-deal"]')).toHaveCount(1);
    // the margin link lands on the Trade Profit Navigator card
    await section.locator('a[href="#trade-profit-navigator"]').click();
    await expect(page.locator("#trade-profit-navigator")).toBeInViewport({ timeout: 15000 });
  });
}

test("390px zh and en: the margin anchor lands after opening its card", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const lang of ["zh", "en"]) {
    await page.goto(`/?lang=${lang}`);
    const marginDetail = page.locator("#three-questions-margin-detail");
    await marginDetail.locator("xpath=preceding-sibling::button[1]").click();
    await page.locator('#three-questions a[href="#trade-profit-navigator"]').click();
    const target = page.locator("#trade-profit-navigator");
    await expect(target).toBeInViewport({ timeout: 15000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

test("390px: the value tag shows before opening; the evidence and deeper link sit in the opened card", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?lang=zh");
  const detail = page.locator("#three-questions-lead-detail");
  await expect(page.locator("#three-questions ol > li").first()).toContainText("找客戶");
  await expect(detail).toBeHidden();
  await detail.locator("xpath=preceding-sibling::button[1]").click();
  await expect(detail.locator('a[href="/cases/overseas-lead-discovery/"]')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
