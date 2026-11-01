import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const qa = process.env.ROOMVERSE_QA_DIR;
for (const width of [1440,390]) test(`entry view preserves controls and shared URL at ${width}px`, async ({ page }) => {
  await page.setViewportSize({width,height:width === 390 ? 844 : 1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/prototype/roomverse-3d/?lang=zh');
  if (await page.locator('#enter').isVisible()) await page.locator('#enter').click();
  await expect(page.locator('.camera-entry')).toBeAttached({timeout:90000});
  if (width !== 390) await page.locator('#panelToggle').click();
  await expect(page.locator('.camera-entry')).toBeVisible();
  await page.locator('.camera-entry').click();
  await expect(page.locator('.camera-entry')).toHaveAttribute('aria-pressed','true');
  await expect(page).toHaveURL(/view=entry/);
  if (qa) { await mkdir(qa,{recursive:true}); await page.locator('.room').screenshot({path:`${qa}/entry-${width}.png`}); }
  await page.reload();
  if (await page.locator('#enter').isVisible()) await page.locator('#enter').click();
  await expect(page.locator('.camera-entry')).toHaveAttribute('aria-pressed','true',{timeout:90000});
  if (width !== 390) await page.locator('#panelToggle').click();
  await page.locator('.camera-window').click();
  await expect(page.locator('.camera-window')).toHaveAttribute('aria-pressed','true');
  await expect(page).not.toHaveURL(/view=entry/);
  if(width===390){
    await page.locator('#immersiveEnter').click();
    const entry=page.locator('#immersiveControls [data-view="entry"]');
    await entry.scrollIntoViewIfNeeded(); await entry.click();
    await expect(page.locator('#immersiveControls [data-view="entry"]')).toHaveAttribute('aria-pressed','true');
    await page.locator('#immersiveExit').click();
  }
});
