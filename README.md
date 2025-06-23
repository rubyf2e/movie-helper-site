# 電影小幫手 Movie Helper

一個使用 HTML/CSS/JavaScript 製作的響應式電影介紹網站，支援資料動態載入與手機顯示，內容由 JSON 控管，用 Canva 結合 ChatGPT 生成。

## 💡 功能

- 熱門電影動態顯示
- 即將上映電影整理
- 電影搜尋介面樣式
- 響應式設計（支援手機）
- JSON 檔案控制內容，可輕鬆擴充

## 🛠 技術架構

- HTML5 + CSS3
- JavaScript ES6
- JSON 資料驅動
- 無框架、無伺服器需求

## 🗂 專案結構

```

movie-helper-site/
├── index.html            # 主頁
├── css/style.css         # 響應式樣式表
├── js/data.js            # 載入 JSON 並產生電影區塊
├── data/content.json     # 熱門與即將上映電影的內容
```



## 🚀 使用方式

1. 使用任何本地伺服器開啟，例如：
   - VS Code + Live Server 外掛
   - Python HTTP server:
     ```bash
     python3 -m http.server
     ```
2. 開啟 `http://localhost:8000/index.html` 進行瀏覽。

https://rubyf2e.github.io/movie-helper-site/

