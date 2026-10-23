import { expect, test } from "@playwright/test";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";

// ROOMVERSE 3D: a poster first (no 3D download until the visitor asks), then a 3D room whose feeling,
// wall and rug can be changed. Furniture models are placed on the floor by their measured bounds.
const PAGE = "/prototype/roomverse-3d/";
for (const dpr of [2, 3]) {
  test(`mobile renderer keeps antialiasing and caps DPR at 1.5 on DPR ${dpr}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dpr });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=zh&mood=rain`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    const render = await page.locator("#stage canvas").evaluate((canvas) => ({
      antialias: canvas.getContext("webgl2")?.getContextAttributes()?.antialias,
      ratio: canvas.width / canvas.clientWidth,
      dpr: devicePixelRatio,
    }));
    expect(render.antialias).toBe(true);
    expect(render.dpr).toBe(dpr);
    expect(render.ratio).toBeCloseTo(1.5, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}
for (const height of [844, 740]) {
  test(`English phone at 390x${height}: entry and both view buttons fit the first screen`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height });
    await page.goto(`${PAGE}?lang=en`);
    const entry = await page.locator("#enter").boundingBox();
    expect(entry.y + entry.height).toBeLessThanOrEqual(height);
    expect(entry.height).toBeGreaterThanOrEqual(44);
    const sizes = await page.evaluate(() => ({ stage: document.querySelector("#stage").getBoundingClientRect().height, poster: document.querySelector("#poster").getBoundingClientRect().height }));
    expect(sizes.stage).toBe(sizes.poster);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    await page.evaluate(() => scrollTo(0, 0));
    for (const selector of [".camera-window", ".camera-tv"]) {
      const button = await page.locator(selector).boundingBox();
      expect(button.y + button.height).toBeLessThanOrEqual(height);
      expect(button.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
const storyRooms = {
  rain: { zh: "加班到十點，外面下著雨。", en: "Working late; rain is falling outside.", wall: "sand", rug: "ivory", curtain: "linen", print: "rain" },
  chic: { zh: "明早要簡報，想先把自己整理好。", en: "A presentation tomorrow; she wants to feel ready.", wall: "original", rug: "ivory", curtain: "rose", print: "hills" },
  family: { zh: "週末，兩個孩子和長輩都要來。", en: "The family is coming over this weekend.", wall: "sand", rug: "stripe", curtain: "sage", print: "hills" },
  tech: { zh: "在家寫到半夜，只想要安靜。", en: "Working from home past midnight, they need quiet.", wall: "mist", rug: "stripe", curtain: "linen", print: "moon" },
  tv: { zh: "週五晚上，只想窩著追劇。", en: "Friday night, and she wants nothing but the sofa and a good series.", wall: "sand", rug: "ivory", curtain: "linen", print: "moon", view: "tv" },
};

for (const width of [390, 1440]) {
  test(`closed interior door at ${width}px: clear of furniture, skirting stops at the frame, postcard downloads`, async ({ page }, testInfo) => {
    expect((await stat("public/prototype/roomverse-3d/tex/door-oak-v1.webp")).size).toBeLessThan(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    const requests = [], errors = [];
    page.on("request", (r) => { if (r.url().endsWith("door-oak-v1.webp")) requests.push(r.url()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${PAGE}?lang=zh&mood=rain`);
    expect(requests).toHaveLength(0);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    expect(await page.evaluate(() => window.__room.loadDoorTexture())).toBe(true);
    await page.evaluate(() => window.__room.setOrbitAngle(270));
    const door = await page.evaluate(() => window.__room.roomDoor());
    expect(door.collisions).toEqual([]);
    expect(door.bounds.max[1]).toBeCloseTo(2.1);
    expect(door.bounds.min[1]).toBeCloseTo(0);
    expect(door.leaf.min[1]).toBeLessThan(.01);
    expect(door.bounds.max[2] - door.bounds.min[2]).toBeCloseTo(1.05);
    expect(door.skirting[0].max[2]).toBeCloseTo(door.bounds.min[2]);
    expect(door.skirting[1].min[2]).toBeCloseTo(door.bounds.max[2]);
    for (const wall of ["original", "pine", "stripe", "botanical"]) {
      await page.evaluate((value) => window.__room.set("wall", value), wall);
      expect((await page.evaluate(() => window.__room.roomDoor())).textureLoaded).toBe(true);
    }
    expect(await page.evaluate(() => window.__room.tableLampLighting().lightCount)).toBe(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (await page.locator("#panelToggle").isVisible()) await page.locator("#panelToggle").click();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "存成明信片", exact: true }).click()]);
    const file = testInfo.outputPath(`door-postcard-${width}.webp`);
    await download.saveAs(file);
    const art = await readFile(file);
    expect(art.toString("ascii", 0, 4)).toBe("RIFF");
    expect(art.toString("ascii", 8, 12)).toBe("WEBP");
    expect(errors).toEqual([]);
  });
}

test("a failed door texture keeps the door and the room usable", async ({ page }) => {
  await page.route("**/door-oak-v1.webp", (route) => route.abort());
  await page.goto(`${PAGE}?lang=zh&mood=tv&view=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  expect(await page.evaluate(() => window.__room.loadDoorTexture())).toBe(false);
  expect((await page.evaluate(() => window.__room.roomDoor())).textureLoaded).toBe(false);
  await page.evaluate(() => window.__room.set("mood", "family"));
  await expect(page.locator("#status")).toBeHidden();
  expect((await page.evaluate(() => window.__room.roomDoor())).collisions).toEqual([]);
});

for (const width of [390, 1440]) {
  test(`console details at ${width}px: delayed image, three grounded objects and no collisions`, async ({ page }) => {
    expect((await stat("public/prototype/roomverse-3d/tex/console-art-river-v1.webp")).size).toBeLessThan(100000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
    const requests = [], errors = [];
    page.on("request", (r) => { if (r.url().endsWith("console-art-river-v1.webp")) requests.push(r.url()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${PAGE}?lang=zh&mood=tv&view=tv`);
    expect(requests).toHaveLength(0);
    await page.locator("#enter").click(); await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    expect(requests).toHaveLength(0);
    expect((await page.evaluate(() => window.__room.consoleDetails())).ready).toBe(false);
    if (await page.locator("#panelToggle").isVisible()) await page.locator("#panelToggle").click();
    await page.locator(".camera-tv").click();
    await page.waitForFunction(() => window.__room.consoleDetails().ready, null, { timeout: 30000 });
    const details = await page.evaluate(() => window.__room.consoleDetails());
    expect(details.artLoaded).toBe(true); expect(details.collisions).toEqual([]);
    expect(details.objects.map((o) => o.name)).toEqual(["console-decor-frame", "console-decor-books", "console-decor-tray"]);
    for (const obj of details.objects) {
      expect(obj.min[1]).toBeCloseTo(.59, 4);
      expect(obj.max[1]).toBeLessThan(1.285); // below the TV's existing lower light strip
      expect(obj.min[0]).toBeGreaterThan(-1.025); expect(obj.max[0]).toBeLessThan(1.025);
      expect(obj.min[2]).toBeGreaterThan(1.88); expect(obj.max[2]).toBeLessThan(2.28);
    }
    expect(requests).toHaveLength(1);
    expect(await page.evaluate(() => window.__room.tableLampLighting().lightCount)).toBe(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => { const card = window.__room.postcard(); return card.width > 0 && card.height > 0; })).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("console picture failure still leaves all three solid decor objects", async ({ page }) => {
  await page.route("**/console-art-river-v1.webp", (route) => route.abort());
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  expect(await page.evaluate(() => window.__room.loadConsoleDecor())).toBe(true);
  const details = await page.evaluate(() => window.__room.consoleDetails());
  expect(details.artLoaded).toBe(false); expect(details.objects).toHaveLength(3); expect(details.collisions).toEqual([]);
});

test("TV wall uses four small painted maps, independent repeats, and consistent grain on thin boards", async ({ page }) => {
  const files = ["tv-oak-v1.webp", "tv-door-v1.webp", "tv-frame-v1.webp", "tv-backing-v1.webp"];
  const bytes = await Promise.all(files.map((file) => stat(`public/prototype/roomverse-3d/tex/${file}`).then((s) => s.size)));
  expect(bytes.reduce((sum, size) => sum + size, 0)).toBeLessThanOrEqual(150000);
  const requests = [];
  page.on("request", (request) => { if (files.some((file) => request.url().endsWith(file))) requests.push(request.url()); });
  await page.goto(`${PAGE}?lang=zh&mood=tv&view=tv`);
  expect(requests).toEqual([]); // keep the poster-first gate
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room?.tvWallTexturesReady(), null, { timeout: 60000 });
  const meshes = await page.evaluate(() => window.__room.tvWallTextures());
  const painted = meshes.filter((m) => files.includes(m.file));
  expect(new Set(painted.map((m) => m.file))).toEqual(new Set(files));
  expect(painted).toHaveLength(20);
  expect(new Set(painted.map((m) => m.mapId)).size).toBe(painted.length);
  expect(new Set(painted.map((m) => m.materialId)).size).toBe(painted.length);
  expect(requests).toHaveLength(4); // clones share the loaded image, not mutable repeat state
  for (const mesh of painted) {
    expect(mesh.colorSpace).toBe("srgb"); expect(mesh.anisotropy).toBe(8);
  }
  const board = painted.find((m) => m.name === "tv-shelf-board");
  expect(board.repeat[0]).toBeCloseTo(.62 / .8);
  expect(board.repeat[1]).toBeCloseTo(.035 / .8);
  expect(board.faces[0].repeat[0]).toBeCloseTo(.135 / .8); // short end
  expect(board.faces[2].repeat[1]).toBeCloseTo(.135 / .8); // top depth
  const console = painted.find((m) => m.name === "tv-console");
  expect(console.repeat[0]).toBeCloseTo(2.05 / .8);
  expect(console.repeat).not.toEqual(board.repeat);
  expect(await page.evaluate(() => window.__room.tableLampLighting().lightCount)).toBe(6);
});

test("regular entry paints before TV textures; the TV button loads them together", async ({ page }) => {
  const files = ["tv-oak-v1.webp", "tv-door-v1.webp", "tv-frame-v1.webp", "tv-backing-v1.webp"];
  const requests = [];
  page.on("request", (request) => { if (files.some((file) => request.url().endsWith(file))) requests.push(request.url()); });
  await page.addInitScript(() => {
    window.__roomIdleCallbacks = [];
    window.requestIdleCallback = (callback) => { window.__roomIdleCallbacks.push(callback); return window.__roomIdleCallbacks.length; };
  });
  await page.goto(`${PAGE}?lang=zh&mood=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room && document.querySelector("#stage canvas"), null, { timeout: 60000 });
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => window.__room.tvWallTexturesReady())).toBe(false);
  const before = await page.evaluate(() => window.__room.tvWallTextures().filter((m) => m.file?.startsWith("tv-") && m.loaded).length);
  expect(before).toBe(0);
  if (await page.locator("#panelToggle").isVisible()) await page.locator("#panelToggle").click();
  await page.locator(".camera-tv").click();
  await page.waitForFunction(() => window.__room?.tvWallTexturesReady(), null, { timeout: 60000 });
  const meshes = await page.evaluate(() => window.__room.tvWallTextures().filter((m) => m.file?.startsWith("tv-")));
  expect(meshes).toHaveLength(20);
  expect(meshes.every((mesh) => mesh.loaded)).toBe(true);
  expect(requests).toHaveLength(4);
});

test("regular entry loads TV textures after the room reaches an idle period", async ({ page }) => {
  const files = ["tv-oak-v1.webp", "tv-door-v1.webp", "tv-frame-v1.webp", "tv-backing-v1.webp"];
  const requests = [];
  page.on("request", (request) => { if (files.some((file) => request.url().endsWith(file))) requests.push(request.url()); });
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.waitForFunction(() => window.__room?.tvWallTexturesReady(), null, { timeout: 20000 });
  expect(requests).toHaveLength(4);
});

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} at ${width}px: poster first, then the room loads and the choices work`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const glb = [];
      page.on("request", (r) => { if (r.url().endsWith(".glb") || r.url().includes("three.module")) glb.push(r.url()); });
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`${PAGE}?lang=${lang}`);
      await expect(page.locator("#home")).toHaveAttribute("href", `/?lang=${lang}`);
      await expect(page.locator("#enter")).toBeVisible();
      await expect(page.locator("#lead")).toContainText(lang === "zh" ? "拖一下轉動房間，或點「看電視牆」" : "Drag to turn the room, or tap ‘Turn to the TV wall’");
      expect(glb, "nothing heavy loads before the visitor asks").toEqual([]);
      const note = await page.locator("#note").textContent();
      expect(note).toContain(lang === "zh" ? "插畫示意" : "Illustrated study");

      await page.locator("#enter").click();
      await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
      await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); }); // wide screens start with the options tucked away
      await expect(page.locator("#panel")).toBeVisible();
      await expect(page.locator("#stage canvas")).toBeVisible();
      expect(glb.filter((u) => u.endsWith(".glb"))).toHaveLength(9);

      const groups = page.locator("#panel .opts");
      await expect(groups).toHaveCount(5);
      for (const [g, i] of [[0, 1], [1, 3], [2, 2], [3, 2], [4, 1]]) {
        const button = groups.nth(g).locator("button").nth(i);
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
}

test("switching language updates the page text and the home link", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#lang").click();
  await expect(page.locator("#home")).toHaveAttribute("href", "/?lang=en");
  await expect(page.locator("#title")).toHaveText("One room, many ways to come home");
});

test("Feeling First links restore six story-matched ROOMVERSE presets at 390px", async ({ page }) => {
  await mkdir("test-results/fu-to-roomverse-scenes", { recursive: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [who, preset] of Object.entries(storyRooms)) {
    await page.goto(`/prototype/feeling-to-room/?lang=zh`);
    const cardStory = await page.locator(`[data-mood="${who}"] .mood-copy span`).textContent();
    expect(cardStory).toBe(preset.zh);
    const query = new URLSearchParams({ lang: "zh", mood: who, wall: preset.wall, rug: preset.rug, curtain: preset.curtain, print: preset.print, ...(preset.view ? { view: preset.view } : {}), from: "fu", who });
    await page.goto(`${PAGE}?${query}`);
    await expect(page.locator("#originHint")).toBeVisible();
    await expect(page.locator("#originStory")).toHaveText(`這個房間來自「先有fu，再有家」：${preset.zh}`);
    await expect(page.locator("#originBack")).toHaveAttribute("href", "/prototype/feeling-to-room/?lang=zh");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (who === "rain") {
      await page.locator("#originClose").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#originHint")).toBeHidden();
      await page.reload();
    }
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    const groups = page.locator("#panel .opts");
    for (const [group, key] of [[0, who], [1, preset.wall], [2, preset.rug], [3, preset.curtain], [4, preset.print]]) {
      await expect(groups.nth(group).locator(`button[data-key="${key}"]`)).toHaveAttribute("aria-pressed", "true");
    }
    if (who === "tv") {
      await expect(page).toHaveURL(/mood=tv/);
      await expect(page).toHaveURL(/view=tv/);
      await expect(page.locator(".camera-tv")).toHaveAttribute("aria-pressed", "true");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#stage").screenshot({ path: `test-results/fu-to-roomverse-scenes/zh-${who}.png` });
    if (who === "rain") {
      await groups.nth(2).locator('button[data-key="medallion"]').click();
      await expect(page).toHaveURL(/from=fu/);
      await expect(page).toHaveURL(/who=rain/);
      await expect(page).toHaveURL(/mood=rain/);
    }
  }
  expect(errors).toEqual([]);
});

test("the English story-origin prompt matches all six stories; ordinary and invalid entries stay unchanged", async ({ page }) => {
  await mkdir("test-results/fu-to-roomverse-scenes", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [who, preset] of Object.entries(storyRooms)) {
    await page.goto(`/prototype/feeling-to-room/?lang=en`);
    const cardStory = await page.locator(`[data-mood="${who}"] .mood-copy span`).textContent();
    expect(cardStory).toBe(preset.en);
    const query = new URLSearchParams({ lang: "en", mood: who, wall: preset.wall, rug: preset.rug, curtain: preset.curtain, print: preset.print, ...(preset.view ? { view: preset.view } : {}), from: "fu", who });
    await page.goto(`${PAGE}?${query}`);
    await expect(page.locator("#originHint")).toBeVisible();
    await expect(page.locator("#originStory")).toHaveText(`This room comes from “Feeling First”: ${preset.en}`);
    await expect(page.locator("#originBack")).toHaveAttribute("href", "/prototype/feeling-to-room/?lang=en");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#originHint").screenshot({ path: `test-results/fu-to-roomverse-scenes/en-${who}-hint.png` });
  }
  await page.goto(`${PAGE}?lang=zh&mood=slow&wall=original&rug=ivory&curtain=linen&print=hills`);
  await expect(page.locator("#originHint")).toBeHidden();
  await page.goto(`${PAGE}?lang=zh&mood=rain&from=fu&who=unknown`);
  await expect(page.locator("#originHint")).toBeHidden();
});

test("the Garage light-tech shelf links to the 3D room in the visitor's language", async ({ page }) => {
  await page.goto("/?lang=en");
  const link = page.locator('#garage a[href^="/prototype/roomverse-3d/"]');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", "/prototype/roomverse-3d/?lang=en");
});

test("homepage Showcase: ROOMVERSE 3D is a formal work with its tag, cover and a link in the visitor's language", async ({ page }) => {
  for (const [lang, title, tag] of [["zh", "ROOMVERSE 3D · 空間幻境", "3D 互動空間 · 雙語作品"], ["en", "ROOMVERSE 3D · One room, many ways to come home", "3D interactive room · bilingual work"]]) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`/?lang=${lang}#showcase`);
      const card = page.locator("#showcase article", { hasText: title });
      await expect(card).toHaveCount(1);
      await expect(card).toContainText(tag);
      await expect(card.locator("a").first()).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=${lang}`);
      const img = card.locator('img[src*="roomverse-3d/showcase-roomverse-3d-v4.webp"]');
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBe(816);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test("homepage Showcase: ROOMVERSE 3D is the first card, with Trade Street beside it", async ({ page }) => {
  for (const [lang, title, next] of [["zh", "ROOMVERSE 3D · 空間幻境", "貿易街"], ["en", "ROOMVERSE 3D · One room, many ways to come home", "Trade Street"]]) {
    await page.goto(`/?lang=${lang}#showcase`);
    await expect(page.locator("#showcase article").nth(0)).toContainText(title);
    await expect(page.locator("#showcase article").nth(1)).toContainText(next);
    await expect(page.locator("#showcase article").nth(0).locator("a").first()).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=${lang}`);
  }
});

test("each feeling shows one line on why the pairing works, and it follows the feeling and the language", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); }); // wide screens start with the options tucked away
  const why = page.locator("#panel .why");
  await expect(why).toHaveCount(1);
  await expect(why).toContainText("宅在家裡一天也很舒服");
  await page.locator("#panel .opts").first().locator("button").nth(2).click();
  await expect(why).toContainText("冷色燈帶");
  await page.locator("#lang").click();
  await expect(why).toContainText("cool LED wash");
});

test("the room lives in the address: a shared link opens the same choices, clicks update it, unknown values are ignored", async ({ page }) => {
  await page.goto(`${PAGE}?lang=en&mood=tech&wall=botanical&rug=medallion&curtain=clay&print=moon&bogus=1`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); }); // wide screens start with the options tucked away
  const pressed = (g) => page.locator("#panel .opts").nth(g).locator('button[aria-pressed="true"]');
  await expect(pressed(0)).toHaveText("Light-tech homebody");
  await expect(pressed(1)).toHaveText("Soft botanical wallpaper");
  await expect(pressed(2)).toHaveText("Classic medallion");
  await expect(pressed(3)).toHaveText("Terracotta");
  await expect(pressed(4)).toHaveText("Crescent moon");
  await page.locator("#panel .opts").nth(2).locator("button").nth(1).click();
  await expect(page).toHaveURL(/rug=ivory/);
  await expect(page).toHaveURL(/lang=en/);

  await page.goto(`${PAGE}?mood=nope&rug=<script>`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); }); // wide screens start with the options tucked away
  await expect(pressed(0)).toHaveText("下雨天想窩在家裡");
  await expect(pressed(2)).toHaveText("藍米條紋");
});

test("new wall paints restore from the URL and work across all six feelings", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=en&mood=rain&wall=mist`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.waitForFunction(() => window.__room.tvWallTexturesReady() && window.__room.consoleDetails().ready && window.__room.roomDoor().textureLoaded, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.getAttribute("aria-expanded") === "false") t.click(); });

  const groups = page.locator("#panel .opts");
  const moodButtons = groups.nth(0).locator("button");
  const wallButtons = groups.nth(1).locator("button");
  const wallKeys = await wallButtons.evaluateAll((buttons) => buttons.map((button) => button.dataset.key));
  expect(new Set(wallKeys).size).toBe(wallKeys.length); // options are rendered from WALLS, without a frozen count
  expect(wallKeys).toContain("mist");
  expect(wallKeys).toContain("pine");
  expect(wallKeys.slice(wallKeys.indexOf("pine") + 1, wallKeys.indexOf("stripe"))).toEqual(["dusk", "wine"]);
  expect(wallKeys).toContain("dusk");
  expect(wallKeys).toContain("wine");
  await expect(wallButtons.filter({ hasText: "Dusk navy" })).toHaveAttribute("aria-pressed", "false");
  await expect(wallButtons.filter({ hasText: "Misty blue-grey" })).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/wall=mist/);
  const postcardDetails = async () => page.evaluate(() => {
    const postcard = window.__room.postcard();
    const source = document.querySelector("#stage canvas");
    const strip = Math.round(Math.max(90, source.height * .16));
    const pad = Math.round(strip * .23), small = Math.round(strip * .17);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `500 ${small}px system-ui, "Noto Sans TC", sans-serif`;
    const labels = [...document.querySelectorAll("#panel .opts")].map((group) => group.querySelector('button[aria-pressed="true"]')?.textContent ?? "");
    const lines = [];
    for (const label of labels) {
      const last = lines.length - 1, candidate = last < 0 ? label : `${lines[last]}  ·  ${label}`;
      if (last >= 0 && ctx.measureText(candidate).width > postcard.width - pad * 2) lines.push(label);
      else if (last < 0) lines.push(label);
      else lines[last] = candidate;
    }
    return { labels, lines, available: postcard.width - pad * 2, widths: lines.map((line) => ctx.measureText(line).width) };
  });
  let postcard = await postcardDetails();
  expect(postcard.labels).toContain("Misty blue-grey");
  expect(postcard.lines.join(" · ")).toContain("Misty blue-grey");
  expect(Math.max(...postcard.widths)).toBeLessThanOrEqual(postcard.available);
  await page.reload();
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.waitForFunction(() => window.__room.tvWallTexturesReady() && window.__room.consoleDetails().ready && window.__room.roomDoor().textureLoaded, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.getAttribute("aria-expanded") === "false") t.click(); });
  await expect(page.locator('#panel .opts').nth(1).locator('button[data-key="mist"]')).toHaveAttribute("aria-pressed", "true");
  const paintRequests = [];
  const recordPaintRequest = (request) => paintRequests.push(request.url());
  page.on("request", recordPaintRequest);
  for (const key of ["dusk", "wine"]) {
    await page.locator("#panel .opts").nth(1).locator(`button[data-key="${key}"]`).click();
    await expect(page).toHaveURL(new RegExp(`wall=${key}`));
  }
  await page.waitForTimeout(250);
  page.off("request", recordPaintRequest);
  expect(paintRequests, "changing a solid wall paint should not request another runtime resource").toEqual([]);
  await page.locator('#panel .opts').nth(1).locator('button[data-key="mist"]').click();

  for (let mood = 0; mood < 6; mood++) {
    await moodButtons.nth(mood).click();
    for (const [key, name] of [["dusk", "Dusk navy"], ["wine", "Deep wine"]]) {
      const button = wallButtons.filter({ hasText: name });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(page).toHaveURL(new RegExp(`wall=${key}`));
    }
  }
  const pineButton = page.locator('#panel .opts').nth(1).locator('button[data-key="pine"]');
  await pineButton.click();
  await expect(page).toHaveURL(/wall=pine/);
  postcard = await postcardDetails();
  expect(postcard.labels).toContain("Deep pine");
  expect(postcard.lines.join(" · ")).toContain("Deep pine");
  expect(Math.max(...postcard.widths)).toBeLessThanOrEqual(postcard.available);
  await page.reload();
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.getAttribute("aria-expanded") === "false") t.click(); });
  await expect(page.locator('#panel .opts').nth(1).locator('button[data-key="pine"]')).toHaveAttribute("aria-pressed", "true");
  for (const [key, name] of [["dusk", "Dusk navy"], ["wine", "Deep wine"]]) {
    await page.locator('#panel .opts').nth(1).locator(`button[data-key="${key}"]`).click();
    await expect(page).toHaveURL(new RegExp(`wall=${key}`));
    await expect(page.locator('#panel .opts').nth(1).locator(`button[data-key="${key}"]`)).toHaveAttribute("aria-pressed", "true");
    postcard = await postcardDetails();
    expect(postcard.labels).toContain(name);
    expect(postcard.lines.join(" · ")).toContain(name);
    expect(Math.max(...postcard.widths)).toBeLessThanOrEqual(postcard.available);
    await page.reload();
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.getAttribute("aria-expanded") === "false") t.click(); });
    await expect(page.locator('#panel .opts').nth(1).locator(`button[data-key="${key}"]`)).toHaveAttribute("aria-pressed", "true");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const mobilePanel = await page.locator("#panel").evaluate((panel) => ({ scroll: panel.scrollHeight, client: panel.clientHeight, width: panel.scrollWidth, clientWidth: panel.clientWidth }));
  expect(mobilePanel.width).toBeLessThanOrEqual(mobilePanel.clientWidth);
  expect(mobilePanel.scroll).toBeLessThan(1100);
  const newWallLabels = await page.locator('#panel .opts').nth(1).locator('button[data-key="dusk"],button[data-key="wine"]').allTextContents();
  expect(newWallLabels.join(" ")).not.toMatch(/壁紙|wallpaper/i);
  for (const [fraction, key] of [[0.6, "dusk"], [0.7, "wine"]]) {
    await page.evaluate(() => window.__room.set("wall", "original"));
    await page.evaluate((value) => { const original = Math.random; Math.random = () => value; document.querySelector(".shuffle").click(); Math.random = original; }, fraction);
    await expect(page).toHaveURL(new RegExp(`wall=${key}`));
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("night paint visuals: two paints across representative moods, views, and screen sizes", async ({ page }) => {
  const output = "test-results/roomverse-night-wall-paints";
  await mkdir(output, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=zh&mood=tv&wall=dusk`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.waitForFunction(() => window.__room.tvWallTexturesReady() && window.__room.consoleDetails().ready, null, { timeout: 60000 });
  const moods = ["tv", "rain", "family"];
  const views = [["window", 0], ["tv", 180], ["door", 270]];
  for (const viewport of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width: viewport[0], height: viewport[1] });
    for (const paint of ["dusk", "wine"]) {
      for (const mood of moods) {
        await page.evaluate((value) => window.__room.set("mood", value), mood);
        for (const [view, angle] of views) {
          await page.evaluate(({ wall, degrees }) => { window.__room.set("wall", wall); window.__room.setOrbitAngle(degrees); }, { wall: paint, degrees: angle });
          await page.waitForTimeout(180);
          const canvas = page.locator("#stage canvas");
          await canvas.screenshot({ path: `${output}/${paint}-${mood}-${view}-${viewport[0]}.png` });
        }
      }
    }
  }
  for (const viewport of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width: viewport[0], height: viewport[1] });
    for (const [mood, angle] of [["tv", 180], ["family", 0]]) {
      await page.evaluate(({ feeling, degrees }) => { window.__room.set("mood", feeling); window.__room.setOrbitAngle(degrees); }, { feeling: mood, degrees: angle });
      for (const wall of ["original", "pine", "dusk", "wine"]) {
        await page.evaluate((key) => window.__room.set("wall", key), wall);
        await page.waitForTimeout(180);
        await page.locator("#stage canvas").screenshot({ path: `${output}/palette-${mood}-${wall}-${viewport[0]}.png` });
      }
    }
  }
  const qa = "docs/qa/roomverse-tv-night-wall-paints";
  await mkdir(qa, { recursive: true });
  for (const [key, zhLabel, label] of [["dusk", "暮色深藍", "Dusk navy"], ["wine", "深酒紅", "Deep wine"]]) {
    await page.evaluate((wall) => { window.__room.set("wall", wall); window.__room.setOrbitAngle(0); }, key);
    const capturePostcard = () => page.evaluate(() => {
      const proto = CanvasRenderingContext2D.prototype, original = proto.fillText, labels = [];
      proto.fillText = function (text, ...args) { labels.push(String(text)); return original.call(this, text, ...args); };
      try { const canvas = window.__room.postcard(); return { data: canvas.toDataURL("image/png"), labels }; }
      finally { proto.fillText = original; }
    });
    const zh = await capturePostcard();
    expect(zh.labels.join(" ")).toContain(zhLabel);
    await writeFile(`${qa}/postcard-${key}-zh.png`, Buffer.from(zh.data.split(",")[1], "base64"));
    await page.locator("#lang").click();
    await expect(page.locator('#panel .opts').nth(1).locator(`button[data-key="${key}"]`)).toHaveText(label);
    const en = await capturePostcard();
    expect(en.labels.join(" ")).toContain(label);
    await writeFile(`${qa}/postcard-${key}-en.png`, Buffer.from(en.data.split(",")[1], "base64"));
    await page.locator("#lang").click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${output}/wall-options-390.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('#panel .opts').nth(1).locator('button[data-key="dusk"]')).toHaveText("暮色深藍");
  await expect(page.locator('#panel .opts').nth(1).locator('button[data-key="wine"]')).toHaveText("深酒紅");
});

test("new wall paint QA: all feelings, four responsive screenshots and the English first screen", async ({ page }) => {
  const output = "docs/qa/roomverse-small-fixes";
  const moodReview = "test-results/roomverse-small-fixes-mood-review";
  await mkdir(moodReview, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=en`);
  await expect(page.locator("#title")).toHaveText("One room, many ways to come home");
  await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute("content", /三種表情/);
  await page.screenshot({ path: `${output}/english-1440-first-screen.png` });
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.getAttribute("aria-expanded") === "false") t.click(); });

  const groups = page.locator("#panel .opts");
  const moodButtons = groups.nth(0).locator("button");
  const wallButtons = groups.nth(1).locator("button");
  const moods = ["rain", "family", "tech", "chic", "slow", "tv"];
  for (let mood = 0; mood < moods.length; mood++) {
    await moodButtons.nth(mood).click();
    for (const [wallKey, wallName] of [["mist", "Misty blue-grey"], ["pine", "Deep pine"]]) {
      const button = wallButtons.filter({ hasText: wallName });
      await button.click();
      await page.waitForTimeout(650); // let mood-light transitions settle before visual review
      await page.locator("#stage").screenshot({ path: `${moodReview}/${moods[mood]}-${wallKey}-1440.png` });
    }
  }

  await moodButtons.nth(1).click(); // keep the required comparisons on the same bright, daytime feeling
  for (const [wallKey, wallName] of [["mist", "Misty blue-grey"], ["pine", "Deep pine"]]) {
    const button = wallButtons.filter({ hasText: wallName });
    await button.click();
    await page.waitForTimeout(650);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `${output}/${wallKey}-390.png`, fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${output}/${wallKey}-1440.png`, fullPage: true });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("粉領新貴風: a fourth feeling with its own line, plus a blush wall and a dusty rose curtain", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh&mood=chic&wall=blush&curtain=rose`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); }); // wide screens start with the options tucked away
  const pressed = (g) => page.locator("#panel .opts").nth(g).locator('button[aria-pressed="true"]');
  await expect(pressed(0)).toHaveText("粉領新貴風");
  await expect(pressed(1)).toHaveText("霧粉");
  await expect(pressed(3)).toHaveText("霧玫瑰");
  await expect(page.locator("#panel .why")).toContainText("咖啡館");
  await page.locator("#lang").click();
  await expect(pressed(0)).toHaveText("Chic city professional");
});

