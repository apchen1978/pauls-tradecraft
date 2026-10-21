# ROOMVERSE 3D：「福杯滿溢」春聯轉角度變黑

## 結論

真正原因是**春聯背後那張柔和陰影貼片**，不是紙的材質。

那張貼片用了 `polygonOffsetFactor: -2`。這個偏移會依「面在畫面上的斜率」放大：鏡頭一轉，斜率變大，貼片的深度就被推到紙面前方，於是一片半透明的暗色（`rgba(36,18,14,.5)`）蓋在紅紙上——看起來就是「紅紙發黑」。

## 量測（同一台機器、同一個視窗、同一個 mood，只換版本）

在紙面位置取紅色像素平均（0–255）。`before` 是同一份程式、只把三處改動還原：

| 視角 | before（暗） | after（修好） |
|---|---|---|
| −40° | (103.3, 7.2, 10.9) | (156.1, 9.0, 14.3) |
| −20° | (101.8, 7.0, 10.5) | (154.4, 8.3, 13.7) |
| 0° | (103.4, 7.1, 10.6) | (154.9, 8.2, 14.1) |
| ＋20° | 已正常 | 已正常 |
| ＋40° | 已正常 | 已正常 |

隔離測試（只還原其中一項，其餘保持修正後）：

| 版本 | 紅色平均 |
|---|---|
| 全部還原（原始） | 102.7 |
| **只還原 `polygonOffset`** | **102.7 → 修掉它才變亮** |
| 只還原 `receiveShadow` | 155.5（幾乎無影響） |
| 只還原 `roughness` | 155.6（幾乎無影響） |

→ 陰影貼片的深度偏移是唯一主因；其餘兩項是照交接文件要求補強的啞光處理。

## 改了什麼（`public/prototype/roomverse-3d/app.js`）

1. **陰影貼片移除 `polygonOffset`**（保留 `transparent`、`depthWrite: false`）。這是一行級的修正，也是真正的修法。
2. 紙面材質改成**霧面宣紙**：`roughness .9`、`metalness 0`，不做亮面反射。（場景沒有 `scene.environment`，所以沒有另加環境反射設定。）
3. 紙面 **`receiveShadow = false`**：紙離牆只有 5 mm，牆面的 shadow map 容易咬進來（shadow acne）；接地感改由陰影貼片提供。
4. 貼圖各向異性過濾改為 `min(8, renderer.capabilities.getMaxAnisotropy())`。
5. 快取版號：`page.js?v=25`、`app.js?v=26`。

尺寸（20×70 cm）、位置、間距 14 cm、字樣、牌匾都沒有動。

## 驗證

- `npx playwright test tests/roomverse-blessing-couplet.spec.js`：2 passed
- `npm test`：89 passed
- `node scripts/check-journey-language.mjs`：PASS
- `node scripts/check-document-parity.mjs`：PASS
- `python scripts/check-onepager-sync.py`：OK

## 截圖

`before-{1440,390}-{m40,m20,zero,p20,p40}.png` / `after-*`，對應 −40°、−20°、0°、＋20°、＋40°。
