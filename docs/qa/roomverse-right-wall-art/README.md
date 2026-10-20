# ROOMVERSE 右牆掛畫 QA

基準：main `38b076b`；視窗 1440×900、390×844。圖片為原創現代支線貨櫃船版。三組視覺驗收：追劇夜 wine、雨天 original、Cozy family olive。側牆沿用房間既有的米白材質；wine／olive 是既有前後牆配色，本次沒有改牆材質。

## 變更與邊界
- 1.2×0.8m 畫布，中心 (x=2.592, y=1.5, z=-0.65)，面朝室內；分層金框、黃銅畫燈、局部加法混合漸層。
- 幾何與貼圖延後到進場後 idle 或主動轉到右牆時載入；首次可互動前不建掛畫、不多請求新資產。失敗時保留素色畫布與畫框。
- 1024×683 / 89,276 bytes；800×533 / 86,164 bytes。每位訪客只載入對應的一張。整幅來源不裁切，金框內緣開口略大於畫布。
- 即時光源維持 6 盞；未改 MOODS、既有燈光參數、renderer 設定或導演鏡頭。`page.js` 僅把模組快取版本 v4 更新為 v5。

## 驗證
- `tests/roomverse-3d.spec.js` + `tests/roomverse-right-wall-art.spec.js`：46 passed；快取版本更新後另複跑掛畫 spec 5 項。
- `npm test`：89 passed。
- build：PASS（既有 >500 kB chunk 提示）。
- export check：58/58；語言檢查：123 checks；One-pager sync、document parity、diff whitespace：PASS。
- 全站 Playwright 全套未跑。未測實體 iPhone。

## 交錯載入量測
Chrome 155.0.8059.85，同機同日，4× CPU 降速。新 context／停用網路快取，兩版各暖機一次，再以交錯順序各量 5 次。量測起點是進場 click 事件，終點是首張房間 render 後 `__room` 指派可互動。

| 視窗 | 修改前中位數 | 修改後中位數 | 差異 |
| --- | --- | --- | --- |
| 1440×900 | 1601.9 ms | 1676.1 ms | +74.2 ms |
| 390×844（DPR 2，房間上限仍 1.5） | 1548.1 ms | 1630.1 ms | +82.0 ms |

這是本機模擬的觀察值，不代表實體手機或公開站效能保證。`performance-and-parity.json` 保存原始各次值，before 確認不存在 `rightWallArt`，after 確認存在；帶查詢參數的 app.js 每次必須命中攔截一次。

重現：先在此分支根目錄啟動既有 preview（4175），再執行 `node docs/qa/roomverse-right-wall-art/measure.mjs`。它直接從 git 基準版本與工作樹取得兩份程式，在相同網址／資產上對照；不修改產品設定。

## 沙發與明信片
- 390px：沙發視角與明信片逐點比較零差異。
- 1440px：差異限定在最右側 x=1293..1359、y=103..390 的新掛畫／畫燈自然入鏡部分；其他像素一致。共 16,655 changed pixels，未改沙發、窗邊光線、家具或下載卡文字。
- 8 秒短片完成後兩種寬度均還原原來房間、相機與網址。原鏡頭沒有特別拍向右牆，沒有為此改路徑。

## 檔案導覽
- `before-after-1440.jpg`、`before-after-390.jpg`：三種氣氛前後並排。
- `<mood>-<width>-front.jpg / side.jpg / detail.png`：右牆全景、側視、實際渲染細節裁切。近景只裁切真實渲染，不改正式相機。
- `before-/after-sofa-*.png`、`before-/after-postcard-*.png`、`*-difference.png`：沙發、明信片與差異證據。
- `tour-*.jpg`：短片進行中畫面。
- `source-detail-contact.jpg` 與 `source-detail-*.png`：船身／貨櫃／岸橋、人物臉與機器人手的原尺寸人工檢查。
- `geometry-and-glow.json`：三氣氛雙寬度的邊界、碰撞與光暈透明度。
- `unchanged-source-blocks.json`：MOODS、renderer 與導演路徑原始碼區塊未變的雜湊檢查。

## 文件一致性
Website：CHECKED（局部插畫與裝飾，沒有新增對外能力宣稱）。One-pager ZH/EN、能力簡介：N/A（不改定位、作品清單、順序、服務或交付狀態）。ZH/EN semantic parity：PASS（無新增公開文案）；claim boundary parity：PASS；document closing gate：PASS。

