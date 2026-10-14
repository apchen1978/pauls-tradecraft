import { expect, test } from "@playwright/test";

const URL = "/prototype/take-the-lantern-apart/";

async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function playThrough(page, lang) {
  const zh = lang === "zh";
  await expect(page.locator("#toy-label")).toHaveText(zh ? "示意玩具，不是報價工具。" : "A toy, not a quoting tool.");
  await noOverflow(page);
  await page.locator("#go0").click();
  await expect(page.locator("#s1")).toBeVisible();
  await noOverflow(page);
  await page.locator("#go1").click();
  await expect(page.locator("#go2")).toBeDisabled();
  await page.locator("#turn-r").click();
  await expect(page.locator("#lamp")).toHaveAttribute("data-angle", "r");
  await page.locator("#turn-l").click();
  await page.locator("#turn-l").click();
  await expect(page.locator("#lamp")).toHaveAttribute("data-angle", "l");
  await page.locator("#spot-shade").click();
  await expect(page.locator("#detail-img")).toHaveAttribute("src", "assets/detail-shade-inside.webp");
  await expect(page.locator("#detail-stars")).toBeVisible();
  await expect(page.locator("#note")).not.toContainText(/星座|Star-sign|待 Paul|Paul to supply/);
  await page.locator("#spot-base").click();
  await expect(page.locator("#go2")).toBeEnabled();
  await noOverflow(page);
  await page.locator("#go2").click();
  await page.locator('[data-part="shade"][data-option="glass"]').click();
  await page.locator('[data-part="pack"][data-option="bulk"]').click();
  await expect(page.locator("#effects")).toContainText(zh ? "貴一點" : "costs a bit more");
  await expect(page.locator("#effects")).toContainText(zh ? "便宜一點" : "costs a bit less");
  await expect(page.locator(".effects")).toContainText(zh ? "示意" : "Illustrative");
  await expect(page.locator('.react[data-part="shade"]')).toContainText(zh ? "千禧" : "Chiensi");
  await expect(page.locator('.react[data-part="pack"]')).toContainText(zh ? "依依姐" : "Yiyi");
  await expect(page.locator(".mg-box")).toBeVisible();
  await noOverflow(page);
  await page.locator("#go3").click();
  const pending = page.locator("#pending-list");
  await expect(pending.locator('[data-item="plug"]')).toBeVisible();
  await expect(pending.locator('[data-item="cert"]')).toBeVisible();
  await expect(pending.locator('[data-item="fragile"]')).toBeVisible();
  await expect(page.locator('#agreed-list [data-item="plug"], #agreed-list [data-item="cert"]')).toHaveCount(0);
  await noOverflow(page);
  await page.locator("#go4").click();
  await expect(page.locator("#card")).toBeVisible();
  await expect(page.locator("#next-link")).toHaveAttribute("href", `/prototype/trade-street/?lang=${lang}`);
  await noOverflow(page);
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/[0-9$€£¥]/);
}

