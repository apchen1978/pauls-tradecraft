import { expect, test } from "@playwright/test";

// Every ROOMVERSE room keeps a one-tap way back to the portfolio homepage.
// Other-room exits stay as they were; the home link never opens the travel door.
const COPY = {
  zh: { text: "⌂ 作品集首頁", label: "回到作品集首頁" },
  en: { text: "⌂ Portfolio home", label: "Back to portfolio home" },
};
const ROOMS = [
  {
    id: "room01",
    path: "/prototype/roomverse-3d/",
    home: "#home",
    other: "#portalBtn",
    otherText: { zh: "看看其他房間", en: "Explore other rooms" },
    otherTravel: true,
  },
  {
    id: "room02",
    path: "/prototype/roomverse-3d/bedroom/",
    home: "#portfolioHome",
    other: "#home",
    otherText: { zh: "← 其他房間", en: "← Other rooms" },
    otherHref: (lang) => `../?lang=${lang}`,
    otherTravel: true,
  },
  {
    id: "room03",
    path: "/prototype/roomverse-3d/kitchen/",
    home: "#portfolioHome",
    other: "#headerOtherRooms",
    otherText: { zh: "← 其他房間", en: "← Other rooms" },
    otherLabel: { zh: "前往其他 ROOMVERSE 房間", en: "Go to another ROOMVERSE room" },
    otherTravel: true,
  },
  {
    id: "room04",
    path: "/prototype/roomverse-3d/cafe/",
    home: "#portfolioHome",
    other: "#otherRooms",
    otherText: { zh: "← 其他房間", en: "← Other rooms" },
    otherHref: (lang) => `/prototype/roomverse-3d/?lang=${lang}`,
  },
];

function trackErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

async function noHorizontalScroll(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

async function boxOf(locator) {
  const box = await locator.boundingBox();
  expect(box, "the control has a box").not.toBeNull();
  return box;
}

function overlaps(a, b) {
  return a.x < b.x + b.width - 1 && a.x + a.width > b.x + 1 && a.y < b.y + b.height - 1 && a.y + a.height > b.y + 1;
}

async function expectHit(locator) {
  expect(await locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + Math.min(rect.height / 2, 22));
    return top === el || el.contains(top);
  })).toBe(true);
}

async function expectHomeLink(page, selector, lang) {
  const link = page.locator(selector);
  await expect(link).toBeVisible();
  await expect(link).toHaveText(COPY[lang].text);
  await expect(link).toHaveAttribute("aria-label", COPY[lang].label);
  await expect(link).toHaveAttribute("href", `/?lang=${lang}`);
  await expect(link).not.toHaveAttribute("data-travel-door-trigger");
  const box = await boxOf(link);
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expectHit(link);
  return box;
}

