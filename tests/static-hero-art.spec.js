import { expect, test } from "@playwright/test";

// The phone hero artwork is static HTML (#hero-art, outside #root). It must paint without
// any script, stay the very same element after React mounts, never be drawn twice, and
// not move anything.

test.describe("phone 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("paints from the HTML alone, in the hero's place and size, with no inline script", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/", { waitUntil: "load" });
    const img = page.locator("#hero-art img");
    await expect(img).toBeVisible();
    const box = await img.boundingBox();
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.height)).toBe(224);
    expect(Math.round(box.y)).toBe(69);
    expect(await img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.body.innerText.trim())).toBe("");
    // CSP stays strict: the only scripts are the JSON-LD data block and the external module.
    const scripts = await page.evaluate(() => [...document.scripts].map((s) => ({ type: s.type, src: !!s.src, inline: !s.src && s.type !== "application/ld+json" })));
    expect(scripts.filter((s) => s.inline)).toEqual([]);
  });

  test("is the same element after React mounts, is drawn once, and does not move or shift", async ({ page }) => {
    const requests = [];
    page.on("request", (request) => { if (/paul-art/.test(request.url())) requests.push(request.url()); });
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
      document.addEventListener("DOMContentLoaded", () => { window.__art = document.querySelector("#hero-art img"); });
    });
    await page.goto("/?lang=zh", { waitUntil: "load" });
    await expect(page.locator("section#top h1")).toBeVisible();
    await page.waitForTimeout(1500);

    const state = await page.evaluate(() => {
      const art = document.querySelector("#hero-art img");
      const rect = art.getBoundingClientRect();
      // Only the hero area: the About section reuses the large file further down the page.
      const visible = [...document.querySelectorAll('#hero-art img, section#top img[src*="paul-art"]')].filter((el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== "hidden");
      return {
        same: window.__art === art && document.contains(window.__art),
        box: [Math.round(rect.width), Math.round(rect.height), Math.round(rect.top)],
        visibleCount: visible.length,
        heroTop: Math.round(document.querySelector("section#top").getBoundingClientRect().top),
        cls: window.__cls,
      };
    });
    expect(state.same).toBe(true);
    expect(state.box).toEqual([390, 224, 69]);
    expect(state.visibleCount).toBe(1);
    expect(state.heroTop).toBe(69);
    expect(state.cls).toBeLessThan(0.001);
    expect(requests.length).toBe(1);
    expect(requests[0]).toContain("paul-art-800.webp");
  });
});

test.describe("desktop 1440px", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("the static layer stays hidden, the hero draws its own artwork once, with one download", async ({ page }) => {
    const requests = [];
    page.on("request", (request) => { if (/paul-art/.test(request.url())) requests.push(request.url().split("/").pop()); });
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("section#top h1")).toBeVisible();
    expect(await page.locator("#hero-art").isVisible()).toBe(false);
    const visible = await page.evaluate(() => [...document.querySelectorAll('#hero-art img, section#top img[src*="paul-art"]')].filter((el) => el.getBoundingClientRect().width > 0).length);
    expect(visible).toBe(1);
    expect(requests).toEqual(["paul-art.webp"]);
  });
});
