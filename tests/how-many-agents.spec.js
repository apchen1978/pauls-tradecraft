import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { calculateModel, MODEL } from "../public/prototype/how-many-agents/model.js";

const PAGE = "/prototype/how-many-agents/";
const screenshots = join(process.cwd(), "docs", "qa", "how-many-agents");
mkdirSync(screenshots, { recursive: true });

test("the illustrative model preserves its intended curves and guardrail effects", () => {
  const one = calculateModel({ agents: 1 });
  const four = calculateModel({ agents: 4 });
  const six = calculateModel({ agents: 6 });
  const twelve = calculateModel({ agents: 12 });
  expect(calculateModel({ agents: 6 }).cost - one.cost).toBeLessThan(twelve.cost - six.cost);
  expect(four.quality).toBeGreaterThan(one.quality);
  expect(six.quality).toBeGreaterThanOrEqual(four.quality);
  expect(six.quality).toBeGreaterThan(twelve.quality);
  for (let n = 1; n < MODEL.maxAgents; n++) expect(calculateModel({ agents: n + 1 }).riskScore).toBeGreaterThan(calculateModel({ agents: n }).riskScore);
  expect(calculateModel({ agents: 6, roles: true, budget: true, cap: true, signoff: true }).cost).toBeLessThan(six.cost);
  expect(calculateModel({ agents: 6, roles: true, budget: true, cap: true, signoff: true }).riskScore).toBeLessThan(six.riskScore);
  expect(calculateModel({ agents: 6, irreversible: true }).riskLevel).toBe("high");
  expect(calculateModel({ agents: 6, irreversible: true, signoff: true }).riskLevel).not.toBe("high");
  expect(calculateModel({ agents: 6, coordinator: true }).cost).toBeGreaterThan(six.cost);
  expect(calculateModel({ agents: 12, coordinator: true }).quality).toBeGreaterThan(twelve.quality);
  expect(calculateModel({ agents: 6, coordinator: true }).riskScore).toBeLessThan(six.riskScore);
  expect(calculateModel({ agents: 12, budget: true }).cost).toBeLessThanOrEqual(MODEL.budgetCostLimit);
  expect(calculateModel({ agents: 1, noLimit: true }).effectiveAgents).toBe(1 + MODEL.automaticExtraAgents);
  expect(calculateModel({ agents: 12, noLimit: true }).effectiveAgents).toBe(MODEL.maxAgents);
});

for (const lang of ["zh", "en"]) {
  test(`complete ${lang} flow at 390px, with first-screen controls visible`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=${lang}`);
    await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "1");
    await expect(page.locator("#scenario-task")).toBeVisible();
    await expect(page.locator("#agent-count")).toBeVisible();
    await expect(page.locator("#step-one-meters .meter")).toHaveCount(3);
    await page.locator("#agent-count").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#agent-value")).toHaveText("2");
    const firstScreen = await page.evaluate(() => {
      const slider = document.querySelector("#agent-count").getBoundingClientRect();
      const meters = document.querySelector("#step-one-meters").getBoundingClientRect();
      return { sliderBottom: slider.bottom, metersBottom: meters.bottom, viewport: innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    expect(firstScreen.sliderBottom).toBeLessThanOrEqual(firstScreen.viewport);
    expect(firstScreen.metersBottom).toBeLessThanOrEqual(firstScreen.viewport);
    expect(firstScreen.overflow).toBe(0);

    for (const count of [1, 6, 12]) {
      await page.locator("#agent-count").evaluate((input, value) => { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); }, String(count));
      await expect(page.locator("#agent-value")).toHaveText(String(count));
      await page.locator("#agent-count").blur();
      await page.screenshot({ path: join(screenshots, `${lang}-390-step1-agents-${count}.png`), fullPage: true });
    }
    await expect(page.locator("#no-limit")).toBeVisible();
    await page.locator("#no-limit").check();
    await expect(page.locator("#automatic-note")).toBeVisible();
    await page.locator("input[value='irreversible']").check();
    await expect(page.locator("#reversibility-note")).toBeVisible();

    await page.locator("#next-one").click();
    await expect(page.locator("#step-two")).toBeVisible();
    const beforeValues = await page.locator("#before-meters .meter-value").allTextContents();
    for (const id of ["roles", "budget", "cap", "signoff"]) await page.locator(`#${id}`).check();
    await page.locator("#coordinator").focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#coordinator")).toBeChecked();
    const afterValues = await page.locator("#after-meters .meter-value").allTextContents();
    expect(afterValues).not.toEqual(beforeValues);
    await expect(page.locator("#guardrail-effects li")).toHaveCount(4);
    await page.screenshot({ path: join(screenshots, `${lang}-390-step2-guardrails.png`), fullPage: true });

    await page.locator("#next-two").click();
    await expect(page.locator("#result-card")).toBeVisible();
    await expect(page.locator("#result-meters .meter")).toHaveCount(3);
    await expect(page.locator("#settings-list")).toContainText(lang === "zh" ? "固定分工" : "Fixed roles");
    await expect(page.locator("#takeaways .takeaway")).toHaveCount(5);
    await expect(page.locator("#chapter-14-link")).toHaveAttribute("href", `/ai-lab/?lang=${lang}#c14`);
    await expect(page.locator("#chapter-17-link")).toHaveAttribute("href", `/ai-lab/?lang=${lang}#c17`);
    await page.screenshot({ path: join(screenshots, `${lang}-390-step3-result.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    expect(await page.evaluate(() => Object.keys(localStorage).length)).toBe(0);
    const disallowed = ["中間層", "A2A", "CDD", "ROI", "轉換率", "成交率", "老闆", "董事長", "DeepSeek", "GrokBot", "Codex", "OpenAI", "Anthropic", "Claude", "Gemini", "ChatGPT"];
    const visibleCopy = await page.locator("body").innerText();
    for (const phrase of disallowed) expect(visibleCopy).not.toContain(phrase);
  });
}

for (const lang of ["zh", "en"]) {
  test(`the ${lang} tool remains within 1440px and controls are comfortably tappable`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${PAGE}?lang=${lang}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    for (const selector of ["#agent-count", "label[for='no-limit']", "#next-one"]) {
      const box = await page.locator(selector).boundingBox();
      expect(box.height, selector).toBeGreaterThanOrEqual(44);
    }
    await page.locator("#next-one").click();
    for (const selector of ["label[for='roles']", "label[for='budget']", "label[for='cap']", "label[for='signoff']", "label[for='coordinator']", "#next-two"]) {
      const box = await page.locator(selector).boundingBox();
      expect(box.height, selector).toBeGreaterThanOrEqual(44);
    }
  });

  test(`chapter entry links work in ${lang} at 1440px`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/ai-lab/?lang=${lang}#c14`);
    await expect(page.locator("#c14-agent-link-anchor")).toHaveAttribute("href", `${PAGE}?lang=${lang}`);
    await expect(page.locator("#c14-agent-link-title")).toBeVisible();
    await page.screenshot({ path: join(screenshots, `${lang}-1440-ai-lab-ch14.png`) });
    await page.locator("#c17-agent-link-anchor").scrollIntoViewIfNeeded();
    await expect(page.locator("#c17-agent-link-anchor")).toHaveAttribute("href", `${PAGE}?lang=${lang}`);
    await page.screenshot({ path: join(screenshots, `${lang}-1440-ai-lab-ch17.png`), fullPage: false });
    await page.goto(`${PAGE}?lang=${lang}`);
    await expect(page.locator("#page-title")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}
