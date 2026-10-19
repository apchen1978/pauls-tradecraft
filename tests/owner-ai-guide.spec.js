import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const GUIDE = "/ai-lab/guide/";
const QA = join(process.cwd(), "docs", "qa", "owner-ai-guide");
mkdirSync(QA, { recursive: true });

async function expectNoOrphanLines(page, lang) {
  const issues = await page.locator(".guide-copy:not([hidden])").evaluate((root, language) => {
    const elements = root.querySelectorAll("h1, h2, p, li, a");
    const found = [];
    for (const element of elements) {
      const range = document.createRange();
      range.selectNodeContents(element);
      const rects = [...range.getClientRects()].filter((rect) => rect.width && rect.height);
      const lines = [];
      for (const rect of rects) {
        let line = lines.find((item) => Math.abs(item.top - rect.top) < 2);
        if (!line) { line = { top: rect.top, text: "" }; lines.push(line); }
      }
      if (lines.length < 2) continue;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        let offset = 0;
        for (const character of Array.from(node.nodeValue)) {
          const characterRange = document.createRange();
          characterRange.setStart(node, offset);
          offset += character.length;
          characterRange.setEnd(node, offset);
          const rect = characterRange.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          let line = lines.reduce((best, candidate) => Math.abs(candidate.top - rect.top) < Math.abs(best.top - rect.top) ? candidate : best, lines[0]);
          line.text += character;
        }
      }
      for (const line of lines) {
        const text = line.text.trim();
        if (!text) continue;
        const units = language === "en"
          ? (text.match(/[A-Za-z]+(?:[’'][A-Za-z]+)*/g) || []).length
          : Array.from(text.replace(/\s/g, "")).length;
        if (units === 1) found.push({ tag: element.tagName, text: element.innerText.trim(), line: text });
      }
    }
    return found;
  }, lang);
  expect(issues, `${lang} orphan lines: ${JSON.stringify(issues)}`).toEqual([]);
}

for (const lang of ["zh", "en"]) {
  test(`${lang}: guide has five principles, three misconceptions and no prohibited wording`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${GUIDE}?lang=${lang}`);
    const copy = page.locator(`.guide-copy[data-language="${lang}"]`);
    await expect(copy).toBeVisible();
    await expect(page.locator(`.guide-copy[data-language="${lang === "zh" ? "en" : "zh"}"]`)).toBeHidden();
    await expect(copy.locator(".guide-principle")).toHaveCount(5);
    await expect(copy.locator(".guide-misconceptions li")).toHaveCount(3);
    await expect(page).toHaveTitle(lang === "zh" ? "負責人的 AI 入門：一頁指南 · AI Lab" : "An owner's first page on AI · AI Lab");
    const text = await page.locator("body").innerText();
    const prohibited = ["中間層", "A2A", "CDD", "ROI", "轉換率", "成交率", "老闆", "董事長", "Polsia", "DSH", "DeepSeek", "Codex", "GrokBot", "Claude", "Gemini", "OpenAI", "Anthropic"];
    for (const phrase of prohibited) expect(text.toLowerCase()).not.toContain(phrase.toLowerCase());
    const textWithoutRequiredChapterLabel = text.replace(lang === "zh" ? "第 13 章" : "Chapter 13", "");
    expect(textWithoutRequiredChapterLabel).not.toMatch(/\b\d+\b/);
    if (lang === "zh") await expect(copy).toContainText("十到十五封");
    else await expect(copy).toContainText("ten to fifteen");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    for (const link of await page.locator("[data-language-link]").all()) {
      const box = await link.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await expect(link).toHaveAttribute("href", `?lang=${await link.getAttribute("data-language-link")}`);
    }
    for (const link of await copy.locator("a").all()) {
      const box = await link.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expectNoOrphanLines(page, lang);
    await page.screenshot({ path: join(QA, `screen-${lang}-390.png`), fullPage: true });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: join(QA, `screen-${lang}-1440.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test(`${lang}: browser print output is a single A4 page`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${GUIDE}?lang=${lang}`);
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ path: join(QA, `owner-ai-guide-${lang}.pdf`), format: "A4", printBackground: true });
    const pageCount = (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
    expect(pageCount, `${lang} print page count`).toBe(1);
  });

  test(`${lang}: both guide entry points preserve language and destination`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/ai-lab/?lang=${lang}#c12`);
    const chapterLink = page.locator("#c12-guide-link-anchor");
    await expect(chapterLink).toHaveAttribute("href", `${GUIDE}?lang=${lang}`);
    await page.locator("#c12-guide-link").screenshot({ path: join(QA, `entry-ai-lab-${lang}.png`) });
    await chapterLink.click();
    await expect(page).toHaveURL(new RegExp(`/ai-lab/guide/\\?lang=${lang}$`));
    await expect(page.locator(`.guide-copy[data-language="${lang}"]`)).toBeVisible();

    await page.goto(`/prototype/how-many-agents/?lang=${lang}`);
    await page.locator("#next-one").click();
    await page.locator("#next-two").click();
    await expect(page.locator("#step-three")).toBeVisible();
    await expect(page.locator("#guide-link")).toHaveAttribute("href", `${GUIDE}?lang=${lang}`);
    await page.locator("#guide-link").scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(QA, `entry-agent-tool-${lang}.png`), fullPage: true });
    await page.locator("#guide-link").click();
    await expect(page).toHaveURL(new RegExp(`/ai-lab/guide/\\?lang=${lang}$`));
  });
}
