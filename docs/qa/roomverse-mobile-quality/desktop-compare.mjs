import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
const app='public/prototype/roomverse-3d/app.js';
const previous=execFileSync('git',['show','origin/main:'+app],{encoding:'utf8'});
const current=await fs.readFile(app,'utf8');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const [label,source] of [['before',previous],['after',current]]) {
  await fs.writeFile(app,source);
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const page=await context.newPage(); await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4189/prototype/roomverse-3d/index.html?lang=zh&mood=rain');
  await page.locator('#enter').click(); await page.waitForFunction(()=>window.__room,null,{timeout:60000}); await page.waitForTimeout(2700);
  await page.evaluate(()=>window.__room.setOrbitAngle(0));
  await page.locator('#stage canvas').screenshot({path:`docs/qa/roomverse-mobile-quality/desktop-${label}-1440.webp`,type:'webp',quality:100});
  console.log(label,await page.locator('#stage canvas').evaluate(c=>({width:c.width,height:c.height,css:c.clientWidth})));
  await context.close();
 }
} finally {await fs.writeFile(app,current);await browser.close();}
