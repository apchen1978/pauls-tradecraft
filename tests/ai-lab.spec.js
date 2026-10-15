import { expect, test } from "@playwright/test";
import { AGENTS, LINKS, TEXT, TIERS } from "../public/ai-lab/content.js";
import { CONTEXT_ITEMS, DEEP, PHYSICS, TOLERANCE } from "../public/ai-lab/deep.js";
import { GATES, GLOSSARY, MORE, NEXT, TRACE } from "../public/ai-lab/more.js";

// AI Lab (AI 人工智慧實驗室), phase 1: chapters 0, 2, 3, 4, and the homepage entry.
const PAGE = "/ai-lab/";

async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test("zh and en have the same shape; no outcome or ROI claims", () => {
  const keys = (o) => Object.keys(o).sort();
  expect(keys(TEXT.zh)).toEqual(keys(TEXT.en));
  for (const c of ["c0", "c2", "c3", "c4"]) expect(keys(TEXT.zh[c])).toEqual(keys(TEXT.en[c]));
  expect(TEXT.zh.c2.steps).toHaveLength(TEXT.en.c2.steps.length);
  expect(TEXT.zh.c4.story).toHaveLength(TEXT.en.c4.story.length);
  const all = JSON.stringify(TEXT);
  expect(all).not.toMatch(/ROI|轉換率|成交率|保證|guarantee/i);
  // numbers appear only in the sourced estimate line
  for (const lang of ["zh", "en"]) {
    const { source, no, ...rest } = TEXT[lang].c0;
    expect(JSON.stringify(rest)).not.toMatch(/\d/);
    for (const c of ["c2", "c3", "c4"]) {
      const { no: n, ...body } = TEXT[lang][c];
      expect(JSON.stringify(body), `${lang} ${c}`).not.toMatch(/\d/);
    }
    expect(source).toMatch(/Karpathy/);
  }
});

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} at ${width}px: funnel, chat vs delegate, the human gate, the team; nothing stored`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const x = TEXT[lang];
      const problems = [];
      page.on("pageerror", (e) => problems.push(String(e)));
      page.on("console", (m) => { if (m.type() === "error" && !/favicon/.test(m.text())) problems.push(m.text()); });
      await page.goto(`${PAGE}?lang=${lang}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(x.title.replace("\n", " "));
      await expect(page.locator("#toc a")).toHaveCount(6);
      await expect(page.locator("#toc a.deep-link")).toHaveAttribute("href", "#deep");
      await noOverflow(page);

      // chapter 0: one tier at a time, with its reply; the estimate carries its source
      await expect(page.locator(".tier")).toHaveCount(TIERS.length);
      await page.locator('.tier[data-tier="work"]').click();
      await expect(page.locator('.tier[aria-checked="true"]')).toHaveCount(1);
      await expect(page.locator('.tier[data-tier="work"] .here')).toHaveText(x.c0.here);
      await expect(page.locator("#funnel-reply")).toHaveText(x.c0.tiers.work.reply);
      await expect(page.locator("#c0-link")).toHaveAttribute("href", LINKS.decoder);
      await expect(page.locator("#c0-x")).toHaveAttribute("href", LINKS.x);

      // chapter 2: nothing shown until play; then the chat reply and all six agent steps
      await expect(page.locator("#chat-reply")).toBeHidden();
      await page.locator("#play").click();
      await expect(page.locator("#chat-reply")).toHaveText(x.c2.chatReply);
      await expect(page.locator("#steps li.on")).toHaveCount(6, { timeout: 8000 });
      await expect(page.locator("#agent-note")).toBeVisible();
      await expect(page.locator("#play")).toHaveText(x.c2.replay);
      await expect(page.locator("#c2-demo")).toHaveText(x.c2.demo);

      // chapter 3: the human gate, and what happens without it
      await expect(page.locator('#flow li[data-kind="human"]')).toHaveCount(1);
      await expect(page.locator("#outcome")).toHaveText(x.c3.withHuman);
      await page.locator("#remove-human").click();
      await expect(page.locator("#remove-human")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#outcome li")).toHaveCount(3);
      await page.locator("#remove-human").click();
      await expect(page.locator("#outcome")).toHaveText(x.c3.withHuman);

      // chapter 4: Paul plus four named agents, each with a real example
      await expect(page.locator(".agent-btn")).toHaveCount(AGENTS.length);
      for (const id of AGENTS) {
        await page.locator(`.agent-btn[data-agent="${id}"]`).click();
        await expect(page.locator("#agent-detail")).toContainText(x.c4.agents[id].example);
      }
      await expect(page.locator("#story li")).toHaveCount(x.c4.story.length);
      await expect(page.locator("#play-work")).toHaveAttribute("href", `/prototype/match-the-approved-lamp/?lang=${lang}`);
      await expect(page.locator("#cta")).toHaveAttribute("href", `/?lang=${lang}#contact`);
      await noOverflow(page);

      const stored = await page.evaluate(() => ({ local: localStorage.length, cookie: document.cookie }));
      expect(stored).toEqual({ local: 0, cookie: "" });
      expect(problems).toEqual([]);
    });
  }
}

