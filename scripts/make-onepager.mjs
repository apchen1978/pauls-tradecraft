// make-onepager.mjs — 從網站資料自動產生「AI 協作能力」一頁 PDF
// 資料來源：src/i18n.jsx（dict）+ src/data/works.js（works）
// 每次網站更新時由 GitHub Actions 自動重跑 → PDF 永遠同步
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// i18n.jsx / works.js 是 ESM+JSX，先用 esbuild（vite 依賴，無新增）轉成臨時 CJS
async function loadModule(relPath) {
  const outFile = path.join(ROOT, ".tmp-" + path.basename(relPath).replace(/\.jsx?$/, ".cjs"));
  await build({
    entryPoints: [path.join(ROOT, relPath)],
    outfile: outFile,
    bundle: true,
    format: "cjs",
    platform: "node",
    loader: { ".jsx": "jsx" },
    jsx: "transform",
    logLevel: "silent",
  });
  const mod = await import(pathToFileURL(outFile).href);
  fs.rmSync(outFile, { force: true });
  return mod;
}

const { dict } = await loadModule("src/i18n.jsx");
const { works } = await loadModule("src/data/works.js");

const zh = dict.zh;
const en = dict.en;

// ---- 組 HTML（A4 單頁，深墨藍 McKinsey 風格，與網站品牌一致）----
const worksList = works
  .map(
    (w) => `<li>${w.zh.title} · ${w.zh.tag}${w.link ? " · 可即時遊玩" : ""}</li>`
  )
  .join("");

const servicesList = zh.capabilities.items
  .map((s) => `<li><b>${s.title}</b> — ${s.desc}</li>`)
  .join("");

const stats = zh.about.stats
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
    font-family: "Geist Variable", "Segoe UI", "Microsoft JhengHei", "PingFang TC", sans-serif;
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
  .footer { margin-top: auto; border-top: 0.3mm solid #24405F; padding-top: 4mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #C7D2E0; }
</style>
</head>
<body>
  <div class="topline"></div>
  <div class="kicker">${zh.hero.headlineA}${zh.hero.headlineB} · ONE-PAGER</div>
  <h1>${zh.contact.headline} — ${zh.capabilities.tagline}</h1>
  <p class="sub">${zh.about.intro} ${zh.about.body}</p>
  <div class="stats">${stats}</div>

  <h2>${zh.capabilities.eyebrow} · ${zh.capabilities.headline}</h2>
  <ul>${servicesList}</ul>

  <h2>${zh.works.eyebrow} · ${zh.works.headline}</h2>
  <ul class="works">${worksList}</ul>

  <h2>${zh.how.eyebrow}</h2>
  <p class="sub" style="margin-top:2mm">${zh.how.steps.map((s) => s.title).join(" → ")}</p>

  <div class="footer">
    <span>${zh.brand} · paulstradecraft.com</span>
    <span>${zh.contact.note}</span>
  </div>
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
  "--no-pdf-header-footer",
  `--print-to-pdf=${outPdf}`,
  `file://${tmpHtml.replace(/\\/g, "/")}`,
], { stdio: "inherit", timeout: 60000 });

fs.rmSync(tmpHtml, { force: true });

if (r.status === 0 && fs.existsSync(outPdf)) {
  console.log(`[onepager] PDF generated: ${outPdf} (${fs.statSync(outPdf).size} bytes)`);
} else {
  console.error("[onepager] PDF generation failed");
  process.exit(1);
}
