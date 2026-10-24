# ROOMVERSE Room 02：南加州海岸，日落

## FACT

- Paul 核准將這幅曾掛在 Room 02 的插畫收入 Human–AI Gallery，並指定中性標題與公開敘事：一幅房間裡的想像插畫，不表示住戶去過洛杉磯。
- ImageGen 原始檔：`docs/gallery/sources/roomverse-room02-la-coast-imagegen-original.png`，1086×1448 RGB，2,639,556 bytes，SHA256 `afe71bdbc59e270fb043a815cbf67dfd41fdf243ddcf1f642a4fbee43b5c7644`。
- 紙邊封裝母檔：`docs/gallery/sources/roomverse-room02-la-coast-source.png`，1200×1600 RGB，2,437,831 bytes，SHA256 `ef30bc9177ecc81b9386d30272e3348d369c76be4f987477e46664ce4b9e922d`。
- 原始檔與封裝步驟可在 `Desktop/AI交接文件/2026-10-23/room02-batch14/` 的 `README.md`、`A-posters/README.md`、`sources/package_posters.py` 查核。批次記錄為內建 ImageGen 生成；腳本記錄的生成輸出檔名是 `exec-bebdeab5-7d56-4706-9269-ace35b84262b.png`，後兩幅以同批已生成圖作系列風格參考。封裝腳本裁去生成圖原有窄紙邊，再置入 6% 奶油色紙邊，未重畫城市內容。
- 原 Room 02 WebP `public/prototype/roomverse-3d/art/room02-city-los-angeles-v1.webp` 為 1200×1600、110,526 bytes、SHA256 `78f0321b01a6e1b784a7019cffeb07d2ee86d5a38560509d76e8a29288af045b`。畫廊桌機版本由此檔位元組原樣複製，Room 02 原檔未修改。
- 手機衍生圖為 800×1067、102,764 bytes；縮圖為 480×640、40,844 bytes。兩者由 1200×1600 母檔等比例縮小，沒有裁切紙邊；SHA256、品質參數與檔案大小見 `docs/qa/human-ai-gallery/asset-manifest.json`。
- 公開製作說明依可查流程寫為：Paul 提出適合美式公寓的城市畫方向並選定，Codex 使用內建 ImageGen 繪製，依三聯畫規格封裝紙邊與 WebP。

## INFERENCE

- 「南加州海岸」是根據圖像內容與批次標籤使用的描述性名稱；這幅插畫不被描述為特定街道或可定位的真實地點。

## UNKNOWN

- ImageGen 逐字提示詞未在交付資料夾或封裝紀錄中找到；批次腳本保留生成輸出檔名與原始 PNG，但不記錄完整 prompt。
- ImageGen 的內部推理、逐版生成紀錄，以及公開發布所適用的個別生成服務條款，未由本次來源包證明。
