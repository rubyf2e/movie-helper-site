import { API_ENDPOINTS, APP_CONFIG } from "../utils/constants";

export class ChatAPI {
  // 獲取基本 headers
  static getHeaders(customHeaders = {}) {
    const baseHeaders = {
      "Content-Type": "application/json",
    };

    // 如果是 ngrok URL，添加跳過瀏覽器警告的 header
    const apiBaseUrl = APP_CONFIG.API_BASE_URL;
    if (
      apiBaseUrl &&
      (apiBaseUrl.includes("ngrok") || apiBaseUrl.includes("ngrok.io"))
    ) {
      baseHeaders["ngrok-skip-browser-warning"] = "true";
      baseHeaders["Access-Control-Allow-Origin"] = "*";
    }

    return { ...baseHeaders, ...customHeaders };
  }

  // 發送聊天訊息到後端
  static async sendMessage(userInput, chatModel = "gemini") {
    try {
      const apiBaseUrl = APP_CONFIG.API_BASE_URL;
      const url = `${apiBaseUrl}${API_ENDPOINTS.CHAT}`;

      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        mode: "cors",
        body: JSON.stringify({
          user_input: userInput,
          chat_model: chatModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("聊天 API 請求失敗:", error);
      throw new Error(`聊天服務暫時無法使用: ${error.message}`);
    }
  }

  static mapModelToBackend(frontendModelId) {
    const modelMapping = {
      azure: "azure",
      gemini: "gemini",
      ollama: "ollama",
    };

    return modelMapping[frontendModelId] || "gemini";
  }
}
