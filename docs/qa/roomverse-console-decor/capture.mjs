import {chromium} from "playwright";
import {execFileSync} from "node:child_process";
import {readFile,writeFile} from "node:fs/promises";
const root="docs/qa/roomverse-console-decor",base=process.env.ROOM_QA_URL||"http://127.0.0.1:4188";
const before=execFileSync("git",["show","dae7f06:public/prototype/roomverse-3d/app.js"],{encoding:"utf8",maxBuffer:2000000});
const after=await readFile("public/prototype/roomverse-3d/app.js","utf8");
const browser=await chromium.launch({channel:"chrome",headless:true}),checks=[];
async function capture(page,name){const bytes=await page.locator("#stage").screenshot();execFileSync("python",["-c","import sys,io;from PIL import Image;Image.open(io.BytesIO(sys.stdin.buffer.read())).save(sys.argv[1],'WEBP',lossless=True,method=6)",`${root}/${name}.webp`],{input:bytes});}
for(const width of [1440,390]){
  for(const mode of ["before","after"]){
    const page=await browser.newPage({viewport:{width,height:width===390?844:900},deviceScaleFactor:1,reducedMotion:"reduce"});
    const errors=[];page.on("pageerror",e=>errors.push(String(e)));
    await page.route("**/app.js?*",route=>route.fulfill({status:200,contentType:"text/javascript",body:mode==="before"?before:after}));
    await page.goto(`${base}/prototype/roomverse-3d/index.html?lang=zh&mood=rain&wall=original&view=tv`);
    await page.locator("#enter").click();await page.waitForFunction(()=>window.__room,null,{timeout:60000});
    await page.evaluate(async()=>{await window.__room.loadTvWallTextures();await window.__room.loadDoorTexture();if(window.__room.loadConsoleDecor)await window.__room.loadConsoleDecor();});
    for(const [view,angle]of[["tv",180],["side",225],["window",0]]){
      await page.evaluate(a=>window.__room.setOrbitAngle(a),angle);await capture(page,`${mode}-rain-original-${view}-${width}`);
    }
    if(mode==="after"){
      for(const mood of ["family","tv"]){await page.evaluate(v=>window.__room.set("mood",v),mood);await page.waitForTimeout(500);await page.evaluate(()=>window.__room.setOrbitAngle(180));await capture(page,`after-${mood}-original-tv-${width}`);}
      await page.evaluate(()=>window.__room.set("mood","rain"));await page.waitForTimeout(500);
      for(const wall of ["pine","stripe","botanical"]){await page.evaluate(v=>window.__room.set("wall",v),wall);await page.waitForTimeout(400);await capture(page,`after-rain-${wall}-tv-${width}`);}
      await page.evaluate(()=>window.__room.set("wall","original"));
      checks.push({width,details:await page.evaluate(()=>window.__room.consoleDetails()),lights:await page.evaluate(()=>window.__room.tableLampLighting().lightCount),errors,noOverflow:await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)});
    }
    const png=await page.evaluate(()=>window.__room.postcard().toDataURL("image/png"));await writeFile(`${root}/${mode}-postcard-${width}.png`,Buffer.from(png.split(",")[1],"base64"));
    await page.close();
  }
}
await browser.close();await writeFile(`${root}/visual-checks.json`,JSON.stringify(checks,null,2)+"\n");console.log("Console decor images saved");
