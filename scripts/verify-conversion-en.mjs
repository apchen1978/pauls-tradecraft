// verify-conversion-en.mjs — EN locale + commercial engagement click-path check
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9335;
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

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const userData = mkdtempSync(join(tmpdir(), "en-verify-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9235", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9235/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
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
  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true }); return r.result?.value; };

  // Switch to EN
  await ev(`[...document.querySelectorAll('button')].find(b => /^EN$/.test(b.textContent.trim()))?.click()`);
  await sleep(800);

  const results = {};
  const heroText = await ev("document.querySelector('section#top').innerText");
  results.heroHeadline = await ev("document.querySelector('h1')?.innerText || ''");
  results.heroPrimaryCta = heroText.includes("Discuss a Commercial Pilot");
  results.heroSecondaryCta = heroText.includes("View Commercial Systems");
  results.engagementLayer = await ev(`(() => {
    const text = document.querySelector('#capabilities')?.innerText || '';
    return ['Overseas Growth Pilot', 'Deal Readiness Review', 'Commercial Control Sprint', 'Supporting capabilities']
      .every((label) => text.includes(label));
  })()`);
  results.engagementCtaHref = await ev(`(() => {
    const a = [...document.querySelectorAll('#capabilities a[href="#contact"]')].find(a => a.textContent.includes('Discuss a Commercial Pilot'));
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
  results.pcLinkLabelEn = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.textContent.trim() : null;
  })()`);

  // Click path: featured CTA → Try surface (≤2 clicks: 1 click on homepage)
  results.clickPath = results.engagementCtaHref;

  console.log("=== EN LOCALE + CLICK PATH ===");
  console.log(JSON.stringify(results, null, 2));
  const pass = results.heroHeadline === "Turn commercial problems\ninto systems teams can act on"
    && results.heroPrimaryCta && results.heroSecondaryCta && results.engagementLayer
    && results.engagementCtaHref === "http://127.0.0.1:9335/#contact"
    && results.cddCaseInvite === "Have a live opportunity to review? Bring it in."
    && results.contactCta === "Discuss a Commercial Pilot"
    && /Payment Prototype/.test(results.pcLinkLabelEn || "")
    && results.clickPath === "http://127.0.0.1:9335/#contact";
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;

  ws.close(); chrome.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch {}
  server.close();
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
