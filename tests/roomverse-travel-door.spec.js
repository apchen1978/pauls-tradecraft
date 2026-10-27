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

function contrastRatio(foreground, background) {
  const luminance = (hex) => {
    const channels = hex.match(/[0-9a-f]{2}/gi).map((channel) => parseInt(channel, 16) / 255)
      .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

async function waitForTravelDoorEnd(dialog) {
  await expect(dialog).toHaveCSS("opacity", "1", { timeout: 20000 });
}

test("travel card header remains visible and closes at the bottom in both rooms", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const currentRoom of ["room01", "room02"]) {
    await page.goto("/prototype/roomverse-3d/rooms.js");
    await page.evaluate(async (room) => {
      document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="/prototype/roomverse-3d/travel-door.css">');
      document.body.innerHTML = '<button id="travelDoorBtn" data-travel-door-trigger>Travel</button>';
      const { initTravelDoor } = await import("/prototype/roomverse-3d/travel-door.js?v=2");
      initTravelDoor({ currentRoom: room, getLang: () => "zh", onChoose: () => {} });
    }, currentRoom);
    const trigger = page.locator("#travelDoorBtn");
    await trigger.click();
    const dialog = page.getByRole("dialog");
    const header = dialog.locator(".travel-door-head");
    const close = dialog.locator(".travel-door-close");
    await expect(dialog).toBeVisible();
    await expect(header).toHaveCSS("position", "sticky");
    const scroll = await dialog.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      const dialogRect = el.getBoundingClientRect();
      const headerRect = el.querySelector(".travel-door-head").getBoundingClientRect();
      const closeRect = el.querySelector(".travel-door-close").getBoundingClientRect();
      return { top: el.scrollTop, dialogTop: dialogRect.top, headerTop: headerRect.top, closeTop: closeRect.top, closeBottom: closeRect.bottom, dialogBottom: dialogRect.bottom };
    });
    expect(scroll.top).toBeGreaterThan(0);
    expect(scroll.headerTop).toBeGreaterThanOrEqual(scroll.dialogTop);
    expect(scroll.closeTop).toBeGreaterThanOrEqual(scroll.dialogTop);
    expect(scroll.closeBottom).toBeLessThanOrEqual(scroll.dialogBottom);
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});

