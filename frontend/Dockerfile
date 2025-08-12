# 多階段構建
# 第一階段：構建階段
FROM node:18-alpine AS build

# 設定工作目錄
WORKDIR /app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --only=production; else npm ci; fi

# 複製源代碼
COPY . .

# 構建應用
RUN npm run build

# 第二階段：運行階段
FROM nginx:alpine

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 從構建階段複製構建結果
COPY --from=build /app/build /usr/share/nginx/html/movie-helper-site

# 暴露端口
EXPOSE 3000

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
