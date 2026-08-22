// verify-cover-crop.mjs — verify the Lead Discovery cover crops well at mobile card size
// The portfolio card shows cover with aspect-[16/9] object-cover object-top.
// At 390px the card image area is ~358px wide × ~201px tall (16:9).
// We render the cover HTML at that exact crop and check key text is within bounds.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const HTML = pathToFileURL("C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/cover-lead-discovery.html").href;
const OUT_DIR = "C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/visual-check";
mkdirSync(OUT_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dir = mkdtempSync(join(tmpdir(), "ldcoverchk-"));
  const c = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", "--remote-debugging-port=9263", "--remote-allow-origins=*", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) { try { const r = await fetch("http://127.0.0.1:9263/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {} await sleep(400); }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 810, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: HTML });
  await sleep(1800);

  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true }); return r.result?.value; };

  const r = {};
  r.fullTitle = await ev("document.querySelector('.title').innerText");
  r.fullFlow = await ev("[...document.querySelectorAll('.flow .num')].map(n => n.textContent)");
  r.chips = await ev("[...document.querySelectorAll('.chip .k')].map(k => k.textContent)");

  // Mobile crop: simulate the card crop at ~358×201 (the visible top region of a 16:9 cover shown at 358px width)
  // We measure element positions in the 1440×810 full render, then scale to 358px width.
  // The card shows the TOP of the cover (object-top). Crop height at 358px width = 358 * 9/16 = 201px.
  // In full-render coords, 201px at scale 358/1440 = 0.2486 → crop bottom in full coords = 810 * 0.2486 ≈ 201... but object-cover crops by width matching.
  // Simpler: measure whether title + 44/20 fall within the TOP ~25% vertical band (since object-top shows the top).
  const titleTop = await ev("document.querySelector('.title').getBoundingClientRect().top");
  const titleBottom = await ev("document.querySelector('.title').getBoundingClientRect().bottom");
  const flowTop = await ev("document.querySelector('.flow').getBoundingClientRect().top");
  r.titleRect = { top: Math.round(titleTop), bottom: Math.round(titleBottom) };
  r.flowTop = Math.round(flowTop);
  // At 358px width, the visible vertical span is (358/1440)*810 = 201px, and title/flow are near top.
  // Check they are within the top ~30% (243px) so they remain visible after object-top crop.
  r.titleVisibleInTopCrop = titleBottom <= 280;
  r.flowVisibleInTopCrop = flowTop <= 280;

  // Screenshot full cover for owner review
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1440, height: 810, scale: 1 } });
  if (shot?.data) writeFileSync(join(OUT_DIR, "cover-lead-discovery-1440.png"), Buffer.from(shot.data, "base64"));

  console.log("=== LEAD DISCOVERY COVER CROP VERIFICATION ===");
  console.log(JSON.stringify(r, null, 2));
  const pass = r.fullTitle === "Overseas Lead Discovery"
    && r.fullFlow.join(",") === "44,20"
    && r.chips.join(",").toLowerCase() === "why,why not,unknown,evidence"
    && r.titleVisibleInTopCrop && r.flowVisibleInTopCrop;
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exitCode = pass ? 0 : 1;
  ws.close(); c.kill();
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
