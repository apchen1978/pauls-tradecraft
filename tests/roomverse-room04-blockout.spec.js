import { test, expect } from "@playwright/test";
import { LEDGER } from "./helpers/room04-ledger.js";

const PAGE = "/prototype/roomverse-3d/cafe/";

async function open(page, width, lang = "zh") {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room04, null, { timeout: 120000 });
  await page.waitForFunction((vertices) => window.__room04.info().vertices === vertices, LEDGER.scene.vertices, { timeout: 60000 });
  return errors;
}

test("the Room 04 ledger is internally consistent", () => {
  const last = LEDGER.history[LEDGER.history.length - 1];
  expect(last.vertices, "the newest history line is the current scene").toBe(LEDGER.scene.vertices);
  expect(last.meshes).toBe(LEDGER.scene.meshes);
  expect(last.desktopCalls).toBe(LEDGER.openingDrawCalls.desktop);
  expect(last.phoneCalls).toBe(LEDGER.openingDrawCalls.phone);
  expect(LEDGER.scene.vertices).toBeLessThanOrEqual(LEDGER.caps.vertices);
  expect(LEDGER.scene.meshes).toBeLessThanOrEqual(LEDGER.caps.meshes);
});

test("Room 04 mood buttons stay fully on the first screen at 1440×900 and on a 390-wide phone", async ({ page }) => {
  test.setTimeout(180000);
  for (const width of [1440, 390]) {
    await open(page, width);
    const layout = await page.evaluate(() => {
      const moods = document.querySelector("#moods")?.getBoundingClientRect();
      return {
        fullyVisible: Boolean(moods && moods.top >= 0 && moods.bottom <= window.innerHeight - 1),
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        bottom: moods?.bottom ?? null,
        vh: window.innerHeight,
      };
    });
    expect(layout.fullyVisible, `${width}px: the mood bar should be on the first screen (bottom ${layout.bottom} / vh ${layout.vh})`).toBe(true);
    expect(layout.overflowX, `${width}px: no horizontal page scroll`).toBe(false);
  }
});

for (const [width, key] of [[1440, "desktop"], [390, "phone"]]) {
  test(`Room 04 blockout opens at ${width}px inside its budget, with real sizes`, async ({ page }) => {
    const errors = await open(page, width);
    await page.waitForFunction(() => window.__room04.info().art.includes("room04-print-p8-steam.webp"));
    const info = await page.evaluate(() => window.__room04.info());
    expect(errors).toEqual([]);
    expect(info.title).toBe("Room 04｜Shanghai, Slowly");
    expect(info.mood).toBe("morning");
    expect(info.vertices).toBe(LEDGER.scene.vertices);
    expect(info.meshes).toBe(LEDGER.scene.meshes);
    expect(info.drawCalls, `settled morning draw calls at ${width}px`).toBe(LEDGER.openingDrawCalls[key]);
    expect(info.drawCalls).toBeLessThanOrEqual(LEDGER.caps[`${key}Calls`]);
    // A standing cafe counter, a 3:2 street window, and a robot whose upper half clears the counter.
    expect(info.counter.heightMm).toBe(1050);
    expect(info.window.widthMm / info.window.heightMm).toBeCloseTo(1.5, 5);
    expect(info.robot.aboveCounterMm).toBeGreaterThanOrEqual(350);
    expect(info.blockout).not.toContain("blockout-robot");
    expect(info.blockout).not.toContain("blockout-espresso-machine");
    await expect(page.locator("#stage canvas")).toHaveAttribute("aria-label", "Room 04 上海咖啡廳的 3D 房間");
    await expect(page.locator("#status")).toBeHidden();
  });
}

test("Room 04 shell: the painted textures load", async ({ page }) => {
  await open(page, 1440);
  await page.waitForFunction(() => window.__room04.info().art.length >= 8, null, { timeout: 60000 });
  const info = await page.evaluate(() => window.__room04.info());
  for (const file of ["room04-brick-red-v1.webp", "room04-brick-red-height-v1.webp", "room04-floor-herringbone.webp", "room04-window-xintiandi-morning-v1.webp", "room04-oak-panel-v1.webp", "room04-counter-stone-v1.webp", "room04-menu-board-a-v1.webp", "room04-menu-board-b-v1.webp"]) expect(info.art).toContain(file);
  expect(info.stage).toBe("section-10-robots");
});

