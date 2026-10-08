import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const ARTIFACTS = "/opt/cursor/artifacts/trade-decision";

async function openWorkflow(page) {
  const opener = page.locator("#open-trade-decision-workflow");
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  const panel = page.locator("#trade-decision-workflow");
  await expect(panel).toBeVisible();
  return panel;
}

async function overflowX(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.beforeAll(async () => {
  await mkdir(ARTIFACTS, { recursive: true });
});

test("initial state, selection, and next/previous boundaries", async ({ page }) => {
  await page.goto("/?lang=zh#ai-native-market-entry");
  await openWorkflow(page);

  await expect(page.getByRole("heading", { name: "從詢盤到報價：六道關卡" })).toBeVisible();
  await expect(page.getByText("互動示範，使用合成資料。不會發生真實交易或授權。")).toBeVisible();
  await expect(page.getByText("示範／成效未驗證").first()).toBeVisible();
  await expect(page.locator("[data-progress]")).toHaveText("已通過 0／6");
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "PENDING");
  await expect(page.locator("#trade-stage-lead")).toContainText("待檢查");
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("aria-selected", "true");
  for (const id of ["qualification", "rfq", "risk-check", "quote", "approval"]) {
    await expect(page.locator(`#trade-stage-${id}`)).toHaveAttribute("data-status", "PENDING");
    await expect(page.locator(`#trade-stage-${id}`)).toContainText("待檢查");
  }
  await expect(page.locator("#trade-decision-workflow")).not.toContainText(/\b(PENDING|ACTIVE|PASSED|HOLD|BLOCKED|PASS|NEEDS_EVIDENCE|SIMULATED_APPROVAL|QUOTE_READY)\b/);

  await page.locator("#trade-stage-approval").click();
  await expect(page.locator("#trade-stage-approval")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#trade-stage-approval")).toHaveAttribute("data-status", "PENDING");
  await expect(page.locator("[data-progress]")).toHaveText("已通過 0／6");
  await expect(page.getByText("核准還沒有打開")).toBeVisible();

  await expect(page.getByRole("button", { name: "下一步" })).toBeDisabled();
  await page.locator("#trade-stage-lead").click();
  await expect(page.getByRole("button", { name: "上一步" })).toBeDisabled();
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.locator("#trade-stage-qualification")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "PENDING");
  await page.getByRole("button", { name: "上一步" }).click();
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("aria-selected", "true");
});

