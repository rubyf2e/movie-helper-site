// TMDB API 服務
const API_KEY = "api_key=" + process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = process.env.REACT_APP_TMDB_BASE_URL;
const IMG_URL = process.env.REACT_APP_TMDB_IMG_URL;
const MOVIE_LANGUAGE = process.env.REACT_APP_TMDB_MOVIE_LANGUAGE;

export class MovieAPI {
  static async fetchMovies(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("無法獲取電影資料:", error);
      throw error;
    }
  }

  static async getPopularMovies() {
    const url = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}&language=${MOVIE_LANGUAGE}&page=1`;
    return this.fetchMovies(url);
  }

  static async searchMovies(query) {
    const url = `${BASE_URL}/search/movie?${API_KEY}&query=${encodeURIComponent(
      query
    )}&language=${MOVIE_LANGUAGE}&page=1`;
    return this.fetchMovies(url);
  }

  static async getMoviesByGenre(genreId) {
    const url = `${BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&${API_KEY}&language=${MOVIE_LANGUAGE}&page=1`;
    return this.fetchMovies(url);
  }

  static async getMovieDetails(movieId) {
    const url = `${BASE_URL}/movie/${movieId}?${API_KEY}&language=${MOVIE_LANGUAGE}&append_to_response=credits`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch details");
      return await response.json();
    } catch (error) {
      console.error("無法獲取電影詳細資料:", error);
      return null;
    }
  }

  static async fetchGenres() {
    const url = `${BASE_URL}/genre/movie/list?${API_KEY}&language=${MOVIE_LANGUAGE}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.genres;
    } catch (error) {
      console.error("無法獲取類型列表:", error);
      return [];
    }
  }

  static getImageURL(posterPath) {
    return posterPath
      ? IMG_URL + posterPath
      : "https://placehold.co/500x750/1f2937/6b7280?text=無圖片";
  }

  static getRatingColor(vote) {
    if (vote >= 8) return "text-green-400 font-bold";
    if (vote >= 6) return "text-yellow-400";
    return "text-red-400";
  }
}