test("Room 04 provisional chalk menus have priced items only on the blank boards", async ({ page }) => {
  await open(page, 1440);
  await page.waitForFunction(() => window.__room04.menuTextureKinds().every(Boolean));
  const menu = await page.evaluate(() => window.__room04.menuCopy);
  expect(menu.coffee.heading).toBe("Coffee");
  expect(menu.other.heading).toBe("Not coffee");
  for (const board of [menu.coffee, menu.other]) {
    expect(board.items.length).toBeGreaterThanOrEqual(6);
    expect(board.items.length).toBeLessThanOrEqual(8);
    for (const line of board.items) {
      expect(line).toMatch(/^.+ \d+元$/);
      const price = Number(line.match(/(\d+)元$/)[1]);
      expect(price).toBeGreaterThanOrEqual(12);
      expect(price).toBeLessThanOrEqual(40);
    }
  }
  await page.evaluate(() => window.__room04.setLook("menu", "chalk"));
  await page.waitForFunction(() => window.__room04.menuTextureKinds().every((value) => value === false));
  await page.evaluate(() => window.__room04.setLook("menu", "board"));
  await page.waitForFunction(() => window.__room04.menuTextureKinds().every(Boolean));
});

test("Room 04 front door and side window use separate streets in all six moods", async ({ page }) => {
  await open(page, 1440);
  await page.waitForFunction(() => window.__room04.streetMaterials().front === "room04-street-corner-morning-v1.webp");
  const initial = await page.evaluate(() => ({ street: window.__room04.streetMaterials(), art: window.__room04.info().art }));
  expect(initial.street.separate).toBe(true);
  expect(initial.street.left).toBe("room04-window-xintiandi-morning-v1.webp");
  expect(initial.art.filter((file) => file.startsWith("room04-street-corner-"))).toEqual(["room04-street-corner-morning-v1.webp"]);
  for (const [mood, suffix] of [["morning", "morning"], ["noon", "morning"], ["golden", "golden"], ["rain", "rain"], ["closing", "night"], ["series", "night"]]) {
    await page.evaluate((value) => window.__room04.setMood(value), mood);
    await page.waitForFunction((value) => window.__room04.streetMaterials().front === `room04-street-corner-${value}-v1.webp`, suffix);
    const street = await page.evaluate(() => window.__room04.streetMaterials());
    expect(street.left).toBe(`room04-window-xintiandi-${suffix}-v1.webp`);
    expect(street.front).not.toBe(street.left);
  }
});

test("Room 04 moods: six buttons, each sets its look inside the draw-call budget, and the robot and the note answer taps", async ({ page }) => {
  const errors = await open(page, 1440);
  await expect(page.locator("#moods button")).toHaveCount(6);
  for (const mood of ["noon", "golden", "rain", "closing", "series", "morning"]) {
    await page.locator(`#moods button[data-mood="${mood}"]`).click();
    await expect(page.locator(`#moods button[data-mood="${mood}"]`)).toHaveAttribute("aria-pressed", "true");
    const info = await page.evaluate(() => window.__room04.info());
    expect(info.mood).toBe(mood);
    expect(info.drawCalls, `${mood} draw calls`).toBeLessThanOrEqual(LEDGER.caps.desktopCalls);
  }
  await expect(page.locator("#robotHit")).toBeVisible();
  await page.locator("#robotHit").click();
  await expect(page.locator("#bubble")).toBeVisible();
  await expect(page.locator("#bubble [data-line]")).toContainText("要來一杯嗎");
  await page.locator("#bubble [data-close]").click();
  await expect(page.locator("#bubble")).toBeHidden();
  await expect(page.locator("#noteHit")).toBeVisible();
  await page.locator("#noteHit").click();
  await expect(page.locator("#bubble [data-line]")).toContainText("慢慢來");
  expect(errors).toEqual([]);
});

