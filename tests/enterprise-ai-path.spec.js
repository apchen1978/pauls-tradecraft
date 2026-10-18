import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { COPY, PREREQUISITES, SCENARIOS, STATIONS } from "../public/prototype/enterprise-ai-path/content.js";

const PAGE = "/prototype/enterprise-ai-path/";
const shots = process.env.ENTERPRISE_AI_PATH_QA_DIR || resolve("output", "enterprise-ai-path");
mkdirSync(shots, { recursive: true });
const noOverflow = async (page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
async function start(page, lang, scenario) {
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.locator(`[data-scenario="${scenario}"]`).click();
  await page.locator("#begin").click();
  await expect(page.locator("#route")).toBeVisible();
}
async function add(page, id) {
  await page.locator(`[data-station="${id}"]`).click();
  await page.locator("#add-station").click();
}

test("prerequisite data and bilingual content stay in parity", () => {
  expect(SCENARIOS).toHaveLength(3);
  expect(STATIONS).toHaveLength(7);
  for (const id of STATIONS) {
    expect(PREREQUISITES[id]).toBeDefined();
    for (const lang of ["zh", "en"]) {
      const station = COPY[lang].stations[id];
      expect(station.name && station.detail && station.gate && station.consequence && station.imageAlt).toBeTruthy();
    }
  }
});

test("each fictional starting point has a stable first move", async ({ page }) => {
  const first = { scattered: "data", individual: "learn", underused: "tools" };
  for (const scenario of SCENARIOS) {
    await start(page, "zh", scenario);
    if (scenario === "underused") await expect(page.locator("#starting-foundation")).toContainText(COPY.zh.stations.learn.name);
    await add(page, first[scenario]);
    await expect(page.locator("#journey li.steady")).toHaveCount(1);
  }
});

for (const lang of ["zh", "en"]) for (const width of [390, 1440]) {
  test(`${lang} ${width}: all starts, early consequence, route summary, loaded art and showcase`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${PAGE}?lang=${lang}`);
    await expect(page.locator("#begin")).toBeDisabled();
    await expect(page.locator(".scenario")).toHaveCount(3);
    await expect(page.locator(".hero-art img")).toHaveAttribute("src", "assets/cover.webp");
    for (const scenario of SCENARIOS) {
      await start(page, lang, scenario);
      await expect(page.locator(".station")).toHaveCount(7);
      await add(page, "search");
      await expect(page.locator("#journey li.unsteady")).toHaveCount(1);
      await expect(page.locator("#feedback")).toContainText(COPY[lang].feedbackBad);
      await noOverflow(page);
      if (scenario === "scattered") await page.screenshot({ path: resolve(shots, `unsteady-${lang}-${width}.png`), fullPage: true });
      await add(page, "data");
      await expect(page.locator("#journey li.steady")).toHaveCount(1);
      await page.locator("#summary-button").click();
      await expect(page.locator("#summary")).toBeVisible();
      await expect(page.locator("#summary-route li")).toHaveCount(2);
      await expect(page.locator("#unstable-list")).toContainText(COPY[lang].stations.search.consequence);
      await expect(page.locator("#first-step")).toHaveText(COPY[lang].scenarios[scenario].first);
      await noOverflow(page);
      if (scenario === "scattered") await page.screenshot({ path: resolve(shots, `summary-${lang}-${width}.png`), fullPage: true });
      await page.locator("#change-start").click();
      await expect(page.locator("#start")).toBeVisible();
    }
    await noOverflow(page);
    await page.goto(`/?lang=${lang}#showcase`);
    const card = page.locator('#showcase article').filter({ has: page.locator('img[src="/prototype/enterprise-ai-path/assets/cover-mobile.webp"]') });
    await expect(card).toHaveCount(1);
    await expect(card.locator("a")).toHaveAttribute("href", `${PAGE}?lang=${lang}`);
    await expect(card.locator("img")).toHaveAttribute("alt", /.+/);
    await expect.poll(() => card.locator("img").evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    await noOverflow(page);
  });
}

for (const lang of ["zh", "en"]) {
  test(`${lang}: foundations, language switch, keyboard, replay and all image assets`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await start(page, lang, "individual");
    await page.locator('[data-station="learn"]').focus(); await page.keyboard.press("Enter");
    await expect(page.locator('[data-station="learn"]')).toHaveAttribute("aria-pressed", "true");
    await page.locator("#add-station").focus(); await page.keyboard.press("Enter");
    await add(page, "tools"); await add(page, "context"); await add(page, "data"); await add(page, "search"); await add(page, "connect"); await add(page, "collaborate");
    await expect(page.locator("#journey li.unsteady")).toHaveCount(0);
    const other = lang === "zh" ? "en" : "zh";
    await page.locator(`[data-lang="${other}"]`).click();
    await expect(page).toHaveURL(new RegExp(`lang=${other}`));
    await expect(page.locator("#journey li")).toHaveCount(7);
    await expect(page.locator("#route-title")).toHaveText(COPY[other].routeTitle);
    await page.locator("#summary-button").click();
    await expect(page.locator("#unstable-list")).toHaveText(COPY[other].noUnstable);
    await page.locator("#restart").click();
    await expect(page.locator("#journey li")).toHaveCount(0);
    await expect(page.locator("#route")).toBeVisible();
    await page.locator(`[data-lang="${lang}"]`).click();
    await expect(page.locator("#route-title")).toHaveText(COPY[lang].routeTitle);
    await expect.poll(() => page.locator("img").evaluateAll((images) => images.every((img) => img.hasAttribute("alt") && img.alt.length > 0 && img.complete && img.naturalWidth > 0))).toBe(true);
    await noOverflow(page);
  });
}
