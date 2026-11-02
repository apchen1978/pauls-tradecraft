import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const QA = process.env.ROOMVERSE_QA_DIR || null;

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`entry poster has no size advisory in Chinese or English at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/prototype/roomverse-3d/?lang=zh");

    const poster = page.locator("#poster");
    const enter = page.locator("#enter");
    await expect(poster).toBeVisible();
    await expect(enter).toBeVisible();
    await expect(enter).toHaveText("走進 3D 房間");
    await expect(page.locator("#size")).toHaveCount(0);
    await expect(poster).not.toContainText(/1\.3\s*MB|建議用電腦|computer or tablet/i);
    const zhBox = await enter.boundingBox();
    expect(zhBox).not.toBeNull();

    if (QA) {
      await mkdir(QA, { recursive: true });
      await poster.screenshot({ path: `${QA}/entry-size-copy-${width}-zh.png` });
    }

    await page.locator("#lang").click();
    await expect(enter).toHaveText("Step into the 3D room");
    await expect(page.locator("#size")).toHaveCount(0);
    await expect(poster).not.toContainText(/1\.3\s*MB|建議用電腦|computer or tablet/i);
    const enBox = await enter.boundingBox();
    expect(enBox).not.toBeNull();
    expect(Math.abs((zhBox.x + zhBox.width / 2) - (enBox.x + enBox.width / 2))).toBeLessThanOrEqual(1);

    if (QA) await poster.screenshot({ path: `${QA}/entry-size-copy-${width}-en.png` });
  });
}
