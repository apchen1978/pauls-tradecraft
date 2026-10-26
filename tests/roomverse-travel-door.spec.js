import fs from "node:fs/promises";
import { expect, test } from "@playwright/test";

const ROOM01 = "/prototype/roomverse-3d/";
const ROOM02 = "/prototype/roomverse-3d/bedroom/";
const QA = process.env.ROOMVERSE_QA_DIR || null;

test.beforeEach(async ({ page }) => {
  page.travelDoorErrors = [];
  page.on("pageerror", (error) => page.travelDoorErrors.push(String(error)));
});

test.afterEach(async ({ page }) => {
  expect(page.travelDoorErrors).toEqual([]);
});

async function enterRoom01(page, { lang = "zh", width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${ROOM01}?lang=${lang}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room?.geometryMetrics);
}

async function enterRoom02(page, { lang = "zh", width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${ROOM02}?lang=${lang}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__bedroom?.robotState?.().loaded);
}

async function assertNoOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("the shared directory has three rooms and the travel card never lists or links Room 03", async ({ page }) => {
  await page.goto(ROOM01);
  const rooms = await page.evaluate(async () => (await import("/prototype/roomverse-3d/rooms.js?v=1")).ROOMS);
  expect(rooms).toHaveLength(3);
  expect(rooms.find((room) => room.id === "room03").listed).toBe(false);
  expect(rooms.filter((room) => room.listed).map((room) => room.id)).toEqual(["room01", "room02"]);
  await enterRoom01(page);
  await page.locator("#travelDoorBtn").click();
  const dialog = page.getByRole("dialog", { name: "要去哪？" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Room 03|Bay Area|灣區/)).toHaveCount(0);
  await expect(dialog.locator("a[href*='kitchen']")).toHaveCount(0);
  await expect(dialog.locator(".travel-door-card")).toHaveCount(1);
});

test("Room 01 travel card is bilingual, keyboard dismissible, focus returning, and fits 390/1440", async ({ page }) => {
  await enterRoom01(page);
  const trigger = page.locator("#travelDoorBtn");
  await expect(trigger).toBeVisible();
  expect(await trigger.evaluate((el) => { const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; })).toBe(true);
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "要去哪？" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(dialog.locator(".travel-door-go")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.locator(".travel-door-close")).toBeFocused();
  const urlWhileOpen = page.url();
  await expect(page.getByRole("button", { name: "推開那扇門", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement.id)).toBe("travelDoorBtn");
  expect(page.url()).toBe(urlWhileOpen);

  await page.locator("#lang").click();
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Where to?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Step through the door" })).toBeVisible();
  await page.keyboard.press("Escape");

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.evaluate(() => window.__room.resize());
    await trigger.click();
    await assertNoOverflow(page);
    await page.keyboard.press("Escape");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  const animationName = await page.locator(".travel-door-dialog").evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).toBe("none");
  await page.keyboard.press("Escape");
});

test("Room 02 robot travel action cancels follow-me and returns focus to its bubble", async ({ page }) => {
  await enterRoom02(page, { width: 390 });
  await page.evaluate(() => window.__bedroom.tapRobot());
  const action = page.locator("#robotBubble [data-travel-door-action]");
  await expect(action).toBeVisible();
  expect(await action.evaluate((el) => { const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; })).toBe(true);
  await action.hover();
  await expect.poll(() => page.evaluate(() => window.__bedroom.robotState().pending)).toBe(false);
  await action.click();
  await expect(page.getByRole("dialog", { name: "要去哪？" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__bedroom.robotState().pending)).toBe(false);
  await page.waitForTimeout(1400);
  expect(page.url()).toContain("/bedroom/");
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => document.activeElement.matches("[data-travel-door-action]"))).toBe(true);
});

test("Room 01 robot travel action keeps its bubble available while the card is open", async ({ page }) => {
  await enterRoom01(page);
  await page.waitForTimeout(2500); // let the opening drift settle
  expect((await page.evaluate(() => window.__room.guideRobot())).bubble).toBe(false);
  await page.evaluate(() => window.__room.faceDoorWall());
  await expect.poll(() => page.evaluate(() => window.__room.guideRobot().bubble), { timeout: 8000 }).toBe(true);
  const action = page.locator("#robotBubble [data-travel-door-action]");
  await expect(action).toBeVisible();
  await action.click();
  await expect(page.getByRole("dialog", { name: "要去哪？" })).toBeVisible();
  await page.waitForTimeout(4400);
  await expect(action).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => document.activeElement.matches("[data-travel-door-action]"))).toBe(true);
});

