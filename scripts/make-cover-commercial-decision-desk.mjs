// make-cover-commercial-decision-desk.mjs — render the light Forest cover for Commercial Decision Desk
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/public/images/cover-commercial-decision-desk.png";
const HTML = pathToFileURL("C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/cover-commercial-decision-desk.html").href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dir = mkdtempSync(join(tmpdir(), "cddcover-"));
  const c = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", "--window-size=1440,810", "--remote-debugging-port=9264", "--remote-allow-origins=*", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) { try { const r = await fetch("http://127.0.0.1:9264/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {} await sleep(400); }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 810, deviceScaleFactor: 2, mobile: false });
  await send("Page.navigate", { url: HTML });
  await sleep(2200);
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1440, height: 810, scale: 1 } });
  if (shot?.data) {
    writeFileSync(OUT, Buffer.from(shot.data, "base64"));
    console.log("cover written:", OUT);
  } else console.error("FAIL screenshot");
  ws.close(); c.kill();
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
