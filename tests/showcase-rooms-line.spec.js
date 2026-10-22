import { expect, test } from "@playwright/test";

for (const [lang, width, sentence] of [["zh", 390, "裡坐坐。"], ["en", 390, "Or come sit a while in our rooms."], ["zh", 1440, "裡坐坐。"], ["en", 1440, "Or come sit a while in our rooms."]]) {
  test(`showcase rooms line links to ROOMVERSE 3D (${lang} ${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    const p = page.locator("#showcase p", { hasText: sentence });
    await expect(p).toBeVisible();
    const link = p.getByRole("link", { name: "rooms" });
    await expect(link).toHaveAttribute("href", new RegExp(`^/prototype/roomverse-3d/.*${lang === "en" ? "lang=en" : ""}`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.locator("#showcase-heading").evaluate((n) => n.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -40));
    await page.screenshot({ path: `docs/qa/showcase-rooms-line/${lang}-${width}.png`, timeout: 20000 });
  });
}
