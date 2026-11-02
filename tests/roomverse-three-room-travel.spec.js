import fs from "node:fs/promises";
import { expect, test } from "@playwright/test";

const ROOT = "/prototype/roomverse-3d/";
const URLS = {
  room01: ROOT,
  room02: ROOT + "bedroom/",
  room03: ROOT + "kitchen/",
};
const TITLES = {
  room01: "Room 01｜客廳",
  room02: "Room 02｜Brooklyn Studio",
  room03: "Room 03｜Bay Area Kitchen",
};
const QA = process.env.ROOMVERSE_QA_DIR || null;

async function enterRoom(page, room, { from = null, width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  const query = new URLSearchParams({ lang: "zh" });
  if (from) query.set("from", from);
  await page.goto(URLS[room] + "?" + query);
  if (room === "room01") {
    if (from !== "room02" && from !== "room03") await page.locator("#enter").click();
    await page.waitForFunction(() => Boolean(window.__room?.portal));
  } else if (room === "room02") {
    if (from !== "room01" && from !== "room03") await page.locator("#enter").click();
    await page.waitForFunction(() => Boolean(window.__bedroom?.info));
  } else {
    await page.waitForFunction(() => Boolean(window.__room03));
  }
}

function triggerFor(room) {
  return room === "room03" ? "#headerOtherRooms" : "#travelDoorBtn";
}

async function choose(page, room, destination) {
  await page.locator(triggerFor(room)).click();
  const dialog = page.getByRole("dialog", { name: "要去哪？" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".travel-door-card")).toHaveCount(2);
  const card = dialog.locator(".travel-door-card").filter({ hasText: TITLES[destination] });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "推開那扇門" }).click();
}

async function turnUntilTargetVisible(page, selector) {
  const canvas = page.locator("#stage canvas");
  const box = await canvas.boundingBox();
  for (let turn = 0; turn < 12; turn++) {
    if (await page.locator(selector).isVisible()) return;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.72, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.28, y, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(100);
  }
  await expect(page.locator(selector), `${selector} should enter the view while orbiting`).toBeVisible();
}

async function waitForArrival(page, room, from) {
  await page.waitForURL((url) => url.pathname === URLS[room] && url.searchParams.get("lang") === "zh" && url.searchParams.get("from") === from, { timeout: 20000 });
  if (room === "room01") {
    if (from !== "room02" && from !== "room03") await page.locator("#enter").click();
    await page.waitForFunction(() => Boolean(window.__room?.portal));
  } else if (room === "room02") {
    if (from !== "room01" && from !== "room03") await page.locator("#enter").click();
    await page.waitForFunction(() => Boolean(window.__bedroom?.info));
  } else {
    await page.waitForFunction(() => Boolean(window.__room03));
  }
}

test("each room offers the other two destinations from a shared chooser", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const current of ["room01", "room02", "room03"]) {
    await enterRoom(page, current);
    await page.locator(triggerFor(current)).click();
    const dialog = page.getByRole("dialog", { name: "要去哪？" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".travel-door-card")).toHaveCount(2);
    for (const destination of Object.keys(URLS).filter((id) => id !== current)) {
      await expect(dialog.locator(".travel-door-card").filter({ hasText: TITLES[destination] })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  }
});

test("Room 03 door and guide robot both reach the shared chooser", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterRoom(page, "room03", { width: 390 });
  for (const hitTarget of ["#doorHit", "#robotHit"]) {
    const hit = page.locator(hitTarget);
    await turnUntilTargetVisible(page, hitTarget);
    await hit.click();
    await expect(page.locator("#robotBubble")).toBeVisible();
    await page.locator("#robotBubble [data-robot-travel]").click();
    const dialog = page.getByRole("dialog", { name: "要去哪？" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".travel-door-card")).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await page.keyboard.press("Escape"); // dismiss the anchored bubble before testing the next target
  }
});

test("all six directed room routes preserve source and arrive without page errors", async ({ page }) => {
  test.setTimeout(300000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  for (const source of Object.keys(URLS)) {
    for (const destination of Object.keys(URLS).filter((id) => id !== source)) {
      await enterRoom(page, source);
      await choose(page, source, destination);
      await waitForArrival(page, destination, source);
      expect(errors, source + " → " + destination).toEqual([]);
    }
  }
});

test("three-room chooser screenshots at desktop and mobile (ROOMVERSE_QA_DIR)", async ({ page }) => {
  test.skip(!QA, "set ROOMVERSE_QA_DIR to save handoff screenshots");
  test.setTimeout(240000);
  await fs.mkdir(QA, { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const room of Object.keys(URLS)) for (const width of [1440, 390]) {
    await enterRoom(page, room, { width });
    await page.locator(triggerFor(room)).scrollIntoViewIfNeeded();
    await page.locator(triggerFor(room)).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.screenshot({ path: QA + "/" + room + "-" + width + "-travel-choices.png" });
    await page.keyboard.press("Escape");
  }
});
