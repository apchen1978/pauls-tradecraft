import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const OUT = "docs/qa/roomverse-mobile-toolbar";

const FULL = {
  zh: { director: "看 8 秒房間短片", shuffle: "幫我隨機搭一間", save: "存成明信片" },
  en: { director: "Watch the 8-second room tour", shuffle: "Surprise me with a room", save: "Save as a postcard" },
};
const SHORT = {
  zh: { director: "8秒短片", shuffle: "隨機搭一間", save: "存成明信片" },
  en: { director: "8s tour", shuffle: "Random room", save: "Save postcard" },
};

async function enter(page, lang) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${PAGE}?lang=${lang}&mood=rain&wall=original&rug=ivory&curtain=linen&print=hills`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => scrollTo(0, 0));
}

function roomChoice(page) {
  return page.evaluate(() => {
    const q = new URL(location.href).searchParams;
    return { mood: q.get("mood"), wall: q.get("wall"), rug: q.get("rug"), curtain: q.get("curtain"), print: q.get("print") };
  });
}

test.beforeAll(async () => { await mkdir(OUT, { recursive: true }); });

for (const lang of ["zh", "en"]) {
  test(`${lang} at 390px: tour, random room and postcard sit in one row above the room`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await enter(page, lang);
    const buttons = [
      page.locator("#roomToolbar .director"),
      page.locator("#roomToolbar .shuffle"),
      page.locator("#roomToolbar .save:not(.director):not(.shuffle)"),
    ];
    await expect(page.locator("#panel .save")).toHaveCount(0);
    await expect(page.getByRole("button", { name: FULL[lang].save, exact: true })).toHaveCount(1);
    const boxes = [];
    for (const [button, key] of buttons.map((button, i) => [button, ["director", "shuffle", "save"][i]])) {
      await expect(button).toBeVisible();
      await expect(button).toHaveAccessibleName(FULL[lang][key]);
      await expect(button).toHaveText(SHORT[lang][key]);
      const box = await button.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      boxes.push(box);
    }
    expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(1);
    expect(Math.abs(boxes[1].y - boxes[2].y)).toBeLessThan(1);
    const place = await page.evaluate(() => {
      const bar = document.querySelector("#roomToolbar").getBoundingClientRect();
      const stage = document.querySelector("#stage").getBoundingClientRect();
      const clipped = [...document.querySelectorAll("#roomToolbar button")].map((b) => b.scrollWidth - b.clientWidth);
      return { gap: stage.top - bar.bottom, clipped, scroll: document.documentElement.scrollWidth <= innerWidth };
    });
    expect(place.gap).toBeGreaterThanOrEqual(0);
    expect(place.gap).toBeLessThanOrEqual(1);
    expect(Math.max(...place.clipped)).toBeLessThanOrEqual(1);
    expect(place.scroll).toBe(true);
    await page.screenshot({ path: `${OUT}/390-${lang}.png` });
  });
}

test("zh at 390px: random room changes the finishes and leaves the room in view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page, "zh");
  const plaque = await page.evaluate(() => window.__room.plaqueView());
  expect(plaque.firstHit).toBe("house-plaque");
  const center = plaque.corners.reduce((sum, corner) => ({ x: sum.x + corner.x / 4, y: sum.y + corner.y / 4 }), { x: 0, y: 0 });
  expect(Math.abs(center.x)).toBeLessThan(1);
  expect(Math.abs(center.y)).toBeLessThan(1);
  const before = await roomChoice(page);
  await page.locator("#roomToolbar .shuffle").click();
  const after = await roomChoice(page);
  expect(after.mood).toBe(before.mood);
  expect(after.wall).not.toBe(before.wall);
  expect(after.rug).not.toBe(before.rug);
  expect(after.curtain).not.toBe(before.curtain);
  expect(after.print).not.toBe(before.print);
  const view = await page.evaluate(() => {
    const r = document.querySelector("#stage").getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    return { ratio: visible / r.height, top: r.top, scroll: document.documentElement.scrollWidth <= innerWidth };
  });
  expect(view.top).toBeGreaterThanOrEqual(0);
  expect(view.ratio).toBeGreaterThan(0.85);
  expect(view.scroll).toBe(true);
  await page.screenshot({ path: `${OUT}/390-zh-after-random.png` });
});

test("zh at 1440px: the three actions stay in the side panel", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, "zh");
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); });
  await expect(page.locator("#roomToolbar")).toBeHidden();
  await expect(page.locator("#roomToolbar .save")).toHaveCount(0);
  const names = ["director", "shuffle", "save"];
  for (const key of names) {
    const button = key === "save"
      ? page.locator("#panel .save:not(.director):not(.shuffle)")
      : page.locator(`#panel .${key}`);
    await expect(button).toBeVisible();
    await expect(button).toHaveAccessibleName(FULL.zh[key]);
    await expect(button).toHaveText(FULL.zh[key]);
  }
  const bar = await page.locator("#roomToolbar").boundingBox();
  expect(bar).toBeNull();
  await page.screenshot({ path: `${OUT}/1440-zh.png` });
});
