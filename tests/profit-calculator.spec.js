import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const ARTIFACTS = "/opt/cursor/artifacts/profit-calculator";

async function openCalculator(page) {
  const opener = page.locator("#open-profit-calculator");
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  const panel = page.locator("#profit-calculator");
  await expect(panel).toBeVisible();
  return panel;
}

async function overflowX(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function focusOutline(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
}

test.beforeAll(async () => {
  await mkdir(ARTIFACTS, { recursive: true });
});

test("number input and slider update the margin, then reset restores it", async ({ page }) => {
  await page.goto("/?lang=zh#trade-profit-navigator");
  const panel = await openCalculator(page);

  await expect(panel.getByRole("heading", { name: "先試算這張單的毛利" })).toBeVisible();
  await expect(panel.getByText("示範／虛構數字").first()).toBeVisible();
  await expect(panel.locator("[data-gross-profit]")).toHaveAttribute("data-gross-profit", "18000");
  await expect(panel.locator("[data-revenue]")).toHaveAttribute("data-revenue", "50000");
  await expect(panel.locator("[data-total-cost]")).toHaveAttribute("data-total-cost", "32000");
  await expect(panel.locator("[data-break-even]")).toHaveAttribute("data-break-even", "8");
  await expect(panel.locator("[data-margin]")).toHaveAttribute("data-margin", "0.36");
  await expect(panel.locator("[data-margin-warning]")).toHaveAttribute("data-margin-warning", "false");
  await expect(panel.getByText("毛利仍在 35% 底線之上")).toBeVisible();
  await expect(panel.getByText("虛構的美式純紙牆紙第一櫃：FOB 上海每卷 USD 10–15，MOQ 1,000 直米（約 122 卷），20 呎櫃估算 3,000–5,000 卷，訂金 30%，餘款出貨前付清。")).toBeVisible();
  await expect(panel.getByText("售價取這個區間的中間")).toHaveCount(0);
  await expect(panel.getByText("出口前費用（內陸運輸、報關、港雜）")).toBeVisible();
  await expect(panel.getByText("運費")).toHaveCount(0);
  await expect(panel.getByRole("link", { name: "打開完整的貿易利潤導航" })).toHaveAttribute("href", /trade-profit-navigator-demo/);

  await expect(panel).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#profit-sellingPrice")).toBeFocused();
  const numberOutline = await focusOutline(page.locator("#profit-sellingPrice"));
  expect(numberOutline.style).not.toBe("none");
  expect(numberOutline.width).toBeGreaterThan(0);
  await page.keyboard.press("Tab");
  await expect(page.locator("[data-field='sellingPrice'] input[type='range']")).toBeFocused();
  const sliderOutline = await focusOutline(page.locator("[data-field='sellingPrice'] input[type='range']"));
  expect(sliderOutline.style).not.toBe("none");
  expect(sliderOutline.width).toBeGreaterThan(0);

  await page.locator("#profit-sellingPrice").fill("12");
  await expect(panel.locator("[data-gross-profit]")).toHaveAttribute("data-gross-profit", "16000");
  await expect(panel.locator("[data-margin-warning]")).toHaveAttribute("data-margin-warning", "true");
  await expect(panel.getByText("低於 35% 毛利底線")).toBeVisible();
  await expect(panel.locator("[data-profit-live]")).toContainText("低於 35% 毛利底線");

  await page.locator("[data-field='purchaseCost'] input[type='range']").fill("8");
  await expect(page.locator("#profit-purchaseCost")).toHaveValue("8");
  await expect(panel.locator("[data-gross-profit]")).toHaveAttribute("data-gross-profit", "14000");
  await expect(panel.locator("[data-margin-warning]")).toHaveAttribute("data-margin-warning", "true");

  await page.getByRole("button", { name: "重設" }).click();
  await expect(page.locator("#profit-sellingPrice")).toHaveValue("12.5");
  await expect(panel.locator("[data-gross-profit]")).toHaveAttribute("data-gross-profit", "18000");
  await expect(panel.locator("[data-margin]")).toHaveAttribute("data-margin", "0.36");
  await expect(panel.locator("[data-margin-warning]")).toHaveAttribute("data-margin-warning", "false");
  await expect(panel.getByText("低於 35% 毛利底線")).toHaveCount(0);

  expect(await overflowX(page)).toBeLessThanOrEqual(1);
  await panel.screenshot({ path: `${ARTIFACTS}/zh-desktop.png` });
});

test("english copy, fictional label, and the full navigator link", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?lang=en#trade-profit-navigator");
  const panel = await openCalculator(page);
  await expect(panel.getByRole("heading", { name: "Try this order's margin" })).toBeVisible();
  await expect(panel.getByText("Demo with fictional numbers").first()).toBeVisible();
  await expect(panel.getByText("Fictional first container of American-style pure-paper wallpaper: FOB Shanghai USD 10–15 per roll, MOQ 1,000 linear meters (直米, about 122 rolls), a 20-foot container estimated at 3,000–5,000 rolls, 30% deposit, balance before shipment.")).toBeVisible();
  await expect(panel.getByText("middle of that band")).toHaveCount(0);
  await expect(panel.getByText("Pre-export costs (inland haulage, customs, port charges)")).toBeVisible();
  await expect(panel.getByText("Freight", { exact: true })).toHaveCount(0);
  await expect(panel.getByText("Below the 35% margin floor")).toHaveCount(0);
  await expect(panel.getByText("Margin is still above the 35% floor")).toBeVisible();
  await expect(panel.locator("[data-margin]")).toHaveAttribute("data-margin", "0.36");
  await expect(panel.getByRole("link", { name: "Open the full Trade Profit Navigator" })).toHaveAttribute("href", /[?&]lang=en/);

  await page.locator("#profit-freight").fill("8000");
  await expect(panel.locator("[data-margin-warning]")).toHaveAttribute("data-margin-warning", "true");
  await expect(panel.getByText("Below the 35% margin floor")).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(panel.locator("[data-margin-warning]")).toHaveAttribute("data-margin-warning", "false");
  expect(await overflowX(page)).toBeLessThanOrEqual(1);
  await panel.screenshot({ path: `${ARTIFACTS}/en-desktop.png` });
});

