// make-onepager.mjs — 從 JSON 資料檔產生一頁簡介 PDF（單一管線、雙語）
// 資料來源：content/onepager-zh.json / content/onepager-en.json（可經 CLI 指定其他資料檔）
// 用法：
//   node scripts/make-onepager.mjs                    -> 產生 ZH（預設）
//   node scripts/make-onepager.mjs en                 -> 產生 EN
//   node scripts/make-onepager.mjs zh                 -> 產生 ZH
//   node scripts/make-onepager.mjs path/to/file.json  -> 用指定資料檔（依 locale 欄位決定輸出名）
// 每次網站更新時由 GitHub Actions 自動重跑兩個 locale → PDF 永遠同步
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function link(href, label) {
  return `<a href="${esc(href)}">${esc(label)}</a>`;
}

export function renderOnePagerHtml(data, locale = "zh") {
  const isCJK = locale === "zh";
  const fontStack = isCJK
    ? '"Noto Sans CJK TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", "Geist Variable", "Segoe UI", sans-serif'
    : '"Geist Variable", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  const htmlLang = isCJK ? "zh-Hant" : "en";

  const worksList = (data.works || [])
    .map((w) => `<li>${esc(w)}</li>`)
    .join("");
  const worksSecondaryList = (data.worksSecondary || [])
    .map((w) => `<li>${esc(w)}</li>`)
    .join("");
  const servicesList = (data.services || [])
    .map((s) => `<li>${esc(s)}</li>`)
    .join("");
  const deliverables = (data.deliverables || [])
    .map((item, index) => `<article class="deliverable"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></article>`)
    .join("");
  const stats = (data.stats || [])
    .map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`)
    .join("");
  const leverage = data.leverage
    ? `<section class="leverage"><p class="leverage-label">${esc(data.leverageTitle || "")}</p><p>${esc(data.leverage)}</p></section>`
    : "";
  const worksHeading = data.worksHref
    ? link(data.worksHref, data.worksTitle || "")
    : esc(data.worksTitle || "");
  const worksLead = data.worksLead ? `<p class="works-lead">${esc(data.worksLead)}</p>` : "";
  const disclaimer = data.disclaimer ? `<p class="disclaimer">${esc(data.disclaimer)}</p>` : "";

  const siteHref = data.url ? `https://${String(data.url).replace(/^https?:\/\//, "")}` : "";
  const site = data.url ? link(siteHref, data.url) : "";
  const email = data.email ? link(`mailto:${data.email}`, data.email) : "";
  const line = data.lineUrl ? link(data.lineUrl, data.lineLabel || "LINE") : "";
  const contact = [email, line].filter(Boolean).join('<span class="dot"> · </span>');
  const left = [esc(data.brand || ""), site].filter(Boolean).join('<span class="dot"> · </span>');

  return `<!doctype html>
<html lang="${htmlLang}">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 210mm; height: 297mm; overflow: hidden;
    font-family: ${fontStack};
    background: #0B1B33; color: #fff; padding: 15mm 15mm 12mm;
    display: flex; flex-direction: column;
  }
  a { color: inherit; text-decoration: underline; text-underline-offset: 1.5pt; }
  .topline { width: 100%; height: 2mm; background: #C9A227; margin-bottom: 7mm; }
  .kicker { font-size: 9pt; letter-spacing: 2.5pt; color: #3B82F6; font-weight: 700; text-transform: uppercase; }
  h1 { font-size: ${isCJK ? "20pt" : "16.5pt"}; line-height: 1.28; margin-top: 3.4mm; font-weight: 800; max-width: 180mm; }
  .positioning { font-size: 10.5pt; font-weight: 700; color: #C9A227; margin-top: 2.4mm; letter-spacing: 0.3pt; }
  .sub { font-size: 10.5pt; color: #C7D2E0; margin-top: 2.8mm; line-height: 1.55; }
  .stats { display: flex; gap: 4mm; margin-top: 5.5mm; }
  .stat { flex: 1 1 0; min-width: 0; background: #122B52; border-left: 1.2mm solid #C9A227; padding: 3mm 4mm; }
  .stat b { display: block; font-size: 16pt; color: #fff; line-height: 1.15; }
  .stat span { display: block; font-size: 8.2pt; color: #C7D2E0; line-height: 1.35; margin-top: 0.8mm; }
  h2 { font-size: 10.5pt; color: #3B82F6; margin: 5.6mm 0 2.2mm; letter-spacing: 1.2pt; text-transform: uppercase; }
  h2 a { text-decoration-thickness: 0.4pt; }
  ul { list-style: none; }
  li { font-size: 9.5pt; color: #E2E8F0; line-height: 1.55; padding-left: 4mm; position: relative; }
  li::before { content: "▪"; color: #C9A227; position: absolute; left: 0; }
  .deliverables { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
  .deliverable { border-top: 0.5mm solid #C9A227; padding-top: 1.6mm; }
  .deliverable span { display: block; font-size: 7.5pt; color: #3B82F6; font-weight: 700; letter-spacing: 1pt; }
  .deliverable h3 { font-size: 9pt; line-height: 1.3; margin-top: 0.8mm; color: #fff; }
  .deliverable p { font-size: 7.6pt; line-height: 1.4; color: #C7D2E0; margin-top: 0.8mm; }
  .leverage { margin-top: 4mm; padding: 2.8mm 3.5mm; border-left: 0.8mm solid #C9A227; background: #102545; }
  .leverage-label { font-size: 7.5pt; font-weight: 700; letter-spacing: 1.1pt; color: #3B82F6; text-transform: uppercase; }
  .leverage p:last-child { margin-top: 0.8mm; font-size: 8.5pt; line-height: 1.45; color: #E2E8F0; }
  .works-lead { font-size: 8.8pt; color: #C7D2E0; line-height: 1.5; margin-bottom: 1.8mm; }
  .works { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2mm 7mm; }
  .works li { font-size: 9pt; line-height: 1.48; }
  .works-secondary-label { font-size: 8pt; color: #64748B; letter-spacing: 1pt; text-transform: uppercase; margin-top: 3mm; }
  .works-secondary { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; margin-top: 1.5mm; }
  .works-secondary li { font-size: 7.5pt; color: #94A3B8; line-height: 1.55; }
  .process { font-size: 10.6pt; color: #E2E8F0; line-height: 1.58; }
  .footer { margin-top: auto; border-top: 0.3mm solid #24405F; padding-top: 3mm; display: flex; flex-direction: column; gap: 1.6mm; font-size: 8.5pt; color: #C7D2E0; }
  .footer-row { display: flex; justify-content: space-between; gap: 6mm; align-items: baseline; }
  .disclaimer { font-size: 8pt; line-height: 1.4; color: #94A3B8; }
  .latin { padding: 13mm 15mm 10mm; }
  .latin .topline { margin-bottom: 5.5mm; }
  .latin h1 { font-size: 15.5pt; line-height: 1.18; margin-top: 2.6mm; }
  .latin .sub { font-size: 9.5pt; line-height: 1.45; margin-top: 2.2mm; }
  .latin .stats { margin-top: 4mm; }
  .latin h2 { margin: 4.2mm 0 1.7mm; font-size: 10pt; }
  .latin li { font-size: 8.7pt; line-height: 1.42; }
  .latin .deliverable p { font-size: 7.4pt; line-height: 1.35; }
  .latin .leverage { margin-top: 2.8mm; padding: 2.2mm 3.5mm; }
  .latin .leverage p:last-child { font-size: 8.2pt; line-height: 1.4; }
  .latin .works-lead { font-size: 8.1pt; margin-bottom: 1.4mm; }
  .latin .works { gap: 0.8mm 7mm; }
  .latin .works li { font-size: 8.1pt; line-height: 1.38; }
  .latin .process { font-size: 9.7pt; line-height: 1.45; }
  .cjk .topline { margin-bottom: 8mm; }
  .cjk h1 { margin-top: 4mm; }
  .cjk .sub { line-height: 1.65; }
  .cjk .stats { margin-top: 6.5mm; }
  .cjk h2 { margin: 6.8mm 0 2.6mm; }
  .cjk li { line-height: 1.68; }
  .cjk .leverage { margin-top: 5mm; padding: 3.2mm 3.5mm; }
  .cjk .works { gap: 2.2mm 7mm; }
  .cjk .works-lead { margin-bottom: 2.4mm; line-height: 1.6; }
  .cjk .process { font-size: 11pt; line-height: 1.7; }
</style>
</head>
<body class="${isCJK ? "cjk" : "latin"}">
  <div class="topline"></div>
  <div class="kicker">${esc(data.kicker || "")}</div>
  <h1>${esc(data.title || "")}</h1>
  ${data.positioning ? `<p class="positioning">${esc(data.positioning)}</p>` : ""}
  <p class="sub">${esc(data.subtitle || "")}</p>
  <div class="stats">${stats}</div>

  <h2>${esc(data.servicesTitle || "")}</h2>
  <ul>${servicesList}</ul>
  ${deliverables ? `<h2>${esc(data.deliverablesTitle || "")}</h2><section class="deliverables">${deliverables}</section>` : ""}
  ${leverage}

  <h2>${worksHeading}</h2>
  ${worksLead}
  <ul class="works">${worksList}</ul>
  ${data.worksSecondary && data.worksSecondary.length ? `<p class="works-secondary-label">${esc(data.worksSecondaryLabel || "")}</p><ul class="works-secondary">${worksSecondaryList}</ul>` : ""}

  <h2>${esc(data.processTitle || "")}</h2>
  <p class="process">${esc(data.process || "")}</p>

  <div class="footer">
    ${disclaimer}
    <div class="footer-row"><span>${left}</span><span>${contact}</span></div>
  </div>
  <script>
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        document.body.classList.add("fonts-ready");
      });
    } else {
      document.body.classList.add("fonts-ready");
    }
  </script>
</body>
</html>`;
}

