import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { readFile,writeFile } from "node:fs/promises";
const root="docs/qa/roomverse-postcard-footer";
const before=execFileSync("git",["show","dae7f06:public/prototype/roomverse-3d/app.js"],{encoding:"utf8",maxBuffer:2000000});
const after=await readFile("public/prototype/roomverse-3d/app.js","utf8");
const browser=await chromium.launch({channel:"chrome",headless:true}), results=[];
for(const lang of ["zh","en"]){
  for(const [width,height,dpr] of [[390,844,1],[390,844,1.25],[1440,900,1]]){
    for(const mode of ["before","after"]){
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,reducedMotion:"reduce"});
      const page=await context.newPage();
      await page.route("**/app.js?*",route=>route.fulfill({status:200,contentType:"text/javascript",body:mode==="before"?before:after}));
      await page.goto(`http://127.0.0.1:4187/prototype/roomverse-3d/index.html?lang=${lang}&mood=tv&wall=original`);
      await page.locator("#enter").click();await page.waitForFunction(()=>window.__room,null,{timeout:60000});
      await page.evaluate(async()=>{await window.__room.loadTvWallTextures();await window.__room.loadDoorTexture();window.__room.setOrbitAngle(0);});
      const data=await page.evaluate(()=>{
        const original=CanvasRenderingContext2D.prototype.fillText,calls=[];
        CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...rest){
          if(text==="ROOMVERSE 3D"||text==="paulstradecraft.com"){
            const width=this.measureText(text).width;
            calls.push({text,left:this.textAlign==="right"?x-width:x,right:this.textAlign==="right"?x:x+width,y,font:this.font});
          }return original.call(this,text,x,y,...rest);
        };
        try{const card=window.__room.postcard();return{png:card.toDataURL("image/png"),width:card.width,height:card.height,sceneHeight:document.querySelector("#stage canvas").height,calls};}
        finally{CanvasRenderingContext2D.prototype.fillText=original;}
      });
      const file=`${mode}-${lang}-${width}-dpr${dpr}.png`;
      await writeFile(`${root}/${file}`,Buffer.from(data.png.split(",")[1],"base64"));delete data.png;
      results.push({mode,lang,viewport:width,dpr,file,...data});await context.close();
    }
  }
}
await browser.close();await writeFile(`${root}/measurements.json`,JSON.stringify(results,null,2)+"\n");console.log("Postcard before/after PNGs saved");