test("Slow Sunday: fifth mood restores from the URL, keeps its pairing note, and fits the postcard line", async ({ page }) => {
  const output = "docs/qa/roomverse-mood-slow";
  await mkdir(output, { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=zh&mood=slow&wall=original&rug=ivory&curtain=linen&print=hills`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const open = async () => page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); });
  await open();
  const moodButtons = page.locator("#panel .opts").nth(0).locator("button");
  await expect(moodButtons).toHaveCount(6);
  await expect(moodButtons.nth(4)).toHaveText("週日午後慢慢過");
  await expect(moodButtons.nth(4)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#panel .why")).toHaveText("白天的光柔和又均勻，用淺木色、亞麻和一點深色收邊，房間就安靜下來，週日下午什麼都不用趕。");
  await expect(page).toHaveURL(/mood=slow/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const postcardFit = async () => page.evaluate(() => {
    const postcard = window.__room.postcard();
    const source = document.querySelector("#stage canvas");
    const baseStrip = Math.round(Math.max(90, source.height * .16));
    const pad = Math.round(baseStrip * .23), small = Math.round(baseStrip * .17);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `500 ${small}px system-ui, "Noto Sans TC", sans-serif`;
    const labels = [...document.querySelectorAll("#panel .opts")].slice(0, 5).map((group) => group.querySelector('button[aria-pressed="true"]')?.textContent ?? "");
    const lines = [];
    for (const label of labels) {
      const last = lines.length - 1, candidate = last < 0 ? label : `${lines[last]}  ·  ${label}`;
      if (last >= 0 && ctx.measureText(candidate).width > postcard.width - pad * 2) lines.push(label);
      else if (last < 0) lines.push(label);
      else lines[last] = candidate;
    }
    const widths = lines.map((line) => ctx.measureText(line).width);
    return { measured: Math.max(...widths), available: postcard.width - pad * 2, lines };
  });
  expect((await postcardFit()).measured).toBeLessThanOrEqual((await postcardFit()).available);
  await page.screenshot({ path: `${output}/slow-zh-390.png`, fullPage: true });

  await page.locator("#lang").click();
  await expect(moodButtons.nth(4)).toHaveText("Slow Sunday");
  await expect(page.locator("#panel .why")).toHaveText("Soft, even daylight with pale wood, linen and one dark accent keeps the room calm, so a Sunday afternoon has nowhere to hurry to.");
  await page.screenshot({ path: `${output}/slow-en-390.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await postcardFit().then((fit) => fit.measured <= fit.available)).toBe(true);
  await page.screenshot({ path: `${output}/slow-en-1440.png`, fullPage: true });
  await page.locator("#lang").click();
  await expect(moodButtons.nth(4)).toHaveText("週日午後慢慢過");
  await page.screenshot({ path: `${output}/slow-zh-1440.png`, fullPage: true });

  for (const [index, mood] of [[0, "rain"], [1, "family"], [4, "slow"]]) {
    await moodButtons.nth(index).click();
    await page.waitForTimeout(250);
    await page.locator("#stage").screenshot({ path: `${output}/lighting-${mood}-zh-1440.png` });
  }
});

test("existing mood postcards keep the original one-line design when it fits and wrap only when needed", async ({ page }) => {
  const output = "docs/qa/roomverse-mood-slow";
  await mkdir(output, { recursive: true });
  for (const lang of ["zh", "en"]) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`${PAGE}?lang=${lang}&mood=rain&wall=original&rug=ivory&curtain=linen&print=hills`);
      await page.locator("#enter").click();
      await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
      await page.waitForTimeout(1900); // let the entry drift settle before comparing postcard pixels
      await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); });
      const moodButtons = page.locator("#panel .opts").first().locator("button");
      for (let moodIndex = 0; moodIndex < 4; moodIndex++) {
        await moodButtons.nth(moodIndex).click();
        await page.waitForTimeout(120);
        const comparison = await page.evaluate((capture) => {
          const src = document.querySelector("#stage canvas"), current = window.__room.postcard();
          const w = src.width, h = src.height, strip = Math.round(Math.max(90, h * .16));
          const pad = Math.round(strip * .32), big = Math.round(strip * .26), small = Math.round(strip * .17);
          const labels = [...document.querySelectorAll("#panel .opts")].slice(0, 5).map((group) => group.querySelector('button[aria-pressed="true"]')?.textContent ?? "");
          const joined = labels.join("  ·  ");
          const before = document.createElement("canvas"); before.width = w; before.height = h + strip;
          const ctx = before.getContext("2d");
          ctx.drawImage(src, 0, 0); ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, h, w, strip);
          ctx.fillStyle = "#24302c"; ctx.font = `800 ${big}px system-ui, "Noto Sans TC", sans-serif`; ctx.textBaseline = "alphabetic";
          ctx.fillText("ROOMVERSE 3D", pad, h + pad + big * .8);
          ctx.fillStyle = "#5b665f"; ctx.font = `500 ${small}px system-ui, "Noto Sans TC", sans-serif`;
          ctx.fillText(joined, pad, h + strip - pad * .9);
          ctx.textAlign = "right"; ctx.fillText("paulstradecraft.com", w - pad, h + pad + big * .8);
          const beforePixels = ctx.getImageData(0, 0, w, h + strip).data;
          const afterPixels = current.getContext("2d").getImageData(0, 0, current.width, current.height).data;
          let changed = 0;
          for (let i = 0; i < beforePixels.length; i++) if (beforePixels[i] !== afterPixels[i]) changed++;
          const fit = ctx.measureText(joined).width <= w - pad * 2;
          if (capture) {
            const sheet = document.createElement("canvas"); sheet.width = w * 2; sheet.height = Math.max(before.height, current.height) + 42;
            const s = sheet.getContext("2d"); s.fillStyle = "#ecebe5"; s.fillRect(0, 0, sheet.width, sheet.height);
            s.fillStyle = "#24302c"; s.font = "600 18px system-ui, sans-serif"; s.fillText("BEFORE", 12, 26); s.fillText("AFTER", w + 12, 26);
            s.drawImage(before, 0, 42); s.drawImage(current, w, 42);
            sheet.id = "postcard-comparison"; sheet.style.cssText = "display:block;width:100%;height:auto;background:#ecebe5"; document.body.append(sheet);
          }
          return { fit, changed };
        }, moodIndex === 0);
        expect(comparison.fit, `${lang} ${width}px: fit the legacy single line`).toBe(width === 1440);
        if (comparison.fit) expect(comparison.changed, `${lang} ${width}px: old mood ${moodIndex} remains pixel-identical`).toBe(0);
        else expect(comparison.changed, `${lang} ${width}px: old mood ${moodIndex} wraps its overflowing line`).toBeGreaterThan(0);
        if (moodIndex === 0) {
          await page.locator("#postcard-comparison").screenshot({ path: `${output}/old-rain-${lang}-${width}-before-after.png` });
          await page.locator("#postcard-comparison").evaluate((el) => el.remove());
        }
      }
    }
  }
});