test("choosing a travel destination preserves language and uses the existing room entry routes", async ({ page }) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterRoom01(page, { lang: "en" });
  await page.locator("#travelDoorBtn").click();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Step through the door" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/bedroom\/\?lang=en&from=room01/);
  await page.waitForFunction(() => window.__bedroom?.info);
  await page.locator("#travelDoorBtn").click();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Step through the door" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/prototype\/roomverse-3d\/\?lang=en&from=room02/);
  await page.waitForFunction(() => window.__room?.geometryMetrics);
});

test("travel-door screenshots and fixed-condition geometry counts (ROOMVERSE_QA_DIR)", async ({ page }) => {
  test.skip(!QA, "set ROOMVERSE_QA_DIR to save handoff screenshots and geometry metrics");
  test.setTimeout(180000);
  await fs.mkdir(QA, { recursive: true });
  const metrics = {};
  const baseline = {
    source: "read-only current live main before this branch",
    room01: { vertices: 57564, meshes: 163, triangles: 107948, robotLoaded: true },
    room02: { vertices: 58794, meshes: 321, drawCalls: 174, robotLoaded: true },
  };
  const collectRoom = async (roomId, enter) => {
    await enter(page, { lang: "zh", width: 1440 });
    await page.waitForTimeout(1500);
    metrics[roomId] = await page.evaluate(() => window.__room?.geometryMetrics?.() ?? (() => {
      const { vertices, meshes, drawCalls } = window.__bedroom.info();
      return { vertices, meshes, drawCalls };
    })());
    for (const lang of ["zh", "en"]) {
      if (lang === "en") await page.locator("#lang").click();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
        if (roomId === "room01") await page.evaluate(() => window.__room.resize());
        const trigger = page.locator("#travelDoorBtn");
        await trigger.scrollIntoViewIfNeeded();
        await trigger.click();
        await page.screenshot({ path: `${QA}/${roomId}-${lang}-${width}-card.png` });
        await page.keyboard.press("Escape");
        const oldHidden = await trigger.evaluate((el) => { const wasHidden = el.hidden; el.hidden = true; return wasHidden; });
        await page.locator("#portalRow").screenshot({ path: `${QA}/${roomId}-${lang}-${width}-button-before.png` });
        await trigger.evaluate((el, wasHidden) => { el.hidden = wasHidden; }, oldHidden);
        await page.locator("#portalRow").screenshot({ path: `${QA}/${roomId}-${lang}-${width}-button-after.png` });
      }
      if (roomId === "room01" && lang === "zh") {
        await page.evaluate(() => window.__room.faceDoorWall());
        const robot = await page.evaluate(() => window.__room.guideRobot());
        const box = await page.locator("#stage canvas").boundingBox();
        await page.mouse.click(box.x + (robot.ndc.x + 1) / 2 * box.width, box.y + (1 - robot.ndc.y) / 2 * box.height);
        await expect(page.locator("#robotBubble [data-travel-door-action]")).toBeVisible();
        await page.locator("#stage").screenshot({ path: `${QA}/${roomId}-${lang}-robot-action.png` });
        await page.keyboard.press("Escape");
      } else if (roomId === "room02" && lang === "zh") {
        await page.evaluate(() => window.__bedroom.tapRobot());
        await expect(page.locator("#robotBubble [data-travel-door-action]")).toBeVisible();
        await page.locator(".room").screenshot({ path: `${QA}/${roomId}-${lang}-robot-action.png` });
        await page.locator("#robotBubble [data-travel-door-action]").click();
        await page.keyboard.press("Escape");
      }
    }
    if (roomId === "room02") await page.evaluate(() => window.__bedroom.cancelRobotFollow());
  };
  await collectRoom("room01", enterRoom01);
  await collectRoom("room02", enterRoom02);
  const delta = Object.fromEntries(Object.keys(metrics).map((id) => [id, {
    vertices: metrics[id].vertices - baseline[id].vertices,
    meshes: metrics[id].meshes - baseline[id].meshes,
  }]));
  await fs.writeFile(`${QA}/geometry-after.json`, JSON.stringify({
    condition: "Chrome channel; 1440x1000; direct page entry; wait robotLoaded plus 1.5s; count all visible room geometry",
    baseline,
    branchAfter: { source: "local Vite build preview", ...metrics },
    delta,
  }, null, 2));
});
