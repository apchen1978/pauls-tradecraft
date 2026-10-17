import { expect, test } from "@playwright/test";
import { AGREEMENTS, BASKETS, LAMPS, MISSED, TEXT } from "../public/prototype/match-the-approved-lamp/content.js";

// Match the Lamp on the Shelf: one toy, one lesson. Bulk goods are checked against the approved sample the factory kept,
// and the range that is acceptable is agreed at trial production. Project buyers only. No numbers, no score.
const PAGE = "/prototype/match-the-approved-lamp/";

function allStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") {
    try { out.push(String(value("A", true))); } catch { /* ignore */ }
    try { out.push(String(value("A"))); } catch { /* ignore */ }
  } else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => allStrings(v, out));
  return out;
}

test("the words carry no digits, no AI, no retired words, and zh and en have the same keys", () => {
  for (const lang of ["zh", "en"]) {
    for (const text of allStrings(TEXT[lang])) {
      if (text === TEXT[lang].htmlLang) continue;
      expect(text, `${lang}: ${text}`).not.toMatch(/\d/);
      expect(text, `${lang}: ${text}`).not.toMatch(/魔法|法師|法術|咒|巫|遠燈鎮|fairy|magic|spell/i);
    }
  }
  expect(Object.keys(TEXT.zh).sort()).toEqual(Object.keys(TEXT.en).sort());
  for (const key of Object.keys(MISSED)) {
    expect(MISSED[key].zh).not.toMatch(/\d/);
    expect(MISSED[key].en).not.toMatch(/\d/);
  }
  expect(AGREEMENTS).toHaveLength(3);
  expect(BASKETS).toHaveLength(3);
  expect(LAMPS.filter((l) => l.diff)).toHaveLength(3);
});

