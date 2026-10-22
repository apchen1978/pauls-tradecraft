# Room 02：枕頭／抱枕滾邊與受壓（任務卡 02）

## 範圍

只改 `pillowGeo()` 與枕頭、抱枕的參數；不動被子、披毯、床架、相機、窗簾、燈、衣櫃。沒有使用 Codex 的圖轉 3D 枕頭 GLB。

## 改了什麼

1. **滾邊（welt）**：邊界保留 **2 cm** 厚度（`welt = .010`，兩片各 1 cm），接縫仍略收但不再是零厚度的尖邊；四角以 `corner` 因子收窄到約 12% 的滾邊，保留「拉尖」。
2. **封閉網格**：新增沿輪廓的邊條（rim band），把兩片布縫起來，枕頭現在是封閉曲面，陰影不會漏。
3. **厚度**：白枕 17 → **19 cm**、抱枕 14 → **16 cm**；剖面指數 .55 → .5（肩部更圓、比較像填充物）。
4. **角度不同**：白枕 `rotation(0, .05, .012)`、抱枕 `rotation(−.32, .08, 0)`，避免像複製貼上。
5. **受壓凹陷**：白枕 `dent .02`、抱枕 `dent .015`；抱枕抬高到 `BED.top + .235`，讓它坐在白枕上（滾邊可見）並在白枕表面留下淺凹，而不是整顆陷進去。

## 量測（本地 preview 4190，`__bedroom.info()` / `bedSoft()`）

| 項目 | before（main `0f13e94`） | after |
|---|---|---|
| 整房頂點 | 28,061 | **28,217（+156，估 150–250 內）** |
| mesh 數（draw call 代理） | 242 | **242（不變）** |
| `plaqueInView`（1440 床邊） | true | **true** |
| 白枕 bbox Y | 0.4750 – 0.6334 | **0.4632 – 0.6497** |
| 抱枕 bbox Y | 0.5564 – 0.7760 | **0.5867 – 0.8348** |
| 白枕 bbox Z max | −1.8100 | −1.7927 |

護欄對照：
- 白枕 `min y > mattress.max − .03` = 0.450 → 0.4632 通過（餘 1.3 cm）
- 白枕 `max y < mattress.max + .2` = 0.680 → 0.6497 通過（餘 3.0 cm；19 cm 厚沒有撞上限）
- 白枕 `max z < duvet.min z + .12` = −1.660 → −1.7927 通過
- 抱枕 `min y > 0.450` → 0.5867 通過
- 牌匾／窗簾 5 cm 間隙與 `plaqueInView`：通過

接觸陰影：`contact-bed-pillow` 仍貼在床墊面（`BED.top + .004`）；`contact-bed-cushion` 的 `surfaceY = BED.top + .17`，新白枕頂面為 `BED.top + .082 + .095 ≈ BED.top + .177`，陰影落在枕面上、沒有浮空，因此未改參數。

## 截圖（`docs/qa/room02-pillow-welt/`）

- `before-*`：main `0f13e94` 本機建置
- `after-*`：本分支
- 1440 床邊 day／night、390 床邊 day／night、1440 枕頭近拍（`__bedroom.camera` 拉近）
- 同一個 `lookTo("bed")`、同 mood、同建置流程

## 測試

- `npx playwright test tests/roomverse-bedroom.spec.js`（整檔）→ 見 PR 回報

## UNKNOWN

- 未量測真機 FPS；mesh 數不變，未宣稱效能變化。
- 滾邊是幾何近似（2 cm 邊條＋收窄四角），不是真正的縫線幾何；近拍仍可看出低多邊形摺線。
- `before-*` 是本機 main 建置，不是 production 截圖。
