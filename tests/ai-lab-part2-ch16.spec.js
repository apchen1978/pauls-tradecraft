import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { NAV_CHAPTERS } from "../public/ai-lab/content.js";
import { TOOLPATH } from "../public/ai-lab/toolpath.js";

const PAGE = "/ai-lab/";
const screenshots = join(process.cwd(), "docs", "qa", "ai-lab-part2-ch16");
mkdirSync(screenshots, { recursive: true });
const COPY = {
  zh: {
    title: "把判斷寫下來，agent 才接得住",
    kindNames: { vague: "含糊", concrete: "具體可用", risk: "看似具體但有風險" },
    status: { vague: "還不夠清楚", concrete: "具體可用", risk: "做得到，但有風險" },
    vague: "條件還不清楚，agent 只能猜。它應先停下來，指出缺少的資訊。",
    concrete: "條件、動作和停下詢問的時機都寫清楚了；agent 可以整理草稿，遇到缺項就交由負責人確認。",
    risk: "直接寄出未經負責人確認的報價，可能把未核實內容當成承諾。",
    bridge: "工具包好了，裡面的判斷還在人的腦中；這一章來把它寫下來。",
  },
  en: {
    title: "Write the judgment down so an agent can use it",
    kindNames: { vague: "Vague", concrete: "Concrete and usable", risk: "Specific-looking but risky" },
    status: { vague: "Still unclear", concrete: "Concrete and usable", risk: "Possible, but risky" },
    vague: "The conditions are unclear, so the agent can only guess. It should pause and point out what is missing.",
    concrete: "The conditions, action and pause point are clear. The agent can prepare a draft and leave missing details for the decision-maker to confirm.",
    risk: "Sending a quote before the decision-maker reviews it may turn unverified details into a promise.",
    bridge: "The toolkit is ready, but its judgment still lives in people's heads. This chapter puts that judgment into words.",
  },
};
const KIND_ORDER = [
  ["concrete", "risk", "vague"],
  ["risk", "vague", "concrete"],
  ["vague", "concrete", "risk"],
  ["risk", "concrete", "vague"],
];
const RISK_RESULTS = {
  zh: ["把詢價當成已確認訂單，可能跳過需求確認。", COPY.zh.risk, "資料缺漏仍自行補齊，可能把猜測寫進報價。", "讓 agent 自行改規則且不回報，錯誤做法可能繼續沿用。"],
  en: ["Treating an enquiry as a confirmed order may skip checking what was requested.", COPY.en.risk, "Filling gaps on its own may put guesses into a quote.", "If the agent changes rules without reporting back, a faulty approach may keep being reused."],
};
const formatSelectionSummary = (lang, kinds) => (lang === "en" ? "Your choices: " : "你選的：") + kinds.map((kind, index) => (lang === "en" ? "Field " + (index + 1) : "第 " + (index + 1) + " 格") + " " + COPY[lang].kindNames[kind]).join(lang === "en" ? "; " : "；");

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`Chapter 16 ${lang} ${width}px: rule combinations, reveal and layout`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${PAGE}?lang=${lang}`);
      const x = COPY[lang];
      await expect(page.locator("#rulebench-title")).toHaveText(x.title);
      await expect(page.locator("#rulebench-demo")).toContainText(lang === "zh" ? "示範／虛構情境" : "Illustration / fictional scenario");
      await expect(page.locator("#rail [data-target='c16']")).toHaveCount(1);
      await expect(page.locator("#rail .rail-dot")).toHaveCount(NAV_CHAPTERS.length);
      await expect(page.locator("#rail [data-target='c16']").evaluate((node) => node.previousElementSibling?.dataset.target)).resolves.toBe("c15");
      await expect(page.locator("#toc a[href='#c16']")).toHaveCount(0);
      await expect(page.locator("#main .chapter[id^='c']")).toHaveCount(NAV_CHAPTERS.filter(({ id }) => /^c\d+$/.test(id)).length);
      await expect(page.locator("#c16")).toHaveCount(1);
      await expect(page.locator("#c16").evaluate((node) => node.nextElementSibling?.id)).resolves.toBe("c17");
      await expect(page.locator("#c15-title")).toHaveText(TOOLPATH[lang].title);
      await expect(page.locator("#c16").evaluate((node) => node.previousElementSibling?.id)).resolves.toBe("c15");
      await expect(page.locator("#c15-to-c16")).toHaveCount(1);
      await expect(page.locator("#c15-to-c16")).toHaveText(x.bridge);
      const groups = page.locator("#rulebench-form fieldset");
      await expect(groups).toHaveCount(4);
      for (let field = 0; field < 4; field++) {
        await expect(groups.nth(field).locator("input[type=radio]")).toHaveCount(3);
        await expect(groups.nth(field).locator("input[type=radio]").evaluateAll((inputs) => inputs.map((input) => input.value))).resolves.toEqual(["0", "1", "2"]);
      }
      const optionLabels = groups.locator(".rulebench-option");
      await expect(page.locator("#rulebench-selection")).toBeEmpty();
      const optionCopy = (await optionLabels.allTextContents()).join(" ");
      for (const kindName of Object.values(x.kindNames)) expect(optionCopy).not.toContain(kindName);
      expect(await optionLabels.evaluateAll((labels) => labels.some((label) => label.hasAttribute("aria-label") || label.hasAttribute("title") || [...label.querySelectorAll("*")].some((child) => child.hasAttribute("aria-label") || child.hasAttribute("title"))))).toBe(false);

      // Every fixed combination is deterministic: risk takes precedence, then vague, then fully concrete.
      const results = await page.evaluate(() => {
        const collected = [];
        for (let packed = 0; packed < 81; packed++) {
          let value = packed;
          for (let field = 0; field < 4; field++) {
            const choice = value % 3; value = Math.floor(value / 3);
            const input = document.querySelectorAll(`#rulebench-form fieldset:nth-child(${field + 1}) input`)[choice];
            input.checked = true;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
          const indices = [...document.querySelectorAll("#rulebench-form fieldset")].map((group) => [...group.querySelectorAll("input")].findIndex((input) => input.checked));
          collected.push({ indices, state: document.getElementById("rulebench-outcome").dataset.state, status: document.getElementById("rulebench-status").textContent, text: document.getElementById("rulebench-outcome-text").textContent, summary: document.getElementById("rulebench-selection").textContent });
        }
        return collected;
      });
      expect(results).toHaveLength(81);
      for (let packed = 0; packed < results.length; packed++) {
        let value = packed;
        const selection = [];
        for (let field = 0; field < 4; field++) { selection.push(value % 3); value = Math.floor(value / 3); }
        const kinds = selection.map((choice, field) => KIND_ORDER[field][choice]);
        const expectedSummary = formatSelectionSummary(lang, kinds);
        const risk = kinds.findIndex((kind) => kind === "risk");
        const mode = risk >= 0 ? "risk" : kinds.includes("vague") ? "vague" : "concrete";
        const expected = mode === "risk" ? RISK_RESULTS[lang][risk] : x[mode];
        expect(results[packed]).toEqual({ indices: selection, state: mode, status: x.status[mode], text: expected, summary: expectedSummary });
      }
      const choose = async (field, kind) => groups.nth(field).locator("input").nth(KIND_ORDER[field].indexOf(kind)).check();
      for (let field = 0; field < 4; field++) await choose(field, "concrete");
      await choose(2, "risk");
      await expect(page.locator("#rulebench-outcome")).toHaveAttribute("data-state", "risk");
      await expect(page.locator("#rulebench-selection")).toContainText(x.kindNames.risk);

      await choose(0, "concrete");
      await choose(1, "risk");
      await choose(2, "vague");
      await choose(3, "concrete");
      await page.locator("#c16").scrollIntoViewIfNeeded();
      await page.locator("#rulebench-reveal summary").click();
      await expect(page.locator("#rulebench-example")).toBeVisible();
      await expect(page.locator("#rulebench-layers .rulebench-layer")).toHaveCount(3);
      await expect(page.locator("#rulebench-links a[href='#c6']")).toHaveCount(1);
      await expect(page.locator("#rulebench-links a[href='#skill']")).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBe(0);
      await page.addStyleTag({ content: ".top, .rail { visibility: hidden !important; }" });
      await page.locator("#c16").screenshot({ path: join(screenshots, `${lang}-${width}.png`) });
    });
  }
}
