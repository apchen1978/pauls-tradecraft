// verify-conversion-build.mjs — verify the Portfolio Conversion Build (pre-commit)
// Desktop 1440px + mobile 390px:
//  - identity preserved (hero headline intact, CTA buttons intact)
//  - commercial engagement layer present: three bounded offers + direct CTA
//  - CDD featured work offers both demo and bring-a-live-case paths
//  - Trade Deal Desk card link unchanged
//  - Payment Concentration card now links to the Try surface
//  - Trade Deal Desk evidence corrected: 13/13 + 5/5
//  - Trade Deal Desk execution-safety fixture disclosed as local-only 9/9 evidence
//  - no horizontal overflow
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9334;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".pdf": "application/pdf" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (p === "/") p = "/index.html";
  const file = normalize(join(ROOT, "dist", p));
  if (!file.startsWith(normalize(join(ROOT, "dist"))) || !existsSync(file)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(viewport) {
  const userData = mkdtempSync(join(tmpdir(), "conv-verify-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9234", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });

  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9234/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
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
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  await sleep(4000);

  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true }); return r.result?.value; };
  const results = {};
  results.viewport = await ev("`${document.documentElement.clientWidth}px`");
  results.noHorizontalOverflow = await ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");

  // Identity preserved
  results.heroHeadline = await ev("document.querySelector('h1') ? document.querySelector('h1').innerText : ''");
  results.heroCTAs = await ev(`[...document.querySelectorAll('section#top a')].map(a => a.textContent.trim()).filter(Boolean)`);

  const heroText = await ev("document.querySelector('section#top').innerText");
  results.heroPrimaryCta = results.heroCTAs.includes("討論商業 Pilot");
  results.heroSecondaryCta = results.heroCTAs.includes("查看商業系統");
  results.engagementLayer = await ev(`(() => {
    const text = document.querySelector('#capabilities')?.innerText || '';
    return ['Overseas Growth Pilot', 'Deal Readiness Review', 'Commercial Control Sprint', '支援能力']
      .every((label) => text.includes(label));
  })()`);
  results.engagementCta = await ev(`(() => {
    const a = [...document.querySelectorAll('#capabilities a[href="#contact"]')].find(a => a.textContent.includes('討論商業 Pilot'));
    return a ? a.href : null;
  })()`);
  results.cddCaseInvite = await ev(`(() => {
    const a = document.querySelector('a[data-featured-copy][href="#contact"]');
    return a ? a.textContent.trim() : null;
  })()`);
  results.contactCta = await ev(`(() => {
    const a = document.querySelector('#contact a[href^="mailto:"]');
    return a ? a.textContent.trim() : null;
  })()`);

  // Trade Deal Desk card
  results.tddLink = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('AI Trade Deal Desk'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.href : null;
  })()`);

  // Payment Concentration card link (now the Try surface)
  results.pcLink = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.href : null;
  })()`);
  results.pcLinkLabel = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.textContent.trim() : null;
  })()`);

  // Trade Deal Desk evidence corrected (13/13, 5/5)
  await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('AI Trade Deal Desk'));
    const s = h && h.closest('article').querySelector('details summary');
    s && s.click();
    return 'ok';
  })()`);
  await sleep(600);
  const tddText = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('AI Trade Deal Desk'));
    return h ? h.closest('article').innerText : '';
  })()`);
  results.tddEvidence1313 = tddText.includes("13/13");
  results.tddEvidence55 = tddText.includes("5/5");
  results.tddFixtureSafety = tddText.includes("9/9") && tddText.includes("無外部 Adapter");
  results.tddNoStale1212 = !tddText.includes("12/12") && !tddText.includes("3/3");

  // Payment Concentration evidence: published + prototype-only status
  await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const s = h && h.closest('article').querySelector('details summary');
    s && s.click();
    return 'ok';
  })()`);
  await sleep(600);
  const pcText = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    return h ? h.closest('article').innerText : '';
  })()`);
  results.pcPublishedEvidence = pcText.includes("Try surface") || pcText.includes("公開 demo");
  results.pcPrototypeOnly = pcText.includes("not proven") || pcText.includes("尚未證明");

  await ev("window.scrollTo(0, document.body.scrollHeight)");
  await sleep(400);
  results.overflowAtBottom = await ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");

  ws.close(); chrome.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch {}
  return results;
}

try {
  await new Promise((r) => server.listen(PORT, r));
  console.log("=== DESKTOP 1440px ===");
  const d = await check({ w: 1440, h: 900, mobile: false });
  console.log(JSON.stringify(d, null, 2));
  console.log("=== MOBILE 390px ===");
  const m = await check({ w: 390, h: 844, mobile: true });
  console.log(JSON.stringify(m, null, 2));

  const EXPECTED_TRY = "https://apchen1978.github.io/payment-concentration-demo/";
  const EXPECTED_TDD = "https://apchen1978.github.io/ai-trade-deal-desk-demo/";
  const pass = (r) =>
    r.heroHeadline && r.heroHeadline.length > 0
    && r.heroCTAs.length >= 2 && r.heroPrimaryCta && r.heroSecondaryCta
    && r.engagementLayer && r.engagementCta === "http://127.0.0.1:9334/#contact"
    && r.cddCaseInvite && r.contactCta === "討論商業 Pilot"
    && r.tddLink === EXPECTED_TDD
    && r.pcLink === EXPECTED_TRY
    && r.pcLinkLabel && /Payment Prototype|付款原型/.test(r.pcLinkLabel)
    && r.tddEvidence1313 && r.tddEvidence55 && r.tddFixtureSafety && r.tddNoStale1212
    && r.pcPublishedEvidence && r.pcPrototypeOnly
    && r.noHorizontalOverflow && r.overflowAtBottom;
  const ok = pass(d) && pass(m);
  console.log(ok ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = ok ? 0 : 1;
} catch (err) {
  console.error("VERIFICATION ERROR:", err.message);
  process.exitCode = 1;
} finally {
  server.close();
}
