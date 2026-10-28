import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const ORIGIN_ROOM = "/prototype/roomverse-3d/";

async function openRoom(page, width = 390, query = "lang=zh") {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?${query}`);
  await page.waitForFunction(() => Boolean(window.__room03));
}

test("header exit is visible, bilingual and at least 44 pixels high", async ({ page }) => {
  for (const width of [390, 1440]) for (const [lang, text, label] of [["zh", "← 其他房間", "前往其他 ROOMVERSE 房間"], ["en", "← Other rooms", "Go to another ROOMVERSE room"]]) {
    await openRoom(page, width, `lang=${lang}`);
    const link = page.locator("#headerOtherRooms");
    await expect(link).toBeVisible({ timeout: 2500 });
    await expect(link).toHaveText(text);
    await expect(link).toHaveAttribute("aria-label", label);
    expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("from is a strict whitelist and current language is retained", async ({ page }) => {
  for (const lang of ["zh", "en"]) for (const from of ["room01", "room02", null, "https://evil.invalid", "constructor"]) {
    const params = new URLSearchParams({ lang });
    if (from !== null) params.set("from", from);
    await openRoom(page, 390, params.toString());
    const href = await page.locator("#headerOtherRooms").getAttribute("href", { timeout: 2500 });
    const url = new URL(href, page.url());
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect(url.pathname).toBe(from === "room02" ? `${ORIGIN_ROOM}bedroom/` : ORIGIN_ROOM);
    expect(url.searchParams.get("lang")).toBe(lang);
  }
});

test("fullscreen exit cleans immersive state before leaving and Back returns normally", async ({ page }) => {
  await page.addInitScript(() => addEventListener("pagehide", () => sessionStorage.setItem("exitClean", String(!document.documentElement.classList.contains("room-immersive")))));
  await openRoom(page, 390, "lang=en&from=room02");
  await page.locator("#immersiveEnter").click();
  const link = page.locator("#immersiveOtherRooms");
  await expect(link).toBeVisible({ timeout: 2500 });
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await link.click();
  await expect(page).toHaveURL(/\/bedroom\/\?lang=en/);
  expect(await page.evaluate(() => sessionStorage.getItem("exitClean"))).toBe("true");
  await page.goBack();
  await page.waitForFunction(() => Boolean(window.__room03));
  await expect(page.locator("html")).not.toHaveClass(/room-immersive/);
  await expect(page.locator(".room")).not.toHaveClass(/is-immersive/);
});

test("keyboard reaches exit before language, with a visible focus outline", async ({ page }) => {
  await openRoom(page);
  await page.keyboard.press("Tab");
  const exit = page.locator("#headerOtherRooms");
  await expect(exit).toBeFocused({ timeout: 2500 });
  const focus = await exit.evaluate((el) => ({ visible: el.matches(":focus-visible"), width: getComputedStyle(el).outlineWidth, style: getComputedStyle(el).outlineStyle }));
  expect(focus.visible).toBe(true);
  expect(parseFloat(focus.width)).toBeGreaterThan(0);
  expect(focus.style).not.toBe("none");
  await page.keyboard.press("Tab");
  await expect(page.locator("#lang")).toBeFocused();
});

test("fullscreen Tab stays in the room after mood selection preserves focus", async ({ page }) => {
  await openRoom(page);
  await page.locator("#immersiveEnter").click();
  await page.keyboard.press("Tab");
  await expect(page.locator('#moods button[data-mood="golden"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator('#moods button[data-mood="golden"]')).toBeFocused();
  await page.keyboard.press("Tab");
  // Old: the next mood was night. Movie night now sits between golden and night.
  await expect(page.locator('#moods button[data-mood="movie"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('#moods button[data-mood="night"]')).toBeFocused();
  await page.keyboard.press("Tab");
  // Old: night was the last mood, so the next Tab reached the other-rooms link.
  // Dinner and Sunday morning now follow night.
  await expect(page.locator('#moods button[data-mood="dinner"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('#moods button[data-mood="sunday"]')).toBeFocused();
  await page.keyboard.press("Tab");
  // Old: Sunday morning was the last mood. Thanksgiving now follows it.
  await expect(page.locator('#moods button[data-mood="thanksgiving"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#immersiveOtherRooms")).toBeFocused();
  await page.keyboard.press("Tab");
  // Previously the loop returned directly to Exit; center-view is now the first room control.
  await expect(page.locator("#centerView")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#immersiveExit")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#centerView")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#immersiveOtherRooms")).toBeFocused();
});
