import { expect, test } from "@playwright/test";

for (const lang of ["zh", "en"]) {
  test(`home Room 04 link opens the cafe in ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/?lang=${lang}#showcase`);
    const card = page.locator("#showcase article").first();
    const links = card.locator('a[href*="/prototype/roomverse-3d/cafe/"]');
    await expect(links).toHaveCount(2);
    for (let i = 0; i < 2; i++) await expect(links.nth(i)).toHaveAttribute("href", "/prototype/roomverse-3d/cafe/?from=home");
    await expect(card.getByRole("link", { name: lang === "zh" ? "走進去看: 上海·慢板" : "Step inside: Shanghai, Slowly" }))
      .toHaveAttribute("href", "/prototype/roomverse-3d/cafe/?from=home");
  });
}
