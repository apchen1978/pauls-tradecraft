# ROOMVERSE 深色牆漆 QA

本輪只新增兩個純色牆漆，順序接在「深松綠」後、壁紙選項前：

- 暮色深藍 / Dusk navy — `#66788d`
- 深酒紅 / Deep wine — `#875b5e`

色值以追劇夜、雨天與明亮家庭感的實際 3D 光線校準。兩色在追劇夜電視牆視角仍能看出藍灰與酒紅色相；電視螢幕保持黑色，周圍木層架、面板和電視輪廓清楚。日光下深酒紅與橘紅靠枕仍有明度差，掛畫及「Christ is the Head of this House」木牌可讀。

## 截圖

- `dusk-all-moods-views-1440.webp`、`dusk-all-moods-views-390.webp`：暮色深藍 × 追劇夜／雨天／Cozy family × 窗邊／電視牆／門視角。
- `wine-all-moods-views-1440.webp`、`wine-all-moods-views-390.webp`：深酒紅的同一組視角。
- `palette-tv-1440.webp`、`palette-tv-390.webp`：追劇夜電視牆同場景比較原來米白、深松綠、暮色深藍、深酒紅。
- `palette-family-1440.webp`、`palette-family-390.webp`：明亮家庭感窗邊比較同四種牆色，檢視靠枕的色彩關係。
- `postcard-dusk-zh.png`、`postcard-dusk-en.png`、`postcard-wine-zh.png`、`postcard-wine-en.png`：實際產生的中英文明信片標籤。

聯絡表由 Playwright 以 Chrome 桌面瀏覽器拍攝；390px 為瀏覽器視窗模擬，沒有在實體 iPhone 上測試（UNKNOWN）。手機選項面板無水平溢位；新增兩個漆色後仍可正常換行與捲動。

## 執行資源與驗證邊界

- 沒有新增公開執行資產、外部請求或載入邏輯。確認 3D 場景素材完成載入後切換兩種漆色，瀏覽器網路事件監測到 0 個新增請求。
- 隨機搭配以固定亂數抽到兩個新色；`wall=` 網址載入／還原及明信片中英文名稱均由測試驗證。
- 所有既有心情（含追劇夜）都可選兩款新色。聯絡表按需求收錄三種代表氣氛、三個角度與兩種視窗寬度。
