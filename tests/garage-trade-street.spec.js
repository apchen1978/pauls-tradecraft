import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

const SHOTS = process.env.TRADE_STREET_SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const COPY = {
  zh: {
    title: "貿易街 · 一櫃貨出海",
    cta: "走一趟",
    tag: "教學玩具 · 雙語原型",
    boundary: "教學示意，不含具體天數、費用或比例",
  },
  en: {
    title: "Trade Street · One Container Ships",
    cta: "Walk the street",
    tag: "Teaching toy · bilingual prototype",
    boundary: "A teaching sketch with no specific days, costs or percentages",
  },
};

async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

for (const width of [390, 1440]) {
  test.describe(`Trade Street in the Garage at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the card sits in the light-tech row, carries the language, and says it is a teaching sketch`, async ({ page }) => {
        const c = COPY[lang];
        await page.goto(`/?lang=${lang}#garage`);
        const branch = page.locator("#garage-branch-light-tech");
        const heading = branch.getByRole("heading", { name: c.title });
        await expect(heading).toBeVisible();
        const card = heading.locator("xpath=ancestor::*[self::li or self::article][1]");
        await expect(card).toContainText(c.tag);
        await expect(card).toContainText(c.boundary);
        const link = card.getByRole("link", { name: c.cta, exact: true });
        const href = await link.getAttribute("href");
        expect(href).toContain("/prototype/trade-street/");
        expect(href).toContain(`lang=${lang}`);
        // it is an experiment, not a showcase piece
        await expect(page.locator("#showcase").getByRole("heading", { name: c.title })).toHaveCount(0);
        await noOverflow(page);
        if (SHOTS) {
          await heading.scrollIntoViewIfNeeded();
          await branch.screenshot({ path: `${SHOTS}/garage-${width}-${lang}.png` });
        }
      });
    }

    test("the other experiments in the row and the Garage are still there", async ({ page }) => {
      await page.goto("/?lang=zh#garage");
      const branch = page.locator("#garage-branch-light-tech");
      await expect(branch.getByRole("heading", { name: "AI agent 聽得懂你的暗號嗎？" })).toBeVisible();
      await expect(page.locator("#garage").getByRole("heading", { name: "Bring Paul Into the Room · 先把問題帶進來" })).toBeVisible();
      await expect(page.locator("#garage")).toContainText("這裡放還在進行中的實驗。");
    });
  });
}