test("travel card final viewport screenshots (ROOMVERSE_QA_DIR)", async ({ page }) => {
  test.skip(!QA, "set ROOMVERSE_QA_DIR to save handoff screenshots");
  test.setTimeout(240000);
  await fs.mkdir(QA, { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [room, enter] of [["room01", enterRoom01], ["room02", enterRoom02]]) {
    await enter(page, { lang: "zh" });
    for (const lang of ["zh", "en"]) {
      if (lang === "en") await page.locator("#lang").click();
      for (const [label, width, height] of [["1440", 1440, 1000], ["390", 390, 844], ["844x390", 844, 390]]) {
        await page.setViewportSize({ width, height });
        if (room === "room01") await page.evaluate(() => window.__room.resize());
        const trigger = page.locator("#travelDoorBtn");
        await trigger.scrollIntoViewIfNeeded();
        await trigger.click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await dialog.evaluate((element) => { element.scrollTop = 0; });
        await page.screenshot({ path: `${QA}/${room}-${lang}-${label}-after-top.png` });
        await dialog.evaluate((element) => { element.scrollTop = element.scrollHeight; });
        await expect(dialog.locator(".travel-door-close")).toBeVisible();
        await page.screenshot({ path: `${QA}/${room}-${lang}-${label}-after-bottom.png` });
        await dialog.locator(".travel-door-close").click();
        await expect(trigger).toBeFocused();
      }
    }
  }
});

async function measureCardContrast(dialog) {
  return dialog.evaluate((element) => {
    const read = (node, backgroundNode = node) => {
      const style = getComputedStyle(node);
      return { color: style.color, background: getComputedStyle(backgroundNode).backgroundColor };
    };
    const card = element.querySelector(".travel-door-card");
    return {
      body: read(element.querySelector(".travel-door-meta"), card),
      secondary: read(element.querySelector(".travel-door-meta p"), card),
      action: read(element.querySelector(".travel-door-go")),
      opacity: Number(getComputedStyle(element).opacity),
    };
  });
}

function rgbToHex(rgb) {
  return `#${rgb.match(/\d+/g).slice(0, 3).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`;
}

test("the shared directory lists three rooms and travel cards include Room 03", async ({ page }) => {
  await page.goto(ROOM01);
  const rooms = await page.evaluate(async () => (await import("/prototype/roomverse-3d/rooms.js?v=2")).ROOMS);
  expect(rooms).toHaveLength(3);
  expect(rooms.find((room) => room.id === "room03").listed).toBe(true);
  expect(rooms.filter((room) => room.listed).map((room) => room.id)).toEqual(["room01", "room02", "room03"]);
  await enterRoom01(page);
  await page.locator("#travelDoorBtn").click();
  const dialog = page.getByRole("dialog", { name: "要去哪？" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Room 03/)).toHaveCount(1);
  await expect(dialog.locator(".travel-door-card")).toHaveCount(2);
});

test("Room 01 travel card is bilingual, keyboard dismissible, focus returning, and fits 390/1440", async ({ page }) => {
  await enterRoom01(page);
  const trigger = page.locator("#travelDoorBtn");
  await expect(trigger).toBeVisible();
  expect(await trigger.evaluate((el) => { const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; })).toBe(true);
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "要去哪？" });
  await expect(dialog).toBeVisible();
  await waitForTravelDoorEnd(dialog);
  const tones = await measureCardContrast(dialog);
  expect(tones.opacity).toBe(1);
  expect(contrastRatio(rgbToHex(tones.body.color), rgbToHex(tones.body.background))).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(rgbToHex(tones.secondary.color), rgbToHex(tones.secondary.background))).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(rgbToHex(tones.action.color), rgbToHex(tones.action.background))).toBeGreaterThanOrEqual(4.5);
  const cover = await dialog.locator("img").first().evaluate((image) => ({ fit: getComputedStyle(image).objectFit, height: image.getBoundingClientRect().height, viewport: innerHeight }));
  expect(cover.fit).toBe("cover");
  expect(cover.height).toBeLessThanOrEqual(cover.viewport * 0.4 + 1);
  await page.keyboard.press("Tab");
  await expect(dialog.locator(".travel-door-go").nth(0)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.locator(".travel-door-go").nth(1)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.locator(".travel-door-close")).toBeFocused();
  const urlWhileOpen = page.url();
  await expect(dialog.locator(".travel-door-card").filter({ hasText: "Room 02" }).getByRole("button", { name: "推開那扇門", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement.id)).toBe("travelDoorBtn");
  expect(page.url()).toBe(urlWhileOpen);

  await page.locator("#lang").click();
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Where to?" })).toBeVisible();
  await expect(page.locator(".travel-door-card").first().getByRole("button", { name: "Step through the door" })).toBeVisible();
  await page.keyboard.press("Escape");

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.evaluate(() => window.__room.resize());
    await trigger.click();
    await waitForTravelDoorEnd(page.getByRole("dialog"));
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
  await expect(page.locator(".travel-door-card").first().getByRole("button", { name: "Step through the door" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/bedroom\/\?lang=en&from=room01/);
  await page.waitForFunction(() => window.__bedroom?.info);
  await page.locator("#travelDoorBtn").click();
  await page.keyboard.press("Tab");
  await expect(page.locator(".travel-door-card").first().getByRole("button", { name: "Step through the door" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/prototype\/roomverse-3d\/\?lang=en&from=room02/);
  await page.waitForFunction(() => window.__room?.geometryMetrics);
});

test("Room 01 and Room 02 can travel to Room 03 and return with language preserved", async ({ page }) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [source, enter, lang] of [["room01", enterRoom01, "zh"], ["room02", enterRoom02, "en"]]) {
    await enter(page, { lang });
    await page.locator("#travelDoorBtn").click();
    await page.locator(".travel-door-card").filter({ hasText: "Room 03" }).locator("button").click();
    await page.waitForURL(new RegExp(`/kitchen/\\?lang=${lang}&from=${source}`));
    const exit = page.locator("#headerOtherRooms");
    await expect(exit).toHaveAttribute("href", new RegExp(`lang=${lang}`));
    await exit.click();
    await page.waitForURL(source === "room01" ? /roomverse-3d\/\?lang=zh/ : /bedroom\/\?lang=en/);
  }
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
        const dialog = page.getByRole("dialog");
        await waitForTravelDoorEnd(dialog);
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