test("390px stays readable in both languages, including the floor warning", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?lang=zh#trade-profit-navigator");
  const panel = await openCalculator(page);
  await page.locator("#profit-sellingPrice").fill("10");
  await expect(panel.getByText("低於 35% 毛利底線")).toBeVisible();
  await expect(panel.locator("[data-break-even]")).toHaveAttribute("data-break-even", "8");
  expect(await overflowX(page)).toBeLessThanOrEqual(1);
  await panel.screenshot({ path: `${ARTIFACTS}/zh-mobile.png` });

  await page.goto("/?lang=en#trade-profit-navigator");
  const english = await openCalculator(page);
  await page.locator("#profit-sellingPrice").fill("10");
  await expect(english.getByText("Below the 35% margin floor")).toBeVisible();
  await expect(english.locator("[data-margin-warning]")).toHaveAttribute("data-margin-warning", "true");
  expect(await overflowX(page)).toBeLessThanOrEqual(1);
  await english.screenshot({ path: `${ARTIFACTS}/en-mobile.png` });
});

test("editing and reset do not call the network", async ({ page }) => {
  const calls = [];
  await page.goto("/?lang=zh#trade-profit-navigator");
  await openCalculator(page);
  await page.waitForLoadState("networkidle");
  page.on("request", (request) => {
    calls.push({ url: request.url(), type: request.resourceType() });
  });
  await page.locator("#profit-quantity").fill("1000");
  await page.locator("[data-field='freight'] input[type='range']").fill("4000");
  await page.getByRole("button", { name: "重設" }).click();
  await page.getByRole("button", { name: "複製試算結果" }).click();
  expect(calls.filter((call) => call.type === "xhr" || call.type === "fetch" || call.type === "websocket")).toEqual([]);
});
