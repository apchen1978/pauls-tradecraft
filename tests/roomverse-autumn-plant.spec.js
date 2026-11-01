import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const qa = process.env.ROOMVERSE_QA_DIR || null;
for (const width of [1440, 390]) {
  test(`Room 01 autumn plant, luggage and robot fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto('/prototype/roomverse-3d/?lang=zh');
    if (await page.locator('#enter').isVisible()) await page.locator('#enter').click();
    await page.waitForFunction(() => window.__room?.autumnPlantInfo, null, { timeout: 90000 });
    await page.evaluate(async () => { await window.__room.loadRightWallArt(); window.__room.setOrbitAngle(270); });
    const p = await page.evaluate(() => window.__room.autumnPlantInfo());
    expect(Math.abs(p.potBottomMm)).toBeLessThanOrEqual(2);
    expect(p.heightMm).toBeGreaterThan(950);
    expect(p.heightMm).toBeLessThanOrEqual(1030);
    expect(p.leaves).toBe(192);
    expect(p.buds).toBe(3);
    expect(p.collisions).toEqual([]);
    expect(p.doorHits).toBe(0);
    expect(p.suitcaseDoorHits).toBe(0);
    expect(p.frameBottomClearMm).toBeGreaterThanOrEqual(0);
    expect(p.robotHitsTv).toBe(false);
    if (qa) {
      await mkdir(qa, { recursive: true });
      for (const mood of ['rain', 'family', 'tech', 'chic', 'slow', 'tv']) {
        await page.evaluate(value => window.__room.set('mood', value), mood);
        await page.waitForTimeout(850);
        await page.locator('.room').screenshot({ path: `${qa}/${width}-${mood}.png` });
      }
    }
  });
}