test("pass and hold change progress, and earlier gates block later ones", async ({ page }) => {
  await page.goto("/?lang=zh#ai-native-market-entry");
  await openWorkflow(page);

  await page.getByRole("button", { name: "標為通過" }).click();
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "PASSED");
  await expect(page.locator("#trade-stage-lead")).toContainText("已通過");
  await expect(page.locator("#trade-stage-qualification")).toHaveAttribute("data-status", "ACTIVE");
  await expect(page.locator("#trade-stage-qualification")).toContainText("進行中");
  await expect(page.locator("[data-progress]")).toHaveText("已通過 1／6");

  await page.getByRole("button", { name: "暫緩／需要證據" }).click();
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "HOLD");
  await expect(page.locator("#trade-stage-lead")).toContainText("暫緩");
  await expect(page.getByRole("button", { name: "暫緩／需要證據" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#trade-stage-qualification")).toHaveAttribute("data-status", "BLOCKED");
  await expect(page.locator("#trade-stage-qualification")).toContainText("受阻");
  await expect(page.locator("[data-progress]")).toHaveText("已通過 0／6");

  await page.locator("#trade-stage-rfq").click();
  await expect(page.locator("#trade-stage-rfq")).toHaveAttribute("data-status", "PENDING");
  await expect(page.getByText("前面還有關卡未通過")).toBeVisible();
  await page.getByRole("button", { name: "標為通過" }).click();
  await expect(page.locator("#trade-stage-rfq")).toHaveAttribute("data-status", "PENDING");
  await expect(page.locator("[data-progress]")).toHaveText("已通過 0／6");
});

test("downstream passes are invalidated, approval is simulated, and reset clears it", async ({ page }) => {
  await page.goto("/?lang=en#ai-native-market-entry");
  await openWorkflow(page);

  const pass = async (id) => {
    await page.locator(`#trade-stage-${id}`).click();
    const label = id === "approval" ? "Record simulated approval" : "Mark as passed";
    await page.getByRole("button", { name: label }).click();
  };

  await pass("lead");
  await pass("qualification");
  await pass("rfq");
  await page.locator("#trade-stage-risk-check").click();
  await page.getByRole("button", { name: "Simulate resolving payment-security evidence" }).click();
  await pass("risk-check");
  await pass("quote");
  await expect(page.getByText("QUOTE_READY · Ready for authorization review, not permission to issue.")).toBeVisible();
  await expect(page.locator("[data-approval-record]")).toHaveCount(0);

  await page.locator("#trade-stage-approval").click();
  await expect(page.getByText("Approval stays closed")).toHaveCount(0);
  await page.getByRole("button", { name: "Record simulated approval" }).click();
  await expect(page.locator("#trade-stage-approval")).toHaveAttribute("data-status", "PASSED");
  await expect(page.getByText("SIMULATED_APPROVAL · Simulated approval record.")).toBeVisible();
  await expect(page.locator("#trade-decision-workflow").getByText(/\bAUTHORIZED\b/)).toHaveCount(0);
  await expect(page.locator("[data-progress]")).toHaveText("6 of 6 passed");

  await page.locator("#trade-stage-lead").click();
  await page.getByRole("button", { name: "Hold / needs evidence" }).click();
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "HOLD");
  for (const id of ["qualification", "rfq", "risk-check", "quote", "approval"]) {
    await expect(page.locator(`#trade-stage-${id}`)).toHaveAttribute("data-status", "BLOCKED");
  }
  await expect(page.locator("[data-approval-record]")).toHaveCount(0);
  await expect(page.locator("[data-progress]")).toHaveText("0 of 6 passed");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("aria-selected", "true");
  for (const id of ["lead", "qualification", "rfq", "risk-check", "quote", "approval"]) {
    await expect(page.locator(`#trade-stage-${id}`)).toHaveAttribute("data-status", "PENDING");
    await expect(page.locator(`#trade-stage-${id}`)).toContainText("Pending");
  }
  await expect(page.locator("#trade-decision-workflow")).not.toContainText(/\b(PENDING|ACTIVE|PASSED|HOLD|BLOCKED)\b/);
  await expect(page.locator("[data-progress]")).toHaveText("0 of 6 passed");
  await expect(page.locator("[data-approval-record]")).toHaveCount(0);
});

test("risk check holds when payment security is missing and recovers through the simulated action", async ({ page }) => {
  await page.goto("/?lang=zh#ai-native-market-entry");
  await openWorkflow(page);

  for (const id of ["lead", "qualification", "rfq"]) {
    await page.locator(`#trade-stage-${id}`).click();
    await page.getByRole("button", { name: "標為通過" }).click();
    await expect(page.locator(`#trade-stage-${id}`)).toHaveAttribute("data-status", "PASSED");
  }

  await page.locator("#trade-stage-risk-check").click();
  await expect(page.getByText("付款保障：缺失 · 未查核")).toBeVisible();
  await expect(page.getByText("缺失的證據不能顯示為已查核")).toBeVisible();
  await page.getByRole("button", { name: "標為通過" }).click();
  await expect(page.locator("#trade-stage-risk-check")).toHaveAttribute("data-status", "ACTIVE");

  await page.getByRole("button", { name: "暫緩／需要證據" }).click();
  await expect(page.locator("#trade-stage-risk-check")).toHaveAttribute("data-status", "HOLD");
  await expect(page.locator("[data-progress]")).toHaveText("已通過 3／6");

  await page.getByRole("button", { name: "模擬補上付款保障證據" }).click();
  await expect(page.locator("[data-evidence]")).toHaveAttribute("data-evidence", "simulated");
  await expect(page.getByText("付款保障：模擬已補上 · 不是實際查核")).toBeVisible();
  await expect(page.locator("#trade-stage-risk-check")).toHaveAttribute("data-status", "HOLD");
  await expect(page.locator("[data-progress]")).toHaveText("已通過 3／6");

  await page.getByRole("button", { name: "標為通過" }).click();
  await expect(page.locator("#trade-stage-risk-check")).toHaveAttribute("data-status", "PASSED");
  await expect(page.locator("[data-progress]")).toHaveText("已通過 4／6");
});

