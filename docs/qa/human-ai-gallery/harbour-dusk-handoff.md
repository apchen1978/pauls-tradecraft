# 〈黃昏的港口〉交接手記

2026-10-21。Paul 同意的文案修改：說明與〈晨光裡的港口〉成對。

2026-10-21。Paul 同意的文案修改：「怎麼做出來的」改為下面兩句。標題、說明與 alt 維持頁上現句。這是 Draft，尚未合併。合併等 Paul 寫「merge #N」。

- zh: Paul 提議讓這幅與〈黎明的港口〉配成一對。Grok Bot 以〈黎明的港口〉為風格參考，用文字生成這幅畫，再以影像工具修整細節。
- en: Paul proposed pairing this painting with Harbour at Dawn. Grok Bot generated it from a text prompt, using Harbour at Dawn as the style reference, then refined the details with image tools.

內部製作，不上頁面：生成之後，以 OpenCV 把貨櫃上的燈籠縮到合宜的大小。船身文字與標誌以 OpenCV inpaint 修去，放大檢查過文字，再用 Pillow 輸出 WebP。

## 這次放上頁面的內容

- 單獨一幅，放在「同一束晨光，兩種港口」和「日光與燈火之間」中間，沒有新的組名。桌面置中，寬度與並排時的一幅相同；390 為全寬。
- 圖用 v2 原稿 `docs/gallery/sources/harbor-dusk-clean-master.png`（SHA256 `9dc7ba3164935f31cab4cd184c54a8d713a7b99d97e84378b7f16cfaafce58e9`）轉出的三張 WebP。
- 其他畫作、頁面標題、副標、AI Lab 入口、頁尾銘牌沒有改字。

## 跑過

- `npm test`：89/89 pass。
- `node scripts/check-document-parity.mjs`：`DOCUMENT CLOSING GATE: PASS`。
- `npx playwright test tests/human-ai-gallery.spec.js`：10/10 pass。其中含中英 × 390／1440、七幅燈箱的說明與製作文字、比例、焦點循環、Escape、左右鍵（左右鍵斷言在第一幅）、無橫向溢位、AI Lab 入口與返回。
- 同一輪 Playwright 會先 `npm run build`。通過，只有既有的 chunk 超過 500 kB 警告。
- 另以中英 × 390／1440 打開〈黃昏的港口〉：Enter 後焦點在「關閉」；右鍵到下一幅（貿易街）；左鍵到上一幅（晨光裡的港口）；Escape 後焦點回到這幅的按鈕。390 與 1440 的橫向溢位都是 0。1440 燈箱用 `harbor-dusk.webp`，390 用 `harbor-dusk-mobile.webp`。

首次載入是畫廊 spec 寫進 `initial-load.json` 的本機觀察：390 為 9 requests、165,508 bytes；1440 為 10 requests、210,210 bytes。都低於 350,000。沒有手機網速或 CPU 模擬。

## 沒跑

CC 請在本機重跑。這次沒有跑：

- `npx playwright test` 全套
- `tests/ai-lab.spec.js` 整份（畫廊 spec 已涵蓋 AI Lab 結尾入口、返回與語言切換）
- `node scripts/verify-export-check.mjs`
- `node scripts/check-journey-language.mjs`
- `python scripts/check-onepager-sync.py`
- `node scripts/measure-onepager-fit.mjs`（沒有改 OnePager）
- 實體手機

## 截圖

整頁：`gallery-zh-1440.jpg`、`gallery-zh-390.jpg`、`gallery-en-1440.jpg`、`gallery-en-390.jpg`。

`lightbox-plain-*` 現在拍的是資料順序第 5 幅（index 4）〈照夜鎮・大家都在〉，因為〈黃昏的港口〉插在第三筆。AI Lab 入口圖與金框燈箱圖和上一版只有壓縮差異，已還原，不在這次 diff 裡。
