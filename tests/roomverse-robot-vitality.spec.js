import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";
const MOODS = {
  rain: ["聽雨聲，剛剛好。", "The rain sounds just right."],
  family: ["好像聞到晚餐香了。", "Feels like dinner is nearly ready."],
  tech: ["安靜一點，靈感來了。", "A little quiet, a little inspiration."],
  chic: ["今天的光很有精神。", "The light has a little sparkle today."],
  slow: ["慢慢來，也很好。", "No rush. This feels good."],
  tv: ["今晚的沙發時間開始啦。", "Sofa time starts now."],
};

test("robot mood lines are bilingual and clear after three seconds", async ({ browser }) => {
  test.setTimeout(300000);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto(`${PAGE}?lang=zh`);
    await page.locator("#enter").click();
    await expect.poll(() => page.evaluate(() => Boolean(window.__room)), { timeout: 60000 }).toBe(true);
    expect((await page.evaluate(() => window.__room.robotState())).reducedMotion).toBe(true);
    expect((await page.evaluate(() => window.__room.robotState())).sleeping).toBe(false);
    await page.evaluate(() => window.__room.set("mood", "rain"));
    expect((await page.evaluate(() => window.__room.robotState())).speaking).toBe(false);

    const order = ["family", "rain", "tech", "chic", "slow", "tv"];
    for (const mood of order) {
      await page.evaluate((value) => window.__room.set("mood", value), mood);
      await expect(page.locator("#robotBubble")).toHaveText(MOODS[mood][0]);
    }
    await page.evaluate(() => window.__room.setLang("en"));
    for (const mood of order) {
      await page.evaluate((value) => window.__room.set("mood", value), mood);
      await expect(page.locator("#robotBubble")).toHaveText(MOODS[mood][1]);
    }
    await page.waitForTimeout(3100);
    await expect(page.locator("#robotBubble")).toBeHidden();
  } finally {
    await context.close();
  }
});

test("robot sleeps after twenty idle seconds, wakes on activity, and respects reduced motion", async ({ browser, page }) => {
  test.setTimeout(300000);
  const output = "docs/qa/roomverse-robot-vitality";
  await mkdir(output, { recursive: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.locator("#enter").click();
  await expect.poll(() => page.evaluate(() => Boolean(window.__room)), { timeout: 60000 }).toBe(true);
  await page.locator("#lang").click();
  await page.locator("#lang").click();

  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    if (width === 1440) {
      const initialYaw = (await page.evaluate(() => window.__room.robotState())).yaw;
      await page.evaluate(() => window.__room.setOrbitAngle(window.__room.angle() + 60));
      await page.waitForTimeout(1300);
      expect(Math.abs((await page.evaluate(() => window.__room.robotState())).yaw - initialYaw)).toBeGreaterThan(.01);
    }
    await page.waitForTimeout(1300);
    const awake = await page.evaluate(() => window.__room.robotState());
    expect(awake.sleeping).toBe(false);
    await page.locator("#stage").screenshot({ path: `${output}/awake-${width}.png` });

    if (width > 768) await page.locator("#panelToggle").click();
    const mood = width === 1440 ? "family" : "tech";
    await page.locator('#panel .opts').first().locator(`button[data-key="${mood}"]`).click();
    await expect(page.locator("#robotBubble")).toHaveText(MOODS[mood][width === 1440 ? 0 : 1]);
    const bubbleBox = await page.locator("#robotBubble").boundingBox();
    const stageBox = await page.locator("#stage").boundingBox();
    expect(bubbleBox.x).toBeGreaterThanOrEqual(stageBox.x);
    expect(bubbleBox.y).toBeGreaterThanOrEqual(stageBox.y);
    expect(bubbleBox.x + bubbleBox.width).toBeLessThanOrEqual(stageBox.x + stageBox.width);
    expect(bubbleBox.y + bubbleBox.height).toBeLessThanOrEqual(stageBox.y + stageBox.height);
    await page.locator("#stage").screenshot({ path: `${output}/speaking-${width}.png` });
    await page.waitForTimeout(20000);
    expect((await page.evaluate(() => window.__room.robotState())).sleeping).toBe(true);
    await page.locator("#stage").screenshot({ path: `${output}/asleep-${width}.png` });

    await page.locator("#lang").click();
    expect((await page.evaluate(() => window.__room.robotState())).sleeping).toBe(false);
    expect((await page.evaluate(() => window.__room.robotState())).speaking).toBe(false);
  }

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  try {
    const reducedPage = await reducedContext.newPage();
    await reducedPage.goto(`${PAGE}?lang=zh`);
    await reducedPage.locator("#enter").click();
    await expect.poll(() => reducedPage.evaluate(() => Boolean(window.__room)), { timeout: 60000 }).toBe(true);
    const initialYaw = (await reducedPage.evaluate(() => window.__room.robotState())).yaw;
    await reducedPage.waitForTimeout(21000);
    const reducedState = await reducedPage.evaluate(() => window.__room.robotState());
    expect(reducedState.sleeping).toBe(false);
    expect(reducedState.yaw).toBe(initialYaw);
    expect(reducedState.reducedMotion).toBe(true);
    await reducedPage.evaluate(() => window.__room.set("mood", "family"));
    await expect(reducedPage.locator("#robotBubble")).toHaveText(MOODS.family[0]);
  } finally {
    await reducedContext.close();
  }
});
