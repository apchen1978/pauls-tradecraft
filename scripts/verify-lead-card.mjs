// verify-lead-card.mjs — verify Lead Discovery card integration in portfolio build
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../dist/", import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9360;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".pdf": "application/pdf" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (p === "/") p = "/index.html";
  const f = normalize(join(ROOT, p));
  if (!f.startsWith(normalize(ROOT)) || !existsSync(f)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "Content-Type": MIME[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(width, height, mobile, lang) {
  const dir = mkdtempSync(join(tmpdir(), "ldcard-"));
  const c = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=9258", "--remote-allow-origins=*", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) { try { const r = await fetch("http://127.0.0.1:9258/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {} await sleep(400); }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const events = [];
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    if (m.method === "Runtime.exceptionThrown") events.push("EXC: " + (m.params.exceptionDetails?.exception?.description || ""));
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") events.push("LOG: " + m.params.entry.text);
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  await sleep(4000);
  if (lang === "en") {
    await send("Runtime.evaluate", { expression: `[...document.querySelectorAll('button')].find(b => /^EN$/.test(b.textContent.trim()))?.click()` });
    await sleep(700);
  }
  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); return r.result?.value; };

  const r = {};
  r.viewport = await ev("`${document.documentElement.clientWidth}px`");
  r.overflow = await ev("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1");
  // Find the Lead Discovery card
  r.cardFound = await ev(`[...document.querySelectorAll('h3')].some(h => /Lead Discovery|海外客戶開發/.test(h.textContent))`);
  r.cardTitle = await ev(`(() => { const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent)); return h ? h.textContent.trim() : null; })()`);
  r.coverRenders = await ev(`(async () => {
    const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent));
    const img = h ? h.closest('article').querySelector('img') : null;
    if (!img) return false;
    img.scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 600));
    return img.complete && img.naturalWidth > 0;
  })()`);
  r.ctaText = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.textContent.trim() : null;
  })()`);
  r.ctaHref = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.href : null;
  })()`);
  // Expand case study
  await ev(`(() => { const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent)); const s = h && h.closest('article').querySelector('details summary'); s && s.click(); return 1; })()`);
  await sleep(400);
  const text = await ev(`(() => { const h = [...document.querySelectorAll('h3')].find(h => /Lead Discovery|海外客戶開發/.test(h.textContent)); return h ? h.closest('article').innerText : ''; })()`);
  const lower = text.toLowerCase();
  r.showsProblem = lower.includes("hundreds of companies") || lower.includes("幾百家");
  r.showsPrecisionPending = lower.includes("precision@20: pending") || lower.includes("precision@20: pending");
  r.showsNotProven = lower.includes("not proven") || lower.includes("未證明") || lower.includes("未證明");
  r.showsNoOutreach = lower.includes("no outreach") || lower.includes("未進行 outreach");
  r.shows4420 = lower.includes("44") && lower.includes("20");
  r.showsAnonymized = lower.includes("anonymized") || lower.includes("脫敏");
  r.showsWhyNot = lower.includes("why not") || lower.includes("矛盾");

  await ev("window.scrollTo(0, document.body.scrollHeight)");
  await sleep(300);
  r.overflowBottom = await ev("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1");
  r.consoleEvents = events;

  ws.close(); c.kill();
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  return r;
}

try {
  await new Promise((r) => server.listen(PORT, r));
  console.log("=== ZH DESKTOP 1440px ===");
  const zd = await check(1440, 900, false, "zh");
  console.log(JSON.stringify(zd, null, 2));
  console.log("=== ZH MOBILE 390px ===");
  const zm = await check(390, 844, true, "zh");
  console.log(JSON.stringify(zm, null, 2));
  console.log("=== EN DESKTOP 1440px ===");
  const ed = await check(1440, 900, false, "en");
  console.log(JSON.stringify(ed, null, 2));

  const DEMO = "https://apchen1978.github.io/overseas-lead-discovery-demo/";
  const pass = (r) => r.cardFound && r.coverRenders && r.ctaText && r.ctaHref === DEMO
    && r.showsProblem && r.showsPrecisionPending && r.showsNotProven && r.showsNoOutreach
    && r.shows4420 && r.showsAnonymized && r.showsWhyNot
    && !r.overflow && !r.overflowBottom && r.consoleEvents.length === 0;
  const ok = pass(zd) && pass(zm) && pass(ed);
  console.log(ok ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = ok ? 0 : 1;
} catch (e) { console.error("ERR:", e.message); process.exitCode = 1; } finally { server.close(); }
