// make-onepager.mjs — 從 JSON 資料檔產生「AI 協作能力」一頁 PDF（單一管線、雙語）
// 資料來源：content/onepager-zh.json / content/onepager-en.json（可經 CLI 指定其他資料檔）
// 用法：
//   node scripts/make-onepager.mjs                    -> 產生 ZH（預設）
//   node scripts/make-onepager.mjs en                 -> 產生 EN
//   node scripts/make-onepager.mjs zh                 -> 產生 ZH
//   node scripts/make-onepager.mjs path/to/file.json  -> 用指定資料檔（依 locale 欄位決定輸出名）
// 每次網站更新時由 GitHub Actions 自動重跑兩個 locale → PDF 永遠同步
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

const worksList = (data.works || [])
  .map((w) => `<li>${w}</li>`)
  .join("");
const worksSecondaryList = (data.worksSecondary || [])
  .map((w) => `<li>${w}</li>`)
  .join("");
const servicesList = (data.services || [])
  .map((s) => `<li>${s}</li>`)
  .join("");
const deliverables = (data.deliverables || [])
  .map((item, index) => `<article class="deliverable"><span>${String(index + 1).padStart(2, "0")}</span><h3>${item.title}</h3><p>${item.body}</p></article>`)
  .join("");
const stats = (data.stats || [])
  .map((s) => `<div class="stat"><b>${s.value}</b><span>${s.label}</span></div>`)
  .join("");
const leverage = data.leverage
  ? `<section class="leverage"><p class="leverage-label">${data.leverageTitle || ""}</p><p>${data.leverage}</p></section>`
  : "";

// 依 locale 選字型優先序：CJK 內容用 Noto CJK；英文內容用標準 sans
const isCJK = locale === "zh";
const fontStack = isCJK
  ? '"Noto Sans CJK TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", "Geist Variable", "Segoe UI", sans-serif'
  : '"Geist Variable", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
const htmlLang = isCJK ? "zh-Hant" : "en";

