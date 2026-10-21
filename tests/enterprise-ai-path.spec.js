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
  expect(COPY.zh.title).toBe("先走哪一步，才踩得住？");
  expect(COPY.zh.subtitle).toBe("企業 AI 路線");
  expect(COPY.en.title).toBe("Which Step Holds?");
  expect(COPY.en.subtitle).toBe("The enterprise AI path");
  expect(SCENARIOS).toHaveLength(3);
  expect(STATIONS).toHaveLength(7);
  expect(COPY.zh.stations.collaborate.imageAlt).toBe("三個部門由一座橋連成一體。");
  expect(COPY.en.stations.collaborate.imageAlt).toBe("Three department blocks joined by one bridge.");
  expect(COPY.zh.label).toBe("示範／虛構情境，成效未驗證。所有回應預先寫好，不代表實際企業或模型表現。");
  expect(COPY.en.label).toBe("Demo / fictional scenario; outcomes not validated. Every response is prewritten; it does not show a real company or model result.");
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
    await page.locator("#summary-button").click();
    if (scenario === "underused") await expect(page.locator("#summary-foundation")).toContainText(COPY.zh.stations.learn.name);
  }
});

for (const lang of ["zh", "en"]) for (const width of [390, 1440]) {
  test(`${lang} ${width}: all starts, early consequence, route summary, loaded art and showcase`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${PAGE}?lang=${lang}`);
    await expect(page.locator("#title")).toHaveText(COPY[lang].title);
    await expect(page.locator(".hero-subtitle")).toHaveText(COPY[lang].subtitle);
    const headingSize = Number.parseFloat(await page.locator("#title").evaluate((node) => getComputedStyle(node).fontSize));
    const subtitleSize = Number.parseFloat(await page.locator(".hero-subtitle").evaluate((node) => getComputedStyle(node).fontSize));
    const leadSize = Number.parseFloat(await page.locator(".lead").evaluate((node) => getComputedStyle(node).fontSize));
    expect(subtitleSize).toBeLessThan(headingSize);
    expect(subtitleSize).toBeLessThan(leadSize);
    await page.screenshot({ path: resolve(shots, `hero-${lang}-${width}.png`) });
    await expect(page.locator("#begin")).toBeDisabled();
    await expect(page.locator(".scenario")).toHaveCount(3);
    await expect(page.locator(".hero-art img")).toHaveAttribute("src", "assets/cover.webp");
    for (const scenario of SCENARIOS) {
      await start(page, lang, scenario);
      await expect(page.locator(".station")).toHaveCount(7);
      if (scenario === "scattered") await page.screenshot({ path: resolve(shots, `stations-${lang}-${width}.png`), fullPage: true });
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
    const card = page.locator('#showcase article').filter({ has: page.locator(`a[href="${PAGE}?lang=${lang}"]`) });
    await expect(card).toHaveCount(1);
    await expect(card.locator("a:not(:has(img))")).toHaveAttribute("href", `${PAGE}?lang=${lang}`);
    await expect(card.locator("img")).toHaveAttribute("alt", /.+/);
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.locator("img").evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    await card.locator("img").evaluate((img) => img.decode());
    if (width === 390) await card.screenshot({ path: resolve(shots, `showcase-card-${lang}-390.png`) });
    await noOverflow(page);
  });
}

for (const lang of ["zh", "en"]) for (const [width, height] of [[390, 844], [1440, 1000]]) {
  test(`${lang} ${width}: first action, selected state, route progress and touch targets`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=${lang}`);
    await expect(page.locator("#start-title")).toBeVisible();
    const firstCard = page.locator(".scenario").first();
    const firstCardBox = await firstCard.boundingBox();
    expect(firstCardBox).not.toBeNull();
    expect(firstCardBox.y).toBeLessThan(height);
    const visibleCardHeight = Math.max(0, Math.min(firstCardBox.y + firstCardBox.height, height) - Math.max(firstCardBox.y, 0));
    expect(visibleCardHeight).toBeGreaterThanOrEqual(width === 390 ? firstCardBox.height / 2 : firstCardBox.height);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: resolve(shots, `first-${lang}-${width}.png`) });

    const before = await firstCard.evaluate((button) => ({
      pressed: button.getAttribute("aria-pressed"),
      background: getComputedStyle(button).backgroundColor,
      borderWidth: getComputedStyle(button).borderTopWidth,
      actionDisabled: document.querySelector("#begin").disabled,
      actionBackground: getComputedStyle(document.querySelector("#begin")).backgroundColor,
    }));
    await firstCard.click();
    await expect(firstCard).toHaveAttribute("aria-pressed", "true");
    await expect(firstCard.locator(".scenario-selected")).toBeVisible();
    await expect(page.locator("#begin")).toBeEnabled();
    const after = await firstCard.evaluate((button) => ({
      background: getComputedStyle(button).backgroundColor,
      borderWidth: getComputedStyle(button).borderTopWidth,
      actionBackground: getComputedStyle(document.querySelector("#begin")).backgroundColor,
    }));
    expect(before.pressed).toBe("false");
    expect(before.actionDisabled).toBe(true);
    expect(after.borderWidth).toBe("3px");
    expect(before.background).not.toBe(after.background);
    expect(before.actionBackground).not.toBe(after.actionBackground);
    await noOverflow(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: resolve(shots, `selected-${lang}-${width}.png`) });

    if (width === 390) {
      const targets = await page.evaluate(() => Object.fromEntries([
        ["起點卡", document.querySelector(".scenario")],
        ["語言切換", document.querySelector('[data-lang="zh"]')],
        ["主要按鈕", document.querySelector("#begin")],
        ["返回連結", document.querySelector("#footer-link")],
      ].map(([name, element]) => { const box = element.getBoundingClientRect(); return [name, [Math.round(box.width), Math.round(box.height)]]; })));
      expect(Object.values(targets).every(([w, h]) => w >= 44 && h >= 44)).toBe(true);
      console.log("390 initial touch target sizes", JSON.stringify(targets));
    }

    await page.locator("#begin").click();
    await expect(page.locator("#route-progress")).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("#route-progress")).toHaveText(lang === "zh" ? `已排 0／${STATIONS.length} 站` : `0 of ${STATIONS.length} stops`);
    const station = page.locator(".station").first();
    if (width === 390) {
      const stationBox = await station.boundingBox();
      const routeButtonBox = await page.locator("#add-station").boundingBox();
      const summaryButtonBox = await page.locator("#summary-button").boundingBox();
      expect(stationBox.width).toBeGreaterThanOrEqual(44);
      expect(stationBox.height).toBeGreaterThanOrEqual(44);
      expect(routeButtonBox.height).toBeGreaterThanOrEqual(44);
      expect(summaryButtonBox.height).toBeGreaterThanOrEqual(44);
      console.log("390 route touch target sizes", JSON.stringify({ "站點卡": [Math.round(stationBox.width), Math.round(stationBox.height)], "路線主要按鈕": [Math.round(routeButtonBox.width), Math.round(routeButtonBox.height)], "路線摘要按鈕": [Math.round(summaryButtonBox.width), Math.round(summaryButtonBox.height)] }));
    }
    await station.click();
    await page.locator("#add-station").click();
    await expect(page.locator("#route-progress")).toHaveText(lang === "zh" ? `已排 1／${STATIONS.length} 站` : `1 of ${STATIONS.length} stops`);
    await page.locator("#route-progress").scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(shots, `progress-${lang}-${width}.png`) });
    await noOverflow(page);
  });
}

