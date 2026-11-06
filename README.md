# 傅立葉畫台灣 · Fourier Draws Taiwan

Vite + 原生 JavaScript 的傅立葉繪圖動畫。支援台灣本島與 22 縣市、1–512 個旋轉圓、跳躍式自動示範與暖色／深色配色。

[線上體驗](https://gemini960114.github.io/taiwan-fourier/) · [GitHub](https://github.com/gemini960114/taiwan-fourier)

推送至 `main` 後，GitHub Actions 會執行測試、建置並部署到 GitHub Pages。

## 啟動

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

開啟終端機顯示的網址（通常為 `http://localhost:5173`）。遠端環境請透過平台提供的埠轉送／預覽網址開啟 5173 埠。

```bash
npm test
npm run build
npm run preview
```

正式網站在 `dist/`，部署到靜態網站服務即可。這個版本使用 JavaScript 模組與資料載入，請透過開發伺服器或網站開啟，不再直接雙擊 HTML。

## 使用

主畫面保留精簡播放列；圓數 N 下拉選單與輪廓選單並排，提供 1、2、4…512 與自訂 1–512，預設 N = 1。點「設定」開啟顯示圓與配色切換。設定立即生效，可按完成、Esc 或點視窗外關閉。傅立葉公式常駐主畫面，詳細原理與資料來源收在「原理與圖資」展開區。預設暖米白便利貼配色，可切換深色並記住選擇。

- 自動示範：1 → 2 → 4 → 8 → 16 → 32 → 64 → 128 → 256 → 512，每階段一圈，最後停留。
- 選單可切換台灣本島／22 縣市。自動示範中切換會從 1 圓重播；手動模式保留圓數與暫停狀態。
- 預設速度 2×，可選 0.5×、1×、2×、4×、8×、16×。

## 結構

- `src/fourier.js`：等弧長取樣、傅立葉分析及重建誤差。
- `src/player.js`：手動／自動播放狀態。
- `src/renderer.js`：Canvas 繪圖、縮放與清晰配色。
- `src/main.js`：介面事件與縣市切換。
- `src/data/`：可隨網站部署的本島與縣市資料。

## 圖資來源與範圍

本島來源：[Natural Earth 1:10m](https://www.naturalearthdata.com/)，public domain。

縣市來源：[內政部國土測繪中心／政府資料開放平臺](https://data.gov.tw/dataset/7442)，[官方下載頁](https://maps.nlsc.gov.tw/pro/download.jsp)。本次下載檔為 `COUNTY_MOI_1090820`（2020-08-20），依[政府資料開放授權條款第 1 版](https://data.gov.tw/license)使用，已簡化為動畫輪廓。這是明確標示版本的資料快照，不宣稱即時行政界線。

每縣市取最大連續陸塊之外環；其他離島／分離區塊及內部孔洞不在描線範圍。選擇縣市時畫面會標示。誤差為重建取樣點 RMS 距離除以該輪廓南北高度，不是測繪精度，也不能直接與其他影片的誤差比較。

## 重建素材（一般使用不需要）

縣市素材重建：`scripts/prepare_counties.py` 需要 pyshp 與 shapely，讀取 `/tmp/taiwan-counties/` 中的官方 SHP。
