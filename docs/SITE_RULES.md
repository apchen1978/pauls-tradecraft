# paulstradecraft.com 規則與流程

給改這個網站的人與 agent。最終決定權在 Paul；規則衝突時停下來回報，不自行解釋或改寫。

## 一、硬規則（每個 PR 逐條自查，違反任何一條都不能 merge）

**用字與內容**
- AI 只能出現在首頁 Hero（以及 OnePager 的 kicker）。其他公開文案不提 AI。
- 公開文案不出現「中間層」「A2A」「CDD」。CDD 是內部簡寫；作品名「商務決策工作台」照用。
- 不寫 ROI 或成效宣稱，不放未經驗證的數字。
- Demo 一律標示「示範／成效未驗證」，只用虛構資料。
- 不放真實公司名稱，不放私人 repo 連結。
- 寫「負責人」（英文 decision-maker），絕不寫「老闆」。
- 不寫「前職」（英文不寫 "Former role"）。`scripts/check-document-parity.mjs` 會擋。
- 公開頁不放內部說明或 meta 文字：測試紀錄、PASS 數、「各自獨立／共用資料模型」這類開發者說明。
- LM = linear meter = 直米。中文一律寫「直米」，絕不寫「延米」或「質米」。
- 「數位中間層」概念只在內部使用，不上公開頁。
- 對外說法一律從「怎麼幫負責人拿到第一張訂單」開始。
- 在有真實客戶之前，不寫任何開發信草稿。
- 頁尾和聯絡區不顯示明文 email 地址。

**數字與判斷**
- 利潤試算用「出口前費用」：案例是 FOB，海運費由買方負擔，不能改回「運費」。
- 第一張訂單的毛利底線仍是「待 Paul 確認」。**35% 只是本示範設定的報價毛利**（寫成「本示範設定的 35%」或「示範設定的報價毛利」），不要在任何地方寫成 Paul 建議的底線。
- 「Paul 會先看」判斷卡的句子，只能由 Paul 寫或逐句確認。任何 agent 都不可以替 Paul 發明判斷或數字。判斷卡標示為「Paul 的經驗判斷」，不冒充數據。

**效能與版面**
- 不載入大型中文網頁字型（中文用系統字）。
- 圖片用 WebP，並提供 800px 手機版。
- 第一屏不能依賴捲動動畫才出現。
- 390 寬不能有水平溢位。

## 二、分支與 PR
- 一個改動 = 一個 branch = 一個 PR，不混入不相關的改動。
- Paul 沒說 merge，就不 merge。
- Draft PR 要先標成 ready for review 才能 merge。
- Merge 後等 GitHub Pages 部署（`.github/workflows/deploy.yml`，約 2–3 分鐘），再到線上實際驗證。
- OnePager PDF 在部署時由 `scripts/make-onepager.mjs` 從 `content/onepager-*.json` 產生；改 OnePager 後要確認線上 PDF 也更新。
- 回報 Paul：簡短繁體中文，先講結論；附 390／1440 前後截圖（中英都要）；不貼大段程式碼或測試輸出。

## 三、每個 PR 必跑的檢查
```bash
npm test                                   # verify-trade-decision-workflow + verify-profit-calculator
npm run build                              # 預期只有既有的「chunk 超過 500 kB」警告
node scripts/verify-export-check.mjs
node scripts/check-journey-language.mjs
python scripts/check-onepager-sync.py      # Windows 沒有 python3 時用 python 或 py
node scripts/check-document-parity.mjs
node scripts/measure-onepager-fit.mjs      # 改到 OnePager 時必跑（必須仍是一頁 A4）
npx playwright test                        # tests/ 下全部 spec
```
數字（58/58、61 等）會隨時間變動，以腳本當下輸出為準。

## 四、檔案地圖
| 用途 | 路徑 |
| --- | --- |
| 作品資料 | `src/data/works.js` |
| 作品卡（inline 工具的掛載點） | `src/components/Works.jsx` |
| 中英文案 | `src/i18n.jsx`、`src/zhPhrase.js` |
| 六道關卡 | `src/components/TradeDecisionWorkflow.jsx`、`src/data/tradeDecisionWorkflow.js` |
| 迷你利潤試算 | `src/components/ProfitCalculator.jsx`、`src/data/profitCalculator.js` |
| 判斷卡 | `src/components/JudgmentNote.jsx`（句子在上面兩個資料檔） |
| 兩分鐘試玩入口 | `src/components/TryIt.jsx` |
| 首屏以下的區塊組裝 | `src/BelowFold.jsx` |
| 外部 demo 連結 | `src/demoLinks.js` |
| HTML 殼、meta、JSON-LD | `index.html`（嚴格 CSP：`script-src 'self'`，不能用 inline script） |
| OnePager 內容 | `content/onepager-zh.json`、`content/onepager-en.json` |
| 案例頁 | `public/cases/*` |
| 原型頁 | `prototype/*/` |
| 部署 | `.github/workflows/deploy.yml` |
