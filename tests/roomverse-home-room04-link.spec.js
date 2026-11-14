import { expect, test } from "@playwright/test";

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`home Room 04 link and cover artwork work in ${lang} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto(`/?lang=${lang}#showcase`);
    const card = page.locator("#showcase article").first();
    const links = card.locator('a[href*="/prototype/roomverse-3d/cafe/"]');
    await expect(links).toHaveCount(2);
    for (let i = 0; i < 2; i++) await expect(links.nth(i)).toHaveAttribute("href", "/prototype/roomverse-3d/cafe/?from=home");
    await expect(card.getByRole("link", { name: lang === "zh" ? "走進去看: 上海·慢板" : "Step inside: Shanghai, Slowly" }))
      .toHaveAttribute("href", "/prototype/roomverse-3d/cafe/?from=home");
    const room04Image = card.locator(lang === "zh"
      ? 'img[alt*="上海紅磚小咖啡廳"]'
      : 'img[alt^="A concept painting of a small red-brick cafe in Shanghai"]');
    await room04Image.scrollIntoViewIfNeeded();
    await expect.poll(() => room04Image.getAttribute("src")).toContain("roomverse-room04-shanghai-slowly-concept-mobile.webp");
    await room04Image.evaluate((image) => image.decode());
    await page.goto(`/prototype/roomverse-3d/cafe/?lang=${lang}`);
    const poster = page.locator("#poster");
    // The whole painting is drawn by ::after (contain); ::before draws the same painting blurred behind it so a desktop frame has no flat bars.
    const faces = await poster.evaluate((el) => ["::before", "::after"].map((p) => { const css = getComputedStyle(el, p); return { image: css.backgroundImage, size: css.backgroundSize }; }));
    expect(faces[1].image).toMatch(/roomverse-room04-shanghai-slowly-concept-mobile\.webp/);
    expect(faces[1].size).toMatch(/contain/);
    expect(faces[0].image).toMatch(/roomverse-room04-shanghai-slowly-concept-mobile\.webp/);
    expect(faces[0].size).toMatch(/cover/);
  });
  }
}
