import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { COPY, GUESTS, LAB_TEXT, LINKS, ROLE_IDS } from "../public/prototype/ai-funnel/content.js";
const PAGE = "/prototype/ai-funnel/";
const shots = process.env.AI_FUNNEL_QA_DIR || resolve("output", "ai-funnel");
mkdirSync(shots, { recursive: true });
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}
async function openReview(page, lang) {
  await page.goto(`${PAGE}?lang=${lang}`);
  await page.locator('[data-tier="chat"]').click();
  await page.locator("#begin").click();
  await page.locator('[data-role="owner"]').click();
  await page.locator("#role-continue").click();
  await page.locator("#delegate").click();
  await expect(page.locator("#workbench")).toBeVisible();
}
test("bilingual data keeps source attribution and one checkable mismatch, with no invented deal numbers", () => {
  expect(Object.keys(COPY.zh).sort()).toEqual(Object.keys(COPY.en).sort());
  expect(COPY.zh.counts).toEqual(["約 60 億人", "約 10–20 億人", "約 2,000 萬人", "約 5,000 人"]);
  expect(COPY.en.counts).toEqual(["About 6 billion", "About 1–2 billion", "About 20 million", "About 5,000"]);
  for (const lang of ["zh", "en"]) {
    const t = COPY[lang];
    expect(t.facts.slice(0, 2)).toEqual(t.claims.slice(0, 2));
    expect(t.facts[2]).not.toBe(t.claims[2]);
    expect(t.corrected).toBe(t.facts[2]);
    expect(JSON.stringify([t.facts, t.claims])).not.toMatch(/\d/);
    expect(LAB_TEXT[lang].c0.source).toContain("Karpathy");
    expect(t.sourceSummary).toContain("2026");
    expect(Object.keys(t.roles)).toEqual(ROLE_IDS);
    for (const role of Object.values(t.roles)) expect(role.fields).toHaveLength(5);
    expect(t.stepNames).toHaveLength(t.stepActors.length);
    expect(t.lead).toContain(lang === "zh" ? "AI 代理人（AI agent）" : "AI agent");
  }
});
for (const lang of ["zh", "en"]) for (const width of [390, 1440]) {
  test(`${lang} ${width}: source, retry, correction, human hold and language-preserving entry`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const errors = [], foreign = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => { if (new URL(r.url()).origin !== "http://127.0.0.1:4173") foreign.push(r.url()); });
    await page.goto(`${PAGE}?lang=${lang}`);
    const t = COPY[lang];
    await expect(page.locator(".tier")).toHaveCount(4);
    for (const count of t.counts) await expect(page.locator("#tiers")).toContainText(count);
    await expect(page.locator(".source summary")).toHaveText(t.sourceSummary);
    await expect(page.locator("#report")).toHaveAttribute("href", LINKS.decoder);
    await expect(page.locator("#original")).toHaveAttribute("href", LINKS.x);
    // All four layers and their source note are reachable without a scroll reveal.
    expect((await page.locator(".source summary").boundingBox()).y).toBeLessThan(width === 390 ? 844 : 1000);
    await noOverflow(page);
    await page.screenshot({ path: resolve(shots, `intro-${lang}-${width}.png`) });
    await expect(page.locator("#begin")).toBeDisabled();
    for (const tier of ["none", "work", "lab", "chat"]) {
      await page.locator(`[data-tier="${tier}"]`).click();
      await expect(page.locator(`#tiers [data-tier="${tier}"]`)).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#tier-reply")).not.toBeEmpty();
    }
    await page.locator("#begin").click();
    await expect(page.locator("#roles-stage")).toBeVisible();
    await expect(page.locator("#role-continue")).toBeHidden();
    await page.locator("#roles-stage").scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(shots, `role-choices-${lang}-${width}.png`) });
    for (const roleId of ROLE_IDS) {
      await page.locator(`[data-role="${roleId}"]`).click();
      await expect(page.locator(`[data-role="${roleId}"]`)).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(`[data-role="${roleId}"] .role-mini-tags`)).toContainText(t.agentTag);
      await expect(page.locator("#role-fields dt")).toHaveText(t.roleFields);
      await expect(page.locator("#role-fields dd")).toHaveText(t.roles[roleId].fields);
      await expect(page.locator("#role-fields dd").last()).toContainText(lang === "zh" ? "示範" : "Demo");
      if (roleId === "owner") await expect(page.locator("#role-continue")).toHaveText(t.roleContinueOwner);
      await noOverflow(page);
    }
    await expect(page.locator("#buyer-work")).toBeHidden();
    await page.locator('[data-role="sales"]').click();
    await expect(page.locator("#buyer-work")).toHaveAttribute("href", `/?lang=${lang}#overseas-customer-development`);
    const other = lang === "zh" ? "en" : "zh";
    await page.locator(`[data-lang="${other}"]`).click();
    await expect(page.locator('[data-role="sales"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#role-fields dd")).toHaveText(COPY[other].roles.sales.fields);
    await page.locator(`[data-lang="${lang}"]`).click();
    await page.locator("#role-detail").scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(shots, `roles-${lang}-${width}.png`) });
    await page.locator("#role-continue").click();
    await expect(page.locator("#chat-reply")).toHaveText(LAB_TEXT[lang].c2.chatReply);
    await page.locator("#delegate").click();
    await expect(page.locator(".steps li span")).toHaveText(t.stepActors);
    await page.locator("#show-all").click();
    await expect(page.locator("#correct")).toBeHidden();
    await page.locator('[data-claim="0"]').click();
    await expect(page.locator("#feedback")).toHaveText(t.feedback[0]);
    await expect(page.locator("#completion")).toBeHidden();
    await expect(page.locator("#correct")).toBeHidden();
    await page.locator('[data-claim="1"]').click();
    await expect(page.locator("#feedback")).toHaveText(t.feedback[1]);
    await expect(page.locator("#completion")).toBeHidden();
    await page.locator('[data-claim="2"]').click();
    await expect(page.locator("#feedback")).toHaveText(t.feedback[2]);
    await expect(page.locator("#completion")).toBeHidden();
    await page.locator(".review-heading").scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(shots, `review-${lang}-${width}.png`) });
    await page.locator("#correct").click();
    await expect(page.locator("body")).toHaveAttribute("data-phase", "complete");
    await expect(page.locator('[data-claim="2"]')).toHaveText(t.facts[2]);
    await expect(page.locator(".hold")).toHaveText(t.hold);
    await expect(page.locator("#lab")).toHaveAttribute("href", `/ai-lab/?lang=${lang}#c2`);
    await expect(page.locator("#back-home")).toHaveAttribute("href", `/?lang=${lang}#works`);
    await noOverflow(page);
    await page.screenshot({ path: resolve(shots, `complete-${lang}-${width}.png`) });
    await page.locator("#lab").click();
    await expect(page).toHaveURL(new RegExp(`/ai-lab/\\?lang=${lang}#c2$`));
    await expect(page.locator("#c2-title")).toHaveText(LAB_TEXT[lang].c2.title);
    expect(errors).toEqual([]); expect(foreign).toEqual([]);
    // Verify the actual homepage card, including the artwork and its language parameter.
    await page.goto(`/?lang=${lang}#showcase`);
    const cards = page.locator("#showcase article");
    await expect(cards.nth(0).locator("a")).toHaveAttribute("href", `/prototype/roomverse-3d/?lang=${lang}`);
    await expect(cards.nth(1).locator("a")).toHaveAttribute("href", `/prototype/trade-street/?lang=${lang}`);
    await expect(cards.nth(2).locator("a")).toHaveAttribute("href", `${PAGE}?lang=${lang}`);
    const image = cards.nth(2).locator("img");
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth)).toBe(800);
    await noOverflow(page);
    await page.screenshot({ path: resolve(shots, `entry-${lang}-${width}.png`) });
  });
}
for (const lang of ["zh", "en"]) {
  test(`${lang}: reduced motion, keyboard review, language state and restart`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openReview(page, lang);
    const other = lang === "zh" ? "en" : "zh";
    await page.locator('[data-claim="2"]').focus();
    await page.keyboard.press("Enter");
    await page.locator(`[data-lang="${other}"]`).click();
    await expect(page).toHaveURL(new RegExp(`lang=${other}`));
    await expect(page.locator("body")).toHaveAttribute("data-phase", "review");
    await expect(page.locator('[data-claim="2"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#feedback")).toHaveText(COPY[other].feedback[2]);
    await page.locator("#correct").focus(); await page.keyboard.press("Enter");
    await expect(page.locator("body")).toHaveAttribute("data-phase", "complete");
    await expect(page.locator("#completion")).toBeFocused();
    expect(await page.locator(".steps li").first().evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
    await page.locator(`[data-lang="${lang}"]`).click();
    await expect(page.locator("#completion")).toBeVisible();
    await expect(page.locator(".hold")).toHaveText(COPY[lang].hold);
    await page.screenshot({ path: resolve(shots, `reduced-${lang}-390.png`) });
    await page.locator("#restart").click();
    await expect(page.locator("body")).toHaveAttribute("data-phase", "intro");
    await expect(page.locator("#activity")).toBeHidden();
    await expect(page.locator("#begin")).toBeFocused();
    await page.locator("#begin").click();
    await page.locator('[data-role="owner"]').click();
    await page.locator("#role-continue").click();
    await page.locator("#delegate").click();
    await expect(page.locator('[data-claim="2"]')).toHaveText(COPY[lang].claims[2]);
    await expect(page.locator("#correct")).toBeHidden();
    await noOverflow(page);
  });
}

for (const lang of ["zh", "en"]) {
  test(`${lang}: each role has its guest with a tip, the robot speaks before and after the check without giving the answer away`, async ({ page }) => {
    const g = GUESTS[lang];
    expect(Object.keys(g.roles)).toEqual(ROLE_IDS);
    expect(g.roles.sales.name).toBe(lang === "zh" ? "福哥" : "Bro Fred");
    expect(g.robot.before).not.toMatch(lang === "zh" ? /已確認/ : /confirmed/i);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${PAGE}?lang=${lang}`);
    await page.locator('[data-tier="none"]').click();
    await page.locator("#begin").click();
    for (const id of ROLE_IDS) {
      await expect(page.locator(`[data-role="${id}"] .role-face`)).toHaveAttribute("src", g.roles[id].img);
      await page.locator(`[data-role="${id}"]`).click();
      await expect(page.locator("#role-guest-name")).toHaveText(g.roles[id].name);
      await expect(page.locator("#role-guest-tip")).toHaveText(g.roles[id].tip);
      expect(await page.locator("#role-guest-img").evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    }
    await page.locator("#role-continue").click();
    await page.locator("#delegate").click();
    await expect(page.locator("#robot-before")).toContainText(g.robot.before);
    await expect(page.locator("#robot-after")).toBeHidden();
    await page.locator('[data-claim="2"]').click();
    await page.locator("#correct").click();
    await expect(page.locator("#robot-after")).toContainText(g.robot.after);
    await noOverflow(page);
  });
}
