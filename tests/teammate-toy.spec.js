import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

const OUT = "/opt/cursor/artifacts/screenshots";
mkdirSync(OUT, { recursive: true });

async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function shoot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

async function waitForMg(page) {
  await page.waitForFunction(() => {
    const img = document.querySelector("#mg");
    return img && img.complete && img.naturalWidth > 0;
  });
}

test.describe("garage listing", () => {
  for (const width of [390, 1440]) {
    test(`${width}px zh and en show the light-tech toy`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto("/?lang=zh#garage");
      const branch = page.locator("#garage-branch-light-tech");
      await branch.scrollIntoViewIfNeeded();
      await expect(branch.getByRole("heading", { level: 3 })).toHaveText("輕科技玩具");
      const card = page.getByRole("heading", { name: "你是哪一種隊友？" });
      await expect(card).toBeVisible();
      await expect(page.locator("#garage-more").getByRole("heading", { name: "你是哪一種隊友？" })).toHaveCount(0);
      await expect(page.getByText("示意玩具，不是心理測驗。").first()).toBeVisible();
      const href = await page.getByRole("link", { name: "玩一次", exact: true }).getAttribute("href");
      expect(href).toContain("/prototype/teammate-type/");
      expect(href).toContain("lang=zh");
      await shoot(page, `garage-${width}-zh-light-tech`);
      await page.goto("/?lang=en#garage");
      await page.locator("#garage-branch-light-tech").scrollIntoViewIfNeeded();
      await expect(page.locator("#garage-branch-light-tech").getByRole("heading", { level: 3 })).toHaveText("Light-tech toys");
      await expect(page.getByRole("heading", { name: "What kind of teammate are you?" })).toBeVisible();
      await expect(page.getByText("A toy, not a personality test.").first()).toBeVisible();
      const enHref = await page.getByRole("link", { name: "Play", exact: true }).getAttribute("href");
      expect(enHref).toContain("lang=en");
      await shoot(page, `garage-${width}-en-light-tech`);
      await noOverflow(page);
    });
  }
});

for (const width of [390, 768, 1440]) {
  test.describe(`toy ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    test("zh play, share-link round trip, and en card", async ({ page }) => {
      const external = [];
      page.on("request", (request) => {
        const url = request.url();
        if (!url.startsWith("http://127.0.0.1:4173") && !url.startsWith("data:")) external.push(url);
      });
      await page.goto("/prototype/teammate-type/?lang=zh");
      await expect(page.getByRole("heading", { name: "你是哪一種隊友？" })).toBeVisible();
      await expect(page.getByText("示意玩具，不是心理測驗。").first()).toBeVisible();
      await expect(page.locator("#quiz")).toBeVisible();
      await noOverflow(page);
      if (width === 390) await shoot(page, "teammate-390-zh-quiz");

      await page.locator("#choices button").nth(0).click();
      await expect(page.locator("#scenario-title")).toHaveText("社團成果展佈置");
      await page.locator("#choices button").nth(1).click();
      await page.locator("#choices button").nth(0).click();

      await expect(page.locator("#card-name")).toHaveText("最後一擊");
      await expect(page.locator("#card-boundary")).toHaveText("示意玩具，不是心理測驗。");
      await expect(page.locator("#picks-label")).toHaveText("你的選擇 ABA");
      expect(page.url()).toContain("c=ABA");
      expect(page.url()).toContain("lang=zh");
      await waitForMg(page);
      await page.locator("#card").scrollIntoViewIfNeeded();
      await noOverflow(page);
      await shoot(page, `teammate-${width}-zh-result`);
      await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-zh-card.png` });

      const shared = page.locator("#share-url");
      const url = await shared.inputValue();
      expect(url).toContain("c=ABA");
      expect(url).toContain("lang=zh");
      await page.goto(url);
      await expect(page.locator("#card-name")).toHaveText("最後一擊");
      await expect(page.locator("#quiz")).toBeHidden();

      await page.getByRole("button", { name: "EN" }).click();
      await expect(page.locator("#card-name")).toHaveText("The Finisher");
      await expect(page.locator("#card-boundary")).toHaveText("A toy, not a personality test.");
      expect(page.url()).toContain("c=ABA");
      expect(page.url()).toContain("lang=en");
      await waitForMg(page);
      await page.locator("#card").scrollIntoViewIfNeeded();
      await noOverflow(page);
      await shoot(page, `teammate-${width}-en-result`);
      await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-en-card.png` });

      const enUrl = await page.locator("#share-url").inputValue();
      await page.goto(enUrl);
      await expect(page.locator("#card-name")).toHaveText("The Finisher");
      await expect(page.locator("#other-name")).toHaveText("最後一擊");

      if (width === 1440) {
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.getByRole("button", { name: "Download card" }).click(),
        ]);
        expect(download.suggestedFilename()).toBe("teammate-ABA.png");
        await page.getByRole("button", { name: "Play again" }).click();
        await expect(page.locator("#quiz")).toBeVisible();
        await expect(page.locator("#scenario-title")).toHaveText("The night before the deadline");
        expect(page.url()).not.toContain("c=");
        await shoot(page, "teammate-1440-en-quiz");
      }
      expect(external).toEqual([]);
    });
  });
}
