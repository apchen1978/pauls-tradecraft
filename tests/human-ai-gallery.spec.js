import { test, expect } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { COLLECTION, PIECES, validatePieces } from "../public/gallery/pieces.js";

const QA = resolve("docs/qa/human-ai-gallery");
mkdirSync(QA, { recursive: true });
const url = (lang) => `/gallery/?lang=${lang}`;
const openName = (lang, index) => COLLECTION[lang].open + PIECES[index].title[lang];
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}
async function loaded(page) {
  await expect.poll(() => page.locator("#viewer-image").evaluate((im) => im.complete && im.naturalWidth > 0)).toBe(true);
}

test("collection: bilingual records, local images, provenance and required-field rejection", () => {
  expect(() => validatePieces(PIECES)).not.toThrow();
  expect(PIECES.length).toBeGreaterThanOrEqual(6);
  for (const id of ["winter-lamplight", "stage-after-show"]) expect(PIECES.some((piece) => piece.id === id)).toBe(true);
  expect(Object.keys(COLLECTION.zh).sort()).toEqual(Object.keys(COLLECTION.en).sort());
  const manifest = JSON.parse(readFileSync(`${QA}/asset-manifest.json`, "utf8"));
  for (const piece of PIECES) {
    expect(manifest.find((p) => p.id === piece.id)?.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
    for (const key of ["image", "imageSmall", "thumbnail"]) expect(existsSync(resolve("public/gallery", piece[key]))).toBe(true);
    for (const key of ["title", "alt", "caption", "made"]) {
      for (const lang of ["zh", "en"]) {
        const broken = structuredClone(PIECES);
        delete broken.find((p) => p.id === piece.id)[key][lang];
        expect(() => validatePieces(broken)).toThrow();
      }
    }
  }
  const laCoast = PIECES.find((piece) => piece.id === "room02-la-coast-collection");
  expect(laCoast).toBeDefined();
  const laRecord = manifest.find((record) => record.id === laCoast.id);
  expect(laRecord.source).toBe("docs/gallery/sources/roomverse-room02-la-coast-source.png");
  const sourcePath = resolve(laRecord.source);
  expect(existsSync(sourcePath)).toBe(true);
  expect(createHash("sha256").update(readFileSync(sourcePath)).digest("hex")).toBe(laRecord.sourceSha256);
  for (const derivative of laRecord.derivatives) {
    const path = resolve("public/gallery/assets", derivative.file);
    expect(statSync(path).size).toBe(derivative.bytes);
    expect(createHash("sha256").update(readFileSync(path)).digest("hex")).toBe(derivative.sha256);
  }
  const visible = JSON.stringify({ copy: COLLECTION, pieces: PIECES.map(({ title, caption, alt, made }) => ({ title, caption, alt, made })) });
  expect(visible).not.toMatch(/十二月的依依|玉仔|ROI|A2A|CDD|老闆|董事長|保證|guaranteed/i);
  const harbour = manifest.filter((p) => ["imagined-harbor", "modern-harbor"].includes(p.id));
  for (const record of harbour) {
    const full = record.derivatives[0];
    const source = record.id === "modern-harbor" ? "public/prototype/roomverse-3d/tex/right-wall-harbor-v1.webp" : null;
    if (source) expect(readFileSync(`public/gallery/assets/${full.file}`).equals(readFileSync(source))).toBe(true);
  }
});

for (const width of [390, 768, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} ${width}: full frames, lightbox, keyboard, focus and responsive assets`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const problems = [];
      page.on("pageerror", (error) => problems.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") problems.push(message.text()); });
      await page.goto(url(lang));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(COLLECTION[lang].title);
      await expect(page.locator("#subtitle")).toHaveText(COLLECTION[lang].subtitle);
      await expect(page.locator("article.painting")).toHaveCount(PIECES.length);
      await expect(page.locator("#harbours article").first()).toHaveAttribute("data-piece", "imagined-harbor");
      await expect(page.locator("#harbours article").last()).toHaveAttribute("data-piece", "modern-harbor");
      await expect(page.locator("#pair-note")).toHaveText(COLLECTION[lang].pairNote);
      await expect(page.locator("#doors-title")).toHaveText(COLLECTION[lang].doorsTitle);
      await expect(page.locator("#doors-note")).toHaveText(COLLECTION[lang].doorsNote);
      await expect(page.locator("#doors article")).toHaveCount(2);
      await expect(page.locator("#doors article").first()).toHaveAttribute("data-piece", "ai-lab-digital-room");
      await expect(page.locator("#doors article").last()).toHaveAttribute("data-piece", "ai-lab-open-horizon");
      await expect(page.locator("#roomverse article")).toHaveCount(2);
      await expect(page.locator("#room-collection-title")).toHaveText(COLLECTION[lang].roomCollectionTitle);
      await expect(page.locator("#room-collection article")).toHaveCount(1);
      await expect(page.locator("#room-collection article")).toHaveAttribute("data-piece", "room02-la-coast-collection");
      await expect(page.locator("#room-collection article h4")).toHaveText(PIECES.find((piece) => piece.id === "room02-la-coast-collection").title[lang]);
      const doorBoxes = await page.locator("#doors article").evaluateAll((articles) => articles.map((article) => ({ left: article.getBoundingClientRect().left, top: article.getBoundingClientRect().top })));
      if (width === 390) expect(doorBoxes[1].top).toBeGreaterThan(doorBoxes[0].top);
      else expect(Math.abs(doorBoxes[1].top - doorBoxes[0].top)).toBeLessThan(2);
      await noOverflow(page);
      const before = await page.evaluate(() => performance.getEntriesByType("resource").map((r) => r.name));
      expect(before.filter((r) => /gallery\/assets\/.*\.webp/.test(r)).every((r) => r.endsWith("-thumb.webp"))).toBe(true);
      for (const image of await page.locator(".art-button img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((im) => im.complete && im.naturalWidth > 0)).toBe(true);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${QA}/gallery-${lang}-${width}.jpg`, fullPage: true, quality: 88 });
      await page.locator("#room-collection").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${QA}/room-collection-${lang}-${width}.jpg`, quality: 90 });

      const first = page.getByRole("button", { name: openName(lang, 0), exact: true });
      await first.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.locator("#close")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(page.locator("#next")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.locator("#close")).toBeFocused();
      await loaded(page);
      expect(await page.locator("#viewer-image").evaluate((im) => im.currentSrc)).toContain(width === 390 ? "-mobile.webp" : "imagined-harbor.webp");
      expect(await page.locator("#viewer-image").evaluate((im) => getComputedStyle(im).objectFit)).toBe("contain");
      await page.screenshot({ path: `${QA}/lightbox-gilt-${lang}-${width}.jpg`, quality: 90 });
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("#viewer-title")).toHaveText(PIECES[1].title[lang]);
      await loaded(page);
      await page.keyboard.press("ArrowLeft");
      await expect(page.locator("#viewer-title")).toHaveText(PIECES[0].title[lang]);
      // Native modal focus must not escape to the page behind it.
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        expect(await page.evaluate(() => document.querySelector("#viewer").contains(document.activeElement))).toBe(true);
      }
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await expect(first).toBeFocused();
      for (let i = 0; i < PIECES.length; i++) {
        await page.getByRole("button", { name: openName(lang, i), exact: true }).click();
        await loaded(page);
        await expect(page.locator("#viewer-caption")).toHaveText(PIECES[i].caption[lang]);
        await expect(page.locator("#viewer-made")).toHaveText(PIECES[i].made[lang]);
        const geometry = await page.locator("#viewer-image").evaluate((im) => ({ natural: im.naturalWidth / im.naturalHeight, declared: Number(im.getAttribute("width")) / Number(im.getAttribute("height")) }));
        expect(Math.abs(geometry.natural - geometry.declared)).toBeLessThan(.005);
        if (PIECES[i].id === "room02-la-coast-collection") {
          await expect(page.locator("#viewer-title")).toHaveText(PIECES[i].title[lang]);
          await expect(page.locator("#viewer-image")).toHaveAttribute("alt", PIECES[i].alt[lang]);
          expect(await page.locator("#viewer-image").evaluate((im) => im.currentSrc)).toContain(width === 390 ? "roomverse-room02-la-coast-mobile.webp" : "roomverse-room02-la-coast.webp");
          await page.screenshot({ path: `${QA}/room-collection-lightbox-${lang}-${width}.jpg`, quality: 90 });
          await page.locator("#previous").click();
          await expect(page.locator("#viewer-title")).toHaveText(PIECES[i - 1].title[lang]);
          await page.locator("#next").click();
          await expect(page.locator("#viewer-title")).toHaveText(PIECES[i].title[lang]);
          await page.locator("#next").click();
          await expect(page.locator("#viewer-title")).toHaveText(PIECES[i + 1].title[lang]);
          await page.locator("#previous").click();
          await expect(page.locator("#viewer-title")).toHaveText(PIECES[i].title[lang]);
        }
        if (i === 4) await page.screenshot({ path: `${QA}/lightbox-plain-${lang}-${width}.jpg`, quality: 90 });
        await page.locator("#close").click();
      }
      await noOverflow(page);
      await expect(page.locator("#back")).toHaveAttribute("href", `/ai-lab/?lang=${lang}#gallery-front`);
      expect(await page.evaluate(() => ({ stored: localStorage.length, cookie: document.cookie }))).toEqual({ stored: 0, cookie: "" });
      expect(problems).toEqual([]);
    });

    test(`${lang} ${width}: AI Lab front entry, return link, language switch`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`/ai-lab/?lang=${lang}#gallery-front`);
      const entry = page.locator("#gallery-link");
      await expect(entry).toHaveAttribute("href", url(lang));
      expect((await entry.boundingBox()).height).toBeGreaterThanOrEqual(44);
      await entry.scrollIntoViewIfNeeded();
      const coverImages = entry.locator(".gallery-entry-cover img");
      await expect(coverImages).toHaveCount(3);
      for (const image of await coverImages.all()) {
        await expect.poll(() => image.evaluate((im) => im.complete && im.naturalWidth > 0)).toBe(true);
        await image.evaluate((im) => im.decode());
      }
      expect(await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.includes("/gallery/assets/")).length)).toBe(3);
      await page.screenshot({ path: `${QA}/entry-${lang}-${width}.jpg`, quality: 88 });
      await entry.click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(COLLECTION[lang].title);
      await page.locator(`.languages a[lang="${lang === "zh" ? "en" : "zh-Hant"}"]`).click();
      const other = lang === "zh" ? "en" : "zh";
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(COLLECTION[other].title);
      await page.locator("#back").click();
      await expect(page).toHaveURL(new RegExp(`/ai-lab/\\?lang=${other}#gallery-front$`));
    });
  }
}

