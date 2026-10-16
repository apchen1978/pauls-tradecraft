import { expect, test } from "@playwright/test";

// ROOMVERSE 3D: a poster first (no 3D download until the visitor asks), then a 3D room whose feeling,
// wall and rug can be changed. Furniture models are placed on the floor by their measured bounds.
const PAGE = "/prototype/roomverse-3d/";

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} at ${width}px: poster first, then the room loads and the choices work`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const glb = [];
      page.on("request", (r) => { if (r.url().endsWith(".glb") || r.url().includes("three.module")) glb.push(r.url()); });
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`${PAGE}?lang=${lang}`);
      await expect(page.locator("#home")).toHaveAttribute("href", `/?lang=${lang}`);
      await expect(page.locator("#enter")).toBeVisible();
      expect(glb, "nothing heavy loads before the visitor asks").toEqual([]);
      const note = await page.locator("#note").textContent();
      expect(note).toContain(lang === "zh" ? "插畫示意" : "Illustrated study");

      await page.locator("#enter").click();
      await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
      await expect(page.locator("#panel")).toBeVisible();
      await expect(page.locator("#stage canvas")).toBeVisible();
      expect(glb.filter((u) => u.endsWith(".glb"))).toHaveLength(9);

      const groups = page.locator("#panel .opts");
      await expect(groups).toHaveCount(5);
      for (const [g, i] of [[0, 1], [1, 3], [2, 2], [3, 2], [4, 1]]) {
        const button = groups.nth(g).locator("button").nth(i);
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
}

test("switching language updates the page text and the home link", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#lang").click();
  await expect(page.locator("#home")).toHaveAttribute("href", "/?lang=en");
  await expect(page.locator("#title")).toHaveText("One room, three ways to come home");
});

test("the Garage light-tech shelf links to the 3D room in the visitor's language", async ({ page }) => {
  await page.goto("/?lang=en");
  const link = page.locator('#garage a[href^="/prototype/roomverse-3d/"]');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", "/prototype/roomverse-3d/?lang=en");
});

test("homepage Showcase: ROOMVERSE 3D is a formal work with its tag, cover and a link in the visitor's language", async ({ page }) => {
  for (const [lang, title, tag] of [["zh", "ROOMVERSE 3D · 空間幻境", "3D 互動空間 · 雙語作品"], ["en", "ROOMVERSE 3D · One room, many ways to come home", "3D interactive room · bilingual work"]]) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`/?lang=${lang}#showcase`);
      const card = page.locator("#showcase article", { hasText: title });
      await expect(card).toHaveCount(1);
      await expect(card).toContainText(tag);
      await expect(card.locator("a").first()).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=${lang}`);
      const img = card.locator('img[src*="roomverse-3d/showcase-roomverse-3d-v1.webp"]');
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBe(816);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test("homepage Showcase: ROOMVERSE 3D is the first card and the first featured chip, before December Lights", async ({ page }) => {
  for (const [lang, title, next] of [["zh", "ROOMVERSE 3D · 空間幻境", "十二月的燈"], ["en", "ROOMVERSE 3D · One room, many ways to come home", "December Lights"]]) {
    await page.goto(`/?lang=${lang}#showcase`);
    await expect(page.locator("#showcase article").nth(0)).toContainText(title);
    await expect(page.locator("#showcase article").nth(1)).toContainText(next);
    const chip = page.locator('[data-testid="quick-works"] a').first();
    await expect(chip).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=${lang}`);
  }
});

test("each feeling shows one line on why the pairing works, and it follows the feeling and the language", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const why = page.locator("#panel .why");
  await expect(why).toHaveCount(1);
  await expect(why).toContainText("宅在家裡一天也很舒服");
  await page.locator("#panel .opts").first().locator("button").nth(2).click();
  await expect(why).toContainText("冷色燈帶");
  await page.locator("#lang").click();
  await expect(why).toContainText("cool LED wash");
});

test("the room lives in the address: a shared link opens the same choices, clicks update it, unknown values are ignored", async ({ page }) => {
  await page.goto(`${PAGE}?lang=en&mood=tech&wall=botanical&rug=medallion&curtain=clay&print=moon&bogus=1`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const pressed = (g) => page.locator("#panel .opts").nth(g).locator('button[aria-pressed="true"]');
  await expect(pressed(0)).toHaveText("Light-tech homebody");
  await expect(pressed(1)).toHaveText("Soft botanical wallpaper");
  await expect(pressed(2)).toHaveText("Classic medallion");
  await expect(pressed(3)).toHaveText("Terracotta");
  await expect(pressed(4)).toHaveText("Crescent moon");
  await page.locator("#panel .opts").nth(2).locator("button").nth(1).click();
  await expect(page).toHaveURL(/rug=ivory/);
  await expect(page).toHaveURL(/lang=en/);

  await page.goto(`${PAGE}?mood=nope&rug=<script>`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await expect(pressed(0)).toHaveText("下雨天想窩在家裡");
  await expect(pressed(2)).toHaveText("藍米條紋");
});

test("粉領新貴風: a fourth feeling with its own line, plus a blush wall and a dusty rose curtain", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh&mood=chic&wall=blush&curtain=rose`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const pressed = (g) => page.locator("#panel .opts").nth(g).locator('button[aria-pressed="true"]');
  await expect(pressed(0)).toHaveText("粉領新貴風");
  await expect(pressed(1)).toHaveText("霧粉");
  await expect(pressed(3)).toHaveText("霧玫瑰");
  await expect(page.locator("#panel .why")).toContainText("咖啡館");
  await page.locator("#lang").click();
  await expect(pressed(0)).toHaveText("Chic city professional");
});

test("surprise me: one tap picks a new wall, rug, curtain and print, keeps the feeling, and updates the link", async ({ page }) => {
  await page.goto(`${PAGE}?lang=en&mood=tech&wall=original&rug=stripe&curtain=linen&print=hills`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.locator("#panel .shuffle").click();
  const url = new URL(page.url());
  expect(url.searchParams.get("mood")).toBe("tech");
  expect(url.searchParams.get("wall")).not.toBe("original");
  expect(url.searchParams.get("rug")).not.toBe("stripe");
  expect(url.searchParams.get("curtain")).not.toBe("linen");
  expect(url.searchParams.get("print")).not.toBe("hills");
  await expect(page.locator("#panel .opts").nth(0).locator('button[aria-pressed="true"]')).toHaveText("Light-tech homebody");
});

test("keyboard use: focus stays on the pressed button, the 3D view has a name, and a feeling change is announced", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const focused = () => page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.locator("#panel .opts").first().locator("button").nth(1).focus();
  await page.keyboard.press("Enter");
  expect(await focused()).toBe("Cozy family");
  await page.keyboard.press("Tab");
  expect(await focused()).toBe("未來輕科技宅男");
  await page.locator("#panel .shuffle").focus();
  await page.keyboard.press("Enter");
  expect(await focused()).toBe("幫我隨機搭一間");
  await expect(page.locator("#stage canvas")).toHaveAttribute("role", "img");
  await expect(page.locator("#stage canvas")).toHaveAttribute("aria-label", /3D/);
  await page.locator("#panel .opts").first().locator("button").nth(2).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText("冷色燈帶");
});