export function chromeCandidates() {
  return [
    process.env.CHROME_PATH,
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);
}

function main() {
  const arg = process.argv[2] || "zh";
  const LOCALE_DIR = path.join(ROOT, "content");

  let dataPath;
  let locale;
  if (arg === "zh" || arg === "en") {
    locale = arg;
    dataPath = path.join(LOCALE_DIR, `onepager-${locale}.json`);
  } else {
    dataPath = path.resolve(arg);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  locale = locale || data.locale || "zh";
  if (locale !== "zh" && locale !== "en") locale = "zh";

  const html = renderOnePagerHtml(data, locale);
  const tmpHtml = path.join(ROOT, `.onepager-${locale}.html`);
  fs.writeFileSync(tmpHtml, html, "utf-8");

  const chrome = chromeCandidates().find((c) => fs.existsSync(c));
  if (!chrome) {
    console.error("[onepager] Chrome not found; skipping PDF generation");
    process.exit(0);
  }

  const outName = `Paul-Tradecraft-OnePager-${locale.toUpperCase()}.pdf`;
  const outPdf = path.join(ROOT, "public", "files", outName);
  fs.mkdirSync(path.dirname(outPdf), { recursive: true });

  const r = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-extensions",
    "--disable-component-update",
    "--font-render-hinting=none",
    "--no-pdf-header-footer",
    "--virtual-time-budget=5000",
    `--print-to-pdf=${outPdf}`,
    pathToFileURL(tmpHtml).href,
  ], { stdio: "inherit", timeout: 180000 });

  fs.rmSync(tmpHtml, { force: true });

  if (r.status === 0 && fs.existsSync(outPdf)) {
    console.log(`[onepager] ${locale.toUpperCase()} PDF generated: ${outPdf} (${fs.statSync(outPdf).size} bytes)`);
  } else {
    console.error(`[onepager] ${locale.toUpperCase()} PDF generation failed`);
    process.exit(1);
  }
}

const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invoked && invoked === fileURLToPath(import.meta.url)) main();
