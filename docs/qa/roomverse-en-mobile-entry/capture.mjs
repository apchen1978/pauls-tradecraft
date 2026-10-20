import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
const root="docs/qa/roomverse-en-mobile-entry";
const before=execFileSync("git",["show","dae7f06:public/prototype/roomverse-3d/index.html"],{encoding:"utf8"});
const after=await readFile("public/prototype/roomverse-3d/index.html","utf8");
const browser=await chromium.launch({channel:"chrome",headless:true});
const results=[];
for(const [lang,width,height] of [["en",390,844],["en",390,740],["zh",390,844],["zh",390,740],["en",1440,900],["zh",1440,900]]){
  for(const mode of ["before","after"]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,reducedMotion:"reduce"});
    await page.route("**/roomverse-3d/index.html?*",route=>route.fulfill({status:200,contentType:"text/html",body:mode==="before"?before:after}));
    await page.goto(`http://127.0.0.1:4187/prototype/roomverse-3d/index.html?lang=${lang}`);
    const record={mode,lang,width,height};
    record.entry=await page.locator("#enter").boundingBox();
    for(const state of ["poster","room"]){
      if(state==="room"){
        await page.locator("#enter").click(); await page.waitForFunction(()=>window.__room,null,{timeout:60000});
        await page.evaluate(async()=>{await window.__room.loadTvWallTextures();await window.__room.loadDoorTexture();window.__room.setOrbitAngle(0);scrollTo(0,0);});
        record.tv=await page.locator(".camera-tv").boundingBox();
      }
      const bytes=await page.screenshot();
      execFileSync("python",["-c","import sys,io;from PIL import Image;Image.open(io.BytesIO(sys.stdin.buffer.read())).save(sys.argv[1],'WEBP',lossless=True,method=6)",`${root}/${mode}-${lang}-${width}x${height}-${state}.webp`],{input:bytes});
    }
    record.stage=await page.locator("#stage").boundingBox();
    record.noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
    results.push(record);await page.close();
  }
}
await browser.close();await writeFile(`${root}/measurements.json`,JSON.stringify(results,null,2)+"\n");
console.log("Entry measurements and before/after images saved");
