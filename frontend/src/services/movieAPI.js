const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export class MovieAPI {
  // 獲取基本 headers
  static getHeaders(customHeaders = {}) {
    const baseHeaders = {
      "Content-Type": "application/json",
    };

    // 如果是 ngrok URL，添加跳過瀏覽器警告的 header
    if (API_BASE_URL.includes("ngrok") || API_BASE_URL.includes("ngrok.io")) {
      baseHeaders["ngrok-skip-browser-warning"] = "true";
      baseHeaders["Access-Control-Allow-Origin"] = "*";
    }

    return { ...baseHeaders, ...customHeaders };
  }

  static async fetchFromAPI(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        method: options.method || "GET",
        headers: this.getHeaders(options.headers),
        mode: "cors",
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "請求失敗");
      }

      return data.data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw error;
    }
  }

  static async getPopularMovies() {
    return this.fetchFromAPI("/movies/popular");
  }

  static async getComingSoonMovies() {
    return this.fetchFromAPI("/movies/coming_soon");
  }

  static async searchMovies(query) {
    return this.fetchFromAPI(`/movies/search?q=${encodeURIComponent(query)}`);
  }

  static async getMoviesByGenre(genreId) {
    return this.fetchFromAPI(`/movies/genre/${genreId}`);
  }

  static async getMovieDetails(movieId) {
    try {
      const response = await this.fetchFromAPI(`/movies/${movieId}`);
      return response;
    } catch (error) {
      console.error("無法獲取電影詳細資料:", error);
      return null;
    }
  }

  static async fetchGenres() {
    try {
      return await this.fetchFromAPI("/movies/genres");
    } catch (error) {
      console.error("無法獲取類型列表:", error);
      return [];
    }
  }

  static getImageURL(posterPath) {
    // 後端已經處理完整的圖片 URL，直接返回
    return (
      posterPath || "https://placehold.co/500x750/1f2937/6b7280?text=無圖片"
    );
  }

  static getRatingColor(vote) {
    if (vote >= 8) return "text-green-400 font-bold";
    if (vote >= 6) return "text-yellow-400";
    return "text-red-400";
  }

  // 發送到 LINE 功能
  static async sendToLine(movieData) {
    try {
      return await this.fetchFromAPI("/send-to-line", {
        method: "POST",
        body: JSON.stringify(movieData),
      });
    } catch (error) {
      console.error("發送到 LINE 失敗:", error);
      throw error;
    }
  }

  // 根據關鍵字獲取推薦電影
  static async getRecommendedMovies(keywords) {
    try {
      // 嘗試使用後端 AI 推薦 API
      return await this.fetchFromAPI(
        `/movies/recommend?keywords=${encodeURIComponent(keywords)}`
      );
    } catch (error) {
      console.error("AI 推薦失敗，降級到搜尋功能:", error);
      // 降級到搜尋功能
      return await this.searchMovies(keywords);
    }
  }
}
