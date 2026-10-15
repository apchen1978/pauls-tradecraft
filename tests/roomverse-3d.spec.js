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
      expect(glb.filter((u) => u.endsWith(".glb"))).toHaveLength(3);

      const groups = page.locator("#panel .opts");
      await expect(groups).toHaveCount(3);
      for (const [g, i] of [[0, 1], [1, 3], [2, 2]]) {
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