test("surprise me: one tap picks a new wall, rug, curtain and print, keeps the feeling, and updates the link", async ({ page }) => {
  await page.goto(`${PAGE}?lang=en&mood=tech&wall=original&rug=stripe&curtain=linen&print=hills`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.waitForTimeout(1900);
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); }); // wide screens start with the options tucked away
  await page.locator("#panel .shuffle").click();
  const url = new URL(page.url());
  expect(url.searchParams.get("mood")).toBe("tech");
  expect(url.searchParams.get("wall")).not.toBe("original");
  expect(url.searchParams.get("rug")).not.toBe("stripe");
  expect(url.searchParams.get("curtain")).not.toBe("linen");
  expect(url.searchParams.get("print")).not.toBe("hills");
  await expect(page.locator("#panel .opts").nth(0).locator('button[aria-pressed="true"]')).toHaveText("Light-tech homebody");
});

test("keyboard use: focus stays on the pressed button, the 3D view has a name, and a feeling change is announced", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.offsetParent && t.getAttribute("aria-expanded") === "false") t.click(); }); // wide screens start with the options tucked away
  const focused = () => page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.locator("#panel .opts").first().locator("button").nth(1).focus();
  await page.keyboard.press("Enter");
  expect(await focused()).toBe("Cozy family");
  await page.keyboard.press("Tab");
  expect(await focused()).toBe("未來輕科技宅男");
  await page.locator("#panel .shuffle").focus();
  await page.keyboard.press("Enter");
  expect(await focused()).toBe("幫我隨機搭一間");
  await expect(page.locator("#stage canvas")).toHaveAttribute("role", "img");
  await expect(page.locator("#stage canvas")).toHaveAttribute("aria-label", /3D/);
  await page.locator("#panel .opts").first().locator("button").nth(2).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText("冷色燈帶");
});

