# 電影小幫手 Movie Helper

### 線上網址

<https://rubyf2e.github.io/movie-helper-site/>

<https://rubyrubyruby.my.canva.site/dagqiedp8k8>

## 心得

### 🌱 實作專案的心態調整

在這個專案中，我刻意將自己歸零，重新以「初學者」的心態投入學習與實作。身為資深工程師，我深知這個產業入門容易，深入困難，而 AI 的快速崛起，更進一步降低了入門門檻，卻也重新定義了工程師的角色與價值。

我發現，過去累積的經驗固然重要，但若過度依賴過去的工作習慣和心態去寫程式，反而可能成為與 AI 協作的障礙。與此同時，許多初學者反而能更自然地使用 AI 工具，快速產出具備創意與實用性的成果。

為了不讓經驗變成框架，我選擇用「初學者的方式」去與 AI 協作，並調整心態，讓自己站在和初學者一樣的角度去使用 AI 撰寫這個專案。

<details>
<summary><strong> 🌱 2025.07.08 專案引入 ENV 和 CSS 改成 Sass 完成心得</strong></summary>

- **1️⃣ 新增 ENV 請 Copilot 改寫程式**

  - 新增環境配置的 .env
  - 請 Copilot 依照 .env 的參數去改寫相關檔案
  - 校對檔案是否有符合預期，確保環境變數在所有組件中正確使用
  - 測試重啟開發伺服器後環境變數是否生效
  - 在 GitHub Repository Settings 中設置 Secrets
  - 更新上線

- **2️⃣ 將 CSS 轉換 SCSS**
  - 將 style.css 和 style.scss 丟給 Copilot 請他改寫
  - 將原本的引用改寫
  - 檢查 UI/功能一致性。
  - 發現有跑版請 Copilot 調整，調了六次還改不好，直接把要改的程式貼給它請它改好
  - 檢查 UI/功能一致性。
  - 移除原本的 style.css
  - 更新 git 後重新檢視正式站頁面，確保整體一致性與功能穩定。

</details>

<details>
<summary><strong>🌱 2025.07.07 靜態頁轉 React 完成心得</strong></summary>

##### 完成工時：一天

- **1️⃣ 初始化與轉換開始**

  - 使用 VS Code + GitHub Copilot Chat。
  - 指示 Copilot 將整個靜態頁專案改寫成 React。
  - 執行 `npm init react-app movie-helper-site`，手動整合檔案。
  - 發現 Copilot 有漏檔現象，工程師需主動監工，確保頁面完整。

- **2️⃣ 啟用 Copilot Agent 模式**

  - 將資料夾與檔案給 Copilot，請它幫忙比對轉換前後的效果。
  - Copilot 重新調整程式轉換前後呈現的效果一致。
  - 檢查 UI/功能一致性。

- **3️⃣ 修正手機版漢堡選單**

  - 發現手機版的漢堡有問題，與 Copilot 經過 3 次請求後處理完成。
  - 發現 VScode 問題功能有顯示問題，點選後再問 Copilot，Copilot 協助修正。

- **4️⃣ 修復 VS Code 問題功能顯示錯誤**

  - 發現點選問題功能異常，再次請 Copilot 協助修正。

- **5️⃣ 撰寫測試**

  - 請 Copilot 幫忙補齊測試，產出內容相當完整。
  - 請 Copilot 移除了有多重元素匹配問題的測試用例，確保所有測試通過

- **6️⃣ 補回原本的錨點功能**

  - 原靜態頁有錨點，Copilot 漏掉了。
  - 請 Copilot 協助補齊，Copilot 還自動加入 smooth scroll 動畫效果。

- **7️⃣ 元件化 App.js 區塊**

  - 將在 App.js 過長的 HTML 區塊選取，請 Copilot 轉為 React Component。
  - Copilot 自動建立新檔案與引用，並補上測試。

- **8️⃣ SVG 抽離**

  - 請 Copilot 將散落各檔案的 SVG 抽出成 Icons.js 模組。
  - Copilot 自動更新所有引用與補測試。

- **9️⃣ 優化 index.html 與 meta 標籤**

  - 修改 index.html，請 Copilot 幫忙校稿與補上 SEO 相關 meta 資訊。