for (const width of [390, 1024, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`lantern ${width}px ${lang}: all six screens, rules, no overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`${URL}?lang=${lang}`);
      await playThrough(page, lang);
    });
  }
}

test("plug and certification stay pending whatever the material", async ({ page }) => {
  await page.goto(`${URL}?lang=zh`);
  await page.locator("#go0").click();
  await page.locator("#go1").click();
  await page.locator("#spot-shade").click();
  await page.locator("#spot-base").click();
  await page.locator("#go2").click();
  for (const shade of ["paper", "glass", "metal"]) {
    for (const base of ["wood", "ceramic", "brass"]) {
      await page.locator(`[data-part="shade"][data-option="${shade}"]`).click();
      await page.locator(`[data-part="base"][data-option="${base}"]`).click();
      await page.locator("#go3").click();
      await expect(page.locator('#pending-list [data-item="plug"]')).toHaveCount(1);
      await expect(page.locator('#pending-list [data-item="cert"]')).toHaveCount(1);
      await page.locator("#go4").click();
      await page.locator("#again").click();
    }
  }
});

test("spec card downloads with the kid's name and no date", async ({ page }) => {
  await page.addInitScript(() => {
    window.__cardText = [];
    const fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__cardText.push(String(s)); return fill.call(this, s, ...a); };
  });
  await page.goto(`${URL}?lang=en`);
  for (const id of ["#go0", "#go1", "#spot-shade", "#spot-base", "#go2", "#go3", "#go4"]) await page.locator(id).click();
  await expect(page.locator("#card")).toHaveAttribute("data-ready", "1");
  const text = (await page.evaluate(() => window.__cardText)).join("\n");
  expect(text).toContain("Chiensi");
  expect(text).toContain("Plug and voltage");
  expect(text).not.toMatch(/\d/);
  const download = page.waitForEvent("download");
  await page.locator("#download").click();
  expect((await download).suggestedFilename()).toBe("a-lamp-as-promised-spec-card.png");
});

test("language switch keeps the screen and updates the link", async ({ page }) => {
  await page.goto(`${URL}?lang=zh`);
  await page.locator("#go0").click();
  await page.getByRole("button", { name: "EN" }).click();
  await expect(page).toHaveURL(/lang=en/);
  await expect(page.locator("#s1")).toBeVisible();
  await expect(page.locator("#go1")).toHaveText("Put the photo on the bench");
});

test("all nine shade and base combos load real art and keep the tint", async ({ page }) => {
  await page.goto(`${URL}?lang=zh`);
  for (const id of ["#go0", "#go1", "#spot-shade", "#spot-base", "#go2"]) await page.locator(id).click();
  for (const shade of ["paper", "glass", "metal"]) {
    for (const base of ["wood", "ceramic", "brass"]) {
      await page.locator(`[data-part="shade"][data-option="${shade}"]`).click();
      await page.locator(`[data-part="base"][data-option="${base}"]`).click();
      await expect(page.locator("#shade")).toHaveAttribute("src", `assets/lamp-shade-${shade}-f.webp`);
      await expect(page.locator("#base")).toHaveAttribute("src", `assets/lamp-base-${base}-f.webp`);
      await expect.poll(() => page.evaluate(() => [...document.querySelectorAll("#lamp img")].every((i) => i.complete && i.naturalWidth === 800))).toBe(true);
    }
  }
  await page.locator('[data-part="colour"][data-option="persimmon"]').click();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.getElementById("tint")).backgroundColor)).toBe("rgb(224, 135, 74)");
  await page.locator('#s3 [data-part="size"][data-option="l"]').click();
  await expect(page.locator("#lamp")).toHaveAttribute("data-size", "l");
});

test("all three angles load real files for every combo", async ({ page }) => {
  await page.goto(`${URL}?lang=zh`);
  for (const id of ["#go0", "#go1", "#spot-shade", "#spot-base", "#go2"]) await page.locator(id).click();
  for (const shade of ["paper", "glass", "metal"]) {
    for (const base of ["wood", "ceramic", "brass"]) {
      await page.locator(`[data-part="shade"][data-option="${shade}"]`).click();
      await page.locator(`[data-part="base"][data-option="${base}"]`).click();
      for (const [btn, a] of [["#turn-l", "l"], ["#turn-r", "f"], ["#turn-r", "r"]]) {
        await page.evaluate((b) => document.querySelector(b).click(), btn);
        await expect(page.locator("#lamp")).toHaveAttribute("data-angle", a);
        await expect(page.locator("#shade")).toHaveAttribute("src", `assets/lamp-shade-${shade}-${a}.webp`);
        await expect(page.locator("#base")).toHaveAttribute("src", `assets/lamp-base-${base}-${a}.webp`);
        await expect(page.locator("#cord")).toHaveAttribute("src", `assets/lamp-cord-${a}.webp`);
        await expect(page.locator("#glow")).toHaveAttribute("src", `assets/lamp-shade-glow-${a}.webp`);
        await expect.poll(() => page.evaluate(() => [...document.querySelectorAll("#lamp img")].every((i) => i.complete && i.naturalWidth === 800))).toBe(true);
      }
      await page.evaluate(() => document.querySelector("#turn-l").click());
    }
  }
});

test("batch 3 art: characters, close-ups, card frame and og meta load", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${URL}?lang=en`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-lantern\.webp$/);
  const bg = await page.locator("#stage").evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toContain("bg-studio-night.webp");
  await page.locator("#go0").click();
  const loaded = (sel) => page.locator(sel).evaluate((i) => i.complete && i.naturalWidth > 0);
  await expect.poll(() => loaded("#s1 img.photo")).toBe(true);
  await expect(page.locator("#s1 img.who").first()).toHaveAttribute("alt", "Chiensi holding a camera");
  await page.locator("#go1").click();
  await page.locator("#spot-base").click();
  await expect(page.locator("#detail-img")).toHaveAttribute("src", "assets/detail-base-bottom.webp");
  await expect(page.locator("#detail-stars")).toBeHidden();
  await page.locator("#spot-mg").click();
  await expect(page.locator("#detail-img")).toHaveAttribute("src", "assets/mg-paw.webp");
  await page.locator("#spot-shade").click();
  for (const id of ["#go2", "#go3"]) await page.locator(id).click();
  await expect.poll(() => loaded("#s4 [data-line=\"s4Diana\"] img.who")).toBe(true);
  await page.locator("#go4").click();
  await expect(page.locator("#card")).toHaveAttribute("data-ready", "1");
});