for (const width of [390, 1440]) {
  test(`table lamp at ${width}px: light and halo stay inside the shade through every mood and quarter turn`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=zh&mood=tv`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    const initial = await page.evaluate(() => window.__room.tableLampLighting());
    expect(initial.sourceInsideShade).toBe(true);
    expect(initial.closedLampCastsShadow).toBe(false); // the closed GLB must not trap its own bulb's light
    expect(initial.decay).toBe(2);
    expect(initial.lightCount).toBe(6); // the picture spot is added only when the left wall is built
    expect(initial.shadowNear).toBeLessThan(.1);
    expect(initial.source[1]).toBeGreaterThan(initial.shadeMin[1]);
    expect(initial.source[1]).toBeLessThan((initial.shadeMin[1] + initial.shadeMax[1]) / 2);
    for (const mood of ["rain", "family", "tech", "chic", "slow", "tv"]) {
      await page.evaluate((value) => window.__room.set("mood", value), mood);
      await page.waitForTimeout(650);
      for (const angle of [0, 90, 180, 270]) {
        await page.evaluate((value) => window.__room.setOrbitAngle(value), angle);
        const lighting = await page.evaluate(() => window.__room.tableLampLighting());
        expect(lighting.source).toEqual(initial.source);
        expect(lighting.halo).toEqual(lighting.source);
        expect(lighting.sourceInsideShade).toBe(true);
        const left = await page.evaluate(() => window.__room.leftWallArt());
        expect(lighting.lightCount).toBe(left.built ? 7 : 6);
        if (left.built) { expect(left.spot.castShadow).toBe(true); expect(left.spot.shadowMap).toBe(512); }
      }
    }
    expect(errors).toEqual([]);
  });
}

test("TV wall, 360-degree safe orbit, accessible view buttons, URL state, and window-facing postcard", async ({ page }) => {
  await mkdir("docs/qa/roomverse-tv-wall", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=zh&mood=tv&view=tv`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.waitForTimeout(1900);
  expect(await page.evaluate(() => window.__room.hasFrontWall())).toBe(true);
  expect(await page.evaluate(() => window.__room.hasTvWall())).toBe(true);
  await expect(page.locator("#panel .camera-heading")).toHaveText("轉換視角");
  await expect(page.locator(".camera-tv")).toHaveAttribute("aria-label", "看電視牆");
  await expect(page.locator(".camera-window")).toHaveAttribute("aria-label", "回到窗邊");
  expect(await page.locator(".camera-tv").evaluate((button) => Math.min(button.clientWidth, button.clientHeight))).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => window.__room.angle())).toBe(180);
  await page.locator("#stage").screenshot({ path: "docs/qa/roomverse-tv-wall/tv-wall-phone-390.png" });

  const limits = await page.evaluate(() => window.__room.orbitLimits());
  expect(limits.minRadius).toBeGreaterThan(0);
  expect(limits.maxRadius).toBeLessThanOrEqual(2.0);
  expect(limits.minAzimuth).toBe(-Infinity);
  expect(limits.maxAzimuth).toBe(Infinity);
  expect(limits.near).toBeLessThan(.1);
  for (const degrees of [0, 90, 180, 270, 360]) {
    const cam = await page.evaluate((angle) => window.__room.setOrbitAngle(angle), degrees);
    expect(cam[0]).toBeGreaterThan(-2.6); expect(cam[0]).toBeLessThan(2.6);
    expect(cam[1]).toBeGreaterThan(0); expect(cam[1]).toBeLessThan(2.7);
    expect(cam[2]).toBeGreaterThan(-2.2); expect(cam[2]).toBeLessThan(2.4);
  }

  await page.locator(".camera-window").focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => window.__room.angle())).toBe(0);
  await expect(page.locator(".camera-window")).toHaveAttribute("aria-pressed", "true");
  await expect(page).not.toHaveURL(/view=tv/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator(".camera-tv").focus(); await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.__room.angle())).toBe(180);
  await expect(page).toHaveURL(/view=tv/);
  await expect(page.locator(".camera-tv")).toHaveAttribute("aria-pressed", "true");

  const moodButtons = page.locator("#panel .opts").first().locator("button");
  await expect(moodButtons).toHaveCount(6);
  for (const mood of ["rain", "family", "tech", "chic", "slow", "tv"]) {
    await page.locator("#panel .opts").first().locator(`button[data-key="${mood}"]`).click();
    await expect(page).toHaveURL(new RegExp(`mood=${mood}`));
    await expect(page).toHaveURL(/view=tv/);
  }
  await page.waitForTimeout(700);
  const windowPostcard = await page.evaluate(() => window.__room.postcard().toDataURL());
  await page.evaluate(() => window.__room.setOrbitAngle(0));
  const windowPostcardAtZero = await page.evaluate(() => window.__room.postcard().toDataURL());
  expect(windowPostcard).toBe(windowPostcardAtZero);
  await page.evaluate(() => window.__room.setOrbitAngle(180));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.goto(`${PAGE}?lang=en&mood=rain`); // legacy links without view remain window-facing
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.waitForTimeout(1900);
  expect(await page.evaluate(() => window.__room.angle())).toBe(0);
  await expect(page.locator(".camera-tv")).toHaveText("Turn to the TV wall");
  await expect(page.locator(".camera-window")).toHaveText("Back to the window");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("all six feelings show both views; tour stays inside and postcards keep the window angle", async ({ page }) => {
  const output = "docs/qa/roomverse-tv-wall";
  await mkdir(output, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=en&mood=rain`);
  await page.locator("#enter").click(); await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t?.getAttribute("aria-expanded") === "false") t.click(); });
  const moods = ["rain", "family", "tech", "chic", "slow", "tv"];
  for (const mood of moods) {
    await page.locator("#panel .opts").first().locator(`button[data-key="${mood}"]`).click();
    await page.waitForTimeout(650);
    await page.evaluate(() => window.__room.setOrbitAngle(0));
    await page.locator("#stage").screenshot({ path: `${output}/${mood}-window-1440.png` });
    await page.evaluate(() => window.__room.setOrbitAngle(180));
    await page.locator("#stage").screenshot({ path: `${output}/${mood}-tv-wall-1440.png` });
  }
  await page.locator("#panel .opts").first().locator('button[data-key="tv"]').click(); await page.waitForTimeout(650);
  for (const degrees of [0, 90, 180, 270]) {
    await page.evaluate((angle) => window.__room.setOrbitAngle(angle), degrees);
    await page.locator("#stage").screenshot({ path: `${output}/orbit-${degrees}-1440.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#panel .opts").first().locator('button[data-key="tv"]').click(); await page.waitForTimeout(650);
  for (const [view, angle] of [["window", 0], ["tv-wall", 180]]) {
    await page.evaluate((degrees) => window.__room.setOrbitAngle(degrees), angle);
    await page.screenshot({ path: `${output}/tv-${view}-390.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator(`#panel .opts button[data-key="tv"]`).click();
  await page.locator(".camera-window").click();
  await expect.poll(() => page.evaluate(() => window.__room.angle())).toBe(0);
  const cameraBeforeTour = await page.evaluate(() => window.__room.cam());
  await page.locator(".director").click();
  await page.waitForFunction(() => window.__room.director().playing, null, { timeout: 10000 });
  const tourInside = await page.evaluate(async () => {
    let safe = true;
    const start = performance.now();
    while (performance.now() - start < 2400) {
      const [x, y, z] = window.__room.cam();
      safe &&= x > -2.6 && x < 2.6 && y > 0 && y < 2.7 && z > -2.2 && z < 2.4;
      await new Promise(requestAnimationFrame);
    }
    return safe;
  });
  expect(tourInside).toBe(true);
  await page.locator(".director-stop").click();
  expect(await page.evaluate(() => window.__room.cam())).toEqual(cameraBeforeTour);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const lang of ["zh", "en"]) {
  for (const dpr of [1, 1.25]) {
    test(`${lang} 390px DPR ${dpr}: postcard title and URL have separate space without changing the canvas`, async ({ browser }, testInfo) => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dpr, reducedMotion: "reduce" });
      try {
        const page = await context.newPage();
        await page.goto(`${PAGE}?lang=${lang}`);
        await page.locator("#enter").click(); await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
        for (const mood of ["rain", "family", "tech", "chic", "slow", "tv"]) {
          const result = await page.evaluate((value) => {
            window.__room.set("mood", value);
            const original = CanvasRenderingContext2D.prototype.fillText, calls = [];
            CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...rest) {
              if (text === "ROOMVERSE 3D" || text === "paulstradecraft.com") {
                const width = this.measureText(text).width;
                calls.push({ text, left: this.textAlign === "right" ? x - width : x, right: this.textAlign === "right" ? x : x + width, font: this.font });
              }
              return original.call(this, text, x, y, ...rest);
            };
            try { const card = window.__room.postcard(); return { calls, width: card.width, sourceWidth: document.querySelector("#stage canvas").width }; }
            finally { CanvasRenderingContext2D.prototype.fillText = original; }
          }, mood);
          expect(result.calls).toHaveLength(2);
          const [title, domain] = result.calls;
          expect(domain.left - title.right).toBeGreaterThanOrEqual(10);
          expect(title.left).toBeGreaterThanOrEqual(0); expect(domain.right).toBeLessThanOrEqual(result.width);
          expect(Number(domain.font.match(/([\d.]+)px/)[1])).toBeGreaterThanOrEqual(12);
          expect(result.width).toBe(result.sourceWidth);
        }
        const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: lang === "zh" ? "存成明信片" : "Save as a postcard", exact: true }).click()]);
        const file = testInfo.outputPath(`${lang}-${dpr}-postcard.webp`); await download.saveAs(file);
        const art = await readFile(file);
        expect(art.toString("ascii", 0, 4)).toBe("RIFF");
        expect(art.toString("ascii", 8, 12)).toBe("WEBP");
      } finally { await context.close(); }
    });
  }
}