- **🔟 最終檢查**

  - 重新檢視所有檔案，確保整體一致性與功能穩定。

- **1️⃣1️⃣ 更新專案結構與文件**

  - 請 Copilot 幫忙產生專案結構
  - Copilot 主動協助修改了 `README.md`，從功能標題以下內容主動更新。
  - 請 Copilot 幫忙改寫本地部署方式
  - 詢問 Copilot 使用其他靜態伺服器這個項目目前是用 react 這樣可以實作嗎
  - Copilot 直接進行測試並在 Vscode 開啟瀏覽器顯示正常

- **1️⃣2️⃣ GitHub Pages 部署**

  - 請 Copilot 協助更新 package.json 和 package-lock.json，新增 gh-pages 依賴
  - 請 Copilot 幫忙生成 .github/workflows/deploy.yml
  - GitHub Pages 設定 Deploy from a branch 改為 GitHub Actions

- **1️⃣3️⃣ 檢查正式站是否正常**
  - 重新檢視正式站頁面，確保整體一致性與功能穩定。

---

**💬 總結**

> 到目前為止，Copilot 是個非常好用的協作同伴，沒有什麼問題，還可以互相學習，而且非常懂得舉一反三，兼顧細節，只是還是需要有工程師幫忙監工。

</details>

<details>
<summary><strong>🌱 2025.06.24 靜態頁完成心得</strong></summary>

##### 完成工時：兩天

這是第一次用生成式 AI 協作生成的網站，也是將慣用工具從 Sublime Text 轉 VScode 中產生的作品。在協作過程中，發現生成式 AI 比較適合雛形開發，Canva AI 可以幫工程師先行設計畫面和文案，但其網站為壓縮編寫的程式碼不可直接套用，但可透過瀏覽器開發者工具觀看其樣式重新雕刻，ChatGPT 及 VScode GitHub Copilot 可以使用上傳截圖分析產生雛形程式碼和專案規格，完成率可以達到 50%，剩餘的 50%就是需要工程師進行微調修改。

結論：生成式 AI 的出現讓工程師在前端頁面刻板可以有快速的雛形，並且在查詢相關語法時可以節省大量時間，甚至可以透過生成式 AI 的回覆間接學習到最新的程式寫法，越使用生成式 AI，程式能力會跟著提升，但如果要完成可商用的專案，還是非常需要工程師的基礎功和實力。

</details>

## 📦 特點

- RWD
- 支援資料動態載入
- 使用 Google NotebookLM 產生商業價值提案報告，再將報告轉貼至 Canva AI 設計網頁及文案產生雛形網站
- 與 ChatGPT 及 VScode GitHub Copilot 協作生成

## 💡 功能

- **響應式設計**: 支援桌面版、平板、手機等各種裝置
- **動態資料載入**: 從 JSON 檔案動態載入電影資料
- **互動式搜尋**: 搜尋框與標籤篩選功能
- **平滑導航**: 錨點連結與平滑滾動效果
- **組件化架構**: 高度模組化的 React 組件設計
- **完整測試**: Jest + React Testing Library 單元測試
- **PWA 支援**: 漸進式網頁應用配置
- **SEO 優化**: 語意化 HTML 與 meta 標籤優化

## 🛠 技術架構

- **前端框架**：React 18
- **樣式**：CSS3 + Responsive Design
- **開發工具**：Create React App
- **測試**：Jest + React Testing Library
- **部署**：GitHub Pages
- **資料來源**：JSON 檔案驅動

## 🗂 專案結構

