import {
  APP_CONFIG,
  API_ENDPOINTS,
  LINE_CONFIG,
  HTTP_HEADERS,
} from "../utils/constants";
import { generateCodeVerifier, generateCodeChallenge } from "../utils/pkce";

class LineAuthService {
  constructor() {
    this.clientId = APP_CONFIG.LINE_LOGIN_CHANNEL_ID;
    this.apiBaseUrl = APP_CONFIG.API_BASE_URL;
    this.redirectUri = this.apiBaseUrl + API_ENDPOINTS.LINE_LOGIN_CALLBACK;

    if (!this.clientId) {
      console.error("LINE_CHANNEL_ID not found in environment variables");
    }
    if (!this.redirectUri) {
      console.error("LINE_REDIRECT_URI not found in environment variables");
    }
  }

  /**
   * 生成隨機狀態碼
   * @returns {string} 隨機狀態碼
   */
  generateState() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * 生成隨機 nonce
   * @returns {string} 隨機 nonce
   */
  generateNonce() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * 開始 LINE 登入流程（使用 PKCE）
   */
  async login() {
    try {
      const state = this.generateState();
      const nonce = this.generateNonce();

      // 生成 PKCE 參數
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // 儲存狀態到 localStorage
      localStorage.setItem(LINE_CONFIG.STORAGE_KEYS.AUTH_STATE, state);
      localStorage.setItem(LINE_CONFIG.STORAGE_KEYS.AUTH_NONCE, nonce);
      localStorage.setItem(
        LINE_CONFIG.STORAGE_KEYS.CODE_VERIFIER,
        codeVerifier
      );
      localStorage.setItem(
        LINE_CONFIG.STORAGE_KEYS.CODE_CHALLENGE,
        codeChallenge
      );

      const params = new URLSearchParams({
        response_type: LINE_CONFIG.RESPONSE_TYPE,
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        state: state,
        scope: LINE_CONFIG.SCOPE,
        nonce: nonce,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      const authUrl = `${LINE_CONFIG.AUTH_URL}?${params.toString()}`;
      console.log("Redirecting to LINE Auth URL with PKCE:", authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error("LINE login error:", error);
      throw error;
    }
  }

  /**
   * 初始化並處理從 URL 參數回調
   */
  async initFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    // 檢查錯誤
    if (error) {
      console.error("LINE auth error:", error);
      return {
        success: false,
        message: `Authentication failed: ${error}`,
      };
    }

    // 如果有授權碼，處理回調
    if (code && state) {
      try {
        const storedState = localStorage.getItem(
          LINE_CONFIG.STORAGE_KEYS.AUTH_STATE
        );
        const codeVerifier = localStorage.getItem(
          LINE_CONFIG.STORAGE_KEYS.CODE_VERIFIER
        );

        if (storedState && codeVerifier && state === storedState) {
          const result = await this.handleCallback(code, state);
          if (result.success) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            return result;
          }
          return result;
        } else {
          console.log("Handling non-PKCE callback from backend redirect");
          const result = await this.handleStandardCallback(code, state);
          if (result.success) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            return result;
          }
          return result;
        }
      } catch (error) {
        console.error("Callback handling error:", error);
        return {
          success: false,
          message: "Callback processing failed",
        };
      }
    }

    // 檢查是否已經登入
    if (this.isAuthenticated()) {
      const user = this.getStoredUser();
      return {
        success: true,
        message: user,
      };
    }

    return null;
  }