async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test.describe(`${lang} at ${width}px`, () => {
      test.use({ viewport: { width, height: width === 390 ? 844 : 900 } });

      test("the whole walk: trial yardstick, one by one, side by side, lamp on, mark, sort, take away; nothing stored", async ({ page }) => {
        const x = TEXT[lang];
        const problems = [];
        const outside = [];
        page.on("pageerror", (error) => problems.push(String(error)));
        page.on("console", (message) => { if (message.type() === "error" && !/favicon/.test(message.text())) problems.push(message.text()); });
        page.on("request", (request) => { if (!request.url().startsWith("http://127.0.0.1") && !request.url().startsWith("data:")) outside.push(request.url()); });
        await page.goto(`${PAGE}?lang=${lang}`);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(x.title);
        await expect(page.locator("#toy-label")).toHaveText(x.label);
        await expect(page.locator("#s0-scope")).toHaveText(x.scope);
        await noOverflow(page);

        // trial run: Go is disabled until the yardstick is chosen; each choice gets its fixed reply
        await page.locator("#go0").click();
        await expect(page.locator("#go1")).toBeDisabled();
        for (const id of AGREEMENTS) {
          await page.locator(`#agree button[data-agree="${id}"]`).click();
          await expect(page.locator("#agree-react")).toContainText(x.agreeReact[id].t);
          await expect(page.locator(`#agree button[data-agree="${id}"]`)).toHaveAttribute("aria-checked", "true");
        }
        await page.locator('#agree button[data-agree="range"]').click();
        await expect(page.locator("#go1")).toBeEnabled();
        await noOverflow(page);
        await page.locator("#go1").click();

        // the bulk: starts one by one, must be seen side by side once, and needs one mark
        await expect(page.locator("#stage")).toHaveAttribute("data-mode", "single");
        await expect(page.locator("#go2")).toBeDisabled();
        await expect(page.locator("#gate")).toHaveText(x.needSide);
        await expect(page.locator("#mode-note")).toHaveText(x.singleNote);
        await page.locator("#next").click();
        await page.locator("#prev").click();
        await page.locator("#mode-side").click();
        await expect(page.locator("#stage")).toHaveAttribute("data-mode", "side");
        await expect(page.locator("#mode-note")).toHaveText(x.sideNote);
        await expect(page.locator("#gate")).toHaveText(x.needLit);
        // first switch-on asks for a guess before the reveal
        await page.locator("#light").click();
        await expect(page.locator("#guess")).toBeVisible();
        await expect(page.locator("#stage")).not.toHaveClass(/lit/);
        await expect(page.locator("#guess-btns button")).toHaveCount(6);
        await page.locator('#guess-btns button[data-guess="C"]').click();
        await expect(page.locator("#guess")).toBeHidden();
        await expect(page.locator("#stage")).toHaveClass(/lit/);
        await expect(page.locator("#mode-note")).toContainText(x.guessSaid("C"));
        await expect(page.locator("#mode-note")).toContainText(x.litNote);
        await expect(page.locator("#gate")).toHaveText(x.needMark);
        // the lamps really light up: a halo and a lit shade on every lamp, and the lamp D light is whiter than the rest
        await expect.poll(() => page.locator('.lamp-btn[data-id="A"] .litglow').evaluate((node) => parseFloat(getComputedStyle(node).opacity))).toBeGreaterThan(0.9);
        await noOverflow(page);
        await page.locator('.lamp-btn[data-id="C"]').click();
        await page.locator('.lamp-btn[data-id="D"]').click();
        await page.locator('.lamp-btn[data-id="A"]').click();
        await expect(page.locator('.lamp-btn[data-id="C"]')).toHaveAttribute("aria-pressed", "true");
        await page.locator('.lamp-btn[data-id="A"]').click();
        await expect(page.locator('.lamp-btn[data-id="A"]')).toHaveAttribute("aria-pressed", "false");
        await page.locator('.lamp-btn[data-id="A"]').click();
        await expect(page.locator("#gate")).toHaveText("");
        await expect(page.locator("#go2")).toBeEnabled();
        await page.locator("#go2").click();

        // sorting: C (shade), D (light), A (looks right). Next stays locked until every mark has a move.
        await expect(page.locator(".sort-item")).toHaveCount(3);
        await expect(page.locator("#go3")).toBeDisabled();
        await expect(page.locator("#gate3")).toHaveText(x.needBasket);
        await expect(page.locator('.sort-item[data-lamp="C"] h3')).toHaveText(x.diffTitle.shade("C"));
        await expect(page.locator('.sort-item[data-lamp="D"] h3')).toHaveText(x.diffTitle.light("D"));
        await expect(page.locator('.sort-item[data-lamp="A"] h3')).toHaveText(x.sameTitle("A"));
        await page.locator('.sort-item[data-lamp="C"] button[data-basket="inrange"]').click();
        await expect(page.locator('.sort-item[data-lamp="C"]')).toContainText(x.react.shade.inrange.t);
        await expect(page.locator('.sort-item[data-lamp="C"]')).toContainText(x.agree.range.t);
        await page.locator('.sort-item[data-lamp="D"] button[data-basket="talk"]').click();
        await expect(page.locator('.sort-item[data-lamp="D"]')).toContainText(x.react.light.talk.t);
        await page.locator('.sort-item[data-lamp="A"] button[data-basket="redo"]').click();
        await expect(page.locator('.sort-item[data-lamp="A"]')).toContainText(x.reactSame.redo.t);
        await expect(page.locator("#go3")).toBeEnabled();
        await noOverflow(page);
        await page.locator("#go3").click();

        // take away: five lines, what was agreed, and the one difference that was not marked
        await expect(page.locator("#card-lines li")).toHaveCount(5);
        await expect(page.locator("#agreed")).toContainText(x.agree.range.t);
        await expect(page.locator("#missed")).toContainText(lang === "zh" ? MISSED.base.zh : MISSED.base.en);
        await expect(page.locator("#scope-end")).toHaveText(x.scopeEnd);
        await expect(page.locator("#guess-end")).toHaveText(x.guessEnd("C", "D"));
        await expect(page.locator("#made-title")).toHaveText(x.madeTitle);
        await page.locator("#made-title").click();
        await expect(page.locator("#made-lines dt")).toHaveCount(3);
        await expect(page.locator("#made-how")).toHaveText(x.madeHow);
        await expect(page.locator("#link-lamp")).toHaveAttribute("href", `/prototype/take-the-lantern-apart/?lang=${lang}`);
        await expect(page.locator("#link-street")).toHaveAttribute("href", `/prototype/trade-street/?lang=${lang}`);
        await noOverflow(page);

        // play again starts clean
        await page.locator("#again").click();
        await expect(page.locator("#s0")).toBeVisible();
        await page.locator("#go0").click();
        await expect(page.locator("#go1")).toBeDisabled();

        const stored = await page.evaluate(() => ({ local: localStorage.length, cookie: document.cookie }));
        expect(stored).toEqual({ local: 0, cookie: "" });
        expect(outside).toEqual([]);
        expect(problems).toEqual([]);
      });
    });
  }
}

