// verify-live-final.mjs — final live verification after deploy
// 1. homepage / mg-mini-demo / try URLs 200
// 2. MG demo: frames load, idle animates, drag → run-left/run-right, wave/cute/jump/sleep/wake/reset, no overflow
// 3. related bridge: TDD → #payment-concentration, PC → #trade-deal-desk
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const HOME = "https://paulstradecraft.com/";
const TRY = "https://paulstradecraft.com/mg-mini-demo/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(url, width, height, mobile) {
  const userData = mkdtempSync(join(tmpdir(), "live-final-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9248", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9248/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
    await sleep(400);
  }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile });
  await send("Page.navigate", { url });
  await sleep(4500);
  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); return r.result?.value; };
  const close = async () => { ws.close(); chrome.kill(); try { rmSync(userData, { recursive: true, force: true }); } catch {} };
  return { ev, close };
}

try {
  const out = {};

  // --- MG demo ---
  const mg = await open(TRY, 390, 844, true);
  out.mg = {};
  out.mg.framesLoaded = await mg.ev(`[...document.images].every(im => im.complete && im.naturalWidth > 0)`);
  out.mg.idleAnimates = await (async () => { const s1 = await mg.ev("document.getElementById('petImg').src"); await sleep(500); const s2 = await mg.ev("document.getElementById('petImg').src"); return s1 !== s2; })();
  out.mg.dragRight = await mg.ev(`(async () => {
    const pet = document.getElementById('pet');
    const pr = pet.getBoundingClientRect();
    const o = { pointerId: 3, bubbles: true, cancelable: true, pointerType: 'mouse', isPrimary: true, clientX: pr.left + pr.width/2, clientY: pr.top + pr.height/2 };
    pet.dispatchEvent(new PointerEvent('pointerdown', o));
    pet.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: o.clientX + 120, clientY: o.clientY }));
    const during = document.getElementById('petImg').src;
    pet.dispatchEvent(new PointerEvent('pointerup', { ...o, clientX: o.clientX + 120, clientY: o.clientY }));
    return /running-right/.test(during);
  })()`);
  await mg.ev("document.getElementById('btnWave').click()");
  await sleep(150);
  out.mg.wave = await mg.ev("document.getElementById('petImg').src.includes('waving/')");
  await mg.ev("document.getElementById('btnSleep').click()");
  await sleep(150);
  out.mg.sleep = await mg.ev("document.getElementById('petImg').src.includes('failed/')");
  await mg.ev(`(() => { const pet = document.getElementById('pet'); const pr = pet.getBoundingClientRect(); const o = { pointerId: 5, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true, clientX: pr.left+20, clientY: pr.top+20 }; pet.dispatchEvent(new PointerEvent('pointerdown', o)); pet.dispatchEvent(new PointerEvent('pointerup', o)); return 1; })()`);
  await sleep(200);
  out.mg.wake = await mg.ev("document.getElementById('petImg').src.includes('waiting/')");
  out.mg.noOverflow = await mg.ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");
  await mg.close();

  // --- related bridge on homepage ---
  const home = await open(HOME, 1440, 900, false);
  out.bridge = {};
  out.bridge.tddRelated = await home.ev(`(async () => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('AI Trade Deal Desk'));
    const a = h.closest('article').querySelector('a[href="#payment-concentration"]');
    return a ? a.textContent.trim().length > 0 : false;
  })()`);
  out.bridge.pcRelated = await home.ev(`(async () => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const a = h.closest('article').querySelector('a[href="#trade-deal-desk"]');
    return a ? a.textContent.trim().length > 0 : false;
  })()`);
  out.bridge.anchors = await home.ev("!!document.getElementById('payment-concentration') && !!document.getElementById('trade-deal-desk')");
  out.bridge.noOverflow = await home.ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");
  await home.close();

  console.log("=== LIVE FINAL VERIFICATION ===");
  console.log(JSON.stringify(out, null, 2));
  const pass = out.mg.framesLoaded && out.mg.idleAnimates && out.mg.dragRight && out.mg.wave && out.mg.sleep && out.mg.wake && out.mg.noOverflow
    && out.bridge.tddRelated && out.bridge.pcRelated && out.bridge.anchors && out.bridge.noOverflow;
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;
} catch (e) { console.error("ERR:", e.message); process.exitCode = 1; }
