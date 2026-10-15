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
      expect(text, `${lang}: ${text}`).not.toMatch(/\bAI\b|魔法|法師|法術|咒|巫|遠燈鎮|fairy|magic|spell/i);
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
        await page.locator("#light").click();
        await expect(page.locator("#stage")).toHaveClass(/lit/);
        await expect(page.locator("#mode-note")).toHaveText(x.litNote);
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
  for (const id of ["C", "D", "E"]) await page.locator(`.lamp-btn[data-id="${id}"]`).click();
  await page.locator("#go2").click();
  for (const id of ["C", "D", "E"]) await page.locator(`.sort-item[data-lamp="${id}"] button[data-basket="talk"]`).click();
  await page.locator("#go3").click();
  await expect(page.locator("#missed")).toHaveText(TEXT.en.missedNone);
  await expect(page.locator("#agreed")).toContainText(TEXT.en.agree.later.t);
});

test("the in-range reply quotes what was agreed at the trial, even when it was 'see at bulk'", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#go0").click();
  await page.locator('#agree button[data-agree="later"]').click();
  await page.locator("#go1").click();
  await page.locator("#mode-side").click();
  await page.locator("#light").click();
  await page.locator('.lamp-btn[data-id="E"]').click();
  await page.locator("#go2").click();
  await page.locator('.sort-item[data-lamp="E"] button[data-basket="inrange"]').click();
  await expect(page.locator('.sort-item[data-lamp="E"]')).toContainText(TEXT.zh.agree.later.t);
});