test("switching language keeps your place and your choices", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#go0").click();
  await page.locator('#agree button[data-agree="tight"]').click();
  await page.locator('#lang-group button[data-lang="en"]').click();
  await expect(page.locator("#s1-title")).toHaveText(TEXT.en.s1title);
  await expect(page.locator('#agree button[data-agree="tight"]')).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("#agree-react")).toContainText(TEXT.en.agreeReact.tight.t);
  expect(page.url()).toContain("lang=en");
});

test("marking all three differences says nothing was missed", async ({ page }) => {
  await page.goto(`${PAGE}?lang=en`);
  await page.locator("#go0").click();
  await page.locator('#agree button[data-agree="later"]').click();
  await page.locator("#go1").click();
  await page.locator("#mode-side").click();
  await page.locator("#light").click();
  await page.locator('#guess-btns button[data-guess="none"]').click();
  for (const id of ["C", "D", "E"]) await page.locator(`.lamp-btn[data-id="${id}"]`).click();
  await page.locator("#go2").click();
  for (const id of ["C", "D", "E"]) await page.locator(`.sort-item[data-lamp="${id}"] button[data-basket="talk"]`).click();
  await page.locator("#go3").click();
  await expect(page.locator("#missed")).toHaveText(TEXT.en.missedNone);
  await expect(page.locator("#agreed")).toContainText(TEXT.en.agree.later.t);
  await expect(page.locator("#guess-end")).toHaveText(TEXT.en.guessEnd(null, "D"));
});

test("the in-range reply quotes what was agreed at the trial, even when it was 'see at bulk'", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#go0").click();
  await page.locator('#agree button[data-agree="later"]').click();
  await page.locator("#go1").click();
  await page.locator("#mode-side").click();
  await page.locator("#light").click();
  await page.locator('#guess-btns button[data-guess="none"]').click();
  await page.locator('.lamp-btn[data-id="E"]').click();
  await page.locator("#go2").click();
  await page.locator('.sort-item[data-lamp="E"] button[data-basket="inrange"]').click();
  await expect(page.locator('.sort-item[data-lamp="E"]')).toContainText(TEXT.zh.agree.later.t);
});

