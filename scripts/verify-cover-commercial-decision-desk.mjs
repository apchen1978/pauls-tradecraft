// verify-cover-commercial-decision-desk.mjs — verify CDD cover crops well at mobile card size
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const HTML = pathToFileURL("C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/cover-commercial-decision-desk.html").href;
const OUT_DIR = "C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/visual-check";
mkdirSync(OUT_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dir = mkdtempSync(join(tmpdir(), "cddcoverchk-"));
  const c = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", "--remote-debugging-port=9265", "--remote-allow-origins=*", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) { try { const r = await fetch("http://127.0.0.1:9265/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {} await sleep(400); }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 810, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: HTML });
  await sleep(2200);

  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true }); return r.result?.value; };

  const r = {};
  r.fullTitle = await ev("document.querySelector('.title').innerText");
  r.flow = await ev("[...document.querySelectorAll('.flow .lbl')].map(n => n.textContent)");
  r.pill = await ev("document.querySelector('.pill').innerText");
  r.imgLoaded = await ev("(() => { const i = document.querySelector('.shot img'); return i && i.complete && i.naturalWidth > 0; })()");
  r.titleBottom = Math.round(await ev("document.querySelector('.title').getBoundingClientRect().bottom"));
  r.flowBottom = Math.round(await ev("document.querySelector('.flow').getBoundingClientRect().bottom"));
  r.titleVisibleInTopCrop = r.titleBottom <= 280;
  r.flowVisibleInTopCrop = r.flowBottom <= 280;

  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1440, height: 810, scale: 1 } });
  if (shot?.data) writeFileSync(join(OUT_DIR, "cover-commercial-decision-desk-1440.png"), Buffer.from(shot.data, "base64"));

  console.log("=== CDD COVER CROP VERIFICATION ===");
  console.log(JSON.stringify(r, null, 2));
  const pass = r.fullTitle === "Commercial Decision Desk"
    && r.flow.join(",") === "DISCOVER,QUALIFY,ASSESS,EXPOSURE,DECIDE"
    && r.pill.includes("HUMAN DECISION REQUIRED")
    && r.imgLoaded
    && r.titleVisibleInTopCrop && r.flowVisibleInTopCrop;
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;
  ws.close(); c.kill();
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
