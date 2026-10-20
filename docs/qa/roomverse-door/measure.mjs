import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
const baseline = execFileSync("git", ["show", "03edca7:public/prototype/roomverse-3d/app.js"], { encoding: "utf8", maxBuffer: 2000000 });
const base = process.env.ROOM_QA_URL || "http://127.0.0.1:4186";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const result = { method: "5 alternating fresh-context runs; Chrome; cache disabled; 4x CPU; actual enter click to canvas and controls ready; same machine", viewports: {} };
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const samples = { before: [], after: [], afterInitialDoorRequests: [] };
  for (let i = 0; i < 5; i++) {
    for (const mode of i % 2 ? ["after", "before"] : ["before", "after"]) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      await page.addInitScript(() => document.addEventListener("click", (e) => { if (e.target?.id === "enter") window.__clickedAt = performance.now(); }, true));
      if (mode === "before") await page.route("**/app.js?*", (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: baseline }));
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await page.goto(`${base}/prototype/roomverse-3d/index.html?lang=zh&mood=tv`);
      await page.locator("#enter").click();
      await page.waitForFunction(() => window.__room && document.querySelector("#stage canvas") && document.querySelector(".camera-tv"), null, { timeout: 60000 });
      const value = await page.evaluate(() => {
        const canvas = document.querySelector("#stage canvas"), gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        const debug = gl.getExtension("WEBGL_debug_renderer_info");
        return { ms: Math.round(performance.now() - window.__clickedAt), gpu: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
          doorRequests: performance.getEntriesByType("resource").filter((r) => r.name.includes("door-oak-v1.webp")).length };
      });
      result.gpu = value.gpu;
      samples[mode].push(value.ms);
      if (mode === "after") samples.afterInitialDoorRequests.push(value.doorRequests);
      console.log(width, mode, i + 1, value.ms);
      await context.close();
    }
  }
  for (const mode of ["before", "after"]) samples[`${mode}Median`] = [...samples[mode]].sort((a, b) => a - b)[2];
  samples.changeMs = samples.afterMedian - samples.beforeMedian;
  result.viewports[width] = samples;
}
await browser.close();
await writeFile("docs/qa/roomverse-door/loading.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
