# 本地開發指南

## 🚀 快速開始

### 方案一：只測試前端（最簡單）

```bash
# 1. 設置環境變數
cp frontend/.env.example frontend/.env.local
# 編輯 .env.local，填入 REACT_APP_TMDB_API_KEY

# 2. 啟動前端（自動使用直接 TMDB 模式）
npm run dev:frontend-only
```

### 方案二：全端開發

```bash
# 1. 安裝所有依賴
npm run install:all

# 2. 設置後端環境變數
cp backend/.env backend/.env.local
# 編輯 backend/.env，填入 TMDB_API_KEY

# 3. 同時啟動前後端
npm run dev
```

## 🎯 不同模式說明

### 🟢 直接 TMDB 模式

- **特點**: 前端直接呼叫 TMDB API
- **優點**: 無需後端，設置簡單
- **缺點**: API Key 會暴露在前端
- **適用**: 學習、展示、快速原型

### 🔵 後端 API 模式

- **特點**: 前端呼叫 Flask 後端，後端呼叫 TMDB
- **優點**: API Key 安全，可加入快取和邏輯
- **缺點**: 需要維護後端服務
- **適用**: 生產環境、專業專案

### 🟡 智能切換模式（當前配置）

- **邏輯**: 優先嘗試後端 API，失敗則自動切換到直接 TMDB
- **優點**: 最佳的開發體驗，向下相容
- **適用**: 開發階段的最佳選擇

## 📋 可用命令

```bash
# 前端開發
npm start                    # 啟動前端（智能模式）
npm run start:frontend-only  # 啟動前端（強制直接 TMDB 模式）

# 後端開發
npm run start:backend        # 啟動後端 API

# 全端開發
npm run dev                  # 同時啟動前後端
npm run dev:frontend-only    # 只啟動前端（直接 TMDB）

# 測試
npm test                     # 前端測試
npm run test:backend         # 後端測試
npm run test:all            # 所有測試

# 構建
npm run build               # 構建前端
```

## 🔧 統一環境變數命名

### ✅ 新的統一命名規範

為了保持前後端一致性，所有環境變數都採用 `REACT_APP_` 前綴：

```env
# 前後端共用
REACT_APP_TMDB_API_KEY=你的TMDB_API金鑰
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
REACT_APP_TMDB_IMG_URL=https://image.tmdb.org/t/p/w500
REACT_APP_TMDB_MOVIE_LANGUAGE=zh-tw
REACT_APP_TITLE=電影小幫手
REACT_APP_VERSION=1.0.0
```

### 🔄 向下相容

Flask 後端同時支援新舊命名：

```python
# 優先使用新命名，回退到舊命名
TMDB_API_KEY = os.environ.get('REACT_APP_TMDB_API_KEY') or os.environ.get('TMDB_API_KEY')
```

### 📋 設置步驟

1. **複製統一範例檔案**:

   ```bash
   cp .env.unified.example .env.local
   ```

2. **編輯並填入真實值**:

   ```bash
   nano .env.local
   ```

3. **前後端共用同一個檔案**:

   ```bash
   # 前端使用
   cp .env.local frontend/.env.local

   # 後端使用
   cp .env.local backend/.env
   ```

## 🔧 環境變數配置

### 前端 (.env.local)

```env
# 直接 TMDB（必需）
REACT_APP_TMDB_API_KEY=你的TMDB_API金鑰

# 強制模式（可選）
REACT_APP_USE_DIRECT_TMDB=true  # 強制使用直接 TMDB
```

### 後端 (.env)

```env
# 必需
TMDB_API_KEY=你的TMDB_API金鑰

# 可選
FLASK_ENV=development
FLASK_DEBUG=True
```

## 🎯 GitHub Actions 狀態

- ✅ **前端部署**: 自動部署到 GitHub Pages
- ⏸️ **後端部署**: 暫時停用（本地測試階段）
- 🔄 **智能回退**: 生產環境會自動使用直接 TMDB 作為備用

## 🌐 線上訪問

- **前端**: https://rubyf2e.github.io/movie-helper-site/
- **模式**: 智能切換（優先後端 API，回退到直接 TMDB）