test("language switch keeps workflow state", async ({ page }) => {
  await page.goto("/?lang=zh#ai-native-market-entry");
  await openWorkflow(page);
  await page.getByRole("button", { name: "標為通過" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "PASSED");
  await expect(page.locator("#trade-stage-qualification")).toHaveAttribute("aria-selected", "true");

  await page.getByRole("button", { name: "切換語言" }).click();
  await expect(page.getByRole("heading", { name: "From Inquiry to Quote: Six Decision Gates" })).toBeVisible();
  await expect(page.getByText("Interactive demonstration using synthetic data. No real transaction or authorization occurs.")).toBeVisible();
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "PASSED");
  await expect(page.locator("#trade-stage-qualification")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#trade-stage-qualification")).toHaveAttribute("data-status", "ACTIVE");
  await expect(page.locator("[data-progress]")).toHaveText("1 of 6 passed");
  await expect(page.getByText("Prepared by tools").first()).toBeVisible();
  await expect(page.getByText("Decided by a person").first()).toBeVisible();

  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(page.getByRole("heading", { name: "從詢盤到報價：六道關卡" })).toBeVisible();
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "PASSED");
  await expect(page.locator("#trade-stage-qualification")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-progress]")).toHaveText("已通過 1／6");
});

test("keyboard focus moves between gates without passing them", async ({ page }) => {
  await page.goto("/?lang=zh#ai-native-market-entry");
  await openWorkflow(page);
  await expect(page.locator("#trade-decision-workflow")).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.locator("#trade-stage-lead")).toBeFocused();
  const outline = await page.locator("#trade-stage-lead").evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(outline.style).not.toBe("none");
  expect(parseFloat(outline.width)).toBeGreaterThan(0);

  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#trade-stage-qualification")).toBeFocused();
  await expect(page.locator("#trade-stage-qualification")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#trade-stage-lead")).toHaveAttribute("data-status", "PENDING");
  await page.keyboard.press("End");
  await expect(page.locator("#trade-stage-approval")).toBeFocused();
  await expect(page.locator("#trade-stage-approval")).toHaveAttribute("data-status", "PENDING");
  await page.keyboard.press("Home");
  await expect(page.locator("#trade-stage-lead")).toBeFocused();
});

test("interactions do not make network calls", async ({ page }) => {
  const calls = [];
  await page.goto("/?lang=zh#ai-native-market-entry");
  await openWorkflow(page);
  await page.waitForLoadState("networkidle");
  page.on("request", (request) => {
    calls.push({ url: request.url(), type: request.resourceType() });
  });

  await page.getByRole("button", { name: "標為通過" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.locator("#trade-stage-risk-check").click();
  await page.getByRole("button", { name: "暫緩／需要證據" }).click();
  await page.getByRole("button", { name: "模擬補上付款保障證據" }).click();
  await page.getByRole("button", { name: "重設" }).click();

  expect(calls.filter((call) => call.type === "xhr" || call.type === "fetch" || call.type === "websocket")).toEqual([]);
  expect(calls).toEqual([]);
});

test("no horizontal overflow at 390px, with screenshots in both languages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?lang=zh#ai-native-market-entry");
  const panel = await openWorkflow(page);
  expect(await overflowX(page)).toBeLessThanOrEqual(1);
  await page.locator("#trade-stage-lead").click();
  await panel.screenshot({ path: `${ARTIFACTS}/zh-mobile.png` });

  await page.getByRole("button", { name: "切換語言" }).click();
  await expect(page.getByRole("heading", { name: "From Inquiry to Quote: Six Decision Gates" })).toBeVisible();
  for (const id of ["lead", "qualification", "rfq", "risk-check", "quote", "approval"]) {
    await page.locator(`#trade-stage-${id}`).click();
    expect(await overflowX(page)).toBeLessThanOrEqual(1);
  }
  await page.locator("#trade-stage-lead").click();
  await page.locator("#trade-decision-workflow").screenshot({ path: `${ARTIFACTS}/en-mobile.png` });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator("#trade-decision-workflow").scrollIntoViewIfNeeded();
  expect(await overflowX(page)).toBeLessThanOrEqual(1);
  await page.locator("#trade-decision-workflow").screenshot({ path: `${ARTIFACTS}/en-desktop.png` });

  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(page.getByRole("heading", { name: "從詢盤到報價：六道關卡" })).toBeVisible();
  await page.locator("#trade-stage-lead").click();
  await page.locator("#trade-decision-workflow").screenshot({ path: `${ARTIFACTS}/zh-desktop.png` });
  expect(await overflowX(page)).toBeLessThanOrEqual(1);
});