const html = `<!doctype html>
<html lang="${htmlLang}">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 210mm; height: 297mm; overflow: hidden;
    font-family: ${fontStack};
    background: #0B1B33; color: #fff; padding: 16mm 16mm 14mm;
    display: flex; flex-direction: column;
  }
  .topline { width: 100%; height: 2mm; background: #C9A227; margin-bottom: 8mm; }
  .kicker { font-size: 9pt; letter-spacing: 2.5pt; color: #3B82F6; font-weight: 700; text-transform: uppercase; }
  h1 { font-size: ${isCJK ? "21pt" : "18pt"}; line-height: 1.3; margin-top: 4mm; font-weight: 800; max-width: 175mm; }
  .positioning { font-size: 10pt; font-weight: 700; color: #C9A227; margin-top: 2.5mm; letter-spacing: 0.4pt; }
  .sub { font-size: 10.5pt; color: #C7D2E0; margin-top: 3mm; line-height: 1.6; }
  .stats { display: flex; gap: 6mm; margin-top: 6mm; }
  .stat { background: #122B52; border-left: 1.2mm solid #C9A227; padding: 3mm 5mm; min-width: 30mm; }
  .stat b { display: block; font-size: 16pt; color: #fff; }
  .stat span { font-size: 8.5pt; color: #C7D2E0; }
  h2 { font-size: 10.5pt; color: #3B82F6; margin: 6mm 0 2.5mm; letter-spacing: 1.5pt; text-transform: uppercase; }
  ul { list-style: none; }
  li { font-size: 9.5pt; color: #E2E8F0; line-height: 1.6; padding-left: 4mm; position: relative; }
  li::before { content: "▪"; color: #C9A227; position: absolute; left: 0; }
  .deliverables { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
  .deliverable { border-top: 0.5mm solid #C9A227; padding-top: 2mm; }
  .deliverable span { display: block; font-size: 7.5pt; color: #3B82F6; font-weight: 700; letter-spacing: 1pt; }
  .deliverable h3 { font-size: 9pt; line-height: 1.3; margin-top: 1mm; color: #fff; }
  .deliverable p { font-size: 7.8pt; line-height: 1.45; color: #C7D2E0; margin-top: 1mm; }
  .leverage { margin-top: 3.5mm; padding: 3mm 4mm; border-left: 0.8mm solid #C9A227; background: #102545; }
  .leverage-label { font-size: 7.5pt; font-weight: 700; letter-spacing: 1.2pt; color: #3B82F6; text-transform: uppercase; }
  .leverage p:last-child { margin-top: 1mm; font-size: 8.8pt; line-height: 1.55; color: #E2E8F0; }
  .works { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; }
  .works li { font-size: 9pt; }
  .works-secondary-label { font-size: 8pt; color: #64748B; letter-spacing: 1pt; text-transform: uppercase; margin-top: 3mm; }
  .works-secondary { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; margin-top: 1.5mm; }
  .works-secondary li { font-size: 7.5pt; color: #94A3B8; line-height: 1.55; }
  .process { font-size: 11pt; color: #E2E8F0; line-height: 1.7; }
  .footer { margin-top: auto; border-top: 0.3mm solid #24405F; padding-top: 4mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #C7D2E0; }
  .latin { padding: 13mm 16mm 9mm; }
  .latin .topline { margin-bottom: 6mm; }
  .latin h1 { line-height: 1.2; margin-top: 3mm; }
  .latin .sub { font-size: 10pt; line-height: 1.5; margin-top: 2.5mm; }
  .latin .stats { margin-top: 4mm; }
  .latin h2 { margin: 5mm 0 2mm; }
  .latin li { font-size: 9pt; line-height: 1.48; }
  .latin .deliverable p { font-size: 7.5pt; line-height: 1.4; }
  .latin .leverage { margin-top: 3mm; padding: 2.5mm 4mm; }
  .latin .leverage p:last-child { font-size: 8.5pt; line-height: 1.45; }
  .latin .works li { font-size: 8.5pt; line-height: 1.45; }
  .latin .process { font-size: 10.2pt; line-height: 1.5; }
</style>
</head>
<body class="${isCJK ? "cjk" : "latin"}">
  <div class="topline"></div>
  <div class="kicker">${data.kicker || ""}</div>
  <h1>${data.title || ""}</h1>
  ${data.positioning ? `<p class="positioning">${data.positioning}</p>` : ""}
  <p class="sub">${data.subtitle || ""}</p>
  <div class="stats">${stats}</div>

  <h2>${data.servicesTitle || ""}</h2>
  <ul>${servicesList}</ul>
  ${deliverables ? `<h2>${data.deliverablesTitle || ""}</h2><section class="deliverables">${deliverables}</section>` : ""}
  ${leverage}

  <h2>${data.worksTitle || ""}</h2>
  <ul class="works">${worksList}</ul>
  ${data.worksSecondary && data.worksSecondary.length ? `<p class="works-secondary-label">${data.worksSecondaryLabel || ""}</p><ul class="works-secondary">${worksSecondaryList}</ul>` : ""}

  <h2>${data.processTitle || ""}</h2>
  <p class="process">${data.process || ""}</p>

  <div class="footer">
    ${data.footer
      ? `<span>${data.footer}</span>`
      : `<span>${data.brand || ""} · ${data.url || ""}</span><span>${data.email || ""}</span>`}
  </div>
  <script>
    // 確保所有字型載入完成，避免 PDF 產生 tofu / 缺字
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

// ---- 寫入暫存 HTML 並用 Chrome print-to-pdf ----
const tmpHtml = path.join(ROOT, `.onepager-${locale}.html`);
fs.writeFileSync(tmpHtml, html, "utf-8");

// 找 Chrome（GitHub Actions runner 或本機）
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const chrome = chromeCandidates.find((c) => fs.existsSync(c));
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
  "--no-sandbox", // GitHub Actions runner 無 sandbox 權限，需停用
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage", // 解決 CI /dev/shm 記憶體不足崩潰
  "--font-render-hinting=none",
  "--no-pdf-header-footer",
  "--virtual-time-budget=5000", // 等字型/網路載入
  `--print-to-pdf=${outPdf}`,
  `file://${tmpHtml.replace(/\\/g, "/")}`,
], { stdio: "inherit", timeout: 90000 });

fs.rmSync(tmpHtml, { force: true });

if (r.status === 0 && fs.existsSync(outPdf)) {
  console.log(`[onepager] ${locale.toUpperCase()} PDF generated: ${outPdf} (${fs.statSync(outPdf).size} bytes)`);
} else {
  console.error(`[onepager] ${locale.toUpperCase()} PDF generation failed`);
  process.exit(1);
}
