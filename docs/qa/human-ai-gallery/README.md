# 人機協作畫廊驗收

2026-10-20；狀態：本機驗收及 Draft PR，未部署。

## Scope / Paul 當場指示

- 入口 A：AI Lab「最後」末尾一個小連結；不做首頁頁尾 B，不新增作品卡或改 OnePager。
- 共六幅，前兩幅為帆船／現代港口對照；既有兩版港口的 1024／800px WebP 原檔直接沿用。
- 標題及副標照 Paul 指定，中英雙語。所有畫面與圖說都不新增私有故事設定。
- 貿易街 v2 核准後，放大檢視船、吊具、小人物；保留核准的油彩筆觸，沒有再生成。

## 檢查結果

- `npm test`：89/89。
- `npx playwright test tests/ai-lab.spec.js tests/human-ai-gallery.spec.js` 首輪 AI Lab 20 項全過；畫廊發現 Tab 邊界問題，已以首尾焦點循環修正。後續調整測試，改以 image 的 width／height 屬性核對原始比例（呈現框採 contain，不能把可見框的比例當作畫作本身比例）。
- 最終 `npx playwright test tests/human-ai-gallery.spec.js`：10/10，含中英×390／1440、六幅大圖、正反 Tab、Esc、左右鍵、焦點返回、雙語入口／返回、手機與桌機資產選用、無橫向溢位、reduced-motion、觸控尺寸及資料缺欄位拒絕。
- `npm run build`：通過（Playwright webServer 每次啟動先執行）；僅既有 chunk >500 kB 警告。
- `node scripts/verify-export-check.mjs`：58/58。
- `node scripts/check-journey-language.mjs`：123 checks PASS。
- `python scripts/check-onepager-sync.py`：PASS。
- `node scripts/check-document-parity.mjs`：PASS。
- `git diff --check`：PASS。
- 全套 Playwright 未跑；實體 iPhone 未測。

## 螢幕與素材檢查

`gallery-{zh|en}-{390|1440}.jpg`：整頁。拍攝前先捲過各幅縮圖，確認延後載入完成，再回頂拍全頁，避免把還未捲到的空白框當成驗收圖。

`lightbox-gilt-*`、`lightbox-plain-*`：金框與細框；大圖 contain、全幅保留，直幅在手機使用燈箱內部捲動閱讀說明。`entry-*`：AI Lab 結尾入口；最小觸控高度 44px。

`trade-detail-review.jpg`、`finale-detail-review.jpg`、`clocktower-detail-review.jpg`、`modern-detail-review.jpg`：四幅放大裁切。人工目視未見可讀文字、小說名稱、品牌、真實國旗或明顯扭曲；這是人工審圖，不是自動完美性保證。其他原稿來源與製作方法見 `docs/gallery/README.md`。

`asset-manifest.json`：原稿 SHA256，以及所有 WebP 的尺寸、bytes、品質與 SHA256。加入兩幅冬夜場景後共 24 個網站 WebP，合計 2,624,204 bytes；不一次全載。貿易街筆觸密集，大圖 143,414 bytes、800px 圖 94,194 bytes，沒有為湊 90KB 再次破壞畫面；原 PNG 保留在來源資料夾。

## 首次載入觀察

方法：本機 preview、Chrome、全新 browser context、固定首屏不捲動、networkidle，Navigation Timing 加 Resource Timing 的 encodedBodySize；含 HTML／CSS／JS／已觸發縮圖／favicon，不含 HTTP headers。無手機網速或 CPU 模擬。原始紀錄 `initial-load.json`。

| viewport | requests | encoded body bytes |
| --- | ---: | ---: |
| 390×844 | 9 | 165,659 |
| 1440×900 | 10 | 210,361 |

原生 lazy-loading 會預取視窗附近的縮圖，所以桌機此尺寸會載六幅縮圖，手機此尺寸載四幅。開燈箱前沒有載任何大圖；AI Lab 頂部不請求畫廊資產，捲到結尾封面卡時載三張預覽縮圖，合計 164,852 bytes。這些是本機觀察，不代表正式站傳輸時間、真機效能或跨網路成效。

## Document parity

網站新畫廊與 AI Lab 小入口：CHECKED。OnePager ZH／EN、能力簡介：N/A（非能力定位或首頁作品清單改動，無新成果／成效宣稱）；既有 parity 腳本通過。ZH/EN semantic parity：人工檢視，待 CC／Paul 最終審定。Claim boundary：兩港口明寫創作對照，不是航運史考據；未宣稱真實營運。來源不明資產未納入。

FACT：本機結果及截圖如上。INFERENCE：夜間展廳與古今港口並排能讓畫作關係更易理解，尚無訪客回饋。UNKNOWN：實體手機／正式站表現、CC 最終措辭審查。不得以本文件表示已合併或發布。

## 2026-10-21 follow-up

- 畫廊由 7 幅擴為 9 幅；補入已核可的「街燈下的相遇 / A Meeting by Lamplight」及「散場以後 / After the Show」兩幅冬夜場景原稿與 1024／800／480px WebP 衍生圖。來源及公開內容邊界記於 `docs/gallery/README.md`。
- AI Lab 結尾入口改為雙語封面卡，預覽由三張畫作縮圖組成；只載入縮圖，不預載畫廊大圖，語言仍由 `?lang=` 保留。
- 驗證：`npm run build` 通過（有既有 >500 KB chunk 警告）；`npm test` 89/89；AI Lab 瀏覽器測試 20/20；畫廊瀏覽器測試 10/10，涵蓋中英 × 390／1440、九幅大圖、雙語接續、入口三圖載入、無水平溢位、燈箱鍵盤／焦點、reduced-motion 與觸控尺寸。
- 本次畫廊頂部首次載入觀察更新為 390×844：9 requests／165,659 bytes；1440×900：10 requests／210,361 bytes。只在 AI Lab 結尾入口載入的三張縮圖合計 164,852 bytes；不預載大圖。
- 正式站、實體手機及 Safari 尚未驗證；瀏覽器結果是本機 Chrome。