for (const room of ROOMS) {
  for (const lang of ["zh", "en"]) {
    for (const width of [390, 1440]) {
      test(`${room.id} ${lang} at ${width}px shows a portfolio home link beside the other-rooms exit`, async ({ page }) => {
        const errors = trackErrors(page);
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.goto(`${room.path}?lang=${lang}`);
        const home = await expectHomeLink(page, room.home, lang);
        const other = page.locator(room.other);
        await expect(other).toHaveText(room.otherText[lang]);
        if (room.otherLabel) await expect(other).toHaveAttribute("aria-label", room.otherLabel[lang]);
        if (room.otherHref) await expect(other).toHaveAttribute("href", room.otherHref(lang));
        if (room.otherTravel) await expect(other).toHaveAttribute("data-travel-door-trigger", "");
        else await expect(other).not.toHaveAttribute("data-travel-door-trigger");
        if (room.id !== "room01") {
          const otherBox = await boxOf(other);
          expect(overlaps(home, otherBox), "home and other rooms sit side by side").toBe(false);
          expect(Math.abs((home.y + home.height / 2) - (otherBox.y + otherBox.height / 2))).toBeLessThan(12);
          expect(home.x).toBeLessThan(otherBox.x);
        }
        await noHorizontalScroll(page);
        expect(errors).toEqual([]);
      });
    }
  }

  test(`${room.id} language toggle rewrites the portfolio home link, and a click opens the homepage`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${room.path}?lang=zh`);
    await page.locator("#lang").click();
    await expect(page.locator(room.home)).toHaveText(COPY.en.text);
    await expect(page.locator(room.home)).toHaveAttribute("aria-label", COPY.en.label);
    await expect(page.locator(room.home)).toHaveAttribute("href", "/?lang=en");
    await expect(page.locator(room.other)).toHaveText(room.otherText.en);
    await page.locator("#lang").click();
    await expect(page.locator(room.home)).toHaveText(COPY.zh.text);
    await expect(page.locator(room.home)).toHaveAttribute("aria-label", COPY.zh.label);
    await expect(page.locator(room.home)).toHaveAttribute("href", "/?lang=zh");
    await expect(page.locator(room.other)).toHaveText(room.otherText.zh);
    if (room.id === "room03") {
      const href = await page.locator("#headerOtherRooms").getAttribute("href");
      const url = new URL(href, page.url());
      expect(url.pathname).toBe("/prototype/roomverse-3d/");
      expect(url.searchParams.get("lang")).toBe("zh");
      await expect(page.locator("#immersiveOtherRooms")).toHaveText(room.otherText.zh);
    }
    expect(errors).toEqual([]);
    await page.locator(room.home).click();
    await page.waitForURL((url) => new URL(url).pathname === "/");
    const landed = new URL(page.url());
    expect(landed.pathname).toBe("/");
    expect(landed.searchParams.get("lang")).toBe("zh");
  });
}

async function expectBeside(homeBox, otherBox) {
  expect(overlaps(homeBox, otherBox)).toBe(false);
  expect(Math.abs((homeBox.y + homeBox.height / 2) - (otherBox.y + otherBox.height / 2))).toBeLessThan(12);
  expect(homeBox.x).toBeLessThan(otherBox.x);
  expect(homeBox.x + homeBox.width).toBeLessThanOrEqual(otherBox.x + 2);
}

for (const lang of ["zh", "en"]) {
  test(`room01 fullscreen ${lang} keeps the portfolio home link clickable beside other rooms`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/prototype/roomverse-3d/?lang=${lang}`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    await page.locator("#immersiveEnter").click();
    await expect(page.locator(".room")).toHaveClass(/is-immersive/);
    const home = await expectHomeLink(page, "#home", lang);
    const door = page.locator("#immersiveDoor");
    await expect(door).toBeVisible();
    await expect(door).toHaveText(lang === "zh" ? "看看其他房間" : "Explore other rooms");
    await expect(door).toHaveAttribute("data-travel-door-trigger", "");
    await expectBeside(home, await boxOf(door));
    const exit = await boxOf(page.locator("#immersiveExit"));
    expect(overlaps(home, exit), "home stays clear of the fullscreen exit").toBe(false);
    await noHorizontalScroll(page);
    expect(errors).toEqual([]);
    if (lang === "en") {
      await page.locator("#home").click();
      await page.waitForURL((url) => new URL(url).pathname === "/");
      expect(new URL(page.url()).pathname).toBe("/");
    }
  });

  test(`room02 fullscreen ${lang} keeps the portfolio home link clickable beside other rooms`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/prototype/roomverse-3d/bedroom/?lang=${lang}`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__bedroom, null, { timeout: 60000 });
    await page.locator("#immersiveEnter").click();
    await expect(page.locator(".room")).toHaveClass(/is-immersive/);
    const home = await expectHomeLink(page, "#portfolioHome", lang);
    const door = page.locator("#immersiveDoor");
    await expect(door).toBeVisible();
    await expect(door).toHaveText(lang === "zh" ? "看看其他房間" : "Explore other rooms");
    await expect(door).toHaveAttribute("data-travel-door-trigger", "");
    await expectBeside(home, await boxOf(door));
    await expect(page.locator("#home")).toHaveText(lang === "zh" ? "← 其他房間" : "← Other rooms");
    await expect(page.locator("#home")).toHaveAttribute("href", `../?lang=${lang}`);
    const exit = await boxOf(page.locator("#immersiveExit"));
    expect(overlaps(home, exit)).toBe(false);
    await noHorizontalScroll(page);
    expect(errors).toEqual([]);
    if (lang === "en") {
      await page.locator("#portfolioHome").click();
      await page.waitForURL((url) => new URL(url).pathname === "/");
      expect(new URL(page.url()).pathname).toBe("/");
    }
  });

  test(`room03 immersive ${lang} home button is visible and clickable beside other rooms`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/prototype/roomverse-3d/kitchen/?lang=${lang}`);
    await page.waitForFunction(() => window.__room03, null, { timeout: 60000 });
    await page.locator("#immersiveEnter").click();
    await expect(page.locator(".room")).toHaveClass(/is-immersive/);
    const home = await expectHomeLink(page, "#immersivePortfolioHome", lang);
    const other = page.locator("#immersiveOtherRooms");
    await expect(other).toBeVisible();
    await expect(other).toHaveText(lang === "zh" ? "← 其他房間" : "← Other rooms");
    await expect(other).toHaveAttribute("aria-label", lang === "zh" ? "前往其他 ROOMVERSE 房間" : "Go to another ROOMVERSE room");
    await expect(other).toHaveAttribute("data-travel-door-trigger", "");
    await expectBeside(home, await boxOf(other));
    for (const id of ["#immersiveExit", "#centerView", "#plaqueView", "#nookView"]) {
      expect(overlaps(home, await boxOf(page.locator(id))), `${id} stays clear of the home link`).toBe(false);
    }
    await noHorizontalScroll(page);
    expect(errors).toEqual([]);
    if (lang === "en") {
      await page.locator("#immersivePortfolioHome").click();
      await page.waitForURL((url) => new URL(url).pathname === "/");
      expect(new URL(page.url()).pathname).toBe("/");
      expect(new URL(page.url()).searchParams.get("lang")).toBe("en");
    }
  });
}
