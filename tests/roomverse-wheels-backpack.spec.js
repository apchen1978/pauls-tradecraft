import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const qa=process.env.ROOMVERSE_QA_DIR || null;
for(const width of [1440,390])test(`Room 01 suitcase wheels and backpack ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:1000});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/prototype/roomverse-3d/?lang=zh');if(await page.locator('#enter').isVisible())await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__room?.casualBackpackInfo?.().ready,null,{timeout:60000});
 await page.evaluate(()=>window.__room.setOrbitAngle(270));
 const r=await page.evaluate(()=>({bag:window.__room.casualBackpackInfo(),case:window.__room.softDetails().suitcase}));
 expect(Math.abs(r.bag.floorGapMm)).toBeLessThanOrEqual(2);expect(r.bag.suitcaseHit).toBe(false);expect(r.bag.plantHit).toBe(false);expect(r.bag.doorHits).toBe(0);
 expect(r.case.parts).toContain('red-suitcase-wheels');expect(r.case.parts).toContain('red-suitcase-wheel-hubs');expect(r.case.wheelFloorGapsMm).toHaveLength(4);for(const gap of r.case.wheelFloorGapsMm)expect(Math.abs(gap)).toBeLessThanOrEqual(2);expect(r.case.shellBottomMm).toBeGreaterThan(40);expect(Math.abs(r.case.floorGapMm)).toBeLessThanOrEqual(2);expect(errors).toEqual([]);
 if(qa){await mkdir(qa,{recursive:true});await page.waitForTimeout(500);await page.locator('.room').screenshot({path:`${qa}/arrangement-${width}.png`});}
});

test('Room 01 stays usable when optional backpack fails to load',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/bedroom/models/campus-backpack-v1.glb',route=>route.abort());
 await page.goto('/prototype/roomverse-3d/?lang=zh');if(await page.locator('#enter').isVisible())await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__room?.casualBackpackInfo?.().error,null,{timeout:60000});
 expect(await page.evaluate(()=>window.__room.softDetails().suitcase)).not.toBeNull();expect(errors).toEqual([]);
});