import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const phase = process.env.CAPTURE_PHASE || 'after';
const port = process.env.CAPTURE_PORT || '4182';
const out = path.resolve(`docs/qa/roomverse-tv-wall-light/${phase}`);
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const moods = process.argv[2] ? [process.argv[2]] : ['rain', 'family', 'tech', 'chic', 'slow', 'tv'];
const widths = process.argv[3] ? [Number(process.argv[3])] : [1440, 390];
const views = process.argv[4] ? [process.argv[4]] : ['window', 'tv'];
try {
  for (const width of widths) {
    const height = width === 1440 ? 900 : 844;
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('console', (msg) => { if (msg.type() === 'error') console.error(`console ${width}: ${msg.text()}`); });
    await page.goto(`http://127.0.0.1:${port}/prototype/roomverse-3d/index.html?lang=zh&mood=rain`, { waitUntil: 'domcontentloaded' });
    await page.locator('#enter').click();
    await page.waitForFunction(() => !!window.__room, null, { timeout: 30000 });
    for (const mood of moods) {
      await page.evaluate((mood) => window.__room.set('mood', mood), mood);
      await page.waitForTimeout(700);
      for (const view of views) {
        await page.evaluate((view) => window.__room.setOrbitAngle({ window: 0, mid: 90, tv: 180 }[view]), view);
        await page.waitForTimeout(100);
        await page.locator('#stage canvas').screenshot({ path: path.join(out, `${mood}-${view}-${width}.png`) });
        if (process.argv.length < 5 && view === 'window' && mood === 'tv') {
          const postcard = await page.evaluate(() => window.__room.postcard().toDataURL('image/png'));
          await fs.writeFile(path.join(out, 'tv-postcard.png'), Buffer.from(postcard.split(',')[1], 'base64'));
        }
      }
      if (!process.argv[2] && ['rain', 'family', 'tv'].includes(mood)) {
        await page.evaluate(() => window.__room.setOrbitAngle(90));
        await page.waitForTimeout(100);
        await page.locator('#stage canvas').screenshot({ path: path.join(out, `${mood}-mid-${width}.png`) });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