  /**
   * 處理授權回調 (PKCE 版本)
   */
  async handleCallback(code, state) {
    try {
      // 驗證 state 參數
      const storedState = localStorage.getItem(
        LINE_CONFIG.STORAGE_KEYS.AUTH_STATE
      );
      if (state !== storedState) {
        return {
          success: false,
          message: "Authentication failed - state mismatch",
        };
      }

      // 獲取儲存的 code verifier
      const codeVerifier = localStorage.getItem(
        LINE_CONFIG.STORAGE_KEYS.CODE_VERIFIER
      );
      if (!codeVerifier) {
        return {
          success: false,
          message: "Authentication failed - missing code verifier",
        };
      }

      // 清除儲存的認證資料
      localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_STATE);
      localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_NONCE);
      localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.CODE_VERIFIER);
      localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.CODE_CHALLENGE);

      // 向後端發送授權碼和 code verifier
      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.LINE_AUTH_CALLBACK}`,
        {
          method: "POST",
          headers: {
            "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
          },
          body: JSON.stringify({
            code,
            state,
            code_verifier: codeVerifier,
            redirect_uri: this.redirectUri,
          }),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: "Authentication failed",
        };
      }

      const data = await response.json();

      if (data.success && data.data) {
        // 儲存用戶資料和 tokens
        const tokenData = data.data;

        if (tokenData.access_token) {
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
            tokenData.access_token
          );
        }

        if (tokenData.refresh_token) {
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
            tokenData.refresh_token
          );
        }

        if (tokenData.expires_in) {
          const expiresAt = Date.now() + tokenData.expires_in * 1000;
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT,
            expiresAt.toString()
          );
        }

        if (tokenData.profile) {
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.USER,
            JSON.stringify(tokenData.profile)
          );
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.PROFILE,
            JSON.stringify(tokenData.profile)
          );
        }

        return {
          success: true,
          data: tokenData,
        };
      }

      return data;
    } catch (error) {
      console.error("LINE PKCE 登入失敗:", error);
      return {
        success: false,
        message: "API 發送失敗",
      };
    }
  }

  /**
   * 處理標準授權回調（非 PKCE）
   */
  async handleStandardCallback(code, state) {
    try {
      console.log(
        "Processing standard callback with code:",
        code.substring(0, 10) + "..."
      );

      // 向後端發送授權碼（使用 GET 請求調用 get_token_api）
      const params = new URLSearchParams({
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
      });

      const response = await fetch(
        `${this.apiBaseUrl}${
          API_ENDPOINTS.LINE_AUTH_TOKEN
        }?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: "Authentication failed",
        };
      }

      const tokenData = await response.json();
      console.log("Standard callback token data:", tokenData);

      if (tokenData.access_token) {
        // 儲存用戶資料和 tokens
        localStorage.setItem(
          LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
          tokenData.access_token
        );

        if (tokenData.refresh_token) {
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
            tokenData.refresh_token
          );
        }

        if (tokenData.expires_in) {
          const expiresAt = Date.now() + tokenData.expires_in * 1000;
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT,
            expiresAt.toString()
          );
        }

        if (tokenData.profile) {
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.USER,
            JSON.stringify(tokenData.profile)
          );
          localStorage.setItem(
            LINE_CONFIG.STORAGE_KEYS.PROFILE,
            JSON.stringify(tokenData.profile)
          );
        }

        return {
          success: true,
          data: tokenData,
        };
      }

      return {
        success: false,
        message: "No access token received",
      };
    } catch (error) {
      console.error("Standard callback error:", error);
      return {
        success: false,
        message: "Standard callback processing failed",
      };
    }
  }

  // 儲存用戶資料
  setStoredUser(tokenData, profile) {
    if (profile) {
      localStorage.setItem(
        LINE_CONFIG.STORAGE_KEYS.USER,
        JSON.stringify(profile)
      );
      localStorage.setItem(
        LINE_CONFIG.STORAGE_KEYS.PROFILE,
        JSON.stringify(profile)
      );
    }
    if (tokenData.access_token) {
      localStorage.setItem(
        LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
        tokenData.access_token
      );
    }
    if (tokenData.refresh_token) {
      localStorage.setItem(
        LINE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
        tokenData.refresh_token
      );
    }
    if (tokenData.expires_in) {
      const expiresAt = Date.now() + tokenData.expires_in * 1000;
      localStorage.setItem(
        LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT,
        expiresAt.toString()
      );
    }
  }

  // 獲取儲存的用戶資料
  getStoredUser() {
    try {
      const userData = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("無法獲取用戶資料:", error);
      return null;
    }
  }

  // 獲取儲存的用戶資料 (Profile)
  getStoredProfile() {
    try {
      const userData = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.PROFILE);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("無法獲取用戶資料:", error);
      return null;
    }
  }

  // 儲存用戶資料 (Profile)
  setStoredProfile(userData, idToken) {
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.PROFILE,
      JSON.stringify(userData)
    );
    if (idToken) {
      localStorage.setItem(LINE_CONFIG.STORAGE_KEYS.ID_TOKEN, idToken);
    }
  }

  // 儲存 Bot Profile
  setStoredBotProfile(userData) {
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.BOT_PROFILE,
      JSON.stringify(userData)
    );
  }

  // 獲取 Bot Profile
  getStoredBotProfile() {
    try {
      const userData = localStorage.getItem(
        LINE_CONFIG.STORAGE_KEYS.BOT_PROFILE
      );
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("無法獲取用戶資料:", error);
      return null;
    }
  }

  // 儲存 Token Profile
  setStoredTokenProfile(userData) {
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.TOKEN_PROFILE,
      JSON.stringify(userData)
    );
  }

  // 獲取 Token Profile
  getStoredTokenProfile() {
    try {
      const userData = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.TOKEN_PROFILE);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("無法獲取 Token Profile:", error);
      return null;
    }
  }

  // 獲取 ID Token
  getStoredUserIdToken() {
    const idToken = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.ID_TOKEN);
    return idToken == null || idToken === "undefined" ? null : idToken;
  }

  getStoredUserAccessToken() {
    const accessToken = localStorage.getItem(
      LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
    );
    return accessToken == null || accessToken === "undefined"
      ? null
      : accessToken;
  }

  // 獲取 Access Token (別名方法)
  getAccessToken() {
    return this.getStoredUserAccessToken();
  }

  // 獲取 ID Token
  getIdToken() {
    return localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.ID_TOKEN);
  }

  // 撤銷 Access Token
  async revokeToken() {
    try {
      const accessToken = this.getStoredUserAccessToken();
      if (!accessToken) {
        return;
      }

      await fetch(`${this.apiBaseUrl}${API_ENDPOINTS.LINE_AUTH_REVOKE}`, {
        method: "POST",
        headers: {
          "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
          AUTHORIZATION: `Bearer ${accessToken}`,
          [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          client_id: this.clientId,
          access_token: this.getStoredUserAccessToken(),
        }),
      });
    } catch (error) {
      console.error("Token 撤銷失敗:", error);
    } finally {
      this.logout();
    }
  }

  // 檢查是否已登入
  isAuthenticated() {
    const accessToken = this.getStoredUserAccessToken();
    const expiresAt = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken || !expiresAt) {
      return false;
    }

    // 檢查 token 是否過期
    const now = Date.now();
    const expirationTime = parseInt(expiresAt);

    if (now >= expirationTime) {
      this.logout();
      return false;
    }

    return true;
  }

  // 登出
  async logout() {
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.PROFILE);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.BOT_PROFILE);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.TOKEN_PROFILE);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_STATE);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_NONCE);
    // PKCE specific keys
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.CODE_VERIFIER);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.CODE_CHALLENGE);
    window.location.href = APP_CONFIG.PUBLIC_URL;
  }

  // 刷新 Access Token
  async refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem(
        LINE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN
      );
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.LINE_AUTH_REFRESH}`,
        {
          method: "POST",
          headers: {
            "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      this.setStoredUser(data, null);

      return data;
    } catch (error) {
      console.error("Token 刷新失敗:", error);
      this.logout();
      return {
        success: false,
        message: "API 發送失敗",
      };
    }
  }

  // 發送電影清單到 LINE
  async sendMovieListToLine(movieList = []) {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        console.error("Line 用戶未登入:");
        return { success: false, message: "請先登入 LINE 帳號" };
      }

      if (!movieList || !Array.isArray(movieList) || movieList.length === 0) {
        return { success: false, message: "沒有電影清單可以發送" };
      }

      const storedUser = this.getStoredUser();
      if (!storedUser) {
        console.error("無法獲取用戶資料:");
        return { success: false, message: "無法獲取用戶資訊" };
      }

      const userId = storedUser.userId || storedUser.id || storedUser.user_id;
      if (!userId) {
        console.error("無法獲取用戶ID，用戶資料:", storedUser);
        return { success: false, message: "無法獲取用戶ID" };
      }

      console.log("發送電影清單到LINE，用戶ID:", userId);

      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.SEND_TO_LINE}`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            movieList: movieList,
            line_login_channel_user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        console.warn("Line 發送失敗:", response.statusText);
        return {
          success: false,
          message: "API 發送失敗",
        };
      } else {
        const data = await response.json();
        console.log("Line 發送成功:", data);
        return {
          success: true,
          message: "API 發送成功",
          data: data,
        };
      }
    } catch (error) {
      console.error("Line 發送錯誤:", error);
      return {
        success: false,
        message: "API 發送失敗",
      };
    }
  }

  // 發送電影提醒到 LINE
  async sendMovieReminderToLine(movie, reminderDate) {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        console.error("Line 用戶未登入:");
        return { success: false, message: "請先登入 LINE 帳號" };
      }

      if (!movie) {
        return { success: false, message: "沒有電影資訊可以發送" };
      }

      const movieList = [
        {
          ...movie,
          reminderDate: reminderDate,
          isReminder: true,
        },
      ];

      const storedUser = this.getStoredUser();
      if (!storedUser) {
        console.error("無法獲取用戶資料:");
        return { success: false, message: "無法獲取用戶資訊" };
      }

      const userId = storedUser.userId || storedUser.id || storedUser.user_id;
      if (!userId) {
        console.error("無法獲取用戶ID，用戶資料:", storedUser);
        return { success: false, message: "無法獲取用戶ID" };
      }

      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.SEND_TO_LINE}`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            movieList: movieList,
            line_login_channel_user_id: userId,
            isReminder: true,
          }),
        }
      );

      if (!response.ok) {
        console.warn("Line 發送失敗:", response.statusText);
        return {
          success: false,
          message: "API 發送失敗",
        };
      } else {
        const data = await response.json();
        console.log("Line 發送成功:", data);
        return {
          success: true,
          message: "API 發送成功",
          data: data,
        };
      }
    } catch (error) {
      console.error("Line 發送錯誤:", error);
      return {
        success: false,
        message: "API 發送失敗",
      };
    }
  }

  // ================ 原始 LINE API 方法 ================

  // 獲取用戶Token
  async getUserToken(code = null, state = null, aud = null, nonce = null) {
    try {
      const redirectUrl = this.getAuthRedirectUrl(state, nonce);
      const params = new URLSearchParams({
        code: code,
        redirect_uri: redirectUrl,
        client_id: aud,
      });

      const response = await fetch(
        `${this.apiBaseUrl}${
          API_ENDPOINTS.LINE_AUTH_TOKEN
        }?${params.toString()}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch user token");
        return {
          success: false,
          message: "Failed to fetch user token",
        };
      }

      const data = await response.json();

      return {
        success: true,
        message: data,
      };
    } catch (error) {
      console.error("獲取用戶資料失敗:", error);
      return {
        success: false,
        message: "API 獲取用戶資料失敗",
      };
    }
  }

  // 獲取 Token Profile
  async getTokenProfile(idToken = null, nonce = null, iss = null) {
    try {
      if (!idToken) {
        const idToken = this.getIdToken();
        if (!idToken) {
          return {
            success: false,
            message: "Failed to fetch user Token Profile",
          };
        }
      }

      if (!nonce || !iss) {
        return {
          success: false,
          message: "Failed to fetch user Token Profile",
        };
      }

      const params = new URLSearchParams({
        id_token: idToken,
        nonce: nonce,
        iss: iss,
      });

      const response = await fetch(
        `${this.apiBaseUrl}${
          API_ENDPOINTS.LINE_AUTH_TOKEN_PROFILE
        }?${params.toString()}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch user verify");
        return {
          success: false,
          message: "Failed to fetch user verify",
        };
      }

      const data = await response.json();

      return {
        success: true,
        message: data,
      };
    } catch (error) {
      console.error("獲取用戶資料失敗:", error);
      return {
        success: false,
        message: "API 獲取用戶資料失敗",
      };
    }
  }

  // 獲取用戶驗證
  async getUserVerify(idToken = null, type = "ID") {
    try {
      if (!idToken) {
        const idToken = this.getIdToken();
        if (!idToken) {
          return {
            success: false,
            message: "Failed to fetch user verify",
          };
        }
      }

      const params = new URLSearchParams({
        code: idToken,
        client_id: this.clientId,
        type: type,
        redirect_uri: window.location.href,
      });

      const response = await fetch(
        `${this.apiBaseUrl}${
          API_ENDPOINTS.LINE_AUTH_VERIFY
        }?${params.toString()}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch user verify");
        return {
          success: false,
          message: "Failed to fetch user verify",
        };
      }

      const data = await response.json();

      return {
        success: true,
        message: data,
      };
    } catch (error) {
      console.error("獲取用戶資料失敗:", error);
      return {
        success: false,
        message: "API 獲取用戶資料失敗",
      };
    }
  }

  // 獲取用戶 Profile
  async getUserProfile(accessToken = null) {
    try {
      if (!accessToken) {
        const accessToken = this.getIdToken();
        if (!accessToken) {
          return {
            success: false,
            message: "Failed to fetch user profile",
          };
        }
      }

      const params = new URLSearchParams({
        access_token: accessToken,
      });

      const response = await fetch(
        `${this.apiBaseUrl}${
          API_ENDPOINTS.LINE_AUTH_PROFILE
        }?${params.toString()}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch user profile");
        return {
          success: false,
          message: "Failed to fetch user profile",
        };
      }

      const data = await response.json();

      return {
        success: true,
        message: data,
      };
    } catch (error) {
      console.error("獲取用戶資料失敗:", error);
      return {
        success: false,
        message: "API 獲取用戶資料失敗",
      };
    }
  }

  // 獲取用戶 Bot Profile
  async getUserBotProfile(user_id) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.LINE_AUTH_BOT_PROFILE}/${user_id}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch user bot profile");
        return {
          success: false,
          message: "Failed to fetch user bot profile",
        };
      }

      const data = await response.json();

      return {
        success: true,
        message: data,
      };
    } catch (error) {
      console.error("獲取用戶資料失敗:", error);
      return {
        success: false,
        message: "API 獲取用戶資料失敗",
      };
    }
  }

  // 生成認證重導向 URL (用於舊版 API)
  getAuthRedirectUrl(state = null, nonce = null) {
    return (
      this.redirectUri +
      "?state=" +
      state +
      "&nonce=" +
      nonce +
      "&client_id=" +
      this.clientId +
      "&scope=" +
      LINE_CONFIG.SCOPE
    );
  }

  // 建立 LINE 登入 URL (舊版非 PKCE)
  getAuthUrl() {
    const state = this.generateState();
    const nonce = this.generateNonce();
    const redirectUrl = this.getAuthRedirectUrl(state, nonce);
    const params = new URLSearchParams({
      response_type: LINE_CONFIG.RESPONSE_TYPE,
      client_id: this.clientId,
      state: state,
      scope: LINE_CONFIG.SCOPE,
      nonce: nonce,
      bot_prompt: "aggressive",
      redirect_uri: redirectUrl,
      response_mode: "query.jwt",
    });

    // 儲存 state 到 localStorage 以便驗證
    localStorage.setItem(LINE_CONFIG.STORAGE_KEYS.AUTH_STATE, state);
    localStorage.setItem(LINE_CONFIG.STORAGE_KEYS.AUTH_NONCE, nonce);

    return `${LINE_CONFIG.AUTH_URL}?${params.toString()}`;
  }
}

export { LineAuthService };
export default LineAuthService;
