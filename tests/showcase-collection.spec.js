import { expect, test } from "@playwright/test";

// The paintings and music sit right under the four rooms, large, so a visitor sees rooms, pictures and music together.
for (const [width, height, lang] of [[390, 844, "zh"], [1440, 1000, "zh"], [1440, 1000, "en"]]) {
  test(`${lang} ${width}: paintings and music collection sits under the rooms`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(`/?lang=${lang}#showcase`);
    const rooms = page.locator("#showcase article").first();
    const collection = page.locator("#showcase-collection");
    await expect(collection).toBeAttached();
    // Directly after the ROOMVERSE card, before the next work.
    const order = await page.evaluate(() => {
      const a = document.querySelector("#showcase article").getBoundingClientRect().bottom;
      const c = document.querySelector("#showcase-collection").getBoundingClientRect();
      const next = document.querySelectorAll("#showcase article")[1].getBoundingClientRect().top;
      return { gap: c.top - a, nextAfter: next >= c.bottom };
    });
    expect(order.gap).toBeGreaterThan(0);
    expect(order.gap).toBeLessThan(60);
    expect(order.nextAfter).toBe(true);
    await expect(rooms.locator("img")).toHaveCount(4);

    await expect(collection.getByRole("link", { name: lang === "zh" ? "走進畫廊" : "Enter the Gallery" })).toHaveAttribute("href", `/gallery/?lang=${lang}`);
    await expect(collection.getByRole("link", { name: lang === "zh" ? "走進 Music Lounge" : "Enter the Music Lounge" })).toHaveAttribute("href", `/music-lounge/?lang=${lang}`);

    // Far below the first screen: every picture is natively lazy until the visitor gets close.
    for (const attr of await collection.locator("img").evaluateAll((list) => list.map((i) => i.getAttribute("loading")))) expect(attr).toBe("lazy");
    await collection.scrollIntoViewIfNeeded();
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
    await collection.scrollIntoViewIfNeeded();
    const imgs = collection.locator("img");
    await expect(imgs).toHaveCount(10);
    await expect.poll(() => imgs.evaluateAll((list) => list.every((i) => i.complete && i.naturalWidth > 0))).toBe(true);
    // Generous: every picture is big enough to read, none is a thumbnail strip.
    const sizes = await imgs.evaluateAll((list) => list.map((i) => i.getBoundingClientRect().width));
    for (const w of sizes) expect(w).toBeGreaterThan(width === 390 ? 140 : 250);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
