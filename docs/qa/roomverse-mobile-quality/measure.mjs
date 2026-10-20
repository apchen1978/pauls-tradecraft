import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4189/prototype/roomverse-3d/index.html';
const appPath='public/prototype/roomverse-3d/app.js';
const restore=await fs.readFile(appPath,'utf8');
const source=execFileSync('git',['show','e9e43b5:'+appPath],{encoding:'utf8'});
const original='  const compactRender = matchMedia("(max-width: 600px)").matches;\n  const renderer = new THREE.WebGLRenderer({ antialias: !compactRender });\n  renderer.setPixelRatio(Math.min(devicePixelRatio, compactRender ? 1.25 : 2));';
const configs={
  current:{source},
  pre97:{source:source.replace(original,'  const compactRender = matchMedia("(max-width: 600px)").matches;\n  const renderer = new THREE.WebGLRenderer({ antialias: true });\n  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));')},
  antialias15:{source:source.replace(original,'  const compactRender = matchMedia("(max-width: 600px)").matches;\n  const renderer = new THREE.WebGLRenderer({ antialias: true });\n  renderer.setPixelRatio(Math.min(devicePixelRatio, compactRender ? 1.5 : 2));')},
  antialias175:{source:source.replace(original,'  const compactRender = matchMedia("(max-width: 600px)").matches;\n  const renderer = new THREE.WebGLRenderer({ antialias: true });\n  renderer.setPixelRatio(Math.min(devicePixelRatio, compactRender ? 1.75 : 2));')},
  adaptive:{source:source.replace(original,'  const compactRender = matchMedia("(max-width: 600px)").matches;\n  const renderer = new THREE.WebGLRenderer({ antialias: true });\n  let adaptiveRatio = Math.min(devicePixelRatio, compactRender ? 1.75 : 2);\n  renderer.setPixelRatio(adaptiveRatio);\n  let adaptiveTimes = [], lastAdaptiveChange = 0;').replace('  function render() { renderer.render(scene, camera); }','  function render() {\n    renderer.render(scene, camera);\n    if (compactRender) {\n      const now = performance.now(); adaptiveTimes.push(now); adaptiveTimes = adaptiveTimes.filter((t) => now - t <= 900);\n      if (adaptiveTimes.length >= 20 && now - lastAdaptiveChange > 900) {\n        const fps = (adaptiveTimes.length - 1) * 1000 / (adaptiveTimes.at(-1) - adaptiveTimes[0]);\n        const next = fps < 47 ? Math.max(1.25, adaptiveRatio - .25) : fps > 58 ? Math.min(Math.min(devicePixelRatio, 1.75), adaptiveRatio + .25) : adaptiveRatio;\n        if (next !== adaptiveRatio) { adaptiveRatio = next; renderer.setPixelRatio(next); lastAdaptiveChange = now; }\n      }\n    }\n  }')},
};
if(!configs.antialias15.source.includes('Math.min(devicePixelRatio, compactRender ? 1.5 : 2)')||!configs.adaptive.source.includes('adaptiveTimes')) throw new Error('Variant source patch failed');
const browser=await chromium.launch({channel:'chrome',headless:true}); const rows=[];
try {
for(const dpr of [2,3]) for(const cpu of [1,4]) for(const [name,cfg] of Object.entries(configs)) {
 await fs.writeFile(appPath,cfg.source);
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:dpr,reducedMotion:'no-preference'}); const page=await context.newPage();
 const cdp=await context.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
 await page.addInitScript(()=>{let draws=0,times=[];for(const C of [window.WebGLRenderingContext,window.WebGL2RenderingContext])if(C)for(const method of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'])if(C.prototype[method]){const orig=C.prototype[method];C.prototype[method]=function(...args){draws++;return orig.apply(this,args);};}const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=(cb)=>raf(t=>{const before=draws;cb(t);if(draws>before)times.push(t);});window.__frameSamples=()=>{const v=times.slice();times=[];const fps=v.slice(1).map((t,i)=>1000/(t-v[i])).filter(x=>Number.isFinite(x)&&x>0);fps.sort((a,b)=>a-b);return{frames:v.length,p50:fps.length?fps[Math.floor(fps.length*.5)]:null,min:fps.length?fps[0]:null};};});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'?lang=zh&mood=tv');await page.locator('#enter').click();await page.waitForFunction(()=>window.__room,null,{timeout:60000});await page.waitForTimeout(2400);
 const attrs=await page.locator('canvas').evaluate(c=>({width:c.width,height:c.height,antialias:c.getContext('webgl2')?.getContextAttributes()?.antialias}));const stem=`${name}-dpr${dpr}-cpu${cpu}`;
 if(cpu===1){await page.evaluate(()=>window.__room.setOrbitAngle(0));await page.locator('#stage canvas').screenshot({path:`docs/qa/roomverse-mobile-quality/${stem}-window.webp`,type:'webp',quality:100});await page.evaluate(()=>window.__room.setOrbitAngle(180));await page.locator('#stage canvas').screenshot({path:`docs/qa/roomverse-mobile-quality/${stem}-tv.webp`,type:'webp',quality:100});}
 const startup=await page.evaluate(()=>window.__frameSamples());await page.evaluate(()=>window.__room.setOrbitAngle(0));await page.waitForTimeout(600);const idle=await page.evaluate(()=>window.__frameSamples());await page.mouse.move(160,410);await page.mouse.down();for(let i=1;i<=48;i++){await page.mouse.move(160+i*2,410+Math.sin(i/8)*3);await page.waitForTimeout(18);}await page.mouse.up();const rotate=await page.evaluate(()=>window.__frameSamples());
 await page.locator('#panelToggle').evaluate(b=>{if(b.offsetParent&&b.getAttribute('aria-expanded')==='false')b.click();});await page.locator('.director').click();await page.locator('.director-stop').waitFor({state:'visible',timeout:60000});await page.waitForTimeout(3900);if(cpu===1)await page.locator('#stage canvas').screenshot({path:`docs/qa/roomverse-mobile-quality/${stem}-tour-mid.webp`,type:'webp',quality:100});const tour=await page.evaluate(()=>window.__frameSamples());
 rows.push({config:name,dpr,cpu,canvas:attrs,startup,staticIdle:idle,manualRotate:rotate,tourMid:tour,errors});console.log(name,'DPR',dpr,'CPU',cpu,'canvas',attrs.width+'x'+attrs.height,'startup',startup,'staticIdle',idle,'rotate',rotate,'tour',tour,'errors',errors.length);await context.close();
}
} finally {
 await fs.writeFile(appPath,restore);
 await browser.close();
}
await fs.writeFile('docs/qa/roomverse-mobile-quality/measurements.json',JSON.stringify({note:'Chromium emulation, not physical phones; static idle uses on-demand rendering, so sustained GPU FPS is not applicable.',runs:rows},null,2));
