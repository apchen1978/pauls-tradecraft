// verify-try-surface.mjs — verify the published Payment Concentration Try surface
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "https://apchen1978.github.io/payment-concentration-demo/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const userData = mkdtempSync(join(tmpdir(), "try-verify-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9233", "--remote-allow-origins=*",
    `--user-data-dir=${userData}`, "about:blank",
  ], { stdio: "ignore" });

  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9233/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
    await sleep(400);
  }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url: URL });
  await sleep(4000);

  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true }); return r.result?.value; };
  const results = {};
  results.title = await ev("document.title");
  results.viewport = await ev("`${document.documentElement.clientWidth}px`");
  results.noOverflow = await ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");
  results.tableRows = await ev("document.querySelectorAll('#events-body tr').length");
  results.editableInputs = await ev("document.querySelectorAll('#events-body input').length");
  const text = await ev("document.body.innerText");
  results.shows83000 = text.includes("83,000");
  results.shows52000 = text.includes("52,000");
  results.shows135000 = text.includes("135,000");
  results.showsDisclosure = text.includes("Payment commitments only");
  results.showsDeals = ["Deal A", "Deal B", "Deal C"].every((d) => text.includes(d));
  results.showsAttribution = text.includes("Deal A: USD 45,000") && text.includes("Deal B: USD 38,000") && text.includes("Deal C: USD 52,000");

  await ev("window.scrollTo(0, document.body.scrollHeight)");
  await sleep(400);
  results.overflowAtBottom = await ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1");

  ws.close(); chrome.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch {}

  console.log("=== PAYMENT CONCENTRATION TRY SURFACE (390px) ===");
  console.log(JSON.stringify(results, null, 2));
  const pass = results.title.includes("Payment Commitments")
    && results.tableRows === 6 && results.editableInputs === 18
    && results.shows83000 && results.shows52000 && results.shows135000
    && results.showsDisclosure && results.showsDeals && results.showsAttribution
    && results.noOverflow && results.overflowAtBottom;
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