test("reduced motion, mobile touch targets and measured first-load payload", async ({ browser }) => {
  const records = [];
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(url("zh"));
    await page.waitForLoadState("networkidle");
    const data = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      return { requests: 1 + resources.length, encodedBodyBytes: nav.encodedBodySize + resources.reduce((n, r) => n + r.encodedBodySize, 0), resources: resources.map((r) => ({ url: new URL(r.name).pathname, bytes: r.encodedBodySize })) };
    });
    records.push({ width, ...data });
    expect(data.encodedBodyBytes).toBeLessThan(350000);
    expect(data.resources.some((r) => /fonts|\.woff/.test(r.url))).toBe(false);
    await page.getByRole("button", { name: openName("zh", 0), exact: true }).click();
    for (const id of ["close", "previous", "next"]) {
      const rect = await page.locator(`#${id}`).boundingBox();
      expect(rect.height).toBeGreaterThanOrEqual(44);
      expect(rect.width).toBeGreaterThanOrEqual(44);
    }
    expect(await page.locator(".art-button").first().evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
    await context.close();
  }
  writeFileSync(`${QA}/initial-load.json`, JSON.stringify({ method: "Fresh browser context; viewport remains at page top; networkidle; navigation plus ResourceTiming encodedBodySize (HTTP headers excluded). Local preview, no mobile CPU or bandwidth emulation.", records }, null, 2));
});
