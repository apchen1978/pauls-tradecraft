import { expect, test } from "@playwright/test";
import { FACTIONS, identityLine, shortName, TYPES, UI } from "../prototype/teammate-type/app.js";

// Measured on main 0c4dfd9, with the default voice, before the visual changes.
const CARDS = [
  { id: "umbrella", code: "AAA", before: { zh: [1022.49, 958.57], en: [1211.94, 986.61] } },
  { id: "cocoa", code: "ACA", before: { zh: [994.44, 958.57], en: [1147.38, 958.57] } },
  { id: "andromeda", code: "FBD", before: { zh: [1052.33, 1016.46], en: [1215.13, 1044.5] } },
  { id: "craftsman", code: "AFG", before: { zh: [1022.49, 958.57], en: [1230.13, 986.61] } },
];

for (const [sizeIndex, width] of [390, 1440].entries()) {
  for (const lang of ["zh", "en"]) {
    test(`${lang} ${width}: layered identity, one-row voices, readable cost and bounded height`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      for (const { id, code, before } of CARDS) {
        await page.goto(`/prototype/teammate-type/?c=${code}&lang=${lang}`);
        await expect(page.locator("#card-name")).toHaveText(identityLine(TYPES[id][lang]));
        await expect(page.locator("#card-name .card-person")).toHaveText(shortName(TYPES[id][lang]));
        await expect(page.locator("#lines .line-label")).toHaveCount(0);
        const layout = await page.evaluate(() => {
          const box = (id) => document.getElementById(id).getBoundingClientRect();
          const costStyle = getComputedStyle(document.getElementById("cost"));
          return {
            height: box("card").height,
            overflow: document.documentElement.scrollWidth > innerWidth,
            tones: [...document.querySelectorAll("#tones button")].map((button) => button.getBoundingClientRect().top),
            costLines: (box("cost").height - parseFloat(costStyle.paddingTop) - parseFloat(costStyle.paddingBottom)) / parseFloat(costStyle.lineHeight),
            nameX: box("card-name").left,
            portraitX: box("stage").left,
            nameY: box("card-name").top,
            portraitBottom: box("stage").bottom,
          };
        });
        expect(layout.height, id).toBeLessThanOrEqual(before[lang][sizeIndex] + 1);
        expect(layout.overflow, id).toBe(false);
        expect(Math.max(...layout.tones) - Math.min(...layout.tones), id).toBeLessThan(1);
        expect(layout.costLines, id).toBeLessThanOrEqual(2.05);
        if (width === 1440) expect(layout.portraitX).toBeGreaterThan(layout.nameX + 400);
        else expect(layout.portraitBottom).toBeLessThanOrEqual(layout.nameY);
        if (id === "andromeda") {
          await expect(page.locator("#card")).toHaveClass(/is-rare/);
          await expect(page.locator("#card-egg")).toHaveText("M-31");
        } else await expect(page.locator("#card")).not.toHaveClass(/is-rare/);
      }
    });
  }
}

test("the animated horse stays centered in the desktop portrait area", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/prototype/teammate-type/?c=EEA&lang=en");
  await expect(page.locator("#horse")).toBeVisible();
  await page.waitForFunction(() => document.getElementById("horse").naturalWidth > 0);
  const art = await page.locator("#horse").boundingBox();
  const stage = await page.locator("#stage").boundingBox();
  expect(Math.abs(art.y + art.height / 2 - stage.y - stage.height / 2)).toBeLessThan(8);
  expect(art.y).toBeGreaterThanOrEqual(stage.y);
  expect(art.y + art.height).toBeLessThanOrEqual(stage.y + stage.height);
});

test("every role's large export paragraphs fit the frame without isolated Chinese endings", async ({ page }) => {
  await page.goto("/prototype/teammate-type/?c=AAA");
  const failures = await page.evaluate(async () => {
    const { TYPES, TONES, UI, wrapLinesNoWidow } = await import("/prototype/teammate-type/app.js");
    const ctx = document.createElement("canvas").getContext("2d");
    const font = getComputedStyle(document.body).fontFamily;
    const failures = [];
    for (const [id, role] of Object.entries(TYPES)) for (const lang of ["zh", "en"]) {
      const text = role[lang];
      const paragraphs = [
        ...TONES.map((key) => [key, text[key], 56, 864]),
        ["about", text.about, 40, 864],
        ...UI[lang].profile.map(([key, label]) => [key, label + text[key], 40, 864]),
        ["cost", UI[lang].costLabel + text.cost, 32, 832],
      ];
      for (const [field, copy, size, width] of paragraphs) {
        ctx.font = `700 ${size}px ${font}`;
        const lines = wrapLinesNoWidow(ctx, copy, width);
        if (lines.some((line) => ctx.measureText(line).width > width + 0.5 || /^[\u3400-\u9fff。！？]{1,2}$/.test(line))) failures.push({ id, lang, field, lines });
      }
    }
    return failures;
  });
  expect(failures).toEqual([]);
});

for (const lang of ["zh", "en"]) {
  test(`${lang}: downloaded keepsakes retain team motto, profile, cost and the selected voice without clipping`, async ({ page }) => {
    for (const { id, code } of CARDS) {
      await page.goto(`/prototype/teammate-type/?c=${code}&lang=${lang}`);
      await page.waitForFunction(() => [...document.querySelectorAll("#stage img")].filter((img) => !img.hidden).every((img) => img.complete && img.naturalWidth));
      await page.evaluate(() => {
        window.cardText = [];
        const draw = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...args) {
          window.cardText.push({ text, x, y, width: this.measureText(text).width, size: parseFloat(this.font.match(/([\d.]+)px/)[1]) });
          return draw.call(this, text, x, y, ...args);
        };
      });
      const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#download").click()]);
      expect(download.suggestedFilename()).toBe(`teammate-${code}.png`);
      const lines = await page.evaluate(() => window.cardText);
      const normalize = (text) => text.replace(/\s/g, "");
      const fullText = normalize(lines.map((line) => line.text).join(""));
      const copy = TYPES[id][lang];
      expect(fullText).toContain(normalize(FACTIONS[TYPES[id].faction].motto[lang]));
      for (const field of ["place", "item", "motto", "cost", "funny"]) expect(fullText).toContain(normalize(copy[field]));
      const shortFields = new Set([shortName(copy), copy.role, copy.mark, TYPES[id].egg, UI[lang].rare]);
      expect(lines.some((line) => !shortFields.has(line.text) && /^[\u3400-\u9fff。！？]{1,2}$/.test(line.text)), id).toBe(false);
      for (const line of lines) {
        expect(line.x, `${id}: ${line.text}`).toBeGreaterThanOrEqual(48);
        expect(line.x + line.width, `${id}: ${line.text}`).toBeLessThanOrEqual(1032);
      }
      const profileStart = lines.find((line) => line.text.startsWith(UI[lang].profile[0][1]));
      expect(profileStart.size, id).toBeGreaterThanOrEqual(34);
      const footerIndex = lines.findIndex((line) => line.text.startsWith(lang === "zh" ? "你的選擇" : "Your choices"));
      expect(footerIndex).toBeGreaterThan(0);
      const lastBody = lines[footerIndex - 1];
      expect(lastBody.y + lastBody.size, id).toBeLessThan(lines[footerIndex].y - 12);
    }
  });
}
