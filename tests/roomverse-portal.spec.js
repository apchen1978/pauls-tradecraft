import { expect, test } from "@playwright/test";

const ROOM01 = "/prototype/roomverse-3d/";
const QA = process.env.ROOMVERSE_QA === "1" ? "docs/qa/roomverse-portal" : null;

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

test("a second robot stands by the door, clear of the leaf; tapping it hops and says what is behind the door; turning toward the door wall brings the hint once", async ({ page }) => {
  await enterRoom01(page);
  await page.waitForTimeout(2500); // let the opening drift settle
  const g = await page.evaluate(() => window.__room.guideRobot());
  expect(g.min[1]).toBeLessThan(.01); // on the floor
  expect(g.max[1] - g.min[1]).toBeGreaterThan(.4); expect(g.max[1] - g.min[1]).toBeLessThan(.52);
  expect(g.max[0]).toBeLessThan(2.6 - .05); expect(g.min[0]).toBeGreaterThan(1.8); // by the right-hand wall, inside the room
  expect(g.max[2]).toBeLessThan(.8); // north of the leaf's hinge (z = 0.81): it never stands in the swing
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
    expect(camera).toEqual([1.8, 2.05, 2.38]); // the walk ends at the usual overview corner
  });
}

test("with reduced motion the button simply opens Room 02, and arriving needs no walk-in", async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterRoom01(page);
  await page.locator("#portalBtn").click();
  await page.waitForURL(/\/bedroom\/\?.*from=room01/, { timeout: 20000 });
  await page.waitForFunction(() => window.__bedroom && !window.__bedroom.arriving());
  expect(await page.evaluate(() => window.__bedroom.info().camera)).toEqual([1.8, 2.05, 2.38]);
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
