import fs from "node:fs/promises";
import { expect, test } from "@playwright/test";

const ROOM01 = "/prototype/roomverse-3d/";
const QA = process.env.ROOMVERSE_QA === "1" ? "docs/qa/roomverse-portal" : null;
const ARRIVAL_QA = process.env.ROOMVERSE_QA === "1" ? "docs/qa/room01-return-arrival" : null;

async function enterRoom01(page, { lang = "zh", width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(`${ROOM01}?lang=${lang}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room && window.__room.portal);
}

test("the door swings open clear of the furniture, the doorway lights up, and closing restores everything", async ({ page }) => {
  await enterRoom01(page);
  const before = await page.evaluate(() => window.__room.roomDoor());
  expect(await page.evaluate(() => window.__room.openPortal({ go: false }))).toBe(true);
  const open = await page.evaluate(() => ({ portal: window.__room.portal(), swing: window.__room.doorSwingBounds() }));
  expect(Math.abs(open.portal.open)).toBeCloseTo(open.portal.openMax, 2);
  expect(open.portal.glow).toBe(true); // light from the other side shows in the doorway
  expect(open.swing.hits).toEqual([]); // the open leaf touches no sofa, table, lamp, plant, chair or robot
  await page.evaluate(() => window.__room.closePortal());
  const after = await page.evaluate(() => ({ door: window.__room.roomDoor(), portal: window.__room.portal() }));
  expect(after.portal.open).toBeCloseTo(0, 5);
  expect(after.portal.active).toBe(false);
  expect(after.portal.glow).toBe(false);
  expect(after.door.leaf).toEqual(before.leaf); // the closed door is exactly where it was
});

test("the guide robot stands near the TV, clear of the leaf; tapping it says what is behind the door", async ({ page }) => {
  await enterRoom01(page);
  await page.waitForTimeout(2500); // let the opening drift settle
  const g = await page.evaluate(() => window.__room.guideRobot());
  expect(g.min[1]).toBeLessThan(.01); // on the floor
  expect(g.max[1] - g.min[1]).toBeGreaterThan(.4); expect(g.max[1] - g.min[1]).toBeLessThan(.52);
  expect(g.min[0]).toBeGreaterThan(1.1); expect(g.max[0]).toBeLessThan(1.8); // moved from door to TV side at Paul request
  expect(g.min[2]).toBeGreaterThan(1.1); expect(g.max[2]).toBeLessThan(1.8); // near TV, clear of its cabinet
  expect((await page.evaluate(() => window.__room.guideRobot())).bubble).toBe(false); // quiet until someone looks at the door wall
  await page.evaluate(() => window.__room.faceDoorWall());
  await expect.poll(() => page.evaluate(() => window.__room.guideRobot().bubble)).toBe(true); // turning to the door wall brings the hint
  await expect.poll(() => page.evaluate(() => window.__room.guideRobot().bubble), { timeout: 8000 }).toBe(false); // it goes away by itself
  await page.evaluate(() => window.__room.faceDoorWall()); // looking again does not repeat it
  await page.waitForTimeout(600);
  expect((await page.evaluate(() => window.__room.guideRobot())).bubble).toBe(false);
  const p = await page.evaluate(() => window.__room.guideRobot());
  const box = await page.locator("#stage canvas").boundingBox();
  await page.mouse.click(box.x + (p.ndc.x + 1) / 2 * box.width, box.y + (1 - p.ndc.y) / 2 * box.height);
  await expect.poll(() => page.evaluate(() => window.__room.guideRobot().bubble)).toBe(true);
  expect(await page.evaluate(() => window.__room.guideRobot().phrase)).toContain("Room 02");
  await page.evaluate(() => window.__room.openPortal({ go: false }));
  expect((await page.evaluate(() => window.__room.doorSwingBounds())).hits).toEqual([]); // the open leaf does not touch the new robot either
});

for (const lang of ["zh", "en"]) {
  test(`the "Room 02" button opens the portal and arrives in Room 02 with the room already running (${lang})`, async ({ page }) => {
    test.setTimeout(90000);
    await enterRoom01(page, { lang });
    await expect(page.locator("#portalRow")).toBeVisible();
    await expect(page.locator("#portalBtn")).toContainText("Room 02");
    await page.locator("#portalBtn").click();
    await page.waitForURL(/\/bedroom\/\?.*from=room01/, { timeout: 20000 });
    expect(new URL(page.url()).searchParams.get("lang")).toBe(lang);
    await page.waitForFunction(() => window.__bedroom, null, { timeout: 30000 }); // no entrance button to press
    await page.waitForFunction(() => document.documentElement.classList.contains("ready"));
    await page.waitForFunction(() => !window.__bedroom.arriving(), null, { timeout: 15000 });
    const camera = await page.evaluate(() => window.__bedroom.info().camera);
    expect(camera).toEqual([-.2, 1.5, .1]); // the walk ends in the middle of the room (the opening look)
  });
}

test("with reduced motion the button simply opens Room 02, and arriving needs no walk-in", async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterRoom01(page);
  await page.locator("#portalBtn").click();
  await page.waitForURL(/\/bedroom\/\?.*from=room01/, { timeout: 20000 });
  await page.waitForFunction(() => window.__bedroom && !window.__bedroom.arriving());
  expect(await page.evaluate(() => window.__bedroom.info().camera)).toEqual([-.2, 1.5, .1]); // starts in the middle, like everyone else
});

test("turning to the right-hand wall and tapping the door itself opens the portal", async ({ page }) => {
  await enterRoom01(page);
  const box = await page.locator("#stage canvas").boundingBox();
  let ndc = null;
  for (let i = 0; i < 14; i++) {
    ndc = await page.evaluate(() => window.__room.doorNdc());
    if (Math.abs(ndc.x) < .5 && ndc.z < 1) break;
    await page.mouse.move(box.x + box.width * .3, box.y + box.height * .5);
    await page.mouse.down(); await page.mouse.move(box.x + box.width * .6, box.y + box.height * .5, { steps: 6 }); await page.mouse.up();
    await page.waitForTimeout(120);
  }
  expect(Math.abs(ndc.x), "the door is in view after turning").toBeLessThan(.6);
  const x = box.x + (ndc.x + 1) / 2 * box.width, y = box.y + (1 - ndc.y) / 2 * box.height;
  await page.mouse.click(x, y);
  await page.waitForFunction(() => window.__room.portal().active, null, { timeout: 5000 });
  await page.evaluate(() => window.__room.closePortal());
});

test("Room 01 arrival from Room 02 walks through the open door, closes it, then restores controls", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto(`${ROOM01}?lang=zh&from=room02`);
    await page.waitForFunction(() => window.__room?.returnArrival, null, { timeout: 60000 });
    await page.evaluate(() => window.__room.finishReturnArrival()); // settle the automatic visit before replaying the animation for deterministic QA
    expect(await page.evaluate(() => window.__room.beginReturnArrival())).toBe(true);
    const start = await page.evaluate(() => window.__room.returnArrival());
    expect(start.active).toBe(true);
    expect(start.controlsEnabled).toBe(false);
    expect(start.doorOpen).toBe(true);
    expect(start.startPosition[0]).toBeGreaterThan(2.0); // begin on the room side of the doorway threshold
    expect(start.camera[0]).toBeGreaterThan(2.0); // the first rendered camera pose is still at the doorway
    if (ARRIVAL_QA) {
      await fs.mkdir(ARRIVAL_QA, { recursive: true });
      await page.waitForTimeout(500); await page.locator("#stage").screenshot({ path: `${ARRIVAL_QA}/room01-arrival-${width}-entry.png` });
      await page.waitForTimeout(900); await page.locator("#stage").screenshot({ path: `${ARRIVAL_QA}/room01-arrival-${width}-walk.png` });
      await page.waitForTimeout(900); await page.locator("#stage").screenshot({ path: `${ARRIVAL_QA}/room01-arrival-${width}-settle.png` });
    } else {
      await page.waitForTimeout(1400);
    }
    const middle = await page.evaluate(() => window.__room.returnArrival());
    expect(middle.camera[0]).toBeLessThan(start.startPosition[0]); // the visitor has moved into the room
    await expect.poll(() => page.evaluate(() => window.__room.returnArrival().active), { timeout: 10000 }).toBe(false);
    const end = await page.evaluate(() => window.__room.returnArrival());
    expect(end.controlsEnabled).toBe(true);
    expect(end.doorOpen).toBe(false);
    expect(end.camera[0]).toBeCloseTo(0, 2);
    await expect(page.locator(".room-arrival-cover")).toHaveCount(0);
    if (ARRIVAL_QA) await page.locator("#stage").screenshot({ path: `${ARRIVAL_QA}/room01-arrival-${width}-settled.png` });
    expect(errors).toEqual([]);
  }
});

test("input during the Room 01 arrival interrupts the walk and hands control back", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${ROOM01}?lang=zh&from=room02`);
  await page.waitForFunction(() => window.__room?.returnArrival, null, { timeout: 60000 });
  await page.evaluate(() => window.__room.finishReturnArrival());
  expect(await page.evaluate(() => window.__room.beginReturnArrival())).toBe(true);
  const box = await page.locator("#stage canvas").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const state = await page.evaluate(() => window.__room.returnArrival());
  await page.mouse.up();
  expect(state.active).toBe(false);
  expect(state.controlsEnabled).toBe(true);
  expect(state.doorOpen).toBe(false);
  await expect(page.locator(".room-arrival-cover")).toHaveCount(0);
});

