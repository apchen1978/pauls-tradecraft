import { test, expect } from "@playwright/test";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { TRACKS as musicTracks } from "../public/music-lounge/tracks.js";

const evidence = path.resolve("docs/qa/ai-lab-music-lounge");

test("AI Lab links to the bilingual Music Lounge", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ai-lab/?lang=zh");
  const gallery = page.getByRole("link", { name: /人機協作畫廊/ });
  await expect(gallery).toHaveAttribute("href", "/gallery/?lang=zh");
  const entry = page.getByRole("link", { name: /人機協作 Music Lounge/ });
  await expect(entry).toHaveAttribute("href", "/music-lounge/?lang=zh");
  const coverBounds = await page.locator("#gallery-front").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom };
  });
  expect(coverBounds.top).toBeGreaterThanOrEqual(0);
  const mobileCards = await page.locator("#gallery-front .gallery-entry").evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
  expect(mobileCards).toHaveLength(2);
  for (const height of mobileCards) expect(height).toBeGreaterThan(280);
  await mkdir(evidence, { recursive: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(evidence, "ai-lab-cover-mobile-zh.png") });
  await page.locator("#gallery-front").screenshot({ path: path.join(evidence, "ai-lab-entry-mobile-zh.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: path.join(evidence, "ai-lab-cover-desktop-zh.png") });
  await page.locator("#gallery-front").screenshot({ path: path.join(evidence, "ai-lab-entry-desktop-zh.png") });
  await page.goto("/ai-lab/?lang=en");
  const englishEntry = page.getByRole("link", { name: /The Human–AI Music Lounge/ });
  await expect(englishEntry).toHaveAttribute("href", "/music-lounge/?lang=en");
  await expect(page.getByRole("link", { name: /The Human–AI Gallery/ })).toHaveAttribute("href", "/gallery/?lang=en");
  await page.screenshot({ path: path.join(evidence, "ai-lab-cover-desktop-en.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator("#gallery-front").screenshot({ path: path.join(evidence, "ai-lab-entry-desktop-en.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(evidence, "ai-lab-cover-mobile-en.png") });
  const englishCards = await page.locator("#gallery-front .gallery-entry").evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
  expect(englishCards).toHaveLength(2);
  for (const height of englishCards) expect(height).toBeGreaterThan(280);
  await page.goto("/ai-lab/?lang=zh#gallery-front");
  const chineseEntry = page.getByRole("link", { name: /人機協作 Music Lounge/ });
  await chineseEntry.click();
  await expect(page).toHaveURL(/\/music-lounge\/\?lang=zh$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("人機協作 Music Lounge");
});

test("lists eleven tracks and defers all music modules and piano samples until playback", async ({ page, browser }) => {
  expect(musicTracks).toHaveLength(11);
  for (const track of musicTracks) {
    for (const field of ["title", "mood", "made"]) {
      expect(track[field].zh, `${track.id} ${field} Chinese`).toBeTruthy();
      expect(track[field].en, `${track.id} ${field} English`).toBeTruthy();
    }
    for (const locale of ["zh", "en"]) {
      const sentenceCount = track.made[locale].split(/[。！？.!?]+/).filter((part) => part.trim()).length;
      expect(sentenceCount, `${track.id} ${locale} making notes`).toBeGreaterThanOrEqual(2);
      expect(sentenceCount, `${track.id} ${locale} making notes`).toBeLessThanOrEqual(3);
    }
    expect(track.rooms.length, `${track.id} room tags`).toBeGreaterThan(0);
    expect(track.cover, `${track.id} cover path`).toBeTruthy();
    await access(path.resolve("public", `.${track.cover.split("?")[0]}`));
  }
  const requests = [];
  page.on("request", (request) => requests.push(new URL(request.url()).pathname));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/music-lounge/?lang=zh");
  await expect(page.locator(".track-card")).toHaveCount(11);
  await expect(page.locator(".track-cover")).toHaveCount(11);
  await expect(page.locator(".track-cover img")).toHaveCount(11);
  await expect(page.locator(".track-card").nth(0).locator("h3")).toHaveText("晨曦");
  await expect(page.locator(".track-card").nth(1).locator("h3")).toHaveText("追劇夜");
  await expect(page.locator(".track-card").nth(2).locator("h3")).toHaveText("十里洋場");
  await expect(page.locator(".track-card").nth(3).locator("h3")).toHaveText("午後上行");
  await expect(page.locator(".track-card").nth(9).locator("h3")).toHaveText("防火梯的雨");
  const coverImages = page.locator(".track-cover img");
  for (let index = 0; index < 11; index += 1) {
    const image = coverImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(requests.some((url) => /roomverse-3d\/(night-score|cafe\/sound|bedroom\/sound|bedroom\/game-score|kitchen\/sound|piano)\.js/.test(url))).toBe(false);
  expect(requests.some((url) => url.includes("/audio/piano/"))).toBe(false);
  expect(requests.some((url) => url.includes("/audio/strings/") || url.endsWith("/strings.js")), "no strings samples or module before a tap").toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: path.join(evidence, "desktop-zh.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".track-card")).toHaveCount(11);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(evidence, "mobile-zh.png"), fullPage: true });

  await page.goto("/music-lounge/?lang=en");
  await expect(page.locator(".track-card")).toHaveCount(11);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Human–AI Music Lounge");
  await expect(page.locator(".track-card").nth(0).locator("h3")).toHaveText("Morning Light");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(evidence, "mobile-en.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: path.join(evidence, "desktop-en.png"), fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(evidence, "desktop-en.png"), fullPage: true });

  const first = page.locator('[data-track="brooklyn-windowsill"] .play-button');
  await first.click();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => requests.some((url) => url.endsWith("/bedroom/sound.js"))).toBe(true);
  await expect.poll(() => requests.some((url) => url.includes("/audio/piano/") && url.endsWith(".mp3"))).toBe(true);
  await expect.poll(() => requests.some((url) => url.includes("/audio/strings/") && url.endsWith(".mp3")), { message: "the orchestral lead loads its real string samples on the first tap" }).toBe(true);

  const second = page.locator('[data-track="bay-area-afternoon"] .play-button');
  await second.click();
  await expect(second).toHaveAttribute("aria-pressed", "true");
  await expect(first).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => requests.some((url) => url.endsWith("/kitchen/sound.js"))).toBe(true);
  await expect(page.locator('.track-card [aria-pressed="true"]')).toHaveCount(1);
  await second.click();
  await expect(second).toHaveAttribute("aria-pressed", "false");

  const engineFile = { night: "/night-score.js", cafe: "/cafe/sound.js", bedroom: "/bedroom/sound.js", bay: "/kitchen/sound.js", game: "/bedroom/game-score.js" };
  for (const track of musicTracks) {
    const button = page.locator(`[data-track="${track.id}"] .play-button`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('.track-card [aria-pressed="true"]')).toHaveCount(1);
    await expect.poll(() => requests.some((url) => url.endsWith(engineFile[track.engine]))).toBe(true);
  }
  for (const source of ["/night-score.js", "/cafe/sound.js", "/bedroom/sound.js", "/kitchen/sound.js"]) {
    await expect.poll(() => requests.some((url) => url.endsWith(source))).toBe(true);
  }
  const lastPlaying = page.locator('[data-track="late-night-game"] .play-button'); // the last track of the list is the one still playing
  await lastPlaying.click();
  await expect(lastPlaying).toHaveAttribute("aria-pressed", "false");

  const mobileContext = await browser.newContext({ baseURL: new URL(page.url()).origin, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const mobile = await mobileContext.newPage();
  const mobileRequests = [];
  mobile.on("request", (request) => mobileRequests.push(new URL(request.url()).pathname));
  await mobile.goto("/music-lounge/?lang=en");
  await expect(mobile.locator(".track-card")).toHaveCount(11);
  await expect.poll(() => mobileRequests.some((url) => url.includes("/audio/piano/"))).toBe(false);
  await mobile.locator('[data-track="fire-escape-rain"] .play-button').tap();
  await expect(mobile.locator('[data-track="fire-escape-rain"] .play-button')).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => mobileRequests.some((url) => url.endsWith("/bedroom/sound.js"))).toBe(true);
  await expect.poll(() => mobileRequests.some((url) => url.includes("/audio/piano/") && url.endsWith(".mp3"))).toBe(true);
  await mobileContext.close();
});
