// verify-conversion-en.mjs — EN locale + click-path check
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
  results.enHook = heroText.includes("Each order looks manageable") && heroText.includes("What happens when the payments collide?");
  results.en83k = heroText.includes("USD 83k");
  results.en52k = heroText.includes("+ USD 52k proposed deal");
  results.en135k = heroText.includes("USD 135k");
  results.enCaption = heroText.includes("7-day supplier-payment commitments");
  results.enDisclosure = heroText.includes("Synthetic example · supplier-payment commitments only — not company cash balance or shortfall");
  results.enCta = heroText.includes("Try the Payment Prototype");
  results.enCtaHref = await ev(`(() => {
    const a = [...document.querySelectorAll('section#top a')].find(a => a.textContent.includes('Try the Payment Prototype'));
    return a ? a.href : null;
  })()`);
  results.identityPreservedEn = heroText.includes("Turning trade practice") && heroText.includes("into visible tools");
  results.pcLinkLabelEn = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.textContent.trim() : null;
  })()`);

  // Click path: featured CTA → Try surface (≤2 clicks: 1 click on homepage)
  results.clickPath = await ev(`(() => {
    const a = [...document.querySelectorAll('section#top a')].find(a => a.textContent.includes('Try the Payment Prototype'));
    if (!a) return 'no-cta';
    const href = a.href;
    // 從 homepage 點一次 CTA 就到 Try surface → 1 click 路徑（≤2 ✓）
    return href;
  })()`);

  console.log("=== EN LOCALE + CLICK PATH ===");
  console.log(JSON.stringify(results, null, 2));
  const pass = results.enHook && results.en83k && results.en52k && results.en135k
    && results.enCaption && results.enDisclosure && results.enCta
    && results.enCtaHref === "https://apchen1978.github.io/payment-concentration-demo/"
    && results.identityPreservedEn
    && /Payment Prototype/.test(results.pcLinkLabelEn || "")
    && results.clickPath === "https://apchen1978.github.io/payment-concentration-demo/";
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;

  ws.close(); chrome.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch {}
  server.close();
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
