// verify-live-lead-card.mjs — final live verification of the integrated Lead Discovery card
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "https://paulstradecraft.com/";
const DEMO = "https://apchen1978.github.io/overseas-lead-discovery-demo/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dir = mkdtempSync(join(tmpdir(), "ldlive2-"));
  const c = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=9259", "--remote-allow-origins=*", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) { try { const r = await fetch("http://127.0.0.1:9259/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {} await sleep(400); }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const events = [];
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    if (m.method === "Runtime.exceptionThrown") events.push("EXC");
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") events.push("LOG");
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.navigate", { url: URL });
  await sleep(4500);
  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); return r.result?.value; };

  const r = {};
  r.viewport = await ev("`${document.documentElement.clientWidth}px`");
  r.overflow = await ev("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1");
  r.cardFound = await ev(`[...document.querySelectorAll('h3')].some(h => /Lead Discovery|海外客戶開發/.test(h.textContent))`);
  r.ctaHref = await ev(`(() => { const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent)); const a = h && h.closest('article').querySelector('a[href]'); return a ? a.href : null; })()`);
  // Expand and read evidence
  await ev(`(() => { const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent)); const s = h && h.closest('article').querySelector('details summary'); s && s.click(); return 1; })()`);
  await sleep(400);
  const txt = (await ev(`(() => { const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent)); return h ? h.closest('article').innerText : ''; })()`)).toLowerCase();
  r.precisionPending = txt.includes("precision@20: pending") || txt.includes("precision@20: pending");
  r.notProven = txt.includes("not proven") || txt.includes("未證明");
  r.noOutreach = txt.includes("no outreach") || txt.includes("未進行 outreach");
  r.anonymized = txt.includes("anonymized") || txt.includes("脫敏");
  // switch to EN and re-check EN phrasing
  await ev(`[...document.querySelectorAll('button')].find(b => /^EN$/.test(b.textContent.trim()))?.click()`);
  await sleep(700);
  const txtEn = (await ev(`(() => { const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent)); return h ? h.closest('article').innerText : ''; })()`)).toLowerCase();
  r.enPrecisionPending = txtEn.includes("precision@20: pending");
  r.enNotProven = txtEn.includes("not proven");
  r.enNoOutreach = txtEn.includes("no outreach performed");
  r.enAnonymized = txtEn.includes("anonymized");
  r.enCta = await ev(`(() => { const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent)); const a = h && h.closest('article').querySelector('a[href]'); return a ? a.textContent.trim() : null; })()`);
  // No real prospect names leaked
  const real = ["hmtx", "metroflor", "msi", "floor & decor", "cali bamboo", "brewster", "roysons", "wallpaper imports", "kravet", "mdc interior", "lions floor", "emser", "bedrosians", "provenza", "turnils", "global linen", "c&f enterprises", "ll flooring", "karndean", "phillip jeffries", "uttermost", "global views", "nourison", "sellers & josephson", "seabrook", "astek", "goldcrest", "fabricut", "kneedler"];
  r.leaks = real.filter((n) => txt.includes(n));
  r.consoleEvents = events;
  r.heroUnchanged = await ev(`(() => { const h1 = document.querySelector('section#top h1'); return h1 ? h1.innerText.length > 0 : null; })()`);
  r.featuredBandIntact = await ev("document.body.innerText.includes('試試付款原型') || document.body.innerText.includes('Try the Payment Prototype')");

  console.log("=== LIVE LEAD CARD VERIFICATION (390px) ===");
  console.log(JSON.stringify(r, null, 2));
  const pass = r.cardFound && r.ctaHref === DEMO && r.precisionPending && r.notProven && r.noOutreach && r.anonymized
    && r.enPrecisionPending && r.enNotProven && r.enNoOutreach && r.enAnonymized
    && /Try Qualification Demo/.test(r.enCta || "")
    && r.leaks.length === 0 && !r.overflow && r.consoleEvents.length === 0 && r.heroUnchanged && r.featuredBandIntact;
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;
  ws.close(); c.kill();
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
