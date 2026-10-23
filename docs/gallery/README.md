# 人機協作畫廊

獨立雙語靜態頁 `/gallery/?lang=zh|en`；入口只在 AI Lab「最後」末尾。首頁作品資料、OnePager、ROOMVERSE 與其他互動作品不變。

## 新增畫作

1. 先確認來源、公開使用權限及 Paul 核可；來源不明不放。保留 PNG 原稿，不以網站壓縮圖取代原稿。
2. 用技術轉檔輸出不裁切 WebP：一般橫圖約 1024px 寬、大圖；800px 手機圖；480px 縮圖。保持原圖比例（直圖亦同）。既有核准圖可直接複製，勿反覆壓縮。不要把可讀文字、品牌或未核可的人物內容帶入畫面。
3. 圖放 `public/gallery/assets/`，以描述性英文 id 命名（例如 `piece.webp`、`piece-mobile.webp`、`piece-thumb.webp`）。
4. 在 `public/gallery/pieces.js` 的 `PIECES` 新增一筆：唯一 id、ISO date、frame（gilt／plain）、width／height、image／imageSmall／thumbnail，以及 title／alt／caption／made 的 zh／en。date 記錄畫作版本日期，不在頁面顯示。
5. `made` 只寫實際可核查的製作過程；來源證據放本目錄，避免在公開頁露出私有路徑或內部測試文字。
6. 補 `docs/qa/human-ai-gallery/asset-manifest.json` 原稿 SHA256、各衍生圖尺寸／bytes／SHA256；確認第 1 幅與現代港口沿用已核准檔案。
7. 執行 `npx playwright test tests/human-ai-gallery.spec.js tests/ai-lab.spec.js` 與 SITE_RULES 的適用檢查。測試會驗中英必填欄位、缺欄位時拒絕資料、資產存在、語言切換、燈箱、鍵盤、焦點及手機溢位。

頁面會從資料自動產生縮圖、文字與燈箱。前兩筆為已核准的港口對照，其餘按資料順序呈現；日後新增一般畫作不需修改渲染程式。若要更換港口對照本身，先由 Paul 確認。

## 本次來源與 Paul 當場指示

2026-10-20：Paul 選入口 A（AI Lab 最後），首頁頁尾 B 不做；核准五幅加現代港口共六幅。兩幅港口並排，說明明寫是創作想像的對照，不是航運史考據。標題、副標依 Paul 最終用字。貿易街 v2 構圖及油彩筆觸核准，放大檢查後直接保留為完稿，不再生成或移動岸橋。所有圖不加文字與標誌；畫廊文字不提私有故事來源或未公開稱謂。

| id | 原始來源與製作證據 |
| --- | --- |
| imagined-harbor | Paul 核准保留的帆船版；桌面右牆畫作來源包 `畫廊第1幅_想像的港口`，內含原 PNG、asset-metadata.json；上層 PROMPT_concept-B.md 記錄內建 ImageGen 構圖。1024／800px WebP 原檔直接沿用。 |
| modern-harbor | #397（main 87455c8）；`public/prototype/roomverse-3d/tex/right-wall-harbor-v1.webp` 與 mobile 版原檔直接沿用；原 PNG 及提示詞保留桌面右牆畫作正式版包。 |
| trade-street | 本輪桌面畫廊提案包 `trade-street-painterly-v2.png`；PROMPT_v1_exact.txt 與 PROMPTS.md 記錄 ImageGen 生成及 Paul 的筆觸修改；正式 PNG／1024／800px WebP 另存桌面 `貿易街完稿`。參考既有貿易街地圖與 app.js mapAlt／handoff.js，不新增世界設定。 |
| nightglow-together | `prototype/teammate-type/assets/nightglow-finale-postcard.png`；Git b4205d7、4251cd6；`.github/qa/december-lamp-story/ART.md` 記錄 ImageGen、站位及細節調整。既有正式站終章可見，本輪僅技術縮圖。 |
| clocktower-map | Git 3048bcc／#247；既有 `easter-clocktower.webp`。桌面封存的彩蛋交稿包含 `原稿/easter-clocktower.png`、README.md 和 ImageGen 方法；本輪由原 PNG 技術縮圖。 |
| warm-window | Git 3048bcc／#247；既有 `easter-warmwindow.webp`。來源包同上，保留 PNG 及共同場景光線的交稿記錄。 |

三幅既有冬夜圖在來源盤點階段透過正式站資產 URL 取得並比對 SHA256，與 repo 相符；本輪未重新走完冬夜遊戲的解鎖流程。畫廊使用的是一幅真正終章大合照，加兩幅日常群像，沒有把日常群像誤稱成大合照。

四幅放大檢視：貿易街船／吊具／小人物、合照人物與衣飾、鐘樓地圖與人物、現代港口船身／岸橋；裁切圖放 QA。未見可讀文字、品牌、真實國旗或故事名稱；這是人工目視檢查，不宣稱自動辨識能排除全部細微瑕疵。

所有畫作均屬創作；不宣稱真實港口、實際營運、歷史考證或商業成效。新增說明文案交 Paul／CC 審定；Paul 已逐字指定的標題與副標照用。

