# ROOMVERSE 左牆掛畫 QA

基準：main `42b61a1`。〈黃昏的港口〉掛在左牆，與右牆〈黎明的港口〉成對。畫布用 Paul 更新後的 WebP，原檔放入，沒有重畫。桌面 `left-wall-harbor-dusk-v1.webp` 1280×720、84,196 bytes；手機 `left-wall-harbor-dusk-mobile-v1.webp` 800×450、38,342 bytes。放大檢查船身、帆與岸線，沒有可讀文字、標誌、船名或旗。

## 位置
掛畫群組中心 **(-2.592, 1.5, 1.0)**。左牆在 x=-2.6，群組離牆 8 mm，避免和牆面重疊。畫布 1.2×0.675 m（16:9），金框與黃銅畫燈用程式做，沒有新增即時光。光暈是牆面漸層，強度跟氣氛：雨天 0.12、追劇夜 0.1152、Cozy family 0.036。

這個位置是看過掛畫前的左牆全景 `before-placement-1440.jpg` 之後定的。空的一段在左牆靠房間前方（正 z）。落地燈與植物在後方約 z=-1.7，矮椅約 z=-0.5 且很低，窗光在後牆。量到的畫布範圍：y 1.1625–1.8375，z 0.40–1.60。與落地燈、植物、矮椅、木牌沒有相交。即時光源仍是 6 盞。

## 給 Paul 看的全景
左是掛上之前，右是掛上之後。角度 90°，正對左牆。

| 氣氛 | 1440 | 390 |
| --- | --- | --- |
| 追劇夜（深酒紅） | `before-after-tv-1440-front.jpg` | `before-after-tv-390-front.jpg` |
| 雨天（米白） | `before-after-rain-1440-front.jpg` | `before-after-rain-390-front.jpg` |
| Cozy（柔橄欖） | `before-after-family-1440-front.jpg` | `before-after-family-390-front.jpg` |

單張全景：`{tv,rain,family}-{1440,390}-front.jpg`，掛上之前是 `before-{mood}-{width}-front.jpg`。

## 已跑
- `npm test`：89 passed。
- `tests/roomverse-left-wall-art.spec.js`：5 passed。含 390／1440 延後載入、16:9、不撞燈／植物／椅、失敗時留素色畫布、光暈隨氣氛、以及下面的截圖。
- 同一輪 Playwright 另外 71 passed：`tests/roomverse-3d.spec.js` 裡通過的項目、`tests/roomverse-director.spec.js`、右牆掛畫功能項（不含會重寫舊截圖的 QA 項）、層架功能項、電視畫面。導演短片與明信片測試有跑過並通過。
- Playwright 的 preview 建置有跑，只有既有的 chunk 超過 500 kB 警告。
- 側視、近景、前後並排也在這次 spec 裡產生了：`{mood}-{width}-side.jpg`、`{mood}-{width}-detail.png`、`before-after-{mood}-{width}-{front,side,detail}.jpg`。近景的「之前」是從掛畫前全景依同一畫面範圍裁的。`geometry-and-glow.json` 有邊界與光暈。

## 沒跑（請 CC 在本機重跑）
- `tests/roomverse-3d.spec.js` 三項在這台機器上超過 60 秒而逾時：`new wall paints restore from the URL…`、`night paint visuals…`、`existing mood postcards…`。明信片那項在還原成未改的程式後單獨再跑，同樣逾時，不是這次掛畫引入的斷言失敗。
- 全站 `npx playwright test` 沒跑。
- 沒跑：`node scripts/verify-export-check.mjs`、`node scripts/check-journey-language.mjs`、`python scripts/check-onepager-sync.py`、`node scripts/check-document-parity.mjs`、`node scripts/measure-onepager-fit.mjs`（One-pager 沒改）。
- 沒測實體 iPhone。
- 右牆 QA 截圖項、層架 QA 截圖項這次故意沒跑，避免重寫舊的 QA 圖。

## 沒改的範圍
木牌「Christ is the Head of this House」、其他燈、renderer、牆漆預設、導演鏡頭、明信片、示意標籤與其他文案都沒改。`page.js` 只把 `app.js?v=6` 改成 `v=7`，`index.html` 只把 `page.js?v=5` 改成 `v=6`。掛畫程式在 `app.js` 裡自成一塊，另外只在 `setLights` 與閒置載入各加一行。
