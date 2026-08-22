// verify-mg-v2.mjs — verify the upgraded MG Mini Demo (real running, direction, cute one-shot)
// Runs against the local build served over HTTP; checks frames, idle, drag + running,
// direction (left/right), wave, cute (one-shot → idle), jump, sleep, wake, reset,
// no console errors, no unexpected network, 390px no page overflow, touch usable.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../public/mg-mini-demo/", import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9343;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (p === "/") p = "/index.html";
  const file = normalize(join(ROOT, p));
  if (!file.startsWith(normalize(ROOT)) || !existsSync(file)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const userData = mkdtempSync(join(tmpdir(), "mg-v2-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9244", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9244/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
    await sleep(400);
  }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const events = [];
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    if (m.method === "Runtime.exceptionThrown") events.push("EXCEPTION: " + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text || ""));
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") events.push("CONSOLE: " + m.params.entry.text);
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable"); await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: Number(process.env.MG_WIDTH || 390), height: Number(process.env.MG_HEIGHT || 844), deviceScaleFactor: 2, mobile: process.env.MG_MOBILE !== "0" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  await sleep(3500);

  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); return r.result?.value; };

  const results = {};
  results.viewport = await ev("`${document.documentElement.clientWidth}px`");
  results.pageOverflow = await ev("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1");
  results.title = await ev("document.title");
  results.framesLoaded = await ev(`(() => {
    const imgs = [...document.images];
    return imgs.every(im => im.complete && im.naturalWidth > 0) ? true : imgs.filter(im => !im.complete || im.naturalWidth === 0).map(im => im.src);
  })()`);
  results.truthfulLabels = await ev("document.body.innerText.includes('Web Mini Demo / Portfolio Adaptation') && document.body.innerText.includes('not the complete desktop application')");

  // idle animates
  const s1 = await ev("document.getElementById('petImg').src");
  await sleep(500);
  const s2 = await ev("document.getElementById('petImg').src");
  results.idleAnimates = s1 !== s2;

  // Drag: pointer down + move → should show run frames (real running, not idle)
  const dragRun = await ev(`(async () => {
    const pet = document.getElementById('pet');
    const stage = document.getElementById('stage');
    const sr = stage.getBoundingClientRect();
    const pr = pet.getBoundingClientRect();
    const startX = pr.left + pr.width / 2, startY = pr.top + pr.height / 2;
    const opts = { pointerId: 7, bubbles: true, cancelable: true, pointerType: 'mouse', isPrimary: true, clientX: startX, clientY: startY };
    pet.dispatchEvent(new PointerEvent('pointerdown', opts));
    pet.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: startX + 80, clientY: startY + 40 }));
    pet.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: startX + 160, clientY: startY + 80 }));
    const during = document.getElementById('petImg').src;
    pet.dispatchEvent(new PointerEvent('pointerup', { ...opts, clientX: startX + 160, clientY: startY + 80 }));
    return new Promise(r => setTimeout(() => {
      const after = pet.getBoundingClientRect();
      const isRun = /running/.test(during);
      const isRunLeft = /running-left/.test(during);
      const isRunRight = /running-right/.test(during);
      r({ moved: Math.abs(after.left - pr.left) > 30, runFrames: isRun, runLeft: isRunLeft, runRight: isRunRight, sample: during.split('/').pop() });
    }, 200));
  })()`);
  results.dragRun = dragRun;

  // Drag left → run-left frames
  const dragLeft = await ev(`(async () => {
    const pet = document.getElementById('pet');
    const pr = pet.getBoundingClientRect();
    const sx = pr.left + pr.width / 2, sy = pr.top + pr.height / 2;
    const opts = { pointerId: 8, bubbles: true, cancelable: true, pointerType: 'mouse', isPrimary: true, clientX: sx, clientY: sy };
    pet.dispatchEvent(new PointerEvent('pointerdown', opts));
    pet.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: sx - 60, clientY: sy }));
    pet.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: sx - 120, clientY: sy }));
    const during = document.getElementById('petImg').src;
    pet.dispatchEvent(new PointerEvent('pointerup', { ...opts, clientX: sx - 120, clientY: sy }));
    return new Promise(r => setTimeout(() => r(/running-left/.test(during)), 200));
  })()`);
  results.dragLeftUsesLeftFrames = dragLeft;

  // Wave → one-shot → idle
  await ev("document.getElementById('btnWave').click()");
  await sleep(120);
  results.waveSrc = await ev("document.getElementById('petImg').src.includes('waving/')");
  await sleep(900);
  results.waveReturnsToIdle = await ev("document.getElementById('petImg').src.includes('idle/')");

  // Cute → one-shot (loop:false) → idle
  await ev("document.getElementById('btnCute').click()");
  await sleep(120);
  results.cuteSrc = await ev("(/jumping|waving/.test(document.getElementById('petImg').src))");
  await sleep(1900); // 9 frames × 150ms + idle return
  results.cuteReturnsToIdle = await ev("document.getElementById('petImg').src.includes('idle/')");

  // Jump
  await ev("document.getElementById('btnJump').click()");
  await sleep(80);
  results.jumpSrc = await ev("document.getElementById('petImg').src.includes('jumping/')");
  await sleep(700);
  results.jumpReturnsToIdle = await ev("document.getElementById('petImg').src.includes('idle/')");

  // Sleep → wake on tap (no drag)
  await ev("document.getElementById('btnSleep').click()");
  await sleep(120);
  results.sleepSrc = await ev("document.getElementById('petImg').src.includes('failed/')");
  await ev(`(() => {
    const pet = document.getElementById('pet');
    const pr = pet.getBoundingClientRect();
    const opts = { pointerId: 9, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true, clientX: pr.left + 20, clientY: pr.top + 20 };
    pet.dispatchEvent(new PointerEvent('pointerdown', opts));
    pet.dispatchEvent(new PointerEvent('pointerup', opts));
    return 'tap';
  })()`);
  await sleep(150);
  results.wakeSrc = await ev("document.getElementById('petImg').src.includes('waiting/')");
  await sleep(1200);
  results.wakeReturnsToIdle = await ev("document.getElementById('petImg').src.includes('idle/')");

  // Reset centers + idle
  await ev("document.getElementById('btnReset').click()");
  await sleep(200);
  results.reset = await ev(`(() => {
    const pet = document.getElementById('pet');
    const pr = pet.getBoundingClientRect();
    const sr = document.getElementById('stage').getBoundingClientRect();
    return { centered: Math.abs((pr.left + pr.width/2) - (sr.left + sr.width/2)) < 5, idle: document.getElementById('petImg').src.includes('idle/') };
  })()`);

  // Touch drag
  const touch = await ev(`(async () => {
    const pet = document.getElementById('pet');
    const pr = pet.getBoundingClientRect();
    const opts = { pointerId: 11, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true, clientX: pr.left + 10, clientY: pr.top + 10 };
    pet.dispatchEvent(new PointerEvent('pointerdown', opts));
    pet.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: pr.left + 90, clientY: pr.top + 30 }));
    pet.dispatchEvent(new PointerEvent('pointerup', { ...opts, clientX: pr.left + 90, clientY: pr.top + 30 }));
    return new Promise(r => setTimeout(() => {
      const after = pet.getBoundingClientRect();
      r({ moved: Math.abs(after.left - pr.left) > 5 });
    }, 200));
  })()`);
  results.touch = touch;

  await ev("window.scrollTo(0, document.body.scrollHeight)");
  await sleep(300);
  results.overflowAtBottom = await ev("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1");

  results.hasUnexpectedNetwork = await ev(`performance.getEntriesByType('resource').some(r => !/^https?:\\/\\/127\\.0\\.0\\.1:9343\\//.test(r.name))`);
  results.consoleEvents = events;

  console.log(`=== MG MINI DEMO v2 VERIFICATION @${process.env.MG_WIDTH || 390}px ===`);
  console.log(JSON.stringify(results, null, 2));

  const pass = results.pageOverflow === false
    && results.framesLoaded === true
    && results.idleAnimates
    && results.dragRun.moved && (results.dragRun.runFrames || results.dragRun.runRight) && !results.dragRun.runLeft
    && results.dragLeftUsesLeftFrames
    && results.waveSrc && results.waveReturnsToIdle
    && results.cuteSrc && results.cuteReturnsToIdle
    && results.jumpSrc && results.jumpReturnsToIdle
    && results.sleepSrc
    && results.wakeSrc && results.wakeReturnsToIdle
    && results.reset.centered && results.reset.idle
    && results.touch.moved
    && results.overflowAtBottom === false
    && results.hasUnexpectedNetwork === false
    && results.consoleEvents.length === 0
    && results.truthfulLabels;
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;

  ws.close(); chrome.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch {}
  server.close();
})().catch((e) => { console.error("VERIFICATION ERROR:", e.message); process.exitCode = 1; });