## 2026-10-21：補入冬夜舞台場景與 AI Lab 封面入口

Paul 指示把《十二月的燈》尚未收入畫廊的場景畫加入。核對四張已交稿彩蛋圖後，畫廊原有其中兩幅（鐘樓地圖、暖窗修補）；「大家都在」是另一張終章群像，不是四張彩蛋之一。這輪補入剩下兩幅「街燈下的相遇」與「露天舞台散場後」，公開標題不展示角色姓名或私有故事設定。

| id | 原稿與製作證據 |
| --- | --- |
| winter-lamplight | 原稿 `docs/gallery/sources/winter-lamplight-original.png`；來源為 2026-10-15 已由 Paul 看過並同意交稿的冬夜場景。封存素材 README 記錄以內建 Image 2.0 參照既有角色圖重繪；PNG 原稿 1122×1402、3,044,380 bytes。WebP 衍生圖尺寸、bytes 與 SHA256 見 `docs/qa/human-ai-gallery/asset-manifest.json`。 |
| stage-after-show | 原稿 `docs/gallery/sources/december-stage-original.png`；來源為 2026-10-15 已由 Paul 看過並同意交稿的彩蛋圖。`Desktop/09_封存/2026-10_完工/十二月的燈素材/給Grokbot_彩蛋/README.md` 記錄以內建 Image 2.0 參照既有角色圖重繪場景；PNG 原稿 1122×1402、2,610,743 bytes。WebP 衍生圖尺寸、bytes 與 SHA256 見 `docs/qa/human-ai-gallery/asset-manifest.json`。 |

AI Lab 結尾入口改成雙語作品卡，以三張畫廊縮圖構成預覽封面；資產維持延遲載入，連結仍寫入訪客目前的語言。公開文案不增加故事人名或未公開設定。

## 2026-10-21：AI Lab「門外，是更大的世界」

Paul 希望「和 AI 一起推開一扇門」的畫面更遼闊，並決定使用沒有飛行車的版本。以 ImageGen 完成的原稿保存在 `docs/gallery/sources/ai-lab-open-horizon-original.png`；AI Lab 用一張 1600×900 桌機 WebP 和一張由同一原稿取景的 780×1100 手機 WebP。畫廊另新增一筆 `ai-lab-open-horizon`，使用 1024／800／480px 的獨立衍生圖。尺寸、品質和雜湊值記錄在 `docs/qa/human-ai-gallery/asset-manifest.json`。

原有的〈想像的港口〉、〈晨光裡的港口〉及其飛行車畫面沒有修改；這件新作也不宣稱畫面是真實場景或具體未來技術。

## 2026-10-21：AI Lab 兩幅門與遠方並排

Paul 核准新完成的室內門窗畫，並指定在這組對照中放第一幅、上述開闊海灣畫放第二幅。第一版原稿保留在 `docs/gallery/sources/ai-lab-digital-room-original.png`；加上智能面板、窗上方冷暖氣機與霧藍織紋壁紙後的定稿另存 `docs/gallery/sources/ai-lab-digital-room-smart-home-wallpaper-v3.png`，沒有覆蓋任何既有畫作。畫廊桌機並排、手機上下排列；作品敘述將它標為概念插畫，不宣稱這是已存在的產品或技術。定稿與 1024／800／480px WebP 的 SHA256、大小與尺寸見 `docs/qa/human-ai-gallery/asset-manifest.json`。

同一張定稿也替換 AI Lab 開場插畫：桌機為 1600×900 WebP；另以定稿為參照、重新構圖一張 780×1100 手機版，來源保留在 `docs/gallery/sources/ai-lab-digital-room-mobile-v1.png`。先前的開闊海灣插畫仍留在畫廊第二幅，舊 AI Lab 資產也沒有覆蓋。

## 2026-10-24：ROOMVERSE 01 與 02 概念畫作

Paul 選定兩幅加入畫廊：Room 01 使用精修機器人的畫家筆觸版本；Room 02 使用 Brooklyn Studio 畫家筆觸版本。兩幅都是概念畫作，沒有替換 ROOMVERSE 的作品封面或 3D 場景。

| id | 原稿與製作證據 |
| --- | --- |
| roomverse-room01-concept | `docs/gallery/sources/roomverse-room01-concept-source.png`；參照 Room 01 已完成封面，以 ImageGen 增加畫家筆觸，再局部精修機器人。Paul 指定使用精修機器人的版本。 |
| roomverse-room02-brooklyn-concept | `docs/gallery/sources/roomverse-room02-brooklyn-concept-source.png`；參照 Room 02 Brooklyn Studio 封面，以 ImageGen 加強布魯克林街屋、水塔、大橋與畫家筆觸。Paul 指定使用此版本。 |

公開圖使用 1122×1402 原比例 WebP、800×1000 手機圖與 480×600 縮圖；檔案大小與 SHA256 記在 `docs/qa/human-ai-gallery/asset-manifest.json`。Room 02 畫面允許比互動場景更自由的城市想像，公開文字均標為概念畫作。
