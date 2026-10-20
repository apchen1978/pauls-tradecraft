import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const phase = process.env.CAPTURE_PHASE || 'after-dark-walls';
const port = process.env.CAPTURE_PORT || '4182';
const out = path.resolve(`docs/qa/roomverse-tv-wall-light/${phase}`);
const walls = ['wine', 'dusk', 'pine'];
const moods = ['rain', 'tech', 'tv'];
const widths = [1440, 390];
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const width of widths) {
    const height = width === 1440 ? 900 : 844;
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    for (const wall of walls) for (const mood of moods) {
      const page = await context.newPage();
      page.on('console', (msg) => { if (msg.type() === 'error') console.error(`${wall}/${mood}/${width}: ${msg.text()}`); });
      const url = `http://127.0.0.1:${port}/prototype/roomverse-3d/index.html?lang=zh&wall=${wall}&mood=${mood}&view=tv`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.locator('#enter').click();
      await page.waitForFunction(() => !!window.__room, null, { timeout: 30000 });
      await page.waitForTimeout(900);
      await page.locator('#stage canvas').screenshot({ path: path.join(out, `${wall}-${mood}-${width}.png`) });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
