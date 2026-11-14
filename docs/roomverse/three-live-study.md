# Room 04 × Three-Live：四場景小試驗

**結論。** Three-Live 的四視角圖適合人工快速定位問題；本次 `validate` 未抓到任何一個 Room 04 在意的細部擺位錯誤。先做 Room 04 自有的支撐／穿壁審計（卡 65-B），目前不把 Three-Live 加進依賴或必跑流程。

## 方法與實測

使用 [Google v1.4.0 Windows CLI](https://github.com/google/three-live/releases/tag/v1.4.0)（SHA-256 `1256617380D4DE291C5A41FCAD9BD798E3DD3C454FA4508865586701449A00DC`），程式放在系統暫存資料夾。依 [允許的 `THREE.*` 子集](https://github.com/google/three-live/blob/main/docs/llm-guide.md)建立四份獨立場景：地板、桌子、椅子、杯子、窗框；單位為公尺。各場景的唯一差異是 `fault` 值。每份執行 `three-live-cli validate <檔案> --json` 與 `three-live-cli render <檔案> --view=quad --grid --annotations -o <暫存 PNG>`。四張圖均為 1024×1024，存於本機暫存資料夾，未納入 PR。

| 場景 | 刻意安排的幾何狀態 | `validate` 是否抓到 | 四視角圖 |
| --- | --- | --- | --- |
| [`ok.js`](three-live-trial/ok.js) | 椅腳進座面 5 mm；杯底貼桌面；腳落地 | 零診斷；無誤報 | 接合外觀正常 |
| [`edge.js`](three-live-trial/edge.js) | 椅腳外緣僅貼座面側緣，水平深入 0 mm | **漏掉**；`valid: true`、零診斷 | 俯視可見腳偏到座面邊緣 |
| [`cup-through-table.js`](three-live-trial/cup-through-table.js) | 杯底低於桌面 12 cm | **漏掉**；`valid: true`、零診斷 | 杯子大半沉入桌面 |
| [`float.js`](three-live-trial/float.js) | 四支椅腳底離地 5 cm | **漏掉**；`valid: true`、零診斷 | 正面／斜視可見懸空 |

四份均編譯成 17 個 mesh、454 頂點，`validate` 沒有任何診斷。這只能證明**本試驗的**三種錯誤未被偵測；零誤報也只限這份正常場景。官方 `validate` 偏重場景層級的視錐、接地與重疊遙測，沒有「哪支腳應深入哪個座面」的支撐關係輸入。[CLI 說明](https://github.com/google/three-live/blob/main/docs/llm-guide.md#5-closed-loop-ai-agent-verification-three-live-cli--mcp-server)也提供四視角及參考圖比對，但圖片仍需人或專用規則解讀。

## 對 Room 04 的判斷

真實 [`cafe.js`](../../public/prototype/roomverse-3d/cafe/cafe.js) 使用瀏覽器 `WebGLRenderer`、多處 `CanvasTexture`、自訂動態燈與按需重畫，還有按材質合併幾何。Three-Live 支援部分 CanvasTexture，但其 sandbox 有 [受限 API 與預設 100,000 頂點配額](https://google.github.io/three-live/llms-full.txt)；Room 04 [帳本](../../tests/helpers/room04-ledger.js)目前記錄 194,581 頂點。因此無法把 `cafe.js` 原檔直接交給 CLI 並期待等價場景或等價渲染。這是程式結構與配額的判斷，未做整房轉譯實測。

**「10 萬個 3D 模型」：查不到。** [官方專案](https://github.com/google/three-live)、[發表文](https://opensource.googleblog.com/2026/)和[範例目錄](https://google.github.io/three-live/)未提供該資產庫或語意檢索的可核驗入口；範例目錄標示 57 個參數化零件。文件中的 **100,000** 指單一場景的預設**頂點上限**，不能當成模型數。下一步是卡 65-B：直接針對 Room 04 的實際支撐關係寫可量測、可回歸的規則。
