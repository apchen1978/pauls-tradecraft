import fs from "node:fs";
import { expect, test, webkit } from "@playwright/test";

// WebKit (iPhone Safari engine) may break "17,000" after the comma when CJK text sits next to it.
// Needs a WebKit build: set PW_WEBKIT_PATH to a Playwright WebKit executable if the one this
// Playwright version expects is not installed. Without any WebKit build the file is skipped.
const executablePath = process.env.PW_WEBKIT_PATH || webkit.executablePath();
const hasWebKit = Boolean(executablePath) && fs.existsSync(executablePath);
const SITE = process.env.SITE_URL || "";

test.skip(!hasWebKit, "no WebKit build installed (set PW_WEBKIT_PATH)");
test.use({
  browserName: "webkit",
  channel: undefined,
  launchOptions: { executablePath },
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

// For every number-like run of text inside the panel, the number must occupy one line box.
async function splitNumbers(page, panelSelector) {
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    const pattern = /\d+(?:[,.]\d+)*(?:[–-]\d+(?:[,.]\d+)*)?%?/g;
    const split = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement.closest("input, textarea, script, style")) continue;
      const text = node.nodeValue;
      for (const match of text.matchAll(pattern)) {
        if (!/[,–-]/.test(match[0])) continue; // single digits cannot split
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0);
        const lines = new Set(rects.map((r) => Math.round(r.top)));
        if (lines.size > 1) split.push(match[0]);
      }
    }
    return split;
  }, panelSelector);
}

for (const lang of ["zh", "en"]) {
  test(`${lang}: numbers in the margin tool are not split across lines`, async ({ page }) => {
    await page.goto(`${SITE}/?lang=${lang}#trade-profit-navigator`);
    await page.waitForTimeout(1500);
    await page.locator("#open-profit-calculator").scrollIntoViewIfNeeded();
    await page.locator("#open-profit-calculator").click();
    const panel = page.locator("#profit-calculator");
    await expect(panel).toBeVisible();
    await expect(panel.locator("[data-judgment]")).toHaveAttribute("data-judgment", "c1");
    expect(await splitNumbers(page, "#profit-calculator")).toEqual([]);
  });

  test(`${lang}: numbers in the six-gate tool are not split across lines`, async ({ page }) => {
    await page.goto(`${SITE}/?lang=${lang}#ai-native-market-entry`);
    await page.waitForTimeout(1500);
    await page.locator("#open-trade-decision-workflow").scrollIntoViewIfNeeded();
    await page.locator("#open-trade-decision-workflow").click();
    await expect(page.locator("#trade-decision-workflow")).toBeVisible();
    expect(await splitNumbers(page, "#trade-decision-workflow")).toEqual([]);
  });
}