test("switching language keeps your choices and updates the address", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator('.tier[data-tier="chat"]').click();
  await page.locator('.agent-btn[data-agent="dsh"]').click();
  await page.locator('#lang-group button[data-lang="en"]').click();
  await expect(page.locator("#funnel-reply")).toHaveText(TEXT.en.c0.tiers.chat.reply);
  await expect(page.locator("#agent-detail")).toContainText(TEXT.en.c4.agents.dsh.example);
  expect(page.url()).toContain("lang=en");
});

test("homepage: the AI Lab entry sits right after the Showcase and links to the lab", async ({ page }) => {
  for (const lang of ["zh", "en"]) {
    await page.goto(`/?lang=${lang}`);
    const entry = page.locator("#ai-lab");
    await entry.scrollIntoViewIfNeeded();
    await expect(entry.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(entry.locator("ol li")).toHaveCount(6);
    await expect(entry.getByRole("link")).toHaveAttribute("href", `/ai-lab/?lang=${lang}`);
    const order = await page.evaluate(() => {
      const s = document.getElementById("showcase");
      return s.nextElementSibling?.id;
    });
    expect(order).toBe("ai-lab");
  }
});

test("deeper: zh and en match, and the measurements behave as described", () => {
  const keys = (o) => Object.keys(o).sort();
  expect(keys(DEEP.zh)).toEqual(keys(DEEP.en));
  for (const c of ["c5", "c7", "c10"]) expect(keys(DEEP.zh[c])).toEqual(keys(DEEP.en[c]));
  expect(DEEP.zh.c10.cases).toHaveLength(DEEP.en.c10.cases.length);
  expect(keys(DEEP.zh.c5.items)).toEqual(CONTEXT_ITEMS.map((i) => i.id).sort());
  // the estimated positions really fail for the two lamps that floated or fell off, and pass for the shelf
  const fails = PHYSICS.filter((p) => Math.abs(p.guess - p.target) > TOLERANCE).map((p) => p.id);
  expect(fails).toEqual(["sample", "trial"]);
  expect(JSON.stringify(DEEP)).not.toMatch(/ROI|保證會|guarantees? (results|success)/i);
});

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`deeper ${lang} at ${width}px: context desk, the placement check, the real mistakes`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const x = DEEP[lang];
      await page.goto(`${PAGE}?lang=${lang}`);
      await expect(page.locator("#deep-title")).toHaveText(x.divider);
      await expect(page.locator("#deep-toc a")).toHaveCount(7);

      // 05: starts with task + everything: missing rules; overflow once more is added; right with the four musts only
      await expect(page.locator("#ctx-verdict")).toHaveText(x.c5.verdict.noRules);
      await page.locator('.ctx-item[data-item="chat"]').click();
      await expect(page.locator("#ctx-verdict")).toHaveText(x.c5.verdict.full);
      await expect(page.locator("#ctx-bar")).toHaveClass(/over/);
      await page.locator('.ctx-item[data-item="chat"]').click();
      await page.locator('.ctx-item[data-item="everything"]').click();
      for (const id of ["rules", "memory", "files"]) await page.locator(`.ctx-item[data-item="${id}"]`).click();
      await expect(page.locator("#ctx-verdict")).toHaveText(x.c5.verdict.right);
      await page.locator('.ctx-item[data-item="memory"]').click();
      await expect(page.locator("#ctx-verdict")).toHaveText(x.c5.verdict.noMemory);

      // 07: estimated positions fail two rows; measured positions pass all
      await expect(page.locator("#phys tr.bad")).toHaveCount(2);
      await expect(page.locator("#phys-note")).toHaveText(x.c7.guessNote);
      await page.locator("#use-measured").click();
      await expect(page.locator("#phys tr.bad")).toHaveCount(0);
      await expect(page.locator("#phys tr.ok")).toHaveCount(PHYSICS.length);
      await expect(page.locator("#phys-note")).toHaveText(x.c7.measuredNote);

      // 10: the real cases, each with how it was caught and what prevents it now
      await expect(page.locator("#cases .case")).toHaveCount(x.c10.cases.length);
      await expect(page.locator("#cases .case dt")).toHaveCount(x.c10.cases.length * 2);
      await noOverflow(page);
    });
  }
}