test("Room 04 Codex art: the clock hands show the real time, series night has one of three stills, and the prints load", async ({ page }) => {
  const errors = await open(page, 1440);
  await page.waitForFunction(() => window.__room04.info().art.length >= 12, null, { timeout: 60000 });
  const clock = await page.evaluate(() => window.__room04.clockTime());
  const now = new Date(), minute = now.getMinutes() + now.getSeconds() / 60;
  const diff = Math.abs(clock.minute - minute * 6); expect(Math.min(diff, 360 - diff), "minute hand within 12 degrees of the real time").toBeLessThan(12);
  for (const key of ["classic", "wood", "tech"]) { await page.evaluate((k) => window.__room04.setLook("clock", k), key); expect(await page.evaluate((k) => window.__room04.clocks[k].visible, key)).toBe(true); }
  await page.locator(`#moods button[data-mood="series"]`).click();
  const still = await page.evaluate(() => window.__room04.tvStill()); expect([0, 1, 2]).toContain(still);
  await page.waitForFunction(() => window.__room04.info().art.some((a) => a.startsWith("room04-tv-")), null, { timeout: 30000 });
  for (const file of ["room04-print-p1-plane-street.webp", "room04-print-p8-steam.webp"]) expect((await page.evaluate(() => window.__room04.info().art))).toContain(file);
  expect(errors).toEqual([]);
});

test("Room 04 switches language and keeps the choice in the address", async ({ page }) => {
  await open(page, 1440);
  await expect(page.locator("#subtitle")).toHaveText("上海·慢板");
  await page.locator("#lang").click();
  await expect(page.locator("#subtitle")).toHaveText("A cafe in Shanghai");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(new URL(page.url()).searchParams.get("lang")).toBe("en");
  await expect(page.locator("#otherRooms")).toHaveAttribute("href", "/prototype/roomverse-3d/?lang=en");
});

test("Room 04 can turn all the way round from the middle of the room, and the counter station comes back exactly", async ({ page }) => {
  const errors = await open(page, 1440);
  const before = await page.evaluate(() => { const r = window.__room04; return { p: r.camera.position.toArray().map((v) => +v.toFixed(3)), fov: r.camera.fov }; });
  await page.locator("#centerView").click();
  await expect(page.locator("#centerView")).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.__room04.isCenter())).toBe(true);
  await page.waitForTimeout(1100);
  const seen = await page.evaluate(() => {
    const r = window.__room04, out = [];
    for (let i = 0; i < 8; i++) { r.centerLook(Math.PI / 4, 0); const d = r.camera.getWorldDirection(new r.camera.position.constructor()); out.push([+d.x.toFixed(2), +d.z.toFixed(2)]); }
    return out;
  });
  expect(new Set(seen.map((d) => d.join(","))).size, "eight different headings round the circle").toBe(8);
  await page.locator('[data-view="counter"]').click(); await page.waitForTimeout(1100);
  const after = await page.evaluate(() => { const r = window.__room04; return { p: r.camera.position.toArray().map((v) => +v.toFixed(3)), fov: r.camera.fov, center: r.isCenter() }; });
  expect(after.center).toBe(false);
  expect(after.p).toEqual(before.p);
  expect(after.fov).toBe(before.fov);
  expect(errors).toEqual([]);
});

test("Room 04 looks: swaps change materials without changing the scene size, wallpapers load, and the random cafe button builds a new one", async ({ page }) => {
  const errors = await open(page, 1440);
  const base = await page.evaluate(() => { const i = window.__room04.info(); return { v: i.vertices, m: i.meshes, d: i.drawCalls, look: i.look }; });
  expect(Object.keys(base.look).sort()).toEqual(["back", "brick", "chair", "clock", "counter", "floor", "gallery", "lamp", "lounge", "menu", "rug", "scarf", "stool", "wainscot", "wall", "wallpaper"]);
  const groups = await page.evaluate(() => window.__room04.lookGroups());
  expect(groups.wallpaper).toEqual(["none", "stripe", "botanical", "grasscloth", "sagewash", "planeleaf", "windowshadow"]);
  for (const [group, keys] of Object.entries(groups)) for (const key of keys) {
    const ok = await page.evaluate(([g, k]) => window.__room04.setLook(g, k), [group, key]);
    expect(ok, `${group}=${key}`).toBe(true);
  }
  await page.evaluate(() => window.__room04.resetLook());
  expect(await page.evaluate(() => window.__room04.setLook("wall", "no-such-colour"))).toBe(false);
  await page.evaluate(() => window.__room04.setLook("wallpaper", "stripe"));
  expect((await page.evaluate(() => window.__room04.look())).wallpaper).toBe("stripe");
  await page.evaluate(() => window.__room04.setLook("wall", "blush")); // a paint colour replaces the paper
  expect((await page.evaluate(() => window.__room04.look())).wallpaper).toBe("none");
  await page.locator("#randomLook").click();
  await expect(page.locator("#resetLook")).toBeVisible();
  const after = await page.evaluate(() => { const i = window.__room04.info(); return { v: i.vertices, m: i.meshes, d: i.drawCalls, look: i.look }; });
  expect(after.v, "a look swap adds no geometry").toBe(base.v);
  expect(after.m).toBe(base.m);
  expect(after.d).toBeLessThanOrEqual(base.d + 1);
  await page.locator("#resetLook").click();
  expect(await page.evaluate(() => window.__room04.look())).toEqual(base.look);
  expect(errors).toEqual([]);
});


