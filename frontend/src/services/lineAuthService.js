import {
  APP_CONFIG,
  API_ENDPOINTS,
  LINE_CONFIG,
  HTTP_HEADERS,
} from "../utils/constants";

class LineAuthService {
  constructor() {
    this.channelId = APP_CONFIG.LINE_LOGIN_CHANNEL_ID;
    this.apiBaseUrl = APP_CONFIG.API_BASE_URL;
    this.redirectUri = this.apiBaseUrl + API_ENDPOINTS.LINE_LOGIN_CALLBACK;
    this.state = this.generateState();
    this.nonce = this.generateNonce();
  }

  // 生成 state 參數 (防止 CSRF 攻擊)
  generateState() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // 生成 nonce 參數 (防止重放攻擊)
  generateNonce() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // 建立 LINE 登入 URL
  getAuthUrl() {
    const params = new URLSearchParams({
      response_type: LINE_CONFIG.RESPONSE_TYPE,
      client_id: this.channelId,
      state: this.state,
      scope: LINE_CONFIG.SCOPE,
      nonce: this.nonce,
      redirect_uri: this.redirectUri,
    });

    // 儲存 state 到 localStorage 以便驗證
    localStorage.setItem(LINE_CONFIG.STORAGE_KEYS.AUTH_STATE, this.state);
    localStorage.setItem(LINE_CONFIG.STORAGE_KEYS.AUTH_NONCE, this.nonce);

    return `${LINE_CONFIG.AUTH_URL}?${params.toString()}`;
  }

  // 處理授權回調
  async handleCallback(code, state) {
    try {
      // 驗證 state 參數
      const storedState = localStorage.getItem(
        LINE_CONFIG.STORAGE_KEYS.AUTH_STATE
      );
      if (state !== storedState) {
        throw new Error("Invalid state parameter");
      }

      // 清除儲存的 state
      localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_STATE);
      localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_NONCE);

      // 向後端發送授權碼
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
            redirect_uri: this.redirectUri,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();

      // 儲存用戶資訊和 token
      this.storeUserData(data);

      return data;
    } catch (error) {
      console.error("LINE 登入失敗:", error);
      throw error;
    }
  }

  // 儲存用戶資料
  storeUserData(userData) {
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.USER,
      JSON.stringify(userData.user)
    );
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
      userData.access_token
    );
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
      userData.refresh_token
    );
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT,
      userData.expires_at
    );
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

  // 檢查是否已登入
  isAuthenticated() {
    const accessToken = localStorage.getItem(
      LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
    );
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

  // 獲取 Access Token
  getAccessToken() {
    return localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
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
      this.storeUserData(data);

      return data;
    } catch (error) {
      console.error("Token 刷新失敗:", error);
      this.logout();
      throw error;
    }
  }

  // 登出
  logout() {
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_STATE);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_NONCE);
  }

  // 撤銷 Access Token
  async revokeToken() {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        return;
      }

      await fetch(`${this.apiBaseUrl}${API_ENDPOINTS.LINE_AUTH_REVOKE}`, {
        method: "POST",
        headers: {
          "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
          AUTHORIZATION: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error("Token 撤銷失敗:", error);
    } finally {
      this.logout();
    }
  }

  // 獲取用戶資料
  async getUserProfile() {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.LINE_AUTH_PROFILE}`,
        {
          method: "GET",
          headers: {
            AUTHORIZATION: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      return await response.json();
    } catch (error) {
      console.error("獲取用戶資料失敗:", error);
      throw error;
    }
  }

  // 發送電影清單到 LINE
  async sendMovieListToLine(movieList) {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        throw new Error("用戶未登入");
      }

      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.LINE_SEND_MOVIES}`,
        {
          method: "POST",
          headers: {
            "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
            AUTHORIZATION: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            movies: movieList,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("發送失敗");
      }

      return await response.json();
    } catch (error) {
      console.error("發送電影清單失敗:", error);
      throw error;
    }
  }
}

export { LineAuthService };
export default LineAuthService;
