import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const PAGE = '/prototype/roomverse-3d/kitchen/';
const MOODS = ['golden', 'night', 'movie', 'dinner', 'sunday', 'thanksgiving'];
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });

for (const lang of ['zh', 'en']) {
  for (const width of [375, 390]) {
    test(`full-screen selected mood remains visible after redraw (${lang}, ${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 375 ? 667 : 780 });
      await page.goto(`${PAGE}?lang=${lang}`);
      await page.waitForFunction(() => window.__room03 && document.querySelectorAll('#moods button').length === 6);
      await page.locator('#immersiveEnter').click();
      await expect(page.locator('.room')).toHaveClass(/is-immersive/);

      for (const mood of MOODS) {
        const button = page.locator(`#moods button[data-mood="${mood}"]`);
        await button.scrollIntoViewIfNeeded();
        await button.click();
        await expect(page.locator(`#moods button[data-mood="${mood}"]`)).toHaveAttribute('aria-pressed', 'true');
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const visibility = await page.locator(`#moods button[data-mood="${mood}"]`).evaluate(element => {
          const group = document.querySelector('#moods');
          const groupRect = group.getBoundingClientRect();
          const buttonRect = element.getBoundingClientRect();
          return {
            visible: buttonRect.left >= groupRect.left - 1 && buttonRect.right <= groupRect.right + 1,
            scrollLeft: group.scrollLeft,
            scrollWidth: group.scrollWidth,
            clientWidth: group.clientWidth,
            group: { left: groupRect.left, right: groupRect.right },
            button: { left: buttonRect.left, right: buttonRect.right, width: buttonRect.width }
          };
        });
        expect(visibility.visible, `${lang} ${width}px ${mood} stays inside the scrollable mood row: ${JSON.stringify(visibility)}`).toBe(true);
        if (QA) await page.screenshot({ path: `${QA}/immersive-${lang}-${width}-${mood}.png`, fullPage: false, animations: 'disabled' });
      }
    });
  }
}