test("batch two: zh and en match", () => {
  const keys = (o) => Object.keys(o).sort();
  expect(keys(MORE.zh)).toEqual(keys(MORE.en));
  for (const c of Object.keys(MORE.zh)) expect(keys(MORE.zh[c]), c).toEqual(keys(MORE.en[c]));
  expect(keys(MORE.zh.glossary.terms)).toEqual([...GLOSSARY].sort());
  expect(keys(MORE.zh.c9.items)).toEqual(GATES.map((g) => g.id).sort());
  expect(keys(MORE.zh.c6.steps)).toEqual(TRACE.map((s) => s.key).sort());
  // every word the tree can reach has text in both languages
  const reach = new Set(Object.values(NEXT).flat().map(([id]) => id));
  for (const id of reach) { expect(MORE.zh.c1.words[id], id).toBeTruthy(); expect(MORE.en.c1.words[id], id).toBeTruthy(); }
});

for (const width of [390, 1440]) {
  for (const lang of ["zh", "en"]) {
    test(`batch two ${lang} at ${width}px: next word, tool log, hand-off, gates, frontier, steps, glossary`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const x = MORE[lang];
      await page.goto(`${PAGE}?lang=${lang}`);
      // 01: two picks complete the sentence and reveal why it may be wrong; start over resets
      await expect(page.locator(".nw-choice")).toHaveCount(3);
      await page.locator('.nw-choice[data-word="now"]').click();
      await page.locator('.nw-choice[data-word="unsure"]').click();
      await expect(page.locator("#nw-line")).toContainText(x.c1.words.unsure);
      await expect(page.locator("#nw-reveal")).toHaveText(x.c1.reveal);
      await page.locator("#nw-again").click();
      await expect(page.locator(".nw-choice")).toHaveCount(3);
      await expect(page.locator("#nw-reveal")).toBeHidden();
      // 06: the real tool log plays in order
      await expect(page.locator("#trace li.on")).toHaveCount(0);
      await page.locator("#trace-play").click();
      await expect(page.locator("#trace li.on")).toHaveCount(TRACE.length, { timeout: 8000 });
      // 08: hand-off document, and what goes wrong without one
      await expect(page.locator("#doc li")).toHaveCount(x.c8.doc.length);
      await expect(page.locator("#no-doc-list")).toBeHidden();
      await page.locator("#no-doc").click();
      await expect(page.locator("#no-doc-list li")).toHaveCount(x.c8.withoutList.length);
      await expect(page.locator("#relay li")).toHaveCount(x.c8.relay.length);
      // 09: each gate reveals our rule
      for (const g of GATES) {
        await page.locator(`.gate-row[data-gate="${g.id}"] button`).click();
        await expect(page.locator(`.gate-row[data-gate="${g.id}"] .gate-answer`)).toHaveText(g.alone ? x.c9.alone : x.c9.ask);
      }
      // 11, steps, glossary
      await expect(page.locator("#frontier .fr")).toHaveCount(x.c11.items.length);
      await expect(page.locator("#three li")).toHaveCount(3);
      await expect(page.locator("#gl .term")).toHaveCount(GLOSSARY.length);
      await page.locator('.term[data-term="mcp"] summary').click();
      await expect(page.locator('.term[data-term="mcp"]')).toHaveAttribute("open", "");
      await noOverflow(page);
    });
  }
}

test("polish: the hero console plays to the stop line, the chapter rail follows the reader on wide screens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=zh`);
  await expect(page.locator("#console-lines .cl")).toHaveCount(TEXT.zh.console.length);
  await expect(page.locator("#console-lines .cl.on")).toHaveCount(TEXT.zh.console.length, { timeout: 8000 });
  await expect(page.locator("#console-lines .cl.wait")).toContainText(TEXT.zh.console.at(-1)[1]);
  await expect(page.locator("#rail .rail-dot")).toHaveCount(12);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; document.getElementById("c7").scrollIntoView(); });
  await expect(page.locator('#rail .rail-dot.on')).toHaveAttribute("data-target", "c7");
  // narrow screens hide the rail
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#rail")).toBeHidden();
  await noOverflow(page);
});
