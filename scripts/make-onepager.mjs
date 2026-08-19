// make-onepager.mjs — 從 JSON 資料檔產生「AI 協作能力」一頁 PDF
// 資料來源：content/onepager-data.json（可經 CLI 參數指定其他資料檔，供多客戶/多支柱客製）
// 用法：
//   node scripts/make-onepager.mjs                        -> 用預設 content/onepager-data.json
//   node scripts/make-onepager.mjs path/to/other.json     -> 用指定資料檔
// 每次網站更新時由 GitHub Actions 自動重跑 → PDF 永遠同步
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const dataArg = process.argv[2];
const dataPath = dataArg
  ? path.resolve(dataArg)
  : path.join(ROOT, "content", "onepager-data.json");

const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const worksList = (data.works || [])
  .map((w) => `<li>${w}</li>`)
  .join("");
const servicesList = (data.services || [])
  .map((s) => `<li>${s}</li>`)
  .join("");
const stats = (data.stats || [])
  .map((s) => `<div class="stat"><b>${s.value}</b><span>${s.label}</span></div>`)
  .join("");

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 210mm; height: 297mm; overflow: hidden;
    /* CJK 優先：Noto Sans CJK TC 是 Linux CI 裝的字型；本機 Windows 用 Microsoft JhengHei */
    font-family: "Noto Sans CJK TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", "Geist Variable", "Segoe UI", sans-serif;
    background: #0B1B33; color: #fff; padding: 16mm 16mm 14mm;
    display: flex; flex-direction: column;
  }
  .topline { width: 100%; height: 2mm; background: #C9A227; margin-bottom: 8mm; }
  .kicker { font-size: 9pt; letter-spacing: 2.5pt; color: #3B82F6; font-weight: 700; text-transform: uppercase; }
  h1 { font-size: 21pt; line-height: 1.3; margin-top: 4mm; font-weight: 800; max-width: 175mm; }
  .sub { font-size: 10.5pt; color: #C7D2E0; margin-top: 4mm; line-height: 1.6; }
  .stats { display: flex; gap: 6mm; margin-top: 6mm; }
  .stat { background: #122B52; border-left: 1.2mm solid #C9A227; padding: 3mm 5mm; min-width: 30mm; }
  .stat b { display: block; font-size: 16pt; color: #fff; }
  .stat span { font-size: 8.5pt; color: #C7D2E0; }
  h2 { font-size: 11pt; color: #3B82F6; margin: 7mm 0 3mm; letter-spacing: 1.5pt; text-transform: uppercase; }
  ul { list-style: none; }
  li { font-size: 9.5pt; color: #E2E8F0; line-height: 1.65; padding-left: 4mm; position: relative; }
  li::before { content: "▪"; color: #C9A227; position: absolute; left: 0; }
  .works { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; }
  .works li { font-size: 9pt; }
  .process { font-size: 11pt; color: #E2E8F0; line-height: 1.7; }
  .footer { margin-top: auto; border-top: 0.3mm solid #24405F; padding-top: 4mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #C7D2E0; }
</style>
</head>
<body>
  <div class="topline"></div>
  <div class="kicker">${data.kicker || ""}</div>
  <h1>${data.title || ""}</h1>
  <p class="sub">${data.subtitle || ""}</p>
  <div class="stats">${stats}</div>

  <h2>${data.servicesTitle || ""}</h2>
  <ul>${servicesList}</ul>

  <h2>${data.worksTitle || ""}</h2>
  <ul class="works">${worksList}</ul>

  <h2>${data.processTitle || ""}</h2>
  <p class="process">${data.process || ""}</p>

  <div class="footer">
    <span>${data.brand || ""} · ${data.url || ""}</span>
    <span>${data.email || ""}</span>
  </div>
  <script>
    // 確保所有字型（含 CJK）載入完成，避免 PDF 產生 tofu
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
const tmpHtml = path.join(ROOT, ".onepager.html");
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

const outPdf = path.join(ROOT, "public", "files", "Paul-Tradecraft-OnePager.pdf");
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
  console.log(`[onepager] PDF generated: ${outPdf} (${fs.statSync(outPdf).size} bytes)`);
} else {
  console.error("[onepager] PDF generation failed");
  process.exit(1);
}
