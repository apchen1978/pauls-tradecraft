// verify-portfolio-payment-concentration.mjs
// Verify the portfolio renders the Payment Concentration case study card:
// - card present, separate from AI Trade Deal Desk
// - case study expands with problem/approach/tools/result/evidence
// - honest PUBLIC EVIDENCE disclosure (no public link)
// - no horizontal overflow at desktop and 390px mobile
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;

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
  const userData = mkdtempSync(join(tmpdir(), "pc-verify-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9231", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });

  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9231/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
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

  // Find the Payment Concentration card by heading text
  results.cardFound = await ev(`[...document.querySelectorAll('h3')].some(h => h.textContent.includes('Payment Concentration'))`);
  results.caseStudyExists = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    if (!h) return false;
    const article = h.closest('article');
    return !!article && !!article.querySelector('details summary');
  })()`);
  // Card should NOT be a link (no public URL)
  results.cardIsNotLinked = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const article = h ? h.closest('article') : null;
    return article ? !article.querySelector('a[href]') : false;
  })()`);
  // Expand case study and read content
  await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const article = h.closest('article');
    const sum = article.querySelector('details summary');
    sum && sum.click();
    return 'ok';
  })()`);
  await sleep(600);
  const text = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    return h.closest('article').innerText;
  })()`);
  results.showsProblem = text.includes("挑戰") || text.includes("Problem");
  results.showsApproach = text.includes("做法") || text.includes("Approach");
  results.showsResult = text.includes("成果") || text.includes("Result");
  results.showsEvidence = text.includes("驗證") || text.includes("Evidence");
  results.shows83k = text.includes("83,000");
  results.shows135k = text.includes("135,000");
  results.showsOct12 = text.includes("Oct 12") || text.includes("10-12");
  results.showsPublicEvidenceUnknown = text.includes("PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED");

  // Separate from trade-deal-desk: two distinct cards
  results.tradeDealDeskSeparate = await ev(`(() => {
    const t = [...document.querySelectorAll('h3')].filter(h => h.textContent.includes('AI Trade Deal Desk')).length;
    const p = [...document.querySelectorAll('h3')].filter(h => h.textContent.includes('Payment Concentration')).length;
    return t === 1 && p === 1;
  })()`);
  results.tradeDealDeskStillLinked = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('AI Trade Deal Desk'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.href : null;
  })()`);

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
  const pass = (r) => r.cardFound && r.caseStudyExists && r.cardIsNotLinked && r.showsProblem && r.showsApproach && r.showsResult && r.showsEvidence && r.shows83k && r.shows135k && r.showsOct12 && r.showsPublicEvidenceUnknown && r.tradeDealDeskSeparate && r.noHorizontalOverflow && r.overflowAtBottom;
  const ok = pass(d) && pass(m);
  console.log(ok ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = ok ? 0 : 1;
} catch (err) {
  console.error("VERIFICATION ERROR:", err.message);
  process.exitCode = 1;
} finally {
  server.close();
}
