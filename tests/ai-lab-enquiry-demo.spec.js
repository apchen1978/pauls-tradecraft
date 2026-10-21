import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { TEXT } from "../public/ai-lab/content.js";
import { ENQUIRY } from "../public/ai-lab/enquiry-demo/content.js";

const PAGE = "/ai-lab/enquiry-demo/";
const shots = join(process.cwd(), "docs", "qa", "ai-lab-enquiry-demo");
mkdirSync(shots, { recursive: true });

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])]));
  return typeof value;
}

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test("enquiry copy matches in both languages and echoes chapter 03", () => {
  expect(shape(ENQUIRY.zh)).toEqual(shape(ENQUIRY.en));
  expect(ENQUIRY.zh.steps.map((step) => step.id)).toEqual(ENQUIRY.en.steps.map((step) => step.id));
  expect(ENQUIRY.zh.steps).toHaveLength(6);
  expect(ENQUIRY.zh.fields.map((field) => field.id)).toEqual(["product", "quantity", "destination", "deadline", "missing"]);
  expect(ENQUIRY.zh.risks).toEqual(TEXT.zh.c3.risks);
  expect(ENQUIRY.en.risks).toEqual(TEXT.en.c3.risks);
  expect(ENQUIRY.zh.badge).toBe("示範・虛構資料");
  expect(ENQUIRY.en.badge).toBe("Demo · fictional data");
  expect(ENQUIRY.en.toggle).toBe("What if no one reviews it?");
  expect(ENQUIRY.zh.title).toBe("一封詢盤的旅程");
  expect(ENQUIRY.en.title).toBe("One enquiry, start to finish");
  expect(JSON.stringify(ENQUIRY.zh.quoteLines)).toContain("USD __ / m");
  expect(JSON.stringify(ENQUIRY.en.quoteLines)).toContain("USD __ / m");
  expect(JSON.stringify(ENQUIRY.zh.quoteLines)).toContain("示意");
  const blob = JSON.stringify(ENQUIRY);
  expect(blob).not.toMatch(/ROI|轉換率|成交率|保證|guarantee|老闆|老板|中間層|\bA2A\b|\bCDD\b|前職|Former role|\bowner\b|\bboss\b/i);
  for (const step of [...ENQUIRY.zh.steps, ...ENQUIRY.en.steps]) expect(step.why.endsWith(step.why.includes("。") ? "。" : ".") || step.why.endsWith(".")).toBe(true);
});

