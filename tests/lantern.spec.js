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
  await expect(page.locator("#egg")).toBeVisible();
  await page.locator("#spot-base").click();
  await expect(page.locator("#go2")).toBeEnabled();
  await noOverflow(page);
  await page.locator("#go2").click();
  await page.locator('[data-part="shade"][data-option="glass"]').click();
  await page.locator('[data-part="pack"][data-option="bulk"]').click();
  await expect(page.locator("#effects")).toContainText(zh ? "貴一點" : "costs a bit more");
  await expect(page.locator("#effects")).toContainText(zh ? "便宜一點" : "costs a bit less");
  await expect(page.locator(".effects")).toContainText(zh ? "示意" : "Illustrative");
  await expect(page.locator("#kid-react")).toBeVisible();
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
  const text = (await page.evaluate(() => window.__cardText)).join("\n");
  expect(text).toContain("Chiensi");
  expect(text).toContain("Plug and voltage");
  expect(text).not.toMatch(/\d/);
  const download = page.waitForEvent("download");
  await page.locator("#download").click();
  expect((await download).suggestedFilename()).toBe("take-the-lantern-apart-spec-card.png");
});

test("language switch keeps the screen and updates the link", async ({ page }) => {
  await page.goto(`${URL}?lang=zh`);
  await page.locator("#go0").click();
  await page.getByRole("button", { name: "EN" }).click();
  await expect(page).toHaveURL(/lang=en/);
  await expect(page.locator("#s1")).toBeVisible();
  await expect(page.locator("#go1")).toHaveText("Take a closer look");
});