```text
movie-helper-site/
├── public/                          # 靜態資源
│   ├── data/
│   │   └── content.json            # 電影資料
│   ├── images/
│   │   └── MovieIcon.svg           # 應用圖標
│   ├── index.html                  # 主 HTML 文件
│   ├── manifest.json               # PWA 配置
│   └── robots.txt                  # SEO 爬蟲配置
├── src/                            # 源碼目錄
│   ├── components/                 # React 組件
│   │   ├── About.js               # 關於我們組件
│   │   ├── Explore.js             # 探索數據組件
│   │   ├── Footer.js              # 頁尾組件
│   │   ├── Header.js              # 頁首與導航組件
│   │   ├── Icons.js               # SVG 圖標集合
│   │   ├── MovieCard.js           # 電影卡片組件
│   │   ├── MovieList.js           # 電影列表組件
│   │   ├── MovieTags.js           # 電影標籤組件
│   │   ├── SearchBox.js           # 搜尋框組件
│   │   └── __tests__/             # 組件測試
│   │       ├── About.test.js
│   │       ├── Explore.test.js
│   │       ├── Footer.test.js
│   │       ├── Header.test.js
│   │       ├── Icons.test.js
│   │       ├── MovieCard.test.js
│   │       ├── MovieTags.test.js
│   │       └── SearchBox.test.js
│   ├── css/
│   │   └── style.css              # 全域樣式
│   ├── App.js                     # 主應用組件
│   ├── App.test.js                # 主應用測試
│   ├── index.js                   # 應用入口點
│   ├── reportWebVitals.js         # 性能監測
│   └── setupTests.js              # 測試配置
├── package.json                    # 專案依賴與腳本
├── package-lock.json              # 依賴鎖定文件
└── README.md                      # 專案說明文件
```

### 📦 組件架構

```text
App.js (主應用)
├── Header.js (頁首導航)
├── Hero Section (主視覺區塊)
├── Explore.js (數據統計)
├── MovieList.js (電影列表)
│   └── MovieCard.js (電影卡片)
├── SearchBox.js (搜尋功能)
│   └── MovieTags.js (標籤篩選)
├── About.js (關於我們)
└── Footer.js (頁尾)
```

### 🎯 核心功能模組

- **Header.js**: 響應式導航、漢堡選單、平滑滾動錨點
- **MovieCard.js**: 熱門電影卡片、即將上映卡片、星級評分
- **SearchBox.js**: 搜尋輸入框、類型標籤篩選
- **Icons.js**: 統一管理所有 SVG 圖標（CheckIcon, MovieIcon, SearchIcon, StarIcon）
- **Explore.js**: 數據統計展示卡片
- **About.js**: 功能特色列表展示

### 🧪 測試覆蓋

專案包含完整的單元測試，覆蓋所有 React 組件：

- **組件測試**: 8 個組件測試文件
- **整合測試**: App.js 主應用測試
- **測試工具**: Jest + React Testing Library
- **測試類型**: 渲染測試、交互測試、快照測試

運行測試：

```bash
npm test                # 運行所有測試
npm test -- --coverage # 運行測試並生成覆蓋率報告
npm test -- --watch    # 監聽模式運行測試
```

## 🚀 使用方式

### 開發環境設置

1. **安裝依賴**：

   ```bash
   npm install
   ```

2. **啟動開發伺服器**：

   ```bash
   npm start
   ```

3. **運行測試**：

   ```bash
   npm test
   ```

4. **構建生產版本**：

   ```bash
   npm run build
   ```

### 本地部署方式

#### 方式一：使用 React 開發伺服器（推薦）

```bash
# 克隆專案
git clone https://github.com/rubyf2e/movie-helper-site.git
cd movie-helper-site

# 安裝依賴
npm install

# 啟動開發伺服器
npm start
```

瀏覽器會自動開啟 `http://localhost:3000`

#### 方式二：生產版本部署

```bash
# 構建生產版本
npm run build

# 使用靜態伺服器運行
npx serve -s build
```

或使用其他靜態伺服器：

```bash
# Python HTTP Server
cd build && python3 -m http.server 8000

# Node.js http-server
npm install -g http-server
cd build && http-server -p 8000
```

#### 方式三：VS Code Live Server

1. 在 VS Code 中安裝 "Live Server" 擴展
2. 構建專案：`npm run build`
3. 右鍵點擊 `build/index.html`
4. 選擇 "Open with Live Server"

#### 瀏覽地址

- **開發模式**：`http://localhost:3000`
- **生產模式**：`http://localhost:8000` 或 `http://localhost:5000`（依使用的伺服器而定）

### 手動觸發部署

```bash
git commit -m "Update content"
git push origin main
```
