import { expect, test } from "@playwright/test";

const overflowX = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function openCalculator(page, lang) {
  await page.goto(`/?lang=${lang}#trade-profit-navigator`);
  const opener = page.locator("#open-profit-calculator");
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  const panel = page.locator("#profit-calculator");
  await expect(panel).toBeVisible();
  return panel;
}

async function openWorkflow(page, lang) {
  await page.goto(`/?lang=${lang}#ai-native-market-entry`);
  const opener = page.locator("#open-trade-decision-workflow");
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  const panel = page.locator("#trade-decision-workflow");
  await expect(panel).toBeVisible();
  return panel;
}

for (const width of [390, 1440]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    test("margin: the judgment follows the numbers (zh)", async ({ page }) => {
      const panel = await openCalculator(page, "zh");
      const card = panel.locator("[data-judgment]");
      await expect(card).toHaveAttribute("data-judgment", "c1");
      await expect(card).toContainText("Paul 會先看");
      await expect(card).toContainText("Paul 的經驗判斷");
      await expect(card).toContainText("毛利還撐得住，但出貨前要先墊 17,000。我會先談訂金，再談價格。");

      await panel.locator("#profit-sellingPrice").fill("12");
      await expect(card).toHaveAttribute("data-judgment", "c2");
      await expect(card).toContainText("價格一往下，毛利就薄。");

      await panel.locator("#profit-sellingPrice").fill("12.5");
      await panel.locator("#profit-depositPct").fill("20");
      await expect(card).toHaveAttribute("data-judgment", "c3");

      await panel.locator("#profit-depositPct").fill("100");
      await expect(card).toHaveAttribute("data-judgment", "c4");
      await expect(card).toContainText("尾款有沒有保障");

      await panel.locator("#profit-purchaseCost").fill("");
      await expect(card).toHaveAttribute("data-judgment", "c5");
      await expect(card).toContainText("我不會當成 0 去算");
      expect(await overflowX(page)).toBeLessThanOrEqual(0);
    });

    test("margin: English wording, with the cash figure filled in", async ({ page }) => {
      const panel = await openCalculator(page, "en");
      const card = panel.locator("[data-judgment]");
      await expect(card).toContainText("What Paul looks at first");
      await expect(card).toContainText("Paul's experience-based judgment");
      await expect(card).toContainText("USD 17,000");
    });

    test("gates: the judgment follows the stage and the payment evidence", async ({ page }) => {
      const panel = await openWorkflow(page, "zh");
      const card = panel.locator("[data-judgment]");
      await expect(card).toHaveAttribute("data-judgment", "g1");
      await expect(card).toContainText("我先看這封詢盤是誰寄的");
      await expect(card).toContainText("Paul 的經驗判斷");

      await panel.locator("#trade-stage-rfq").click();
      await expect(card).toHaveCount(0);

      await panel.locator("#trade-stage-risk-check").click();
      await expect(card).toHaveAttribute("data-judgment", "g2");
      await expect(card).toContainText("付款沒有保障之前，我不往報價走。");
      await panel.getByRole("button", { name: "模擬補上付款保障證據" }).click();
      await expect(card).toHaveAttribute("data-judgment", "g3");

      await panel.locator("#trade-stage-quote").click();
      await expect(card).toHaveAttribute("data-judgment", "g4");
      await panel.locator("#trade-stage-approval").click();
      await expect(card).toHaveCount(0);
      expect(await overflowX(page)).toBeLessThanOrEqual(0);
    });
  });
}
