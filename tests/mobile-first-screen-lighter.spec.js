import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const SHOTS = resolve("docs/qa/mobile-first-screen-lighter");
mkdirSync(SHOTS, { recursive: true });

const MOBILE_CASES = [
  { width: 390, height: 844, lang: "zh" },
  { width: 390, height: 844, lang: "en" },
  { width: 360, height: 740, lang: "zh" },
  { width: 360, height: 740, lang: "en" },
];

for (const { width, height, lang } of MOBILE_CASES) {
  test(`mobile ${width}x${height} ${lang}: no hero portrait request and colorful work arrives sooner`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      window.__firstScreenPerf = { lcp: null, cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__firstScreenPerf.lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__firstScreenPerf.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    const imageRequests = [];
    page.on("request", (request) => {
      if (request.resourceType() === "image") imageRequests.push(new URL(request.url()).pathname);
    });
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    await expect(page.locator("section#top h1")).toBeVisible();
    await expect(page.locator("#showcase-heading")).toBeInViewport();
    await page.waitForTimeout(700);

    const metrics = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return { top: Math.round(box.top + scrollY), bottom: Math.round(box.bottom + scrollY), height: Math.round(box.height), width: Math.round(box.width) };
      };
      const businessCards = [...document.querySelectorAll('[data-testid="hero-works"] li')];
      const businessBottom = businessCards.at(-1)?.getBoundingClientRect().bottom + scrollY;
      const eyebrow = rect("#showcase > div > p:first-of-type");
      const suggestedStart = rect("#showcase > div > p:nth-of-type(3)");
      const firstCover = rect("#showcase article:first-child img");
      const suggestedLink = rect("#showcase > div > p:nth-of-type(3) a");
      const images = performance.getEntriesByType("resource")
        .filter((entry) => /\.(webp|png|jpe?g)(\?|$)/i.test(entry.name))
        .map((entry) => ({ path: new URL(entry.name).pathname, bytes: entry.encodedBodySize }));
      return {
        viewport: { width: innerWidth, height: innerHeight },
        hero: rect("section#top"),
        businessCardsBottom: Math.round(businessBottom),
        showcase: rect("#showcase"),
        showcaseTitle: rect("#showcase-heading"),
        showcaseHeader: { top: eyebrow.top, bottom: Math.max(suggestedStart.bottom, suggestedLink.bottom), height: Math.max(suggestedStart.bottom, suggestedLink.bottom) - eyebrow.top },
        firstInteractiveImage: firstCover,
        firstCoverVisible: Math.max(0, Math.min(innerHeight, firstCover.bottom) - Math.max(0, firstCover.top)),
        suggestedLink,
        scrollWidth: document.documentElement.scrollWidth,
        smallestHeroTarget: Math.round(Math.min(...[...document.querySelectorAll("section#top a")].map((link) => link.getBoundingClientRect().height).filter((height) => height > 0))),
        images,
        perf: window.__firstScreenPerf,
      };
    });
    const uniqueRequests = [...new Set(imageRequests)];

    await page.screenshot({ path: `${SHOTS}/after-${width}x${height}-${lang}.png` });
    console.log(`MOBILE_FIRST_SCREEN ${JSON.stringify({ ...metrics, imageRequests: uniqueRequests })}`);

    expect(uniqueRequests.some((path) => /\/images\/paul-art(?:-800)?\.webp$/.test(path))).toBe(false);
    expect(uniqueRequests).not.toContain("/images/showcase-trade-street-cover.webp");
    expect(metrics.scrollWidth).toBeLessThanOrEqual(width);
    expect(metrics.smallestHeroTarget).toBeGreaterThanOrEqual(44);
    expect(metrics.showcaseTitle.bottom).toBeLessThanOrEqual(height);
    expect(metrics.showcase.top).toBeLessThanOrEqual(700);
    expect(metrics.suggestedLink.height).toBeGreaterThanOrEqual(44);
    expect(metrics.suggestedLink.width).toBeGreaterThanOrEqual(44);
    if (width === 390) expect(metrics.firstCoverVisible).toBeGreaterThanOrEqual(lang === "zh" ? 120 : 60);
    else expect(metrics.firstInteractiveImage.top - height).toBeLessThanOrEqual(150);

    const workLinks = page.locator('[data-testid="hero-works"] a');
    await expect(workLinks).toHaveCount(3);
    const businessCopy = (await workLinks.allTextContents()).map((text) => text.replaceAll("\u200b", ""));
    expect(businessCopy).toEqual(expect.arrayContaining([
      expect.stringContaining(lang === "zh" ? "商務決策" : "Commercial Decision Desk"),
      expect.stringContaining(lang === "zh" ? "海外" : "Overseas Lead Discovery"),
      expect.stringContaining(lang === "zh" ? "貿易" : "Trade Profit Navigator"),
    ]));

    const firstCover = page.locator("#showcase ol > li:first-child article img");
    expect(await firstCover.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    const secondCover = page.locator("#showcase ol > li:nth-child(2) article img");
    await expect(secondCover).toHaveAttribute("src", /^data:image\/gif/);
    await secondCover.scrollIntoViewIfNeeded();
    await expect(secondCover).toHaveAttribute("src", /showcase-trade-street-cover\.webp/);
    expect(await secondCover.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);

    // Paul 2026-10-30: the hero buttons are desktop-only; on phones the work cards and the nav carry those jobs.
    await expect(page.locator('section#top a[href="#showcase"]')).toBeHidden();
    await expect(page.locator('section#top a[href="#contact"]')).toBeHidden();
    await expect(page.locator('header a[href="#contact"]').first()).toBeAttached();
  });
}

test("desktop 1440: hero portrait and layout remain in place", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const imageRequests = [];
  page.on("request", (request) => {
    if (request.resourceType() === "image") imageRequests.push(new URL(request.url()).pathname);
  });
  await page.goto("/?lang=zh", { waitUntil: "networkidle" });
  const portrait = page.locator('section#top picture img');
  await expect(portrait).toBeVisible();
  await expect(page.locator("#showcase-heading")).toBeVisible();
  await expect(page.locator('section#top a[href="#showcase"]')).toBeVisible();
  await expect(page.locator('section#top a[href="#contact"]')).toBeVisible();
  const currentSrc = await portrait.evaluate((image) => image.currentSrc);
  expect(currentSrc).toContain("/images/paul-art.webp");
  expect(imageRequests.filter((path) => /\/images\/paul-art(?:-800)?\.webp$/.test(path))).toEqual(["/images/paul-art.webp"]);

  const metrics = await page.evaluate(() => {
    const box = (selector) => {
      const element = document.querySelector(selector);
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top + scrollY), bottom: Math.round(rect.bottom + scrollY), height: Math.round(rect.height) };
    };
    return { hero: box("section#top"), businessCardsBottom: Math.round([...document.querySelectorAll('[data-testid="hero-works"] li')].at(-1).getBoundingClientRect().bottom + scrollY), showcase: box("#showcase"), scrollWidth: document.documentElement.scrollWidth };
  });
  expect(metrics.scrollWidth).toBe(1440);
  expect(metrics.hero).toEqual({ top: 77, bottom: 776, height: 699 });
  expect(metrics.showcase.top).toBe(776);
  await page.screenshot({ path: `${SHOTS}/after-1440x1000-zh.png` });
  console.log(`DESKTOP_FIRST_SCREEN ${JSON.stringify({ ...metrics, imageRequests })}`);
});
