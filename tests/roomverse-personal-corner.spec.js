import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const STORAGE_KEY = "roomverse-personal-corner-v1";

async function captureRoom(page, path) {
  const panel = page.locator("#panel");
  const visibility = await panel.evaluate((node) => { const value = node.style.visibility; node.style.visibility = "hidden"; return value; });
  try { await page.locator("#stage").screenshot({ path }); }
  finally { await panel.evaluate((node, value) => { node.style.visibility = value; }, visibility); }
}

test("visitor corner stays in this browser, allows three generated items, and fits desktop and phone", async ({ page }) => {
  test.setTimeout(300000);
  await mkdir("docs/qa/roomverse-personal-corner", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  console.log(`Generated item geometry vertices: ${JSON.stringify(await page.evaluate(() => window.__room.cornerVertexCounts()))}`);
  await captureRoom(page, "docs/qa/roomverse-personal-corner/empty.png");
  await page.locator("#panelToggle").click();

  const section = page.locator(".personal-corner");
  await expect(section.locator(".corner-count")).toHaveText("已擺 0/3 件");
  await expect(section.locator(".corner-privacy")).toHaveText("只存在你的瀏覽器，不會上傳。");
  await section.locator('button[data-key="plant"]').click();
  await expect(section.locator(".corner-count")).toHaveText("已擺 1/3 件");
  await captureRoom(page, "docs/qa/roomverse-personal-corner/one.png");
  for (const key of ["frame", "cup"]) await section.locator(`button[data-key="${key}"]`).click();
  await expect(section.locator(".corner-count")).toHaveText("已擺 3/3 件");
  await expect(section.locator('button[data-key="book"]')).toBeDisabled();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY)).toEqual(["plant", "frame", "cup"]);
  expect(page.url()).not.toContain("corner");

  await captureRoom(page, "docs/qa/roomverse-personal-corner/1440.png");
  await page.reload();
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.locator("#panelToggle").click();
  await expect(page.locator('.personal-corner button[data-key="plant"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".corner-count")).toHaveText("已擺 3/3 件");
  await page.locator("#lang").click();
  await expect(page.locator(".corner-privacy")).toHaveText("Saved only in this browser. Nothing is uploaded.");
  await page.locator("#lang").click();

  await page.setViewportSize({ width: 390, height: 844 });
  const mobilePanelHeight = await page.locator(".personal-corner").evaluate((node) => Math.ceil(node.getBoundingClientRect().height));
  console.log(`390px personal-corner section height: ${mobilePanelHeight}px`);
  await page.locator('.personal-corner button[data-key="cup"]').click();
  await page.locator('.personal-corner button[data-key="vase"]').click();
  await expect(page.locator(".corner-count")).toHaveText("已擺 3/3 件");
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY)).toEqual(["plant", "frame", "vase"]);
  await page.evaluate(() => scrollTo(0, 0));
  await captureRoom(page, "docs/qa/roomverse-personal-corner/390.png");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

});

test("room remains usable when browser storage is blocked", async ({ browser }) => {
  test.setTimeout(300000);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  try {
    await context.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("Blocked", "SecurityError"); } });
    });
    const page = await context.newPage();
    await page.goto(`${PAGE}?lang=zh`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    await page.locator("#panelToggle").click();
    await expect(page.locator(".corner-storage")).toHaveText("這個瀏覽器目前無法儲存，重新載入後會清空。");
    await page.locator('.personal-corner button[data-key="plant"]').click();
    await expect(page.locator(".corner-count")).toHaveText("已擺 1/3 件");
    expect(await page.evaluate(() => Boolean(window.__room))).toBe(true);
  } finally {
    await context.close();
  }
});