// Physics: every lamp stands on something. Feet are measured in picture coordinates (percent of the scene picture),
// against surfaces measured on Codex's pictures: the glass case floor, the table top, the wall shelves, the counter.
const FEET = {
  desktop: { trial: { sample: [18.2, 55.8], trial: [62, 65.5] }, single: { A: [52, 81.5] }, side: { A: [18.75, 55.8], B: [34.65, 55.8], C: [50.6, 55.8], D: [66.4, 55.8], E: [82.4, 55.8], dome: [23, 82] } },
  phone: { trial: { sample: [50, 31.4], trial: [60, 64] }, single: { A: [50, 77.5] }, side: { A: [25.8, 32.6], B: [51.5, 32.6], C: [77.7, 32.6], D: [37.9, 51.1], E: [65.5, 51.1], dome: [30, 78.2] } },
};
async function feet(page) {
  return page.evaluate(() => {
    const scene = document.getElementById("scene").getBoundingClientRect();
    const at = (x, y) => [((x - scene.left) / scene.width) * 100, ((y - scene.top) / scene.height) * 100];
    const foot = (root) => { const r = root.querySelector(".base").getBoundingClientRect(); return at(r.left + r.width / 2, r.top + r.height * 0.884); };
    const out = {};
    const sample = document.getElementById("sample");
    if (getComputedStyle(sample).opacity !== "0") {
      out.sample = foot(sample);
      const stand = sample.querySelector(".stand");
      if (getComputedStyle(stand).display !== "none") {
        const r = stand.getBoundingClientRect();
        out.dome = at(r.left + r.width / 2, r.top + r.height * 0.948);
        out.domeFloor = at(0, r.top + r.height * 0.698)[1];
      }
    }
    document.querySelectorAll(".lamp-btn").forEach((b) => {
      const st = getComputedStyle(b);
      if (st.display !== "none" && st.opacity !== "0") out[b.dataset.id || "trial"] = foot(b);
    });
    return out;
  });
}
function near(got, want, label) {
  expect(Math.abs(got[0] - want[0]), `${label} x`).toBeLessThan(0.6);
  expect(Math.abs(got[1] - want[1]), `${label} y`).toBeLessThan(0.6);
}
for (const [kind, width, height] of [["phone", 390, 844], ["desktop", 1440, 900], ["desktop", 1024, 768]]) {
  test(`physics at ${width}px: the sample stands on the case floor, the trial lamp on the table, the bulk on the shelves, the dome on the counter`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(`${PAGE}?lang=zh`);
    const want = FEET[kind];
    // the trial room is Codex's painting with both lamps in it, so no code lamps are drawn there
    await expect(page.locator("#sample")).toBeHidden();
    await expect(page.locator(".lamp-btn.trial")).toBeHidden();
    const bg = await page.locator("#scene").evaluate((node) => getComputedStyle(node).backgroundImage);
    expect(bg).toContain(kind === "phone" ? "scene-trial-lamps-mobile" : "scene-trial-lamps-desktop");
    let got;
    await page.locator("#go0").click();
    await page.locator('#agree button[data-agree="range"]').click();
    await page.locator("#go1").click();
    await page.waitForTimeout(400);
    got = await feet(page);
    near(got.A, want.single.A, "one by one");
    await page.locator("#mode-side").click();
    await page.waitForTimeout(400);
    got = await feet(page);
    for (const id of ["A", "B", "C", "D", "E"]) near(got[id], want.side[id], `lamp ${id}`);
    near(got.dome, want.side.dome, "dome feet");
    expect(Math.abs(got.sample[1] - got.domeFloor), "lamp inside the dome stands on its floor").toBeLessThan(0.6);
  });
}

test("the tag beside the dome turns over to a small handwritten note, and closes again", async ({ page }) => {
  for (const lang of ["zh", "en"]) {
    await page.goto(`${PAGE}?lang=${lang}`);
    await expect(page.locator("#tagbtn")).toBeHidden();
    await page.locator("#go0").click();
    await page.locator('#agree button[data-agree="range"]').click();
    await page.locator("#go1").click();
    await page.locator("#mode-side").click();
    await expect(page.locator("#tagbtn")).toBeVisible();
    await expect(page.locator("#tagbtn")).toHaveAttribute("aria-label", TEXT[lang].tagLabel);
    await page.locator("#tagbtn").click();
    await expect(page.locator("#tagnote")).toHaveText(TEXT[lang].tagNote);
    await expect(page.locator("#tagbtn")).toHaveAttribute("aria-expanded", "true");
    await page.locator("#tagbtn").click();
    await expect(page.locator("#tagnote")).toBeHidden();
  }
});

test("share image: the page carries og and twitter image meta, and the image is 1200x630", async ({ page, request }) => {
  await page.goto(`${PAGE}?lang=zh`);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBe("https://paulstradecraft.com/prototype/match-the-approved-lamp/assets/og-match-lamp.jpg");
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", og);
  const response = await request.get("/prototype/match-the-approved-lamp/assets/og-match-lamp.jpg");
  expect(response.status()).toBe(200);
  const body = await response.body();
  // JPEG frame header: height and width sit right after the SOF0/SOF2 marker
  let i = 2;
  let size = null;
  while (i < body.length) {
    if (body[i] !== 0xff) { i += 1; continue; }
    const marker = body[i + 1];
    const length = body.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc2) { size = { height: body.readUInt16BE(i + 5), width: body.readUInt16BE(i + 7) }; break; }
    i += 2 + length;
  }
  expect(size).toEqual({ width: 1200, height: 630 });
  expect(body.length).toBeLessThan(150 * 1024);
});
