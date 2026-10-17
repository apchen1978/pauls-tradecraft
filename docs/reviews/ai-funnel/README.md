# 交辦之後，誰來檢查？｜Owner Review

2026-10-18。新作品位於 `public/prototype/ai-funnel/`；本輪停在 Draft PR，不合併、不部署。

## 使用者路徑

選擇使用經驗 → 看原有的聊天示範 → 展開交辦 → 對照虛構來源 → 指出「交期待確認」被寫成「已確認」→ 改回待確認 → 停在人確認價格與交期之前 → 帶語言回 AI Lab。

沒有分數或升層判定，答錯可再試，沒有呼叫模型或寄送。中英切換保留當前選擇與修正結果，重玩會恢復原本的示範錯誤。

## 整合

- 基於最新 main `eb712ab`（含 CC 的 #329），保留新版 Hero。Showcase 前排為 ROOMVERSE → 貿易街 → 本作品。
- `public/ai-lab/` 沒有差異。來源、聊天示範與原有說明由其 `content.js` 讀入；兩句適配回覆只在新作品中定義。
- 四組人口值仍標為 Karpathy 的個人估計、據媒體報導、沒有調查資料；不是統計圖或能力評分。2026-10-17 來源檢查能讀報導，X 原文回 403；直接核對原文仍 UNKNOWN。
- 新入口加入 `withDemoLang` 及其既有檢查。這輪只加 Showcase 卡，不改 canonical Works，因此無須新增 reviewedWorkIds；OnePager 同步檢查通過。
- 封面使用 built-in ImageGen，原始 PNG／實際 prompt 留在本機 QA 資料夾。repo 只納入 WebP：816×1020／40,872 bytes；800×1000／38,276 bytes。內頁用 HTML／CSS，無新套件或網頁字型。

## 驗證

最新 main 上的定向 Chrome 測試 **20/20 通過**：

- 新作品 7 項：雙語資料與唯一錯誤、中英 ×390／1440 完整流程、答錯重試、修正前禁止完成、修正後仍待人確認、四組估計及來源、語言連結、首頁卡實際載圖、頁面錯誤／對外請求、鍵盤與減少動態、切換語言保留進度、重玩。
- 受影響的入口／順位回歸 13 項：Showcase 中英 ×390／768／1440、街角中英 ×390／1440、一盞燈第六張、ROOMVERSE 卡與前排。
- 既有測試調整只涉及順位／清單：街角 `nth(4)`、燈 `nth(5)`、Showcase 目的地清單插入新作品；保留原有互動與連結檢查。CC 在 #329 移除的快速膠囊斷言未恢復。
- `npm test` 89/89；build 通過（既有大型 chunk 警告）；語言連結 111 項、export-check 58/58、OnePager sync、document parity、`git diff --check` 通過。

依 Paul 指示只驗任務與受影響入口，沒有跑全站瀏覽器套件。Safari、Firefox、真機、讀屏器未測。

## 本機截圖與預覽

截圖、原始圖、prompt：`Desktop/AI漏斗作品_QA_2026-10-18/`。`intro-*`、`review-*`、`complete-*`、`entry-*` 各有中英 ×390／1440，另有 `reduced-*`。圖片不提交 repo。新頁無改前畫面；`entry-*` 是新版首頁入口。

在本分支執行 `npm run dev -- --host 127.0.0.1 --port 4215 --strictPort`，開 `/prototype/ai-funnel/?lang=zh` 或 `?lang=en`。訪客是否理解並能把方法用到實際工作仍 UNKNOWN；沒有真人成效驗證。
