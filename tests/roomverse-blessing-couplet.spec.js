import { test, expect } from "@playwright/test";
import { stat } from "node:fs/promises";

const PAGE = "/prototype/roomverse-3d/";

async function enter(page, { width = 1440 } = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => { window.requestIdleCallback = () => 1; });
  await page.goto(`${PAGE}?lang=zh&mood=rain`);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room);
  await page.waitForFunction(() => window.__room.blessingCouplet().loaded);
}

test("blessing couplet hangs straight beside the glass board", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await enter(page);
  expect(await page.evaluate(() => window.__room.tableLampLighting().lightCount)).toBe(6);
  const strip = await page.evaluate(() => window.__room.blessingCouplet());
  expect(strip.text).toBe("福杯滿溢");
  expect(strip.file).toBe("blessing-couplet-v1.webp");
  expect(strip.pixels[0]).toBe(1024);
  expect(strip.pixels[1] / strip.pixels[0]).toBeCloseTo(strip.height / strip.width, 2);
  expect(strip.width).toBeCloseTo(.20, 2);
  expect(strip.height).toBeCloseTo(.70, 2);
  expect(strip.roughness).toBeCloseTo(.9, 2);
  expect(strip.metalness).toBe(0);
  // 霧面宣紙：不收陰影（5 mm 貼牆會有 shadow acne），也不做環境反射。
  expect(strip.receiveShadow).toBe(false);
  // 陰影貼片不可用 polygonOffset：斜率相關偏移會在斜視時爬到紙面前方，把紅紙蓋黑。
  expect(strip.polygonOffset).toBe(false);
  expect(strip.rotation[0]).toBe(0);
  expect(strip.rotation[2]).toBe(0);
  expect(strip.rotation[1]).toBeCloseTo(Math.PI / 2, 5);
  expect(strip.top).toBeCloseTo(strip.boardTop, 2);
  expect(strip.gap).toBeGreaterThan(.10);
  expect(strip.gap).toBeLessThan(.20);
  expect(strip.offWall).toBeGreaterThan(.003);
  expect(strip.offWall).toBeLessThan(.012);
  expect(strip.shadow).toBe(true);
  expect(strip.collisions).toEqual([]);
  const bands = await page.evaluate(async () => {
    const info = window.__room.blessingCouplet();
    const response = await fetch(`/prototype/roomverse-3d/art/${info.file}`);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);
    const darkShare = (y0, y1) => {
      const data = ctx.getImageData(0, y0, canvas.width, y1 - y0).data;
      let dark = 0, n = 0;
      for (let i = 0; i < data.length; i += 16) {
        if (data[i + 3] < 128) continue;
        n += 1;
        if (data[i] < 70 && data[i + 1] < 60 && data[i + 2] < 60) dark += 1;
      }
      return dark / n;
    };
    const side = (x) => {
      const data = ctx.getImageData(x, 0, 1, canvas.height).data;
      let first = -1, last = -1;
      for (let y = 0; y < canvas.height; y += 1) {
        if (data[y * 4 + 3] > 200) {
          if (first < 0) first = y;
          last = y;
        }
      }
      return [first, last];
    };
    return {
      shares: [518, 1346, 2174, 3002].map((y) => darkShare(y - 180, y + 180)),
      left: side(0),
      right: side(canvas.width - 1),
    };
  });
  for (const share of bands.shares) expect(share).toBeGreaterThan(.08);
  expect(bands.left[0]).toBe(bands.right[0]);
  expect(bands.left[1]).toBe(bands.right[1]);
  expect(bands.left[1] - bands.left[0]).toBeGreaterThan(3000);
  await page.evaluate(() => window.__room.setOrbitAngle(0));
  expect(await page.evaluate(() => window.__room.plaqueView().firstHit)).toBe("house-plaque");
  expect(errors).toEqual([]);
});

test("blessing couplet picture stays a single webp", async () => {
  const size = (await stat("public/prototype/roomverse-3d/art/blessing-couplet-v1.webp")).size;
  expect(size).toBeGreaterThan(20000);
  expect(size).toBeLessThan(400000);
});
