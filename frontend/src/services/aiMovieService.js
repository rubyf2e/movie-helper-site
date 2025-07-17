import { MovieAPI } from "./movieAPI";
import {
  APP_CONFIG,
  API_ENDPOINTS,
  HTTP_HEADERS,
  RECOMMENDATION_SOURCES,
  DEFAULT_STORAGE_KEY,
} from "../utils/constants";

class AIMovieService {
  constructor(storageKey = DEFAULT_STORAGE_KEY) {
    this.apiBaseUrl = APP_CONFIG.API_BASE_URL;
    this.storageKey = storageKey;
  }

  /**
   * AI 分析用戶喜好並推薦電影
   * @param {string} userInput - 用戶描述的電影喜好或心情
   * @param {string} language - 語言設定，預設為 zh-TW
   * @returns {Promise<Object>} 分析結果和推薦電影
   */
  async analyzeAndRecommend(userInput, language = "zh-TW") {
    if (!userInput?.trim()) {
      throw new Error("請描述您想看的電影類型或心情！");
    }

    try {
      // 調用後端 AI 分析 API
      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.ANALYZE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
          },
          body: JSON.stringify({
            userInput: userInput.trim(),
            language: language,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "AI 分析失敗");
      } else if (!data.keywords === "") {
        return {
          success: false,
          error: "根據您的喜好找不到相關電影，請嘗試不同的描述",
          analysis: "",
          keywords: [],
          movies: [],
          totalCount: 0,
        };
      }

      return await this.fallbackSearch(data.keywords);
      // // 根據 AI 分析結果搜尋推薦電影
      // const movieRecommendations = await MovieAPI.getRecommendedMovies(
      //   data.keywords
      // );

      // return {
      //   success: true,
      //   analysis: data.analysis,
      //   keywords: data.keywords,
      //   movies: movieRecommendations || [],
      //   totalCount: movieRecommendations?.length || 0,
      // };
    } catch (error) {
      console.error("AI 分析失敗:", error);

      // 降級處理：使用關鍵字搜尋
      return await this.fallbackSearch(userInput);
    }
  }

  /**
   * 降級處理：當 AI 分析失敗時使用關鍵字搜尋
   * @param {string} query - 搜尋關鍵字
   * @returns {Promise<Object>} 搜尋結果
   */
  async fallbackSearch(query) {
    try {
      const fallbackResults = await MovieAPI.searchMovies(query);

      return {
        success: true,
        analysis: `根據您的輸入「${query}」為您找到以下電影推薦：`,
        keywords: [query],
        movies: fallbackResults || [],
        totalCount: fallbackResults?.length || 0,
        isFallback: true,
      };
    } catch (fallbackError) {
      console.error("降級搜尋也失敗:", fallbackError);

      return {
        success: false,
        error: "推薦失敗，請稍後再試",
        analysis: "",
        keywords: [],
        movies: [],
        totalCount: 0,
      };
    }
  }

  /**
   * 格式化電影資料用於儲存
   * @param {Object} movie - 電影物件
   * @param {string} analysis - AI 分析結果
   * @returns {Object} 格式化的電影資料
   */
  formatMovieForStorage(movie, analysis = "") {
    return {
      title: movie.title || movie.original_title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids,
      id: movie.id,
      analysis: analysis,
      addedAt: new Date().toISOString(),
      source: RECOMMENDATION_SOURCES.AI,
    };
  }

  /**
   * 儲存推薦電影到本地儲存
   * @param {Object} movie - 電影物件
   * @param {string} analysis - AI 分析結果
   * @param {string} storageKey - localStorage 鍵值
   * @returns {Object} 格式化的電影資料
   */
  saveRecommendedMovie(movie, analysis, storageKey = null) {
    const key = storageKey || this.storageKey;
    const formattedMovie = this.formatMovieForStorage(movie, analysis);

    try {
      // 取得現有清單
      const existingMovies = this.getStoredMovies(key);

      // 檢查是否已存在
      const isDuplicate = existingMovies.some(
        (existingMovie) =>
          existingMovie.id === movie.id || existingMovie.title === movie.title
      );

      if (isDuplicate) {
        throw new Error(`「${movie.title}」已在清單中`);
      }

      // 新增到清單
      const updatedMovies = [...existingMovies, formattedMovie];
      localStorage.setItem(key, JSON.stringify(updatedMovies));

      return formattedMovie;
    } catch (error) {
      console.error("儲存電影失敗:", error);
      throw error;
    }
  }

  /**
   * 取得已儲存的電影清單
   * @param {string} storageKey - localStorage 鍵值
   * @returns {Array} 電影清單
   */
  getStoredMovies(storageKey = null) {
    const key = storageKey || this.storageKey;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("讀取電影清單失敗:", error);
      return [];
    }
  }

  getStoredKey(storageKey = null) {
    return this.storageKey;
  }

  /**
   * 驗證 API 連線狀態
   * @returns {Promise<boolean>} 是否可用
   */
  async isServiceAvailable() {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}${API_ENDPOINTS.HEALTH}`,
        {
          method: "GET",
          headers: {
            [HTTP_HEADERS.NGROK_SKIP_WARNING]: "true",
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error("AI 服務不可用:", error);
      return false;
    }
  }

  /**
   * 產生推薦統計資訊
   * @param {Array} movies - 電影清單
   * @returns {Object} 統計資訊
   */
  generateRecommendationStats(movies) {
    if (!Array.isArray(movies) || movies.length === 0) {
      return {
        total: 0,
        averageRating: 0,
        genres: [],
        releaseYears: [],
      };
    }

    const total = movies.length;
    const ratings = movies
      .filter((m) => m.vote_average)
      .map((m) => m.vote_average);
    const averageRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          ).toFixed(1)
        : 0;

    // 提取發行年份
    const releaseYears = movies
      .filter((m) => m.release_date)
      .map((m) => new Date(m.release_date).getFullYear())
      .filter((year) => !isNaN(year));

    const uniqueYears = [...new Set(releaseYears)].sort((a, b) => b - a);

    return {
      total,
      averageRating: parseFloat(averageRating),
      releaseYears: uniqueYears.slice(0, 5), // 取前 5 個年份
      hasHighRated: movies.some((m) => m.vote_average >= 8),
      hasRecent: movies.some((m) => {
        const year = new Date(m.release_date).getFullYear();
        return year >= new Date().getFullYear() - 2;
      }),
    };
  }
}

export { AIMovieService };
export default AIMovieService;
