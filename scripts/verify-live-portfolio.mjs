// verify-live-portfolio.mjs — live verification of paulstradecraft.com after deploy
// Checks (desktop + 390px mobile):
//  - Payment Concentration case study card renders + expands with story fields
//  - Trade Deal Desk demo link unchanged (https://apchen1978.github.io/ai-trade-deal-desk-demo/)
//  - unpublished prototype still shows honest PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED
//  - no horizontal overflow
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "https://paulstradecraft.com/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(viewport) {
  const userData = mkdtempSync(join(tmpdir(), "live-verify-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9232", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });

  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9232/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
    await sleep(400);
  }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: viewport.w, height: viewport.h, deviceScaleFactor: 1, mobile: viewport.mobile });
  await send("Page.navigate", { url: URL });
  await sleep(5000);

  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true }); return r.result?.value; };
  const results = {};
  results.viewport = await ev("`${document.documentElement.clientWidth}px`");
  results.noHorizontalOverflow = await ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");
  results.pcCardFound = await ev(`[...document.querySelectorAll('h3')].some(h => h.textContent.includes('Payment Concentration'))`);
  results.pcCaseStudy = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    return h ? !!h.closest('article').querySelector('details summary') : false;
  })()`);
  results.pcCardNotLinked = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.href : null;
  })()`);
  await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const s = h && h.closest('article').querySelector('details summary');
    s && s.click();
    return 'ok';
  })()`);
  await sleep(600);
  const text = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    return h ? h.closest('article').innerText : '';
  })()`);
  results.showsProblem = text.includes("挑戰") || text.includes("Problem");
  results.showsApproach = text.includes("做法") || text.includes("Approach");
  results.showsResult = text.includes("成果") || text.includes("Result");
  results.showsEvidence = text.includes("驗證") || text.includes("Evidence");
  results.shows83k = text.includes("83,000");
  results.shows135k = text.includes("135,000");
  results.showsOct12 = text.includes("Oct 12") || text.includes("10-12");
  results.showsPublicEvidenceUnknown = text.includes("PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED");

  // Trade Deal Desk link unchanged
  results.tddLink = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('AI Trade Deal Desk'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.href : null;
  })()`);
  results.tddSeparate = await ev(`(() => {
    const t = [...document.querySelectorAll('h3')].filter(h => h.textContent.includes('AI Trade Deal Desk')).length;
    const p = [...document.querySelectorAll('h3')].filter(h => h.textContent.includes('Payment Concentration')).length;
    return t === 1 && p === 1;
  })()`);

  await ev("window.scrollTo(0, document.body.scrollHeight)");
  await sleep(400);
  results.overflowAtBottom = await ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");

  ws.close(); chrome.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch {}
  return results;
}

try {
  console.log("=== LIVE DESKTOP 1440px ===");
  const d = await check({ w: 1440, h: 900, mobile: false });
  console.log(JSON.stringify(d, null, 2));
  console.log("=== LIVE MOBILE 390px ===");
  const m = await check({ w: 390, h: 844, mobile: true });
  console.log(JSON.stringify(m, null, 2));

  const EXPECTED_TDD = "https://apchen1978.github.io/ai-trade-deal-desk-demo/";
  const pass = (r) => r.pcCardFound && r.pcCaseStudy && r.pcCardNotLinked === null
    && r.showsProblem && r.showsApproach && r.showsResult && r.showsEvidence
    && r.shows83k && r.shows135k && r.showsOct12 && r.showsPublicEvidenceUnknown
    && r.tddLink === EXPECTED_TDD && r.tddSeparate
    && r.noHorizontalOverflow && r.overflowAtBottom;
  const ok = pass(d) && pass(m);
  console.log(ok ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = ok ? 0 : 1;
} catch (err) {
  console.error("VERIFICATION ERROR:", err.message);
  process.exitCode = 1;
}
