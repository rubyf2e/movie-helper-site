import {
  APP_CONFIG,
  API_ENDPOINTS,
  LINE_CONFIG,
  HTTP_HEADERS,
} from "../utils/constants";

class LineAuthService {
  async initFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const IdToken = params.get("response");
    // const state = params.get("state");

    if (IdToken) {
      const verifyID = await this.getUserVerify(IdToken, "ID_TOKEN");

      if (!verifyID || verifyID.success === false) {
        this.logout();
        window.location.href = APP_CONFIG.PUBLIC_URL;
        return {
          success: false,
          message: "Failed to fetch user ID",
        };
      }

      const profile = await this.getUserVerify(IdToken, "ID");

      if (!profile || profile.success === false) {
        return {
          success: false,
          message: "Failed to fetch user profile",
        };
      }

      this.userdata = profile.message;
      this.setStoredProfile(this.userdata, IdToken);

      console.log("LINE 登入成功，獲取用戶資料:", profile);
      console.log("IdToken", IdToken);
      console.log(LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT, this.userdata.exp);
      // await this.getUserToken(IdToken, state);
      return this.userdata;
    }
  }

  constructor() {
    this.channelId = APP_CONFIG.LINE_LOGIN_CHANNEL_ID;
    this.apiBaseUrl = APP_CONFIG.API_BASE_URL;
    this.redirectUrl = this.apiBaseUrl + API_ENDPOINTS.LINE_LOGIN_CALLBACK;
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

  getAuthRedirectUrl(state = null) {
    return (
      this.redirectUrl +
      "?state=" +
      state +
      "&client_id=" +
      this.channelId +
      "&scope=" +
      LINE_CONFIG.SCOPE
    );
  }

  // 建立 LINE 登入 URL
  getAuthUrl() {
    const redirectUrl = this.getAuthRedirectUrl(this.state);
    // console.log(redirectUrl);

    const params = new URLSearchParams({
      response_type: LINE_CONFIG.RESPONSE_TYPE,
      client_id: this.channelId,
      state: this.state,
      scope: LINE_CONFIG.SCOPE,
      nonce: this.nonce,
      redirect_uri: redirectUrl,
      response_mode: "query.jwt",
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
        return {
          success: false,
          message: "Authentication failed",
        };
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
            redirect_uri: this.redirectUrl,
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

      // 儲存用戶資訊和 token
      this.setStoredUser(data);

      return data;
    } catch (error) {
      console.error("LINE 登入失敗:", error);
      return {
        success: false,
        message: "API 發送失敗",
      };
    }
  }

  // 儲存用戶資料
  setStoredProfile(userData, IdToken) {
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.PROFILE,
      JSON.stringify(userData)
    );
    localStorage.setItem(LINE_CONFIG.STORAGE_KEYS.ID_TOKEN, IdToken);
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT,
      this.userdata.exp
    );
  }

  // 儲存用戶資料
  setStoredUser(userData) {
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.USER,
      JSON.stringify(userData.user)
    );
    localStorage.setItem(
      LINE_CONFIG.STORAGE_KEYS.ID_TOKEN,
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
  getStoredProfile() {
    try {
      const userData = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.PROFILE);
      console.log("用戶資料:", userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("無法獲取用戶資料:", error);
      return null;
    }
  }

  getStoredUser() {
    try {
      const userData = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.User);
      console.log("用戶資料:", userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("無法獲取用戶資料:", error);
      return null;
    }
  }

  // 檢查是否已登入
  isAuthenticated() {
    const IdToken = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.ID_TOKEN);
    const expiresAt = localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT);

    if (!IdToken || !expiresAt) {
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
  getIdToken() {
    return localStorage.getItem(LINE_CONFIG.STORAGE_KEYS.ID_TOKEN);
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
      this.setStoredUser(data);

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

  // 登出
  logout() {
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.PROFILE);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_STATE);
    localStorage.removeItem(LINE_CONFIG.STORAGE_KEYS.AUTH_NONCE);
  }

  // 撤銷 Access Token
  async revokeToken() {
    try {
      const accessToken = this.getIdToken();
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

  // 獲取用戶Token
  async getUserToken(IdToken = null, state) {
    try {
      if (!IdToken) {
        const IdToken = this.getIdToken();
        if (!IdToken) {
          return {
            success: false,
            message: "Failed to fetch user token",
          };
        }
      }

      const redirectUrl = this.getAuthRedirectUrl(this.state);
      // console.log(redirectUrl);

      const params = new URLSearchParams({
        code: IdToken,
        redirect_uri: redirectUrl,
        client_id: this.channelId,
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

      return response;
    } catch (error) {
      console.error("獲取用戶資料失敗:", error);
      return {
        success: false,
        message: "API 獲取用戶資料失敗",
      };
    }
  }

  // 獲取用戶資料
  async getUserVerify(IdToken = null) {
    try {
      if (!IdToken) {
        const IdToken = this.getIdToken();
        if (!IdToken) {
          return {
            success: false,
            message: "Failed to fetch user verify",
          };
        }
      }

      const params = new URLSearchParams({
        code: IdToken,
        client_id: this.channelId,
        type: "ID",
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
      console.log(data);
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

  // 獲取用戶資料
  async getUserProfile(accessToken = null, state = null) {
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
        code: accessToken,
        client_id: this.channelId,
        state: state,
        scope: LINE_CONFIG.SCOPE,
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

      return response;
    } catch (error) {
      console.error("獲取用戶資料失敗:", error);
      return {
        success: false,
        message: "API 獲取用戶資料失敗",
      };
    }
  }

  // 發送電影清單到 LINE
  async sendMovieListToLine(movieList = []) {
    try {
      const accessToken = this.getIdToken();
      if (!accessToken) {
        console.error("Line 用戶未登入:");
        return { success: false, message: "請先登入 LINE 帳號" };
      }

      if (!movieList || !Array.isArray(movieList) || movieList.length === 0) {
        return { success: false, message: "沒有電影清單可以發送" };
      }

      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.SEND_TO_LINE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
            AUTHORIZATION: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            movieList: movieList,
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
        response.success = true;
        response.message = "API 發送成功";

        return response;
      }
    } catch (error) {
      console.error("Line 發送錯誤:", error);
      return {
        success: false,
        message: "API 發送失敗",
      };
    }
  }
}

export { LineAuthService };
export default LineAuthService;