test("mobile yaw opens the TV wall from the plaque-fit window fov to at least 76; desktop, postcard and the short film stay put", async ({ page }) => {
  const readFov = async (degrees) => page.evaluate((value) => {
    window.__room.setOrbitAngle(value);
    const box = document.querySelector("#stage").getBoundingClientRect();
    return { fov: window.__room.fov(), wide: box.width / box.height >= 0.8 };
  }, degrees);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  const stage = await page.evaluate(() => {
    const box = document.querySelector("#stage").getBoundingClientRect();
    return { aspect: box.width / box.height, antialias: document.querySelector("#stage canvas").getContext("webgl2").getContextAttributes().antialias };
  });
  expect(stage.aspect).toBeLessThan(0.8);
  expect(stage.antialias).toBe(true);
  const atWindow = await readFov(0);
  expect(atWindow.fov).toBeGreaterThan(66);
  expect(atWindow.fov).toBeLessThan(76);
  const plaque = await page.evaluate(() => window.__room.plaqueView());
  expect(plaque.firstHit).toBe("house-plaque");
  const xs = plaque.corners.map((corner) => corner.x);
  const ys = plaque.corners.map((corner) => Math.abs(corner.y));
  expect(Math.max(...xs)).toBeLessThanOrEqual(0.97);
  expect(Math.min(...xs)).toBeGreaterThanOrEqual(-0.97);
  expect(Math.max(...ys)).toBeLessThanOrEqual(0.97);
  expect(plaque.corners.every((corner) => corner.z > -1 && corner.z < 1)).toBe(true);
  const at90 = (await readFov(90)).fov;
  const at135 = (await readFov(135)).fov;
  expect(at90).toBeGreaterThan(atWindow.fov);
  expect(at135).toBeGreaterThan(at90);
  expect(at135).toBeLessThan(76);
  await readFov(180);
  const updates = await page.evaluate(() => window.__room.fovProjectionUpdates());
  await page.evaluate(() => window.__room.setOrbitAngle(180));
  expect(await page.evaluate(() => window.__room.fovProjectionUpdates())).toBe(updates);
  expect(await page.evaluate(() => window.__room.tableLampLighting().lightCount)).toBe(7); // left wall was opened at 90°, so its picture spot is present
  expect(await page.evaluate(() => window.__room.leftWallArt().spot.castShadow)).toBe(true);
  expect(await page.evaluate(() => window.__room.leftWallArt().spot.shadowMap)).toBe(512);
  const fromTv = await page.evaluate(() => window.__room.postcard().toDataURL());
  await page.evaluate(() => window.__room.setOrbitAngle(0));
  expect(await page.evaluate(() => window.__room.postcard().toDataURL())).toBe(fromTv);
  await page.evaluate(() => window.__room.setOrbitAngle(180));
  const beforeTour = await page.evaluate(() => window.__room.cam());
  await page.locator(".director").click();
  await page.waitForFunction(() => window.__room.director().playing, null, { timeout: 15000 });
  expect(await page.evaluate(() => window.__room.fov())).toBeCloseTo(66, 2);
  await page.locator(".director-stop").click();
  await expect.poll(() => page.evaluate(() => window.__room.cam())).toEqual(beforeTour);
  expect(await page.evaluate(() => window.__room.fov())).toBeCloseTo(76, 2);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(() => page.evaluate(() => {
    const box = document.querySelector("#stage").getBoundingClientRect();
    const canvas = document.querySelector("#stage canvas");
    return box.width / box.height >= 0.8 && Math.abs(canvas.width - box.width) < 2;
  })).toBe(true);
  for (const degrees of [0, 135, 180]) {
    const reading = await readFov(degrees);
    expect(reading.wide).toBe(true);
    expect(reading.fov).toBeCloseTo(44, 2);
  }
  await page.evaluate(() => window.__room.setOrbitAngle(0));
  const desktopPlaque = await page.evaluate(() => window.__room.plaqueView());
  const desktopXs = desktopPlaque.corners.map((corner) => corner.x);
  expect(desktopPlaque.firstHit).toBe("house-plaque");
  expect(Math.max(...desktopXs)).toBeLessThanOrEqual(0.97);
  expect(desktopPlaque.corners.every((corner) => corner.z > -1 && corner.z < 1)).toBe(true);
});