test("new title, tagline and share meta in zh and en", async ({ page }) => {
  await page.goto(`${URL}?lang=zh`);
  await expect(page).toHaveTitle("一盞燈的約定 · A Lamp, As Promised");
  await expect(page.locator("#s0-title")).toHaveText("一盞燈的約定");
  await expect(page.locator(".tagline")).toHaveText("拆開一盞燈，把你想要的說清楚。");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "一盞燈的約定 · A Lamp, As Promised");
  await expect(page.locator("#toy-label")).toContainText("示意玩具");
  await page.getByRole("button", { name: "EN" }).click();
  await expect(page).toHaveTitle("A Lamp, As Promised · 一盞燈的約定");
  await expect(page.locator("#s0-title")).toHaveText("A Lamp, As Promised");
  await expect(page.locator(".tagline")).toHaveText("Take a lamp apart, and say clearly what you want.");
  expect(await page.content()).not.toContain("Take the Lantern Apart");
  expect(await page.content()).not.toContain("拆一盞燈");
});

test("story: skip path, both helpers, fixed reactions, picks survive a language switch", async ({ page }) => {
  await page.goto(`${URL}?lang=zh`);
  await page.locator("#go0").click();
  await expect(page.locator('#s1 [data-line="s1Diana"]')).toContainText("戴安娜");
  await expect(page.locator('#s1 [data-line="s1Yiyi"]')).toBeHidden();
  await page.locator("#s1 .talk summary").click();
  await expect(page.locator('#s1 [data-line="s1Yiyi"]')).toContainText("依依姐");
  await page.locator("#skip1").click();
  await expect(page.locator("#s2")).toBeVisible();
  await page.locator("#spot-base").click();
  await expect(page.locator("#note")).toContainText("依依姐");
  await expect(page.locator("#detail-hint")).toContainText("插頭、電壓和安全要求");
  await page.locator("#spot-shade").click();
  await expect(page.locator("#note")).toContainText("戴安娜");
  await page.locator("#go2").click();
  await expect(page.locator('.react[data-part="size"]')).toContainText("依依姐");
  await page.locator('[data-part="base"][data-option="ceramic"]').click();
  const first = await page.locator('.react[data-part="base"]').innerText();
  await page.locator('[data-part="base"][data-option="wood"]').click();
  await page.locator('[data-part="base"][data-option="ceramic"]').click();
  expect(await page.locator('.react[data-part="base"]').innerText()).toBe(first);
  await expect(page.locator('[data-part="base"][data-option="ceramic"]')).toBeFocused();
  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.locator('[data-part="base"][data-option="ceramic"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('.react[data-part="base"]')).toContainText("Diana");
  await page.locator("#go3").click();
  await expect(page.locator('#s4 [data-line="s4Diana"]')).toContainText("Diana");
  await expect(page.locator('#s4 [data-line="s4Yiyi"]')).toContainText("Yiyi");
  await expect(page.locator('#pending-list [data-item="moq"]')).toContainText("still need confirming");
  await page.locator("#go4").click();
  await expect(page.locator('#s5 [data-line="s5Chiensi"]')).toContainText("Chiensi");
  await expect(page.locator("#again")).toHaveText("Try a different set of choices");
});

test("story: three explorations open, close and return focus without blocking", async ({ page }) => {
  await page.goto(`${URL}?lang=en`);
  await page.locator("#go0").click();
  for (const [btn, panel, text] of [["#find-leaf", "#leaf-panel", "keep your place"]]) {
    await page.locator(btn).click();
    await expect(page.locator(panel)).toContainText(text);
    await page.locator(`${panel} [data-close]`).click();
    await expect(page.locator(panel)).toBeHidden();
    await expect(page.locator(btn)).toBeFocused();
  }
  for (const id of ["#go1", "#spot-shade", "#spot-base", "#go2"]) await page.locator(id).click();
  const size = await page.locator('[data-part="size"][aria-pressed="true"]').getAttribute("data-option");
  for (const [btn, panel, text] of [["#find-note", "#note-panel", "open book"], ["#find-mg", "#mg-panel", "tail outside"]]) {
    await page.locator(btn).click();
    await expect(page.locator(panel)).toContainText(text);
    await page.locator(`${panel} [data-close]`).click();
    await expect(page.locator(btn)).toBeFocused();
  }
  await expect(page.locator('[data-part="size"][aria-pressed="true"]')).toHaveAttribute("data-option", size);
  await expect(page.locator("#effects")).toContainText("Nothing changed yet.");
});

test("story: spec card keeps title, subtitle, client and pending list in both languages", async ({ page }) => {
  await page.addInitScript(() => {
    window.__cardText = [];
    const fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__cardText.push(String(s)); return fill.call(this, s, ...a); };
  });
  for (const [lang, want] of [["zh", ["規格卡 · 一盞燈的約定", "我們想做的那盞燈", "委託人：千禧", "數量與最低製作量"]], ["en", ["Spec Card · A Lamp, As Promised", "The lamp we'd like to make", "Chiensi", "Quantity and minimum run"]]]) {
    await page.goto(`${URL}?lang=${lang}`);
    for (const id of ["#go0", "#skip1", "#spot-shade", "#spot-base", "#go2", "#go3", "#go4"]) await page.locator(id).click();
    await expect(page.locator("#card")).toHaveAttribute("data-ready", "1");
    const text = (await page.evaluate(() => window.__cardText)).join("\n");
    for (const w of want) expect(text).toContain(w);
    expect(text).not.toContain("依依姐");
    expect(text).not.toMatch(/\d/);
  }
});

test("story: Yiyi portraits load and never reuse Diana's files", async ({ page }) => {
  await page.goto(`${URL}?lang=zh`);
  await page.locator("#go0").click();
  const yiyi = page.locator('#s1 .cast-row img[src="assets/yiyi-work.webp"]');
  await expect(yiyi).toBeVisible();
  expect(await yiyi.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
  await page.locator("#go1").click();
  await page.locator("#spot-base").click();
  await expect(page.locator('#note img[src="assets/yiyi-ask.webp"]')).toBeVisible();
  await page.locator("#spot-shade").click();
  await expect(page.locator('#note img[src="assets/diana-ask.webp"]')).toBeVisible();
});
