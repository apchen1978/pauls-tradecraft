import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });
const MOODS = ["golden", "movie", "night", "dinner", "sunday", "thanksgiving"];
const VIEWS = ["fog-morning", "spring-bloom", "overcast-rain"];

async function loadRoom(page, width, lang = "zh") {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().wallArtLoaded && window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
  await expect(page.locator("#swaps")).toBeVisible();
}

// Paul 2026-10-29: Codex painted three more window views; the swap panel offers them next to "follow the mood".
for (const width of [1440, 390]) {
  test(`window views swap, keep the mood's tint, fetch only when chosen and cost no geometry at ${width}px`, async ({ page }) => {
    const yardRequests = [];
    page.on("request", (request) => { if (request.url().includes("room03-yard-")) yardRequests.push(request.url()); });
    await loadRoom(page, width);
    expect(yardRequests, "no replacement view is downloaded until one is chosen").toEqual([]);
    expect(await page.evaluate(() => window.__room03.yardViews())).toEqual(["auto", ...VIEWS]);
    const base = await page.evaluate(() => window.__room03.info());
    expect(base.yardView).toBe("auto");
    expect(base.courtyardMap, "golden hour keeps the original photo").toBe("courtyard-v1");
    await page.locator("#swaps summary").click();
    for (const view of VIEWS) {
      await page.locator(`#swapGroups button[data-frame="yard"][data-art="${view}"]`).click();
      await page.waitForFunction((name) => window.__room03.info().courtyardMap === `courtyard-${name}`, view, { timeout: 15000 });
      for (const mood of MOODS) {
        await page.evaluate((name) => window.__room03.setMood(name), mood);
        const info = await page.evaluate(() => window.__room03.info());
        expect(info.yardView, `${mood}: choice sticks`).toBe(view);
        expect(info.courtyardMap, `${mood}: the chosen view replaces the mood's own photo, Thanksgiving included`).toBe(`courtyard-${view}`);
        expect(info.vertices, `${view}/${mood}: vertices`).toBeGreaterThan(0);
        if (QA && ["golden", "night", "dinner"].includes(mood)) await page.locator(".room").screenshot({ path: `${QA}/yard-${width}-${view}-${mood}.png` });
      }
      await page.evaluate(() => window.__room03.setMood("golden"));
      const golden = await page.evaluate(() => window.__room03.info());
      expect(golden.vertices, `${view}: vertices unchanged`).toBe(base.vertices);
      expect(golden.meshes, `${view}: meshes unchanged`).toBe(base.meshes);
      expect(golden.drawCallsLastFrame, `${view}: draw calls unchanged`).toBe(base.drawCallsLastFrame);
      expect(await page.locator(`#swapGroups button[data-frame="yard"][aria-pressed="true"]`).getAttribute("data-art")).toBe(view);
    }
    // Back to following the mood: golden returns to the original photo and Thanksgiving to the autumn one.
    await page.locator('#swapGroups button[data-frame="yard"][data-art="auto"]').click();
    await page.waitForFunction(() => window.__room03.info().yardView === "auto");
    await page.evaluate(() => window.__room03.setMood("golden"));
    expect((await page.evaluate(() => window.__room03.info())).courtyardMap).toBe("courtyard-v1");
    await page.evaluate(() => window.__room03.setMood("thanksgiving"));
    await expect.poll(() => page.evaluate(() => window.__room03.info().courtyardMap)).toBe("courtyard-autumn-v1");
    expect(yardRequests.length, "each view was fetched once or more, never all at once").toBeGreaterThanOrEqual(3);
  });
}

test("the window-view group is labelled in both languages and its buttons are 44 px", async ({ page }) => {
  await loadRoom(page, 390);
  await page.locator("#swaps summary").click();
  await expect(page.locator('#swapGroups .swap-group[data-frame="yard"] h3')).toHaveText("窗外景色");
  await expect(page.locator('#swapGroups button[data-art="fog-morning"]')).toHaveText("濃霧早晨");
  await page.locator("#lang").click();
  await expect(page.locator('#swapGroups .swap-group[data-frame="yard"] h3')).toHaveText("View outside");
  await expect(page.locator('#swapGroups button[data-art="fog-morning"]')).toHaveText("Foggy morning");
  for (const button of await page.locator('#swapGroups button[data-frame="yard"]').all()) expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});
