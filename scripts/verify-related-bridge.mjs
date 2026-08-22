// verify-related-bridge.mjs — verify the Deal Desk ↔ Payment Concentration cross-link
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../dist/", import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9346;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".pdf": "application/pdf" };
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
  const userData = mkdtempSync(join(tmpdir(), "bridge-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9247", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9247/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
    await sleep(400);
  }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  await sleep(4000);
  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); return r.result?.value; };

  const results = {};
  // TDD card: open case study, check related link exists and href = #payment-concentration
  results.tddRelated = await ev(`(async () => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('AI Trade Deal Desk'));
    const article = h.closest('article');
    const sum = article.querySelector('details summary');
    sum.click();
    await new Promise(r => setTimeout(r, 300));
    const a = [...article.querySelectorAll('a')].find(a => a.href.includes('#payment-concentration'));
    return a ? { href: a.getAttribute('href'), text: a.textContent.trim(), note: article.innerText.includes('合成模擬') || article.innerText.includes('synthetic') } : null;
  })()`);

  // Payment card: related link = #trade-deal-desk
  results.pcRelated = await ev(`(async () => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const article = h.closest('article');
    const sum = article.querySelector('details summary');
    sum.click();
    await new Promise(r => setTimeout(r, 300));
    const a = [...article.querySelectorAll('a')].find(a => a.href.includes('#trade-deal-desk'));
    return a ? { href: a.getAttribute('href'), text: a.textContent.trim() } : null;
  })()`);

  // Click the TDD related link → should scroll to payment card anchor
  results.anchorExists = await ev("!!document.getElementById('payment-concentration') && !!document.getElementById('trade-deal-desk')");
  results.noOverflow = await ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");

  // ZH + EN labels present
  results.zhLabel = await ev("document.body.innerText.includes('下一步：這個決策會如何影響 7 天付款高峰？') || document.body.innerText.includes('回到源頭')");

  console.log("=== RELATED BRIDGE VERIFICATION ===");
  console.log(JSON.stringify(results, null, 2));
  const pass = results.tddRelated && results.tddRelated.href === "#payment-concentration" && results.tddRelated.note
    && results.pcRelated && results.pcRelated.href === "#trade-deal-desk"
    && results.anchorExists && results.noOverflow;
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;

  ws.close(); chrome.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch {}
  server.close();
})().catch((e) => { console.error("VERIFICATION ERROR:", e.message); process.exitCode = 1; });
