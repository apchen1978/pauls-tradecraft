// measure-onepager-fit.mjs — verify the works grid + footer fit within one A4 page
// Replicates make-onepager.mjs layout (body fixed 210x297mm, works 2-col grid, footer margin-top:auto).
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const zh = JSON.parse(readFileSync("C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/content/onepager-zh.json", "utf8"));
const en = JSON.parse(readFileSync("C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/content/onepager-en.json", "utf8"));

function build(data, isCJK) {
  const works = data.works.map((w) => `<li>${w}</li>`).join("");
  const services = data.services.map((s) => `<li>${s}</li>`).join("");
  const stats = data.stats.map((s) => `<div class="stat"><b>${s.value}</b><span>${s.label}</span></div>`).join("");
  const font = isCJK ? '"Noto Sans CJK TC","Microsoft JhengHei",sans-serif' : '"Geist Variable","Segoe UI",sans-serif';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 210mm; height: 297mm; overflow: hidden; font-family: ${font}; background: #0B1B33; color: #fff; padding: 16mm 16mm 14mm; display: flex; flex-direction: column; }
    .topline { height: 2mm; background: #C9A227; margin-bottom: 8mm; }
    h2 { font-size: 11pt; color: #3B82F6; margin: 7mm 0 3mm; text-transform: uppercase; }
    ul { list-style: none; }
    li { font-size: 9.5pt; color: #E2E8F0; line-height: 1.6; padding-left: 4mm; }
    .works { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; }
    .works li { font-size: 9pt; }
    .process { font-size: 11pt; color: #E2E8F0; margin-top: 7mm; }
    .footer { margin-top: auto; border-top: 0.3mm solid #24405F; padding-top: 4mm; font-size: 8.5pt; color: #C7D2E0; display: flex; justify-content: space-between; }
  </style></head><body>
    <div class="topline"></div>
    <h1 style="font-size:21pt">${data.title}</h1>
    <p class="sub" style="font-size:10.5pt;color:#C7D2E0">${data.subtitle}</p>
    <div class="stats" style="display:flex;gap:6mm;margin-top:6mm">${stats}</div>
    <h2>${data.servicesTitle || "SERVICES"}</h2>
    <ul>${services}</ul>
    <h2>${data.worksTitle || "SELECTED WORKS"}</h2>
    <ul class="works">${works}</ul>
    <h2>${data.processTitle || "HOW I WORK"}</h2>
    <p class="process">${data.process}</p>
    <div class="footer"><span>${data.brand} · ${data.url}</span><span>${data.email}</span></div>
  </body></html>`;
}

async function measure(locale, html) {
  const tmp = join(tmpdir(), `onepager-measure-${locale}.html`);
  writeFileSync(tmp, html, "utf-8");
  const dir = mkdtempSync(join(tmpdir(), "opf-"));
  const c = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=9266", "--remote-allow-origins=*", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) { try { const r = await fetch("http://127.0.0.1:9266/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {} await sleep(400); }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 794, height: 1123, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: pathToFileURL(tmp).href });
  await sleep(2500);
  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true }); return r.result?.value; };
  const out = {};
  out.bodyH = await ev("Math.round(document.body.getBoundingClientRect().height)");
  out.footerBottom = await ev("Math.round(document.querySelector('.footer').getBoundingClientRect().bottom)");
  out.processBottom = await ev("Math.round(document.querySelector('.process').getBoundingClientRect().bottom)");
  out.worksCount = await ev("document.querySelectorAll('.works li').length");
  out.lastWorkBottom = await ev("Math.round([...document.querySelectorAll('.works li')].at(-1).getBoundingClientRect().bottom)");
  ws.close(); c.kill();
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  rmSync(tmp, { force: true });
  return out;
}

const zhR = await measure("zh", build(zh, true));
const enR = await measure("en", build(en, false));
console.log("ZH:", JSON.stringify(zhR));
console.log("EN:", JSON.stringify(enR));
const fit = (r) => r.footerBottom <= r.bodyH && r.processBottom <= r.bodyH;
console.log("RESULT:", fit(zhR) && fit(enR) ? "PASS" : "FAIL");
process.exitCode = fit(zhR) && fit(enR) ? 0 : 1;
