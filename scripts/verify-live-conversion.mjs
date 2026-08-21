// verify-live-conversion.mjs — LIVE verification of paulstradecraft.com post-deploy
// Desktop 1440px + mobile 390px:
//  - identity preserved; featured hook visible in ZH and EN
//  - 83k → +52k → 135k visible; disclosure visible; CTA → Try surface (1 click)
//  - Trade Deal Desk link unchanged + evidence 13/13 + 5/5
//  - Payment Concentration card links to Try surface, prototype-only disclosure
//  - no horizontal overflow
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "https://paulstradecraft.com/";
const TRY = "https://apchen1978.github.io/payment-concentration-demo/";
const TDD = "https://apchen1978.github.io/ai-trade-deal-desk-demo/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(viewport, lang) {
  const userData = mkdtempSync(join(tmpdir(), "live-conv-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9236", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });

  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9236/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
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

  if (lang === "en") {
    await ev(`[...document.querySelectorAll('button')].find(b => /^EN$/.test(b.textContent.trim()))?.click()`);
    await sleep(800);
  }

  const heroText = await ev("document.querySelector('section#top').innerText");
  results.identityHeadline = await ev("document.querySelector('h1') ? document.querySelector('h1').innerText : ''");
  results.featuredHook = lang === "zh"
    ? heroText.includes("每張訂單單看都沒問題") && heroText.includes("當付款撞在一起時")
    : heroText.includes("Each order looks manageable") && heroText.includes("What happens when the payments collide?");
  results.featured83k = heroText.includes("USD 83k");
  results.featured52k = heroText.includes("USD 52k");
  results.featured135k = heroText.includes("USD 135k");
  results.featuredCaption = heroText.includes("7-day supplier-payment commitments") || heroText.includes("7 天供應商付款承諾");
  results.featuredDisclosure = heroText.includes("Synthetic example") || heroText.includes("合成範例");
  results.featuredCtaText = heroText.includes("Try the Payment Prototype") || heroText.includes("試試付款原型");
  results.featuredCtaHref = await ev(`(() => {
    const a = [...document.querySelectorAll('section#top a')].find(a => /Payment Prototype|付款原型/.test(a.textContent));
    return a ? a.href : null;
  })()`);

  results.tddLink = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('AI Trade Deal Desk'));
    const a = h ? h.closest('article').querySelector('a[href]') : null;
    return a ? a.href : null;
  })()`);
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

  results.pcLink = await ev(`(() => {
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
  const pcText = await ev(`(() => {
    const h = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Payment Concentration'));
    return h ? h.closest('article').innerText : '';
  })()`);
  results.pcPrototypeOnly = pcText.includes("not proven") || pcText.includes("尚未證明");

  await ev("window.scrollTo(0, document.body.scrollHeight)");
  await sleep(400);
  results.overflowAtBottom = await ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");

  ws.close(); chrome.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch {}
  return results;
}

try {
  console.log("=== LIVE ZH DESKTOP 1440px ===");
  const zd = await check({ w: 1440, h: 900, mobile: false }, "zh");
  console.log(JSON.stringify(zd, null, 2));
  console.log("=== LIVE ZH MOBILE 390px ===");
  const zm = await check({ w: 390, h: 844, mobile: true }, "zh");
  console.log(JSON.stringify(zm, null, 2));
  console.log("=== LIVE EN DESKTOP 1440px ===");
  const ed = await check({ w: 1440, h: 900, mobile: false }, "en");
  console.log(JSON.stringify(ed, null, 2));

  const pass = (r) => r.identityHeadline && r.featuredHook && r.featured83k && r.featured52k && r.featured135k
    && r.featuredCaption && r.featuredDisclosure && r.featuredCtaText && r.featuredCtaHref === TRY
    && r.tddLink === TDD && r.tddEvidence1313 && r.tddEvidence55
    && r.pcLink === TRY && r.pcPrototypeOnly
    && r.noHorizontalOverflow && r.overflowAtBottom;
  const ok = pass(zd) && pass(zm) && pass(ed);
  console.log(ok ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = ok ? 0 : 1;
} catch (err) {
  console.error("VERIFICATION ERROR:", err.message);
  process.exitCode = 1;
}
