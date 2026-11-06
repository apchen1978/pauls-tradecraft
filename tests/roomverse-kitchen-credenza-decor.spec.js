import { test, expect } from "@playwright/test";
import { LEDGER, CAPS } from "./helpers/room03-ledger.js";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("the credenza top carries two takeaway cups and a small Bay Area keepsake inside its footprint", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().furniture.table === "glb" && window.__room03.info().wallArtLoaded && window.__room03.info().yardLoaded && window.__room03.robotInfo?.().ready && window.__room03.info().drawCallsLastFrame > 0, null, { timeout: 90000 });
  const info = await page.evaluate(() => window.__room03.info());
  const decor = info.credenzaDecor, credenza = info.credenza;
  expect(decor.vertices, "the decor exists and is one merged mesh").toBeGreaterThan(500);
  expect(info.vertices).toBeLessThanOrEqual(CAPS.vertices);
  const top = credenza.heightMm / 1000;
  expect(decor.bounds.min[1] - top, "rests on the top, neither floating nor sunk").toBeGreaterThanOrEqual(-0.002);
  expect(decor.bounds.min[1] - top).toBeLessThanOrEqual(0.002);
  expect(decor.bounds.max[1] - top, "stays well below the painting").toBeLessThanOrEqual(0.6);
  expect(decor.bounds.max[0], "inside the credenza depth (front edge 2.49, wall 2.94)").toBeLessThanOrEqual(2.92);
  expect(decor.bounds.min[0]).toBeGreaterThanOrEqual(2.49);
  expect(decor.bounds.min[2], "clear of the door leaf end (z -0.80)").toBeGreaterThanOrEqual(-0.79);
  expect(decor.bounds.max[2], "short of the wok counter (z 1.023)").toBeLessThanOrEqual(1.0);
  expect(decor.cups).toHaveLength(2);
  for (const cup of decor.cups) {
    expect(cup.bounds.min[1] - top, `${cup.name} base embeds no more than 2 mm into the oak top`).toBeGreaterThanOrEqual(-0.002);
    expect(cup.bounds.min[1] - top).toBeLessThanOrEqual(0.002);
    expect(cup.bounds.max[1] - top, `${cup.name} is a plausible 125 mm takeaway cup`).toBeGreaterThan(0.115);
    expect(cup.bounds.max[1] - top).toBeLessThanOrEqual(0.13);
    expect(cup.bounds.min[0]).toBeGreaterThanOrEqual(2.49);
    expect(cup.bounds.max[0]).toBeLessThanOrEqual(2.92);
    expect(cup.bounds.min[2]).toBeGreaterThanOrEqual(-0.79);
    expect(cup.bounds.max[2]).toBeLessThanOrEqual(1.0);
  }
  expect(decor.cups[0].bodyColour).not.toBe(decor.cups[1].bodyColour);
  expect(decor.cups[0].sleeveColour).not.toBe(decor.cups[1].sleeveColour);
  expect(decor.cups[1].bounds.min[2] - decor.cups[0].bounds.max[2], "the two cups have clear space between them").toBeGreaterThan(0.5);
  expect(decor.keepsake.type).toBe("unbranded-sf-cable-car-keepsake");
  expect(decor.keepsake.vertices).toBeGreaterThan(250);
  expect(decor.keepsake.bounds.min[1] - top, "keepsake plinth rests on the oak top").toBeGreaterThanOrEqual(-0.002);
  expect(decor.keepsake.bounds.min[1] - top).toBeLessThanOrEqual(0.002);
  expect(decor.keepsake.bounds.max[1] - top).toBeLessThanOrEqual(0.18);
  expect(decor.keepsake.bounds.min[0]).toBeGreaterThanOrEqual(2.49);
  expect(decor.keepsake.bounds.max[0]).toBeLessThanOrEqual(2.92);
  expect(decor.keepsake.bounds.min[2], "clear of the adjacent takeaway cup").toBeGreaterThan(decor.cups[1].bounds.max[2] + 0.04);
  expect(decor.keepsake.bounds.max[2], "clear of the stone dish").toBeLessThan(0.74);
});
