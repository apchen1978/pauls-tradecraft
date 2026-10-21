import { expect, test } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/";
const PHONES = [
  [360, 640], [360, 800], [360, 844],
  [390, 740], [390, 844],
  [414, 736], [414, 896],
  [430, 844], [430, 932],
];

function placed(view) {
  const xs = view.corners.map((corner) => corner.x);
  const ys = view.corners.map((corner) => Math.abs(corner.y));
  const inside = (corner) => Math.abs(corner.x) <= 0.97 && Math.abs(corner.y) <= 0.97 && corner.z > -1 && corner.z < 1;
  const outside = (corner) => Math.abs(corner.x) > 1 || Math.abs(corner.y) > 1 || corner.z >= 1 || corner.z <= -1;
  return {
    hit: view.firstHit,
    maxX: Math.max(...xs),
    minX: Math.min(...xs),
    maxY: Math.max(...ys),
    whole: view.corners.every(inside),
    away: view.corners.every(outside),
  };
}

for (const lang of ["zh", "en"]) {
  test(`${lang} keeps the whole plaque on phone window views, the return trip, and the postcard`, async ({ page }) => {
    test.setTimeout(240000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const [width, height] of PHONES) {
      await page.setViewportSize({ width, height });
      await page.goto(`${PAGE}?lang=${lang}&mood=family`);
      await page.locator("#enter").click();
      await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
      const where = `${lang} ${width}×${height}`;
      const initial = await page.evaluate(() => ({
        aspect: document.querySelector("#stage").getBoundingClientRect().width / document.querySelector("#stage").getBoundingClientRect().height,
        fov: window.__room.fov(),
        view: window.__room.plaqueView(),
        clear: window.__room.climate().plaqueClear,
        board: window.__room.homeBoard().visible,
        overflow: document.documentElement.scrollWidth <= innerWidth,
      }));
      const fit = placed(initial.view);
      expect(fit.hit, where).toBe("house-plaque");
      expect(fit.whole, where).toBe(true);
      expect(initial.clear, where).toBe(true);
      expect(initial.board, where).toBe(true);
      expect(initial.overflow, where).toBe(true);
      expect(initial.fov, where).toBeGreaterThanOrEqual(initial.aspect < 0.8 ? 66 : 44);

      await page.locator(".camera-tv").click();
      const tv = placed(await page.evaluate(() => window.__room.plaqueView()));
      expect(tv.whole || tv.away, `${where} TV preset`).toBe(true);
      await page.locator(".camera-window").click();
      expect(await page.evaluate(() => window.__room.angle()), where).toBe(0);
      expect(placed(await page.evaluate(() => window.__room.plaqueView())).whole, `${where} back at the window`).toBe(true);

      const beforeCard = await page.evaluate(() => window.__room.cam());
      await page.evaluate(() => window.__room.postcard());
      expect(await page.evaluate(() => window.__room.cam()), where).toEqual(beforeCard);
      expect(placed(await page.evaluate(() => window.__room.plaqueView())).whole, `${where} postcard`).toBe(true);
    }
  });
}

for (const lang of ["zh", "en"]) {
  test(`${lang} desktop 1440 keeps the 44° frame and the whole plaque`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${PAGE}?lang=${lang}&mood=family`);
    await page.locator("#enter").click();
    await page.waitForFunction(() => window.__room, null, { timeout: 60000 });
    for (const degrees of [0, 135, 180]) {
      const reading = await page.evaluate((value) => {
        window.__room.setOrbitAngle(value);
        return window.__room.fov();
      }, degrees);
      expect(reading, `${lang} ${degrees}`).toBeCloseTo(44, 2);
    }
    await page.evaluate(() => window.__room.setOrbitAngle(0));
    const fit = placed(await page.evaluate(() => window.__room.plaqueView()));
    expect(fit.hit).toBe("house-plaque");
    expect(fit.whole).toBe(true);
    expect(await page.evaluate(() => window.__room.climate().plaqueClear)).toBe(true);
  });
}
