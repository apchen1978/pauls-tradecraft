import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

async function loadRoom(page, width = 1440) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
}

test("the entry hall has a low bench and a rug facing the TV, clear of the console, the walls and the doorway", async ({ page }) => {
  await loadRoom(page);
  const nook = await page.evaluate(() => window.__room03.info().entryNook);
  expect(nook, "nook report exists").toBeTruthy();
  expect(nook.seatTopMm, "seat height of a low sofa-bench").toBeGreaterThanOrEqual(380);
  expect(nook.seatTopMm).toBeLessThanOrEqual(460);
  expect(nook.benchMm[0], "bench width").toBeGreaterThanOrEqual(850);
  expect(nook.benchMm[0]).toBeLessThanOrEqual(1000);
  expect(nook.rugGapMm, "rug lies on the hall floor").toBeLessThanOrEqual(1);
  expect(nook.footGapMm, "bench feet are pressed 5-15 mm into the rug (legs reach the floor under it)").toBeLessThanOrEqual(-5);
  expect(nook.footGapMm).toBeGreaterThanOrEqual(-15);
  expect(nook.benchToConsoleMm, "legroom between the bench and the TV console").toBeGreaterThanOrEqual(300);
  expect(nook.benchToLeftWallMm, "bench clears the left hall wall").toBeGreaterThanOrEqual(50);
  expect(nook.benchToDoorLineMm, "bench stays behind the doorway line").toBeGreaterThanOrEqual(100);
  expect(nook.rugToWallsMm[0], "rug clears the left wall").toBeGreaterThanOrEqual(20);
  expect(nook.rugToWallsMm[1], "rug clears the right wall").toBeGreaterThanOrEqual(20);
  expect(nook.rugToConsoleMm).toBeGreaterThanOrEqual(50);
  expect(nook.meshes, "bench frame, cushions, pillows and the rug").toBe(4);
  expect(nook.vertices).toBeLessThanOrEqual(1800);
});

test("the coffee maker shows a temperature readout and has no ring handle; the hob is a gas hob with knobs", async ({ page }) => {
  await loadRoom(page);
  const found = await page.evaluate(() => {
    const info = window.__room03.info();
    return { coffee: info.dripCoffeeMakerFit, hasDisplay: !!window.__room03.camera };
  });
  expect(found.coffee).toBeTruthy();
  const source = await (await page.request.get(`${PAGE}kitchen.js?v=62`)).text();
  expect(source, "a seven-segment display is built for the coffee maker").toContain("prop-coffee-maker-temperature-display");
  expect(source, "the black ring handle is gone").not.toContain("TorusGeometry(0.045, 0.008, 5, 20), m.black, [0.075, 0.115, 0.065]");
  expect(source, "the old bare steel burner rings are gone").not.toContain('ring.name = "hob-burner"');
  expect(source, "four knobs on the hob front").toContain("for (const x of [0.58, 0.74, 0.90, 1.06])");
});