test("Room 04 lounge upholstery swaps preserve drawing cost", async ({ page }) => {
  for (const width of [390, 1440]) {
    await open(page, width);
    const summary = await page.evaluate(() => {
      const r = window.__room04;
      r.setView("lounge", true);
      return r.lookGroups().lounge.map((key) => {
        r.setLook("lounge", key);
        const { meshes, vertices, drawCalls } = r.info();
        return { key: r.look().lounge, meshes, vertices, drawCalls };
      });
    });
    expect(summary.map(({ key }) => key)).toEqual(["terracotta", "olive", "navy"]);
    const [{ meshes, vertices, drawCalls }] = summary;
    for (const preset of summary) expect(preset).toMatchObject({ meshes, vertices, drawCalls });
  }
});

test("Room 04 skips the shadow pass when nothing shadow-casting changes", async ({ page }) => {
  await open(page, 390);
  const counts = await page.evaluate(() => window.__room04.shadowDrawCalls());
  expect(counts.first).toBeGreaterThan(counts.second);
  expect(counts.first - counts.second).toBeGreaterThan(5);
});

test("Room 04 views are standing stations: no overview, the room opens at the counter, and every station turns all the way round", async ({ page }) => {
  for (const width of [1440, 390]) {
    const errors = await open(page, width);
    const pose = () => page.evaluate(() => { const r = window.__room04; return { p: r.camera.position.toArray().map((v) => +v.toFixed(2)), fov: r.camera.fov, view: r.view() }; });
    await expect(page.locator('[data-view="overview"]')).toHaveCount(0);
    const start = await pose();
    expect(start.view).toBe("counter");
    await expect(page.locator('[data-view="counter"]')).toHaveAttribute("aria-pressed", "true");
    const seen = new Set([start.p.join(",")]);
    for (const view of ["window", "lounge", "middle"]) {
      await page.locator(`[data-view="${view}"]`).click();
      await page.waitForFunction((v) => window.__room04.view() === v, view);
      await page.waitForTimeout(1200);
      await expect(page.locator(`[data-view="${view}"]`)).toHaveAttribute("aria-pressed", "true");
      const pos = await pose(); expect(pos.view).toBe(view); seen.add(pos.p.join(","));
      // From every station the head turns all the way round: eight different headings, back to the first after a full turn.
      const headings = await page.evaluate(() => { const r = window.__room04, out = []; for (let i = 0; i < 8; i++) { r.centerLook(Math.PI / 4, 0); const d = r.camera.getWorldDirection(new r.camera.position.constructor()); out.push(d.x.toFixed(2) + "," + d.z.toFixed(2)); } return out; });
      expect(new Set(headings).size, view + ": eight headings round the circle").toBe(8);
      expect((await pose()).p, view + ": turning the head does not move the camera").toEqual(pos.p);
    }
    expect(seen.size, "four distinct stations").toBe(4);
    await page.locator('[data-view="counter"]').click(); await page.waitForTimeout(1200);
    const back = await pose(); expect(back.p).toEqual(start.p); expect(back.fov).toBe(start.fov);
    expect(errors).toEqual([]);
  }
});