test("chapter 03 and the decision-maker route link to the demo", async ({ page }) => {
  for (const lang of ["zh", "en"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/ai-lab/?lang=${lang}`);
    const href = `/ai-lab/enquiry-demo/?lang=${lang}`;
    const chapter = page.locator("#c3-journey");
    await expect(chapter).toHaveAttribute("href", href);
    await expect(chapter).toHaveText(TEXT[lang].c3.journey);
    expect((await chapter.boundingBox()).height).toBeGreaterThanOrEqual(44);
    const route = page.locator(`#fast-route-steps a[href="${href}"]`);
    await expect(route.locator(".fast-label")).toHaveText(TEXT[lang].fastRoute.enquiry);
    expect((await route.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await noOverflow(page);
  }
});

test("an edit stays on the page and still is not sent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PAGE}?lang=zh`);
  const x = ENQUIRY.zh;
  for (let i = 0; i < 3; i += 1) await page.locator("#next").click();
  await expect(page.locator("#next")).toBeDisabled();
  await page.locator("#edit").click();
  await expect(page.locator("#draft")).toBeVisible();
  await expect(page.locator("#next")).toBeDisabled();
  await page.locator("#draft").fill("顏色先別答應。");
  expect((await page.locator("#keep-edit").boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.locator("#keep-edit").click();
  await expect(page.locator("#draft-preview")).toContainText("顏色先別答應。");
  await expect(page.locator("#review-status")).toHaveText(x.editedStatus);
  await expect(page.locator("#not-sent")).toHaveText(x.notSent);
  await page.locator("#next").click();
  await page.locator("#next").click();
  await expect(page.locator("#human-did")).toContainText(x.humanEdit);
  await expect(page.locator("#human-did")).not.toContainText(x.humanApprove);
  await expect(page.locator("#ai-did")).toContainText(x.aiDid.at(-1));
});

test("switching language keeps the step and the approval", async ({ page }) => {
  await page.goto(`${PAGE}?lang=zh`);
  for (let i = 0; i < 3; i += 1) await page.locator("#next").click();
  await page.locator("#approve").click();
  await page.locator('#lang-group button[data-lang="en"]').click();
  await expect(page.locator("h1")).toHaveText(ENQUIRY.en.title);
  await expect(page.locator("#badge")).toHaveText(ENQUIRY.en.badge);
  await expect(page.locator("#panel")).toHaveAttribute("data-step", "review");
  await expect(page.locator("#review-status")).toHaveText(ENQUIRY.en.approvedStatus);
  await expect(page.locator("#not-sent")).toHaveText(ENQUIRY.en.notSent);
  expect(page.url()).toContain("lang=en");
});

for (const lang of ["zh", "en"]) {
  for (const width of [390, 1440]) {
    test(`enquiry ${lang} at ${width}px: step through, approve, and the review risk`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const problems = [];
      page.on("pageerror", (error) => problems.push(String(error)));
      const x = ENQUIRY[lang];
      await page.goto(`${PAGE}?lang=${lang}`);
      await expect(page.locator("#badge")).toHaveText(x.badge);
      await expect(page.locator("h1")).toHaveText(x.title);
      await expect(page.locator("#panel")).toHaveAttribute("data-step", "arrive");
      await expect(page.locator("#letter")).toContainText(x.email.from);
      await expect(page.locator("#letter")).toContainText(x.email.company);
      await expect(page.locator("#why")).toHaveText(x.steps[0].why);
      await expect(page.locator("#stepper button")).toHaveCount(6);
      await page.locator("main").screenshot({ path: join(shots, `${lang}-${width}-arrive.png`) });

      await page.locator("#next").click();
      await expect(page.locator("#panel")).toHaveAttribute("data-step", "summary");
      for (const field of x.fields) await expect(page.locator(`[data-field="${field.id}"] dd`)).toHaveText(field.value);
      await expect(page.locator("#why")).toHaveText(x.steps[1].why);

      await page.locator("#next").click();
      await expect(page.locator("#panel")).toHaveAttribute("data-step", "draft");
      await expect(page.locator("#quote")).toContainText("USD __ / m");
      await expect(page.locator("#quote")).toContainText(lang === "zh" ? "示意" : "Example only");
      await expect(page.locator(".questions li")).toHaveCount(x.questions.length);

      await page.locator("#next").click();
      await expect(page.locator("#panel")).toHaveAttribute("data-step", "review");
      await expect(page.locator("#next")).toBeDisabled();
      await expect(page.locator("#gate")).toBeVisible();
      await expect(page.locator("#not-sent")).toHaveText(x.notSent);
      await page.locator("#approve").click();
      await expect(page.locator("#review-status")).toHaveText(x.approvedStatus);
      await expect(page.locator("#next")).toBeEnabled();
      await expect(page.locator("#draft-preview")).toContainText("USD __ / m");
      if (width === 390) {
        for (const id of ["#back", "#next", "#approve", "#edit", "#no-review", "#back-link"]) {
          expect((await page.locator(id).boundingBox()).height).toBeGreaterThanOrEqual(44);
        }
        const steps = await page.locator("#stepper button, .lang button").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
        for (const height of steps) expect(height).toBeGreaterThanOrEqual(44);
      }
      await page.locator("main").screenshot({ path: join(shots, `${lang}-${width}-review.png`) });

      await page.locator("#next").click();
      await expect(page.locator("#panel")).toHaveAttribute("data-step", "follow");
      await expect(page.locator('[data-day="3"]')).toContainText(x.follow[0].day);
      await expect(page.locator('[data-day="3"]')).toContainText(x.follow[0].body);
      await expect(page.locator('[data-day="7"]')).toContainText(x.follow[1].day);
      await expect(page.locator('[data-day="7"]')).toContainText(x.follow[1].body);

      await page.locator("#next").click();
      await expect(page.locator("#panel")).toHaveAttribute("data-step", "outcome");
      await expect(page.locator("#human-did")).toContainText(x.humanRead);
      await expect(page.locator("#human-did")).toContainText(x.humanApprove);
      await expect(page.locator("#human-did")).toContainText(x.humanSend);
      await expect(page.locator("#ai-did li")).toHaveCount(x.aiDid.length);
      await expect(page.locator("#ai-did")).toContainText(x.aiDid.at(-1));
      await expect(page.locator("#next")).toBeDisabled();
      await page.locator("main").screenshot({ path: join(shots, `${lang}-${width}-outcome.png`) });

      await page.locator("#no-review").click();
      await expect(page.locator("#no-review")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#risk-list li")).toHaveText(x.risks);
      await expect(page.locator("#risk-note")).toHaveText(x.riskNote);
      await page.locator("#no-review").click();
      await expect(page.locator("#risk")).toBeHidden();
      await noOverflow(page);
      expect(await page.evaluate(() => localStorage.length)).toBe(0);
      expect(problems).toEqual([]);
    });
  }
}