test("the room-to-room portal remains usable after the Room 02 to Room 01 arrival", async ({ page }) => {
  test.setTimeout(120000);
  await enterRoom01(page);
  await page.locator("#portalBtn").click();
  await page.waitForURL(/\/bedroom\/\?.*from=room01/, { timeout: 20000 });
  await page.waitForFunction(() => window.__bedroom && !window.__bedroom.arriving(), null, { timeout: 30000 });
  await page.locator("#portalBtn").click();
  await page.waitForURL(/\?lang=zh&from=room02/, { timeout: 20000 });
  await page.waitForFunction(() => window.__room?.returnArrival, null, { timeout: 60000 });
  await page.waitForTimeout(3200);
  expect(await page.evaluate(() => window.__room.returnArrival().active)).toBe(false);
  await page.locator("#portalBtn").click();
  await page.waitForURL(/\/bedroom\/\?.*from=room01/, { timeout: 20000 });
  await page.waitForFunction(() => window.__bedroom && !window.__bedroom.arriving(), null, { timeout: 30000 });
});

test("QA screenshots (set ROOMVERSE_QA=1)", async ({ page }) => {
  test.skip(!QA, "only when collecting QA images");
  test.setTimeout(300000);
  for (const width of [1440, 390]) {
    await enterRoom01(page, { width });
    await page.waitForTimeout(500);
    await page.locator("#stage").screenshot({ path: `${QA}/room01-before-${width}.png` });
    await page.locator("#portalRow").scrollIntoViewIfNeeded();
    await page.locator("#portalRow").screenshot({ path: `${QA}/portal-button-${width}.png` });
    const p = page.evaluate(() => window.__room.openPortal({ go: false }));
    await page.waitForTimeout(700); await page.locator("#stage").screenshot({ path: `${QA}/walk-${width}.png` });
    await page.waitForTimeout(900); await page.locator("#stage").screenshot({ path: `${QA}/open-${width}.png` });
    await p;
    await page.locator("#stage").screenshot({ path: `${QA}/doorway-${width}.png` });
    await page.evaluate(() => window.__room.closePortal());
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto(`/prototype/roomverse-3d/bedroom/?lang=zh&from=room01`);
    await page.waitForFunction(() => window.__bedroom, null, { timeout: 60000 });
    await page.waitForTimeout(700); await page.locator("#stage").screenshot({ path: `${QA}/arrive-1-${width}.png` });
    await page.waitForTimeout(1000); await page.locator("#stage").screenshot({ path: `${QA}/arrive-2-${width}.png` });
  }
});