test("Room 04 poster defers the 3D scene and portal arrivals enter directly", async ({ page }) => {
  const requests = []; page.on("request", (request) => requests.push(request.url()));
  await page.goto(PAGE);
  await expect(page.locator("#poster")).toBeVisible();
  await expect(page.locator("#enter")).toBeVisible();
  expect(await page.evaluate(() => Boolean(window.__room04))).toBe(false);
  expect(requests.some((url) => /\/cafe\.js|\/vendor\/three/.test(url))).toBe(false);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room04, null, { timeout: 120000 });
  await expect(page.locator("#poster")).toBeHidden();
  await page.waitForFunction((vertices) => window.__room04.info().vertices === vertices, LEDGER.scene.vertices, { timeout: 60000 });
  const deferred = await page.evaluate(() => {
    const first = performance.getEntriesByName("room04-first-render")[0].startTime;
    return performance.getEntriesByType("resource").filter((entry) => /room04-print-p[1-8]-|room04-clock-[ab]-dial/.test(entry.name)).map((entry) => entry.startTime > first);
  });
  expect(deferred).toHaveLength(10);
  expect(deferred.every(Boolean)).toBe(true);
  for (const from of ["room01", "room02", "room03"]) {
    await page.goto(`${PAGE}?from=${from}`);
    await page.waitForFunction(() => window.__room04, null, { timeout: 120000 });
    await expect(page.locator("#poster")).toBeHidden();
    expect(await page.evaluate(() => performance.getEntriesByType("resource").some((entry) => entry.name.includes("room04-shanghai-slowly-concept-mobile.webp")))).toBe(false);
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test.describe("Room 04 immersive at " + viewport.width + "px", () => {
    test.use({ viewport, deviceScaleFactor: viewport.width === 390 ? 2 : 1, hasTouch: viewport.width === 390, reducedMotion: "reduce" });
    test("keeps the room controls, history and travel usable", async ({ page }) => {
      await page.goto(PAGE + "?lang=zh&lounge=navy");
      const enter = page.locator("#immersiveEnter"), exit = page.locator("#immersiveExit");
      const shell = page.locator(".room"), door = page.locator(".travel-door-dialog");
      await expect(enter).toBeHidden();
      await page.locator("#enter").click();
      await expect(enter).toBeVisible({ timeout: 30000 }); // the room builds in a few seconds, more on a busy machine

      await page.locator("#robotHit").click();
      await page.locator("#bubble [data-travel]").click();
      await expect(door).toBeVisible();
      await expect(door.locator(".travel-door-card")).toHaveCount(3);
      await door.locator(".travel-door-close").click();
      await expect(page.locator("#bubble [data-travel]")).toBeFocused();
      await page.locator("#bubble [data-close]").click();

      await enter.click();
      await expect(shell).toHaveClass(/is-immersive/);
      await expect(exit).toBeFocused();
      await expect(page.locator("#moodNote")).toBeHidden();
      await expect(page.locator("#immersiveExits #portfolioHome")).toBeVisible();
      await expect.poll(async () => {
        const size = await page.locator("#stage canvas").boundingBox();
        return [Math.round(size.width), Math.round(size.height)];
      }).toEqual([viewport.width, viewport.height]);

      for (const view of ["middle", "window", "lounge", "counter"]) {
        const button = page.locator('[data-view="' + view + '"]');
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
      }
      for (const mood of ["noon", "golden", "rain", "closing", "series", "morning", "golden"]) {
        const button = page.locator('[data-mood="' + mood + '"]');
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
      }
      await page.locator("#noteHit").click();
      await expect(page.locator("#bubble")).toBeVisible();
      await page.locator("#bubble [data-close]").click();
      await page.locator("#centerView").click();
      await expect(page.locator("#centerView")).toHaveAttribute("aria-pressed", "true");
      await page.locator("#lang").click();
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      for (const row of ["#views", "#moods"]) {
        const sizes = await page.locator(row).evaluate((el) => {
          el.scrollLeft = el.scrollWidth;
          return { width: el.clientWidth, scrollWidth: el.scrollWidth, left: el.scrollLeft, wrap: getComputedStyle(el).flexWrap };
        });
        expect(sizes.wrap).toBe("nowrap");
        if (viewport.width === 390) {
          expect(sizes.scrollWidth).toBeGreaterThan(sizes.width);
          expect(sizes.left).toBeGreaterThan(0);
        }
      }

      await exit.click();
      await expect(enter).toBeFocused();
      await expect(shell).not.toHaveClass(/is-immersive/);
      await expect(page.locator("#centerView")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('[data-mood="golden"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page).toHaveURL(/lang=en/);
      expect(new URL(page.url()).searchParams.get("lounge")).toBe("navy");

      await page.locator('[data-view="lounge"]').click();
      await enter.click();
      await page.locator("#immersiveDoor").click();
      await expect(door).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(door).toBeHidden();
      await expect(shell).toHaveClass(/is-immersive/);
      await page.keyboard.press("Escape");
      await expect(enter).toBeFocused();
      await expect(page.locator('[data-view="lounge"]')).toHaveAttribute("aria-pressed", "true");

      await enter.click();
      await page.goBack();
      await expect(shell).not.toHaveClass(/is-immersive/);
      await expect(enter).toBeFocused();

      await enter.click();
      await page.locator("#immersiveDoor").click();
      await door.locator(".travel-door-go").first().click();
      await expect(page).toHaveURL(/from=room04/);
      await page.goBack();
      await expect(page).toHaveURL(/\/cafe\//);
      await expect(shell).not.toHaveClass(/is-immersive/);
      expect(await page.evaluate(() => history.state?.room04Immersive)).toBeFalsy();
    });
  });
}

test("Room 04 grinder: the beans read as a half-full hopper of many pieces", async ({ page }) => {
  const errors = await open(page, 1440);
  const beans = await page.evaluate(() => window.__room04.beansVisible());
  expect(beans, "individual beans, not a muddy block").toBeGreaterThanOrEqual(150);
  expect(errors).toEqual([]);
});

test("the Shanghai, Slowly record player fits the budget and plays on demand", async ({ page }) => {
  test.setTimeout(180000);
  const errors = await open(page, 390);
  const info = await page.evaluate(() => window.__room04.info());
  expect(info.recordPlayer).toMatchObject({ widthMm: 360, depthMm: 280, heightMm: 110, xMm: 500, zMm: -720, attached: true });
  expect(info.recordPlayer.vertices, "the platter and tonearm stay within their vertex allowance").toBeLessThanOrEqual(1500);
  const dripTowerVertices = LEDGER.scene.vertices - 190773;
  expect(info.vertices - dripTowerVertices - 187744, "record-player and checkout-screen growth stays within budget, excluding the later drip tower").toBeLessThanOrEqual(3200);
  expect(info.drawCalls).toBeLessThanOrEqual(LEDGER.caps.phoneCalls);
  const target = page.locator("#recordHit");
  await expect(target, "the record player is tappable in the opening counter view").toBeVisible();
  const box = await target.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);

  await target.click();
  await expect(page.locator("#bubble [data-line]")).toHaveText("慢板，三十三轉。");
  await expect.poll(() => page.evaluate(() => window.__room04.recordPlaying())).toBe(true);
  await page.waitForTimeout(850);
  const moving = await page.evaluate(() => window.__room04.recordState());
  expect(moving.platterAngle).not.toBe(0);
  expect(moving.armAngle).toBeGreaterThan(0.28);
  expect(Math.abs(moving.robotTilt)).toBeGreaterThan(0.04);
  await target.click();
  await expect.poll(() => page.evaluate(() => window.__room04.recordPlaying())).toBe(false);
  await page.waitForTimeout(400);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await target.click();
  const reducedStart = await page.evaluate(() => window.__room04.recordState());
  await page.waitForTimeout(800);
  const reducedEnd = await page.evaluate(() => window.__room04.recordState());
  expect(reducedEnd.platterAngle).toBe(reducedStart.platterAngle);
  expect(reducedEnd.armAngle).toBeGreaterThan(0.28);
  await target.click();
  await expect.poll(() => page.evaluate(() => window.__room04.recordPlaying())).toBe(false);
  await page.waitForTimeout(400);
  expect(errors).toEqual([]);
});

test("the Kyoto drip tower fits the stone, plays once per drop, and respects reduced motion", async ({ page }) => {
  test.setTimeout(180000);
  const errors = await open(page, 390);
  const info = await page.evaluate(() => window.__room04.info());
  const tower = info.dripTower, top = info.backBarStone;
  expect(tower).toMatchObject({ widthMm: 220, depthMm: 180, heightMm: 600, xMm: -2410, zMm: -2040, baseYmm: 900, framePostsInBaseMm: 10 });
  expect(info.vertices - 190773, "the drip tower stays within its 4,000-vertex allowance").toBeLessThanOrEqual(4000);
  expect(info.vertices).toBe(LEDGER.scene.vertices);
  expect(info.meshes).toBe(LEDGER.scene.meshes);
  expect(info.drawCalls).toBeLessThanOrEqual(LEDGER.caps.phoneCalls);
  expect(tower.xMm - tower.widthMm / 2).toBeGreaterThanOrEqual(top.x0Mm);
  expect(tower.xMm + tower.widthMm / 2).toBeLessThanOrEqual(top.x1Mm);
  expect(tower.zMm - tower.depthMm / 2).toBeGreaterThanOrEqual(top.z0Mm);
  expect(tower.zMm + tower.depthMm / 2).toBeLessThanOrEqual(top.z1Mm);
  expect(tower.baseYmm).toBe(top.topMm);

  const target = page.locator("#dripHit");
  await expect(target, "the tower is visible and tappable in the 390px counter station").toBeVisible();
  const box = await target.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
  await target.click();
  await expect(page.locator("#bubble [data-line]")).toHaveText("冰滴，一滴一滴慢慢來。");
  await expect.poll(() => page.evaluate(() => window.__room04.dripPlaying())).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__room04.dripState().dropScales.some((scale) => scale > 0))).toBe(true);
  const falling = await page.evaluate(() => window.__room04.dripState());
  expect(falling.dropsVisible).toBe(true);
  await page.waitForTimeout(150);
  const moving = await page.evaluate(() => window.__room04.dripState());
  expect(moving.dropPositions).not.toEqual(falling.dropPositions);
  await page.waitForTimeout(1400);
  expect((await page.evaluate(() => window.__room04.dripState())).liquidRiseMm).toBeGreaterThan(0);
  await target.click();
  await expect.poll(() => page.evaluate(() => window.__room04.dripPlaying())).toBe(false);
  const stopped = await page.evaluate(() => window.__room04.dripState());
  expect(stopped.dropsVisible).toBe(false); expect(stopped.liquidRiseMm).toBe(0);
  const stoppedFrame = stopped.renderFrame;
  await page.waitForTimeout(180);
  expect((await page.evaluate(() => window.__room04.dripState())).renderFrame).toBe(stoppedFrame);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await target.click();
  const reduced = await page.evaluate(() => window.__room04.dripState());
  expect(reduced.playing).toBe(true); expect(reduced.dropsVisible).toBe(false); expect(reduced.liquidRiseMm).toBe(8);
  await page.waitForTimeout(180);
  expect((await page.evaluate(() => window.__room04.dripState())).renderFrame).toBe(reduced.renderFrame);
  await target.click();
  await expect.poll(() => page.evaluate(() => window.__room04.dripPlaying())).toBe(false);
  expect((await page.evaluate(() => window.__room04.dripState())).liquidRiseMm).toBe(0);
  expect(errors).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`Room 04 gold random-cafe tag stays on screen in full screen at ${width}px`, async ({ page }) => {
    const errors = await open(page, width);
    const tag = page.locator("#randomLook");
    await expect(tag).toBeVisible();
    expect(await tag.evaluate((el) => getComputedStyle(el).backgroundImage), "gold gradient").toContain("linear-gradient");
    await page.locator("#immersiveEnter").click();
    await expect(tag).toBeVisible();
    const box = await tag.boundingBox();
    expect(box.x, "inside the screen, left edge").toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, "inside the screen, right edge").toBeLessThanOrEqual(width);
    const before = await page.evaluate(() => JSON.stringify(window.__room04.look()));
    await tag.click();
    await expect.poll(() => page.evaluate(() => JSON.stringify(window.__room04.look()))).not.toBe(before);
    await page.locator("#immersiveExit").click();
    await expect(page.locator("#swapActions #randomLook")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}
