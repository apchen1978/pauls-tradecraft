// make-cover-lead-discovery-bilingual.mjs — render the Lead Discovery cover in English and Chinese.
//
// Reads cover-lead-discovery.html (?lang=en | ?lang=zh) and writes, next to the other covers:
//   public/images/cover-lead-discovery.{png,webp}      English
//   public/images/cover-lead-discovery-zh.{png,webp}   Chinese
// Paths are relative to this checkout, so it works from a worktree.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CHROME = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const HTML = pathToFileURL(join(ROOT, "cover-lead-discovery.html")).href;
const OUT = join(ROOT, "public", "images");
const TARGETS = [["en", "cover-lead-discovery"], ["zh", "cover-lead-discovery-zh"]];
const PORT = 9263;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dir = mkdtempSync(join(tmpdir(), "ldcover-"));
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", "--window-size=1440,810", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*", "--allow-file-access-from-files", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
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
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 810, deviceScaleFactor: 2, mobile: false });
    for (const [lang, name] of TARGETS) {
      await send("Page.navigate", { url: `${HTML}?lang=${lang}` });
      await sleep(1800);
      for (const [format, ext, quality] of [["png", "png"], ["webp", "webp", 88]]) {
        const shot = await send("Page.captureScreenshot", { format, ...(quality ? { quality } : {}), clip: { x: 0, y: 0, width: 1440, height: 810, scale: 1 } });
        if (!shot?.data) throw new Error(`no screenshot for ${name}.${ext}`);
        writeFileSync(join(OUT, `${name}.${ext}`), Buffer.from(shot.data, "base64"));
        console.log("written:", `${name}.${ext}`);
      }
    }
    ws.close();
  } finally {
    chrome.kill();
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  }
})().catch((e) => { console.error("ERR:", e.message); process.exitCode = 1; });
