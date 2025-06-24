# 電影小幫手 Movie Helper

### 線上網址
<https://rubyf2e.github.io/movie-helper-site/> 

<https://rubyrubyruby.my.canva.site/dagqiedp8k8>

#### 2025.06.24 靜態頁完成心得
##### 完成工時：兩天
這是第一次用生成式AI協作生成的網站，也是將慣用工具從 Sublime Text 轉 VScode 中產生的作品。在協作過程中，發現生成式AI比較適合雛形開發，Canva AI 可以幫工程師先行設計畫面和文案，但其網站為壓縮編寫的程式碼不可直接套用，但可透過瀏覽器開發者工具觀看其樣式重新雕刻，ChatGPT 及 VScode GitHub Copilot 可以使用上傳截圖分析產生雛形程式碼和專案規格，完成率可以達到50%，剩餘的50%就是需要工程師進行微調修改。

結論：生成式AI的出現讓工程師在前端頁面刻板可以有快速的雛形，並且在查詢相關語法時可以節省大量時間，甚至可以透過生成式AI的回覆間接學習到最新的程式寫法，越使用生成式AI，程式能力會跟著提升，但如果要完成可商用的專案，還是非常需要工程師的基礎功和實力。



## 📦 特點

- RWD
- 支援資料動態載入
- 使用 Google NotebookLM 產生商業價值提案報告，再將報告轉貼至Canva AI 設計網頁及文案產生雛形網站
- 與 ChatGPT 及 VScode GitHub Copilot 協作生成


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
- GitHub Pages 部署

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
