# ROOMVERSE 3D：紅圍巾改成精品喀什米爾風（第二輪）

## 這一輪改了什麼（回應審查的三點）

1. **「像板子」**：兩條尾巴在鉤子下方再左右錯開（各 1.6 cm，平滑過渡）、前後錯開 1.4 cm；鉤子處把布收窄到 55% 再往下展開（過渡拉長到 t 的 35%，避免急轉）。正面看得到前後兩片、下擺有高低差與起伏。
2. **流蘇看不到**：加長到 **10 cm**、線條從 2.6 px 加粗到 **4.2 px**、條數 26→**30**；390 手機的近景也看得到。
3. **尺寸從 162.6×25 變成 180×30**：照交接文件（Paul 的意見）的「約 180×30 cm、厚 0.8–1 cm、兩端約 8 cm 流蘇、兩邊長度不一 75/85」。這是**依指示變更**，不是自己改的。
4. **`docs/qa/roomverse-hall-stand/` 的 10 張 jpg**：這一輪已從 PR 移除（那是既有測試自動產生的圖，不是這次的 QA；測試跑完會在本機重寫，但不進 PR）。

## 成果

- 180×30 cm、厚 1 cm；兩條尾巴 85 / 75 cm，含流蘇全長約 188 cm。
- 人字織紋（256² canvas）＋同圖 bumpMap（bumpScale .0035）。
- 兩端 10 cm 流蘇：透明貼圖、30 條細線、雙面材質、alphaTest .35。
- 材質 roughness .96、metalness 0、DoubleSide；暖紅（依交接文件，未改成酒紅）。

## 量測（`window.__room.hallStand()`）

| 項目 | 值 |
|---|---|
| 寬 | 0.300 m |
| 厚 | 0.010 m |
| 垂墜 | 0.853 m / 0.753 m |
| 布料長（中心線） | 1.686 m |
| 全衣帽架頂點 | 3,961（上限 4,000） |
| 流蘇 / 凹凸貼圖 | true / true |

## 沒有動到

底座 41 cm、桿徑、6 支鉤子（1.65 m）、衣帽架高度、白板、春聯、牌匾「基督是我家之主」。

## 驗證

- `npx playwright test tests/roomverse-hall-stand.spec.js` → 3 passed
- `npm test` → 89 passed
- `check-journey-language`／`check-document-parity`／`check-onepager-sync` → PASS

## 截圖

`rain-room-1440.png`、`rain-close-1440.png`、`slow-room-1440.png`、`tv-room-1440.png`、`tv-close-1440.png`、`rain-room-390.png`、`rain-close-390.png`、`tv-close-390.png`