test("zh 1280x800: first starting card is fully visible in the first screen", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${PAGE}?lang=zh`);
  const heading = await page.locator("#start-title").boundingBox();
  const card = await page.locator(".scenario").first().boundingBox();
  expect(heading.y + heading.height).toBeLessThanOrEqual(800);
  expect(card.y).toBeLessThanOrEqual(700);
  expect(card.y + card.height).toBeLessThanOrEqual(800);
  await page.screenshot({ path: resolve(shots, "first-zh-1280x800.png") });
});

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

for (const lang of ["zh", "en"]) {
  test(`${lang}: station card surfaces match all seven icon edge pixels in route and summary`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await start(page, lang, "scattered");
    await expect.poll(() => page.locator(".station img").evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0))).toBe(true);
    const mismatches = await page.locator(".station").evaluateAll((buttons) => buttons.map((button) => {
      const image = button.querySelector("img");
      const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d"); context.drawImage(image, 0, 0);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      const expected = `rgb(${r}, ${g}, ${b})`;
      return { id: button.dataset.station, expected, actual: getComputedStyle(button).backgroundColor };
    }).filter(({ expected, actual }) => expected !== actual));
    expect(mismatches).toEqual([]);
    await add(page, "collaborate");
    await expect(page.locator("#journey li")).toHaveCSS("background-color", "rgb(247, 246, 240)");
    await page.locator("#summary-button").click();
    await expect(page.locator("#summary-route li")).toHaveCSS("background-color", "rgb(247, 246, 240)");
    await noOverflow(page);
  });
}
