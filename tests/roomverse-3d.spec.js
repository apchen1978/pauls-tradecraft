import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// ROOMVERSE 3D: a poster first (no 3D download until the visitor asks), then a 3D room whose feeling,
// wall and rug can be changed. Furniture models are placed on the floor by their measured bounds.
const PAGE = "/prototype/roomverse-3d/";
const storyRooms = {
  rain: { zh: "加班到十點，外面下著雨。", en: "Working late; rain is falling outside.", wall: "sand", rug: "ivory", curtain: "linen", print: "rain" },
  chic: { zh: "明早要簡報，想先把自己整理好。", en: "A presentation tomorrow; she wants to feel ready.", wall: "original", rug: "ivory", curtain: "rose", print: "hills" },
  family: { zh: "週末，兩個孩子和長輩都要來。", en: "The family is coming over this weekend.", wall: "sand", rug: "stripe", curtain: "sage", print: "hills" },
  tech: { zh: "在家寫到半夜，只想要安靜。", en: "Working from home past midnight, they need quiet.", wall: "mist", rug: "stripe", curtain: "linen", print: "moon" },
  tv: { zh: "週五晚上，只想窩著追劇。", en: "Friday night, and she wants nothing but the sofa and a good series.", wall: "sand", rug: "ivory", curtain: "linen", print: "moon" },
};

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

test("Feeling First links restore five story-matched ROOMVERSE presets at 390px", async ({ page }) => {
  await mkdir("test-results/fu-to-roomverse-scenes", { recursive: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [who, preset] of Object.entries(storyRooms)) {
    await page.goto(`/prototype/feeling-to-room/?lang=zh`);
    const cardStory = await page.locator(`[data-mood="${who}"] .mood-copy span`).textContent();
    expect(cardStory).toBe(preset.zh);
    const query = new URLSearchParams({ lang: "zh", mood: who === "tv" ? "tech" : who, wall: preset.wall, rug: preset.rug, curtain: preset.curtain, print: preset.print, from: "fu", who });
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
    for (const [group, key] of [[0, who === "tv" ? "tech" : who], [1, preset.wall], [2, preset.rug], [3, preset.curtain], [4, preset.print]]) {
      await expect(groups.nth(group).locator(`button[data-key="${key}"]`)).toHaveAttribute("aria-pressed", "true");
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

test("the English story-origin prompt matches all five stories; ordinary and invalid entries stay unchanged", async ({ page }) => {
  await mkdir("test-results/fu-to-roomverse-scenes", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [who, preset] of Object.entries(storyRooms)) {
    await page.goto(`/prototype/feeling-to-room/?lang=en`);
    const cardStory = await page.locator(`[data-mood="${who}"] .mood-copy span`).textContent();
    expect(cardStory).toBe(preset.en);
    const query = new URLSearchParams({ lang: "en", mood: who, wall: preset.wall, rug: preset.rug, curtain: preset.curtain, print: preset.print, from: "fu", who });
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
      const img = card.locator('img[src*="roomverse-3d/showcase-roomverse-3d-v1.webp"]');
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

test("new wall paints restore from the URL and work across all five feelings", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=en&mood=rain&wall=mist`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.getAttribute("aria-expanded") === "false") t.click(); });

  const groups = page.locator("#panel .opts");
  const moodButtons = groups.nth(0).locator("button");
  const wallButtons = groups.nth(1).locator("button");
  const wallKeys = await wallButtons.evaluateAll((buttons) => buttons.map((button) => button.dataset.key));
  expect(new Set(wallKeys).size).toBe(wallKeys.length); // options are rendered from WALLS, without a frozen count
  expect(wallKeys).toContain("mist");
  expect(wallKeys).toContain("pine");
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
  await page.evaluate(() => { const t = document.getElementById("panelToggle"); if (t && t.getAttribute("aria-expanded") === "false") t.click(); });
  await expect(page.locator('#panel .opts').nth(1).locator('button[data-key="mist"]')).toHaveAttribute("aria-pressed", "true");

  for (let mood = 0; mood < 5; mood++) {
    await moodButtons.nth(mood).click();
    const wall = mood % 2 === 0 ? "Deep pine" : "Misty blue-grey";
    const button = wallButtons.filter({ hasText: wall });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(new RegExp(`wall=${mood % 2 === 0 ? "pine" : "mist"}`));
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
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
  const moods = ["rain", "family", "tech", "chic", "slow"];
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
  await expect(moodButtons).toHaveCount(5);
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
