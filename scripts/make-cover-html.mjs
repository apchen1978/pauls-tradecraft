// make-cover-html.mjs — render one HTML cover template to PNG (and WebP) with headless Chrome.
//
//   node scripts/make-cover-html.mjs <template.html> <outBase> <width> <height> [formats]
//   e.g. node scripts/make-cover-html.mjs cover-trade-deal-desk.html public/images/cover-trade-deal-desk 1440 810 png,webp
//        node scripts/make-cover-html.mjs cover-og-image.html public/og-image 1200 630 png
// Paths are relative to this checkout, so it works from a worktree. Set CHROME_PATH to override Chrome.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CHROME = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const [tpl, outBase, w, h, fmts = "png"] = process.argv.slice(2);
if (!tpl || !outBase || !w || !h) { console.error("usage: make-cover-html.mjs <template.html> <outBase> <width> <height> [png,webp]"); process.exit(2); }
const WIDTH = Number(w), HEIGHT = Number(h);
const [tplFile, tplQuery] = tpl.split("?");
const HTML = pathToFileURL(join(ROOT, tplFile)).href + (tplQuery ? `?${tplQuery}` : "");
const PORT = 9300 + Math.floor(Math.random() * 400);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dir = mkdtempSync(join(tmpdir(), "cover-"));
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", `--window-size=${WIDTH},${HEIGHT}`, `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*", "--allow-file-access-from-files", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
  try {
    let tabs;
    for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (Array.isArray(tabs) && tabs.length) break; } catch {} await sleep(400); }
    const page = tabs.find((t) => t.type === "page") || tabs[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 0; const pending = new Map();
    const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); });
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: HTML });
    await sleep(1800);
    for (const ext of fmts.split(",")) {
      const shot = await send("Page.captureScreenshot", { format: ext, ...(ext === "webp" ? { quality: 88 } : {}), clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 } });
      if (!shot?.data) throw new Error(`no screenshot for ${outBase}.${ext}`);
      writeFileSync(join(ROOT, `${outBase}.${ext}`), Buffer.from(shot.data, "base64"));
      console.log("written:", `${outBase}.${ext}`);
    }
    ws.close();
  } finally {
    chrome.kill();
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  }
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
