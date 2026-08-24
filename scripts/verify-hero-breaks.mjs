// verify-hero-breaks.mjs — HARD acceptance gate for the homepage Hero headline.
//
// Intentional line-break rules (desktop + mobile must stay in sync):
//   G1  ZH: exactly 2 lines at every width >= 320
//        line1 = "把國際貿易流程，做成" · line2 = "真正能運作的工具"
//   G2  EN: no more than 3 lines; no line may be a single orphan word
//   G3  No horizontal overflow at any width
//   G4  Gold highlight (工具 / "that actually run") never splits
//
// Widths: 1440 / 1280 / 1024 / 768 / 390 / 360 / 320  ×  ZH / EN
//
// Usage (requires system Chrome + the local dist or live site):
//   python -m http.server 8091 --directory dist
//   node scripts/verify-hero-breaks.mjs                 # local dist
//   node scripts/verify-hero-breaks.mjs --url https://paulstradecraft.com
//
// Runs headless Chrome via CDP (same pattern as make-covers.mjs; no deps).

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : "http://127.0.0.1:8091";
const WIDTHS = [1440, 1280, 1024, 768, 390, 360, 320];
const ZH_TARGET = ["把國際貿易流程，做成", "真正能運作的工具"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dir = mkdtempSync(join(tmpdir(), "herobreak-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
  "--remote-debugging-port=9271", "--remote-allow-origins=*",
  `--user-data-dir=${dir}`, "about:blank",
], { stdio: "ignore" });

async function cdp() {
  let tabs;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch("http://127.0.0.1:9271/json"); tabs = await r.json(); if (Array.isArray(tabs) && tabs.length) break; } catch {}
    await sleep(400);
  }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => {
    const i = ++id; pend.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable");
  return { send, close: () => ws.close() };
}

const MEASURE = `() => {
  const h1 = document.querySelector("#top h1");
  if (!h1) return { error: "no h1" };
  const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
  const chars = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent;
    for (let i = 0; i < text.length; i++) {
      const range = document.createRange();
      range.setStart(node, i); range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      chars.push({ ch: text[i], y: Math.round(rect.top) });
    }
  }
  const ys = [...new Set(chars.map((c) => c.y))].sort((a, b) => a - b);
  const lines = ys.map((y) => chars.filter((c) => c.y === y).map((c) => c.ch).join("").replace(/\\s+/g, " ").trim());
  const hl = h1.querySelector("span");
  return {
    font: getComputedStyle(h1).fontSize,
    lineCount: lines.length,
    lines,
    highlight: hl ? hl.textContent.trim() : null,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
}`;

const { send, close } = await cdp();
const results = {};
const violations = [];

for (const width of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
  for (const lang of ["zh", "en"]) {
    await send("Page.navigate", { url: BASE });
    await sleep(2200);
    if (lang === "en") {
      await send("Runtime.evaluate", { expression: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='EN')?.click()` });
      await sleep(800);
    }
    const r = await send("Runtime.evaluate", { expression: `(${MEASURE})()`, returnByValue: true });
    const m = r.result.value;
    const key = `${width}px_${lang}`;
    results[key] = m;
    const issues = [];
    if (m.error) issues.push(m.error);
    if (m.overflow) issues.push("overflow");
    if (lang === "zh") {
      if (m.lineCount !== 2) issues.push(`${m.lineCount} lines (want 2)`);
      else m.lines.forEach((l, i) => { if (l !== ZH_TARGET[i]) issues.push(`line ${i + 1} != "${ZH_TARGET[i]}" (got "${l}")`); });
    } else {
      if (m.lineCount > 3) issues.push(`${m.lineCount} lines (max 3)`);
      m.lines.forEach((l, i) => { if (l.split(/\s+/).filter(Boolean).length === 1) issues.push(`orphan word line ${i + 1}: "${l}"`); });
    }
    if (lang === "zh" && m.highlight && !m.lines.some((l) => l.includes(m.highlight))) issues.push("highlight split");
    if (issues.length) violations.push(`${key}: ${issues.join("; ")}`);
  }
}

close();
try { chrome.kill(); } catch {}
try { rmSync(dir, { recursive: true, force: true }); } catch {}

console.log("== Hero line-break acceptance matrix ==");
for (const [k, m] of Object.entries(results)) {
  console.log(`${k.padEnd(11)} ${String(m.lineCount).padEnd(2)} lines ${(m.font || "").padEnd(7)} ${JSON.stringify(m.lines)}`);
}
if (violations.length) {
  console.log("\nVIOLATIONS:");
  violations.forEach((v) => console.log("  -", v));
  process.exitCode = 1;
} else {
  console.log("\nPASS: all widths x ZH/EN meet the line-break gates.");
}
