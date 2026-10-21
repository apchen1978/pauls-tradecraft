import { test, expect } from "@playwright/test";
import { stat } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const MOOD_NAMES = [
  "下雨天想窩在家裡", "Cozy family", "未來輕科技宅男", "粉領新貴風", "週日午後慢慢過", "追劇夜",
  "Rainy day, staying in", "Light-tech homebody", "Chic city professional", "Slow Sunday", "Series night",
];

async function enter(page, { lang = "zh", mood = "rain", width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Keep the left-wall picture spot from loading on its own, so the first light count stays at the room's six.
  await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
  await page.goto(`${PAGE}?lang=${lang}&mood=${mood}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room);
  await page.waitForFunction(() => window.__room.homeBoard().loaded);
}

test("home board fills the left wall without covering the painting or the plaque", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await enter(page);
  expect(await page.evaluate(() => window.__room.tableLampLighting().lightCount)).toBe(6);
  await page.evaluate(() => { window.__room.setOrbitAngle(90); return window.__room.loadLeftWallArt(); });
  await page.waitForFunction(() => window.__room.leftWallArt().ready);
  const placed = await page.evaluate(() => {
    const board = window.__room.homeBoard();
    const art = window.__room.leftWallArt();
    return { board, artZ: art.painting.min[2], lights: window.__room.tableLampLighting().lightCount };
  });
  expect(placed.lights).toBe(7);
  expect(placed.board.visible).toBe(true);
  expect(placed.board.markers).toBe(4);
  expect(placed.board.notes).toEqual(["call", "walk", "dentist", "dry"]);
  expect(placed.board.file).toBe("home-board-en-v2.webp");
  expect(placed.board.copy.lines).toEqual(["Buy milk", "Water the plants", "Friday family dinner", "Fresh sheets"]);
  expect(placed.board.copy.notes).toEqual(["Call mom", "Book dentist", "Pick up dry cleaning", "Walk the dog"]);
  expect(placed.board.collisions).toEqual([]);
  expect(placed.board.bounds.min[0]).toBeGreaterThan(-2.6);
  expect(placed.board.bounds.max[0]).toBeLessThan(-2.4);
  expect(placed.board.bounds.max[2]).toBeLessThan(placed.artZ - .40);
  expect(placed.board.face.max[1] - placed.board.face.min[1]).toBeCloseTo(.9, 2);
  expect(placed.board.face.max[2] - placed.board.face.min[2]).toBeCloseTo(.6, 2);
  const words = [...placed.board.copy.lines, ...placed.board.copy.notes].join(" ");
  for (const name of MOOD_NAMES) expect(words).not.toContain(name);
  expect(words).not.toMatch(/\d/);
  await page.evaluate(() => window.__room.setOrbitAngle(0));
  expect(await page.evaluate(() => window.__room.plaqueView().firstHit)).toBe("house-plaque");
  expect(await page.evaluate(() => window.__room.postcard().width)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("home board follows the page language and stays up in every feeling", async ({ page }) => {
  await enter(page, { lang: "en" });
  const english = await page.evaluate(() => window.__room.homeBoard());
  expect(english.lang).toBe("en");
  expect(english.file).toBe("home-board-en-v2.webp");
  expect(english.copy.lines).toEqual(["Buy milk", "Water the plants", "Friday family dinner", "Fresh sheets"]);
  expect(english.copy.notes).toEqual(["Call mom", "Book dentist", "Pick up dry cleaning", "Walk the dog"]);
  await page.evaluate(() => window.__room.setLang("zh"));
  const chinese = await page.evaluate(() => window.__room.homeBoard());
  expect(chinese.file).toBe("home-board-en-v2.webp");
  expect(chinese.copy.lines).toEqual(english.copy.lines);
  expect(chinese.copy.notes).toEqual(english.copy.notes);
  for (const mood of ["rain", "family", "tech", "chic", "slow", "tv"]) {
    const board = await page.evaluate((value) => { window.__room.set("mood", value); return window.__room.homeBoard(); }, mood);
    expect(board.visible).toBe(true);
    expect(board.collisions).toEqual([]);
  }
});

for (const width of [390, 1440]) {
  test(`home board keeps orbit and the page width at ${width}px`, async ({ page }) => {
    await enter(page, { width });
    await page.evaluate(() => window.__room.setOrbitAngle(90));
    const before = await page.evaluate(() => window.__room.angle());
    const canvas = page.locator("#stage canvas");
    const box = await canvas.boundingBox();
    const y = box.y + box.height / 2;
    const x0 = box.x + 24;
    const x1 = x0 + Math.min(box.width * .45, box.height * .7);
    await page.mouse.move(x0, y);
    await page.mouse.down();
    await page.mouse.move(x1, y, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ angle: window.__room.angle(), enabled: window.__room.director().controlsEnabled }));
    const turned = Math.abs((((after.angle - before) % 360) + 540) % 360 - 180);
    expect(turned).toBeGreaterThan(12);
    expect(after.enabled).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.__room.setOrbitAngle(0));
    expect(await page.evaluate(() => window.__room.plaqueView().firstHit)).toBe("house-plaque");
  });
}

test("home board pictures stay small", async () => {
  const files = [
    "home-board-en-v2.webp",
    "home-note-call-v1.webp", "home-note-dentist-v1.webp", "home-note-dry-v1.webp", "home-note-walk-v1.webp",
  ];
  for (const file of files) {
    const size = (await stat(`public/prototype/roomverse-3d/art/${file}`)).size;
    expect(size).toBeLessThan(file.startsWith("home-board") ? 40000 : 15000);
  }
});
