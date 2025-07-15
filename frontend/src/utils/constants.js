// 全域常數定義

export const DEFAULT_STORAGE_KEY = "movieWatchlist";

// 其他全域常數
export const APP_CONFIG = {
  HEADER_HEIGHT: 72,
  REACT_APP_TITLE: process.env.REACT_APP_TITLE || "電影小幫手",
  PUBLIC_URL: process.env.PUBLIC_URL,
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  TMDB_IMG_URL: process.env.REACT_APP_TMDB_IMG_URL,
  LINE_LOGIN_CHANNEL_ID: process.env.REACT_APP_LINE_LOGIN_CHANNEL_ID,
  DEFAULT_LANGUAGE: process.env.REACT_APP_TMDB_MOVIE_LANGUAGE,
};

// 通知類型常數
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// 電影狀態常數
export const MOVIE_STATUS = {
  WATCHED: "watched",
  WATCHING: "watching",
  PLANNED: "planned",
  DROPPED: "dropped",
};

// API 端點常數
export const API_ENDPOINTS = {
  HEALTH: "/health",
  MOVIES: "/movies",
  POPULAR: "/movies/popular",
  SEARCH: "/movies/search",
  GENRES: "/movies/genres",
  ANALYZE: "/movies/analyze-movie-preference",
  SEND_TO_LINE: "/line/bot/send-to-line",
  LINE_AUTH_CALLBACK: "/line/auth/line/callback",
  LINE_AUTH_REFRESH: "/line/auth/line/refresh",
  LINE_AUTH_REVOKE: "/line/auth/line/revoke",
  LINE_AUTH_PROFILE: "/line/auth/line/profile",
  LINE_LOGIN_CALLBACK: "/line/login/callback",
};

// HTTP 請求標頭常數
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
  NGROK_SKIP_WARNING: "ngrok-skip-browser-warning",
};

// LINE 相關常數
export const LINE_CONFIG = {
  AUTH_URL: "https://access.line.me/oauth2/v2.1/authorize",
  RESPONSE_TYPE: "code",
  SCOPE: "profile",
  STORAGE_KEYS: {
    USER: "line_user",
    ACCESS_TOKEN: "line_access_token",
    REFRESH_TOKEN: "line_refresh_token",
    EXPIRES_AT: "line_expires_at",
    AUTH_STATE: "line_auth_state",
    AUTH_NONCE: "line_auth_nonce",
  },
};

// 推薦來源類型
export const RECOMMENDATION_SOURCES = {
  AI: "ai_recommendation",
  MANUAL: "manual_add",
  SEARCH: "search_result",
};
