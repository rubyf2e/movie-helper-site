import React, { useState, useEffect } from "react";
import { MovieAPI } from "../services/movieAPI";
import TMDBMovieCard from "./TMDBMovieCard";
import MovieModal from "./MovieModal";
import { SearchIcon } from "./Icons";

function SearchBox() {
  // TMDB API 狀態
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [movieGridTitle, setMovieGridTitle] = useState("熱門電影");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  // GenreFilter 相關狀態
  const [genres, setGenres] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);

  useEffect(() => {
    loadPopularMovies();
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const genreList = await MovieAPI.fetchGenres();
      setGenres(genreList);
    } catch (error) {
      console.error("載入類型失敗:", error);
    }
  };

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

  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadPopularMovies();
      return;
    }

    setLoading(true);
    setNoResults(false);
    try {
      const movieList = await MovieAPI.searchMovies(query);
      setMovies(movieList);
      setMovieGridTitle(`搜尋 "${query}" 的結果`);
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
    handleSearch(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
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
              placeholder="輸入電影名稱、演員或導演..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </form>

        {/* 類型篩選器 */}
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

        <button className="search-btn" onClick={handleSearchSubmit}>
          搜尋電影
        </button>
      </div>

      {/* 電影結果區域 */}
      <div className="movie-results-section">
        {/* 結果標題 */}
        <h3 className="movie-grid-title">{movieGridTitle}</h3>

        {/* 載入指示器 */}
        {loading && <div className="loading-indicator">載入中...</div>}

        {/* 無結果提示 */}
        {noResults && !loading && (
          <div className="no-results">
            找不到相關電影，請嘗試其他關鍵字或類型。
          </div>
        )}

        {/* 電影網格 */}
        {!loading && !noResults && movies.length > 0 && (
          <div className="tmdb-movie-grid">
            {movies.map((movie) => (
              <TMDBMovieCard
                key={movie.id}
                movie={movie}
                onClick={handleMovieClick}
              />
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
