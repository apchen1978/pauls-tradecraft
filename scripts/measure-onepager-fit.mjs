// measure-onepager-fit.mjs — verify each one-pager fits on one A4 page.
// Uses the same HTML as make-onepager.mjs, so spacing changes cannot drift.
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromeCandidates, renderOnePagerHtml } from "./make-onepager.mjs";

const CHROME = chromeCandidates().find((candidate) => existsSync(candidate));
if (!CHROME) {
  console.error("FAIL: Chrome not found");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const zh = JSON.parse(readFileSync(new URL("../content/onepager-zh.json", import.meta.url), "utf8"));
const en = JSON.parse(readFileSync(new URL("../content/onepager-en.json", import.meta.url), "utf8"));

async function measure(locale, html) {
  const tmp = join(tmpdir(), `onepager-measure-${locale}.html`);
  writeFileSync(tmp, html, "utf-8");
  const dir = mkdtempSync(join(tmpdir(), "opf-"));
  const port = locale === "zh" ? 9266 : 9267;
  const c = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${port}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${dir}`,
    "about:blank",
  ], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json`);
      tabs = await r.json();
      if (Array.isArray(tabs) && tabs.length) break;
    } catch {}
    await sleep(400);
  }
  if (!Array.isArray(tabs) || !tabs.length) {
    c.kill();
    throw new Error(`Chrome DevTools did not open for ${locale}`);
  }
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pend = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => {
    const i = ++id;
    pend.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) {
      const p = pend.get(m.id);
      pend.delete(m.id);
      m.error ? p.rej(new Error(m.error.message)) : p.res(m.result);
    }
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 794, height: 1123, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: pathToFileURL(tmp).href });
  await sleep(1200);
  const ev = async (x) => {
    const r = await send("Runtime.evaluate", { expression: x, returnByValue: true });
    return r.result?.value;
  };
  const out = {};
  out.bodyH = await ev("Math.round(document.body.getBoundingClientRect().height)");
  out.scrollH = await ev("document.body.scrollHeight");
  out.clientH = await ev("document.body.clientHeight");
  out.footerBottom = await ev("Math.round(document.querySelector('.footer').getBoundingClientRect().bottom)");
  out.disclaimerBottom = await ev("Math.round(document.querySelector('.disclaimer')?.getBoundingClientRect().bottom || 0)");
  out.processBottom = await ev("Math.round(document.querySelector('.process').getBoundingClientRect().bottom)");
  out.deliverablesBottom = await ev("Math.round(document.querySelector('.deliverables')?.getBoundingClientRect().bottom || 0)");
  out.worksCount = await ev("document.querySelectorAll('.works li').length");
  out.lastWorkBottom = await ev("Math.round([...document.querySelectorAll('.works li')].at(-1).getBoundingClientRect().bottom)");
  out.lineHref = await ev("document.querySelector('.footer a[href*=\"line.me\"]')?.getAttribute('href') || ''");
  out.emailHref = await ev("document.querySelector('.footer a[href^=\"mailto:\"]')?.textContent || ''");
  ws.close();
  c.kill();
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  rmSync(tmp, { force: true });
  return out;
}

const zhR = await measure("zh", renderOnePagerHtml(zh, "zh"));
const enR = await measure("en", renderOnePagerHtml(en, "en"));
console.log("ZH:", JSON.stringify(zhR));
console.log("EN:", JSON.stringify(enR));
const fit = (r) => r.footerBottom <= r.bodyH
  && r.processBottom <= r.bodyH
  && r.disclaimerBottom <= r.bodyH
  && r.deliverablesBottom <= r.bodyH
  && r.lastWorkBottom <= r.bodyH
  && r.scrollH <= r.clientH + 1
  && r.lineHref.startsWith("https://line.me/")
  && r.emailHref.includes("@");
console.log("RESULT:", fit(zhR) && fit(enR) ? "PASS" : "FAIL");
process.exitCode = fit(zhR) && fit(enR) ? 0 : 1;
