import React, { useState, useEffect } from "react";
import { MovieAPI } from "../services/movieAPI";
import { useGenres } from "../contexts/GenreContext";
import TMDBMovieCard from "./TMDBMovieCard";
import MovieModal from "./MovieModal";
import { SearchIcon } from "./Icons";

function SearchBox() {
  // TMDB API 狀態
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("movie"); // 新增搜尋類型狀態
  const [movieGridTitle, setMovieGridTitle] = useState("熱門電影");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [personInfo, setPersonInfo] = useState(null); // 新增人物資訊狀態
  // 使用全域 genres
  const genres = useGenres();
  const [activeGenre, setActiveGenre] = useState(null);

  useEffect(() => {
    loadPopularMovies();
  }, []);

  const loadPopularMovies = async () => {
    setLoading(true);
    setNoResults(false);
    try {
      const movieList = await MovieAPI.getPopularMovies();
      setMovies(movieList);
      setMovieGridTitle("熱門電影");
      setActiveGenre(null);
      if (movieList.length === 0) {
        setNoResults(true);
      }
    } catch (error) {
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query, type = searchType) => {
    if (!query.trim()) {
      loadPopularMovies();
      return;
    }

    setLoading(true);
    setNoResults(false);
    setPersonInfo(null); // 重置人物資訊
    try {
      const response = await MovieAPI.searchMovies(query, type);
      let movieList, title;

      if (typeof response === "object" && response.data) {
        // 如果回應包含額外資料（如人物搜尋）
        movieList = response.data;
        title =
          response.search_type === "person"
            ? `搜尋演員/導演 "${query}" 的相關電影`
            : `搜尋 "${query}" 的結果`;

        // 儲存人物資訊
        if (response.person_info) {
          setPersonInfo(response.person_info);
        }
      } else {
        // 一般電影搜尋
        movieList = response;
        title = `搜尋 "${query}" 的結果`;
      }

      setMovies(movieList);
      setMovieGridTitle(title);
      setActiveGenre(null);
      if (movieList.length === 0) {
        setNoResults(true);
      }
    } catch (error) {
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = async (genreId, genreName) => {
    if (genreId === null) {
      loadPopularMovies();
      return;
    }

    setLoading(true);
    setNoResults(false);
    try {
      const movieList = await MovieAPI.getMoviesByGenre(genreId);
      setMovies(movieList);
      setMovieGridTitle(`${genreName}電影`);
      setActiveGenre(genreId);
      if (movieList.length === 0) {
        setNoResults(true);
      }
    } catch (error) {
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMovieId(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery, searchType);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery, searchType);
    }
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    // 如果有搜尋關鍵字，立即重新搜尋
    if (searchQuery.trim()) {
      handleSearch(searchQuery, type);
    }
  };

  return (
    <div className="search-box-container">
      <div className="search-box">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrap">
            <span className="search-icon">
              <SearchIcon className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder={
                searchType === "person"
                  ? "輸入演員或導演名稱..."
                  : "輸入電影名稱..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </form>

        {/* 搜尋類型選擇器 */}
        <div className="search-type-selector">
          <button
            type="button"
            className={`search-type-btn ${
              searchType === "movie" ? "active" : ""
            }`}
            onClick={() => handleSearchTypeChange("movie")}
          >
            🎬 電影
          </button>
          <button
            type="button"
            className={`search-type-btn ${
              searchType === "person" ? "active" : ""
            }`}
            onClick={() => handleSearchTypeChange("person")}
          >
            🎭 演員/導演
          </button>
        </div>

        {/* 類型篩選器 - 只在電影搜尋模式下顯示 */}
        {searchType === "movie" && (
          <div className="tags" id="search-tags">
            <div className="genre-filters">
              <button
                className={`genre-btn ${activeGenre === null ? "active" : ""}`}
                onClick={() => handleGenreChange(null, "全部熱門")}
              >
                全部熱門
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  className={`genre-btn ${
                    activeGenre === genre.id ? "active" : ""
                  }`}
                  onClick={() => handleGenreChange(genre.id, genre.name)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="search-btn" onClick={handleSearchSubmit}>
          {searchType === "person" ? "搜尋演員/導演" : "搜尋電影"}
        </button>
      </div>

      {/* 電影結果區域 */}
      <div className="movie-results-section">
        {/* 結果標題 */}
        <h3 className="movie-grid-title">{movieGridTitle}</h3>

        {/* 人物資訊顯示 - 只在人物搜尋模式下顯示 */}
        {personInfo && searchType === "person" && (
          <div className="person-info">
            <div className="person-card">
              {personInfo.profile_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w185${personInfo.profile_path}`}
                  alt={personInfo.name}
                  className="person-avatar"
                />
              )}
              <div className="person-details">
                <h4 className="person-name">{personInfo.name}</h4>
                <p className="person-department">
                  {personInfo.known_for_department === "Acting"
                    ? "演員"
                    : personInfo.known_for_department === "Directing"
                    ? "導演"
                    : personInfo.known_for_department || "電影工作者"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 載入指示器 */}
        {loading && <div className="loading-indicator">載入中...</div>}

        {/* 無結果提示 */}
        {noResults && !loading && (
          <div className="no-results">
            找不到相關{searchType === "person" ? "演員/導演" : "電影"}
            ，請嘗試其他關鍵字{searchType === "movie" ? "或類型" : ""}。
          </div>
        )}

        {/* 電影網格 */}
        {!loading && !noResults && movies.length > 0 && (
          <div className="tmdb-movie-grid">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card-wrapper">
                <TMDBMovieCard movie={movie} onClick={handleMovieClick} />
                {/* 顯示演員/導演標籤 */}
                {searchType === "person" && movie.person_role && (
                  <div className="person-role-badge">
                    {movie.person_role === "actor" ? "🎭 演員" : "🎬 導演"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 電影詳情彈窗 */}
      <MovieModal
        movieId={selectedMovieId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default SearchBox;
