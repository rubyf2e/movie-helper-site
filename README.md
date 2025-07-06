# 電影小幫手 Movie Helper


### 線上網址
<https://rubyf2e.github.io/movie-helper-site/> 

<https://rubyrubyruby.my.canva.site/dagqiedp8k8>

## 心得
### 🌱 實作專案的心態調整

在這個專案中，我刻意將自己歸零，重新以「初學者」的心態投入學習與實作。身為資深工程師，我深知這個產業入門容易，深入困難，而 AI 的快速崛起，更進一步降低了入門門檻，卻也重新定義了工程師的角色與價值。

我發現，過去累積的經驗固然重要，但若過度依賴過去的工作習慣和心態去寫程式，反而可能成為與 AI 協作的障礙。與此同時，許多初學者反而能更自然地使用 AI 工具，快速產出具備創意與實用性的成果。

為了不讓經驗變成框架，我選擇用「初學者的方式」去與 AI 協作，並調整心態，讓自己站在和初學者一樣的角度去使用 AI 撰寫這個專案。

### 🌱 2025.06.24 靜態頁完成心得

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
├── public/
│   └── data/
│       └── content.json
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── SearchBox.js
│   │   ├── MovieTags.js
│   │   ├── MovieList.js
│   │   ├── MovieCard.js
│   ├── App.js
│   ├── index.js
│   └── style.css
└── package.json
```



## 🚀 使用方式

1. 使用任何本地伺服器開啟，例如：
   - VS Code + Live Server 外掛
   - Python HTTP server:
     ```bash
     python3 -m http.server
     ```
2. 開啟 `http://localhost:8000/index.html` 進行瀏覽。
