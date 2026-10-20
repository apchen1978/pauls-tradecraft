import {chromium} from "playwright";
import {execFileSync} from "node:child_process";
import {readFile,writeFile} from "node:fs/promises";
const before=execFileSync("git",["show","dae7f06:public/prototype/roomverse-3d/app.js"],{encoding:"utf8",maxBuffer:2000000}),after=await readFile("public/prototype/roomverse-3d/app.js","utf8");
const browser=await chromium.launch({channel:"chrome",headless:true});
const result={method:"5 alternating fresh contexts per viewport, both app scripts route-fulfilled, cache disabled, CPU 4x, actual entry click to interactive canvas/controls",viewports:{}};
for(const[width,height]of[[1440,900],[390,844]]){
 const samples={before:[],after:[],newImageRequestsBeforeReady:[],decorObjectsBeforeReady:[]};
 for(let i=0;i<5;i++)for(const mode of i%2?["after","before"]:["before","after"]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1}),page=await context.newPage();
  await page.route("**/app.js?*",r=>r.fulfill({status:200,contentType:"text/javascript",body:mode==="before"?before:after}));
  await page.addInitScript(()=>document.addEventListener("click",e=>{if(e.target?.id==="enter")window.__clickedAt=performance.now()},true));
  const cdp=await context.newCDPSession(page);await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
  await page.goto(`${process.env.ROOM_QA_URL||"http://127.0.0.1:4188"}/prototype/roomverse-3d/index.html?lang=zh&mood=tv`);
  await page.locator("#enter").click();await page.waitForFunction(()=>window.__room&&document.querySelector("#stage canvas")&&document.querySelector(".camera-tv"),null,{timeout:60000});
  const data=await page.evaluate(()=>{const canvas=document.querySelector("#stage canvas"),gl=canvas.getContext("webgl2")||canvas.getContext("webgl"),ext=gl.getExtension("WEBGL_debug_renderer_info");return{ms:Math.round(performance.now()-window.__clickedAt),requests:performance.getEntriesByType("resource").filter(r=>r.name.includes("console-art-river-v1.webp")).length,objects:window.__room.consoleDetails?.().objects.length||0,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}});
  samples[mode].push(data.ms);if(mode==="after"){samples.newImageRequestsBeforeReady.push(data.requests);samples.decorObjectsBeforeReady.push(data.objects)}result.gpu=data.gpu;
  console.log(width,mode,i+1,data.ms);await context.close();
 }
 for(const mode of["before","after"])samples[`${mode}Median`]=[...samples[mode]].sort((a,b)=>a-b)[2];samples.changeMs=samples.afterMedian-samples.beforeMedian;result.viewports[width]=samples;
}
await browser.close();await writeFile("docs/qa/roomverse-console-decor/loading.json",JSON.stringify(result,null,2)+"\n");console.log(JSON.stringify(result,null,2));