for (const lang of ["zh", "en"]) {
  for (const [width, height] of [[390, 844], [390, 740], [360, 740], [360, 640]]) {
    test(`${lang} ${width}×${height} TV view frames both shelves and the window view keeps the plaque`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${PAGE}?lang=${lang}&mood=tv&view=tv`);
      await page.locator("#enter").click();
      await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
      const framing = await page.evaluate(() => {
        const stage = document.querySelector("#stage").getBoundingClientRect();
        window.__room.setOrbitAngle(0);
        const windowFov = window.__room.fov();
        const plaque = window.__room.plaqueView();
        const xs = plaque.corners.map((corner) => corner.x);
        const ys = plaque.corners.map((corner) => Math.abs(corner.y));
        window.__room.setOrbitAngle(135);
        const turningFov = window.__room.fov();
        window.__room.setOrbitAngle(180);
        const tvFov = window.__room.fov();
        const tvCameraZ = window.__room.cam()[2];
        const visibleHalfWidth = (2.4 - tvCameraZ) * Math.tan(tvFov * Math.PI / 360) * stage.width / stage.height;
        return {
          aspect: stage.width / stage.height, windowFov, turningFov, tvFov, visibleHalfWidth,
          plaqueHit: plaque.firstHit,
          plaqueMaxX: Math.max(...xs), plaqueMinX: Math.min(...xs), plaqueMaxY: Math.max(...ys),
          plaqueInFront: plaque.corners.every((corner) => corner.z > -1 && corner.z < 1),
        };
      });
      expect(framing.plaqueHit).toBe("house-plaque");
      expect(framing.plaqueInFront).toBe(true);
      expect(framing.plaqueMaxX).toBeLessThanOrEqual(0.97);
      expect(framing.plaqueMinX).toBeGreaterThanOrEqual(-0.97);
      expect(framing.plaqueMaxY).toBeLessThanOrEqual(0.97);
      expect(framing.windowFov).toBeGreaterThanOrEqual(framing.aspect < .8 ? 66 : 44);
      expect(framing.visibleHalfWidth).toBeGreaterThanOrEqual(2.23); // shelf edges ±2.13 m, plus visible margin
      expect(framing.turningFov).toBeGreaterThanOrEqual(framing.windowFov);
      expect(framing.turningFov).toBeLessThanOrEqual(framing.tvFov);
    });
  }
}

for (const [label, viewport] of [["phone", { width: 390, height: 844 }], ["desktop", { width: 1440, height: 900 }]]) {
  test(`${label} can orbit through two full turns and does not snap back on release`, async ({ page }) => {
    const output = "docs/qa/roomverse-orbit-continuous";
    await mkdir(output, { recursive: true });
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=zh&mood=tv&view=tv`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    const canvas = page.locator("#stage canvas");
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    await page.waitForTimeout(300);
    const start = await page.evaluate(() => window.__room.angle());
    await canvas.screenshot({ path: `${output}/${label}-rotation-start-tv.png` });
    await page.evaluate(() => window.__room.setOrbitAngle(135));
    await canvas.screenshot({ path: `${output}/${label}-rotation-135.png` });
    await page.evaluate((angle) => window.__room.setOrbitAngle(angle), start);

    const halfTurnDrag = box.height / 2;
    const x0 = box.x + 30, x1 = x0 + halfTurnDrag, y = box.y + box.height / 2;
    expect(x1).toBeLessThan(box.x + box.width - 8);
    const samples = [];
    const releases = [];
    for (let i = 1; i <= 4; i++) {
      await page.mouse.move(x0, y);
      await page.mouse.down();
      await page.mouse.move(x1, y, { steps: 12 });
      await page.mouse.up();
      const angleAtRelease = await page.evaluate(() => window.__room.angle());
      let previous = angleAtRelease, stableReads = 0, angleSettled = angleAtRelease;
      for (let poll = 0; poll < 80 && stableReads < 4; poll++) {
        await page.waitForTimeout(100);
        angleSettled = await page.evaluate(() => window.__room.angle());
        stableReads = angleSettled === previous ? stableReads + 1 : 0;
        previous = angleSettled;
      }
      expect(stableReads).toBeGreaterThanOrEqual(4); // wait for normal damping, not a fixed timing guess
      samples.push(angleSettled);
      const releaseDelta = ((angleSettled - angleAtRelease + 540) % 360) - 180;
      releases.push({ angleAtRelease, angleSettled, releaseDeltaDegrees: releaseDelta });
      if (i === 1) {
        const settledDistanceFromTv = Math.abs(((angleSettled - 180 + 540) % 360) - 180);
        expect(settledDistanceFromTv).toBeGreaterThan(30); // a released drag must not snap back to the TV preset
      }
      await canvas.screenshot({ path: `${output}/${label}-rotation-after-${i}-half-turns.png` });
    }

    const unwrap = (values) => values.reduce((sum, current, index) => {
      const previous = index === 0 ? start : values[index - 1];
      const delta = ((current - previous + 540) % 360) - 180;
      return sum + delta;
    }, 0);
    const travelled = unwrap(samples);
    expect(Math.abs(travelled)).toBeGreaterThan(650);
    expect(Math.abs(travelled)).toBeLessThan(850);
    expect(samples).toHaveLength(4);
    let fovBeforeSeam = null;
    for (const degrees of [179, 181]) {
      await page.evaluate((value) => window.__room.setOrbitAngle(value), degrees);
      const fov = await page.evaluate(() => window.__room.fov());
      expect(Number.isFinite(fov)).toBe(true);
      if (degrees === 179) fovBeforeSeam = fov;
      else expect(Math.abs(fov - fovBeforeSeam)).toBeLessThan(0.1);
    }
    const cameraBeforePostcard = await page.evaluate(() => window.__room.cam());
    await page.evaluate(() => window.__room.postcard().toDataURL());
    expect(await page.evaluate(() => window.__room.cam())).toEqual(cameraBeforePostcard);
    const panelToggle = page.locator("#panelToggle");
    if (await panelToggle.isVisible()) await panelToggle.click();
    await page.locator(".camera-window").click();
    expect(await page.evaluate(() => window.__room.angle())).toBe(0);
    await expect(page).not.toHaveURL(/view=tv/);
    await page.locator(".camera-tv").click();
    expect(await page.evaluate(() => window.__room.angle())).toBe(180);
    await expect(page).toHaveURL(/view=tv/);
    await writeFile(`${output}/${label}-rotation-measurements.json`, JSON.stringify({ viewport, start, samples, travelledDegrees: travelled, releases }, null, 2));
  });
}
