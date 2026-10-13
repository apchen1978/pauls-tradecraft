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
  test.describe(`Trade Street in the Showcase at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    for (const lang of ["zh", "en"]) {
      test(`${lang}: the card sits in the Showcase (not the Garage), carries the language, the cover and the teaching-sketch boundary`, async ({ page }) => {
        const c = COPY[lang];
        await page.goto(`/?lang=${lang}#showcase`);
        const showcase = page.locator("#showcase");
        const heading = showcase.getByRole("heading", { name: c.title });
        await expect(heading).toBeVisible();
        const card = heading.locator("xpath=ancestor::article[1]");
        await expect(card).toContainText(c.tag);
        await expect(card).toContainText(c.boundary);
        const link = card.getByRole("link", { name: c.cta, exact: true });
        const href = await link.getAttribute("href");
        expect(href).toContain("/prototype/trade-street/");
        expect(href).toContain(`lang=${lang}`);
        const img = card.locator("img");
        await expect(img).toHaveAttribute("src", "/images/showcase-trade-street-cover.webp");
        await expect(img).toHaveAttribute("width", "408");
        await expect(img).toHaveAttribute("height", "510");
        await expect(showcase.getByText(lang === "zh"
          ? "探索 AI 如何結合商業判斷、工作流程與互動工具，將想法轉化為可親自體驗的解決方案。"
          : "Explore how AI brings together business judgment, workflows and interactive tools to turn ideas into solutions you can try for yourself.")).toBeVisible();
        await expect(showcase.getByText(lang === "zh" ? "示範／成效未驗證。" : "Demo / outcomes not validated.")).toHaveCount(0);
        // promoted: it no longer appears among the Garage experiments
        await expect(page.locator("#garage").getByRole("heading", { name: c.title })).toHaveCount(0);
        await noOverflow(page);
        if (SHOTS) {
          await card.scrollIntoViewIfNeeded();
          await showcase.screenshot({ path: `${SHOTS}/showcase-${width}-${lang}.png` });
        }
      });
    }

    test("the toys row, the other stories and the rest of the Garage are still there", async ({ page }) => {
      await page.goto("/?lang=zh#garage");
      const branch = page.locator("#garage-branch-light-tech");
      await expect(branch.getByRole("heading", { name: "AI agent 聽得懂你的暗號嗎？" })).toBeVisible();
      await expect(page.locator("#garage").getByRole("heading", { name: "Bring Paul Into the Room · 先把問題帶進來" })).toBeVisible();
      await expect(page.locator("#garage")).toContainText("這裡放還在進行中的實驗。");
      for (const name of ["The Project Buyer · 專案型貿易商", "How Far to Bend · 保住客戶，讓到哪裡", "The Handback Sheet · 交接單"]) {
        await expect(page.locator("#garage").getByRole("heading", { name })).toBeVisible();
      }
    });
  });
}
