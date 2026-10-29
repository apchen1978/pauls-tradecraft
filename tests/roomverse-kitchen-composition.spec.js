import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });
for (const [width,height] of [[1280,720],[1440,1000],[1920,1080]]) {
  test(`desktop camera framing ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({width,height});
    await page.goto('/prototype/roomverse-3d/kitchen/?lang=zh');
    await page.waitForFunction(() => window.__room03?.info().furniture.pendant === 'glb' && window.__room03.info().yardLoaded);
    const data = await page.evaluate(async () => {
      const r=window.__room03,c=r.camera,i=r.info(),T=await import('/prototype/roomverse-3d/vendor/three.module.min.js'),rect=document.querySelector('.room canvas').getBoundingClientRect();
      function project(box){let pts=[];for(const x of [box.min[0],box.max[0]])for(const y of [box.min[1],box.max[1]])for(const z of [box.min[2],box.max[2]]){let p=new T.Vector3(x,y,z).project(c);pts.push([(p.x+1)*rect.width/2,(1-p.y)*rect.height/2]);}return {left:Math.min(...pts.map(p=>p[0])),right:Math.max(...pts.map(p=>p[0])),top:Math.min(...pts.map(p=>p[1])),bottom:Math.max(...pts.map(p=>p[1]))};}
      return {camera:i.camera,target:i.cameraTarget,fov:i.cameraFov,vertices:i.vertices,meshes:i.meshes,calls:i.drawCallsLastFrame,canvas:[rect.width,rect.height],ball:project({min:[-.16,1.8075,-.01],max:[.16,2.1275,.31]}),hood:project(i.sceneBounds.hood)};
    });
    // Position [0,1.56,1.58] -> [.22,1.64,1.52] and target [0,1.48,0] -> [.05,1.50,.05] separate the globe from the hood.
    for(let i=0;i<3;i++){expect(data.camera[i]).toBeCloseTo([.22,1.64,1.52][i],3);expect(data.target[i]).toBeCloseTo([.05,1.50,.05][i],3)}
    expect(data.fov).toBe(62); expect(data.vertices).toBe(47680); expect(data.meshes).toBe(105); expect(data.calls).toBeLessThanOrEqual(75); // 72 -> 75: dish dryer, credenza and robot are in the opening view; // Old 39,105/96 -> 47,680/99: living details add 2,498 vertices and 3 meshes; call cap stays 72.
    for(const box of [data.ball,data.hood]){expect(box.top).toBeGreaterThanOrEqual(20);expect(box.left).toBeGreaterThanOrEqual(0);expect(box.right).toBeLessThanOrEqual(data.canvas[0]);expect(box.bottom).toBeLessThanOrEqual(data.canvas[1]);}
    expect(data.ball.right).toBeLessThan(data.hood.left);
    if(QA) await page.locator('.room').screenshot({path:`${QA}/pr1-golden-${width}.png`});
    console.log('FRAMING',width,JSON.stringify(data));
  });
}
test('desktop and mobile complete a 10-degree orbit sweep',async ({page})=>{
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:width===390?844:1000}); await page.goto('/prototype/roomverse-3d/kitchen/?lang=zh');
    await page.waitForFunction(()=>window.__room03?.info().furniture.table==='glb' && window.__room03.info().yardLoaded);
    // Orbit sweep snapshot: 39,105/96 -> 47,680/99 (+2,498 vertices, +3 meshes); each view must still render.
    for(let deg=0;deg<360;deg+=10){const info=await page.evaluate(d=>{let r=window.__room03;r.setView(d*Math.PI/180);return r.info()},deg);expect(info.camera.every(Number.isFinite)).toBe(true);expect(info.vertices).toBe(47680);expect(info.meshes).toBe(105);expect(info.drawCallsLastFrame).toBeGreaterThan(0);}
  }
});
