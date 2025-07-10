import React, { useState } from "react";
import { MovieAPI } from "../services/movieAPI";
import TMDBMovieCard from "./TMDBMovieCard";
import MovieModal from "./MovieModal";

const MovieSearchForm = ({ onMovieAdd, placeholder = "輸入電影名稱..." }) => {
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  const LOCAL_STORAGE_KEY = "movieWatchlist";
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // 顯示提示訊息
  const showMessage = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", show: false });
    }, 2000);
  };

  // 搜尋電影
  const handleSearch = async () => {
    const query = inputValue.trim();
    if (!query) {
      showMessage("請輸入電影名稱！", "error");
      return;
    }

    setIsSearching(true);
    try {
      const results = await MovieAPI.searchMovies(query);
      setSearchResults(results.results || []);
      if (results.results?.length === 0) {
        showMessage("找不到相關電影", "warning");
      }
    } catch (error) {
      console.error("搜尋電影失敗:", error);
      showMessage("搜尋失敗，請稍後再試", "error");
    } finally {
      setIsSearching(false);
    }
  };

  // 直接添加電影（原有功能）
  const handleDirectAdd = () => {
    const movieTitle = inputValue.trim();
    if (movieTitle && onMovieAdd) {
      onMovieAdd(movieTitle);
      setInputValue("");
      setSearchResults([]);
    } else {
      showMessage("請輸入電影名稱！", "error");
    }
  };

  const handleSendToLine = async () => {
    const movie = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

    const res = await fetch(API_BASE_URL + "/send-to-line", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movie),
    });

    const data = await res.json();
    alert("送出成功：" + data.status);
  };

  // 從搜尋結果添加電影
  const handleAddFromSearch = (movie) => {
    if (onMovieAdd) {
      onMovieAdd(movie.title, movie);
      handleSendToLine();
      showMessage(`已新增「${movie.title}」到清單`, "success");
    }
  };

  // 開啟電影詳情模態框
  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
    setIsModalOpen(true);
  };

  // 關閉模態框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovieId(null);
  };

  // 處理 Enter 鍵
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        // Shift + Enter 直接添加
        handleDirectAdd();
      } else {
        // Enter 搜尋
        handleSearch();
      }
    }
  };

  // 清除搜尋結果
  const clearSearch = () => {
    setInputValue("");
    setSearchResults([]);
  };

  return (
    <div className="movie-search-form">
      {/* 提示訊息區域 */}
      {notification.show && (
        <div
          className={`movie-search-form__notification movie-search-form__notification--${notification.type}`}
        >
          {notification.message}
        </div>
      )}

      {/* 搜尋表單 */}
      <div className="movie-search-form__form">
        <div className="movie-search-form__input-group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="movie-search-form__input"
            disabled={isSearching}
          />
          {inputValue && (
            <button
              onClick={clearSearch}
              className="movie-search-form__clear-btn"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <div className="movie-search-form__buttons">
          <button
            onClick={handleSearch}
            className="movie-search-form__search-btn"
            disabled={isSearching || !inputValue.trim()}
          >
            {isSearching ? "搜尋中..." : "搜尋電影"}
          </button>
          <button
            onClick={handleDirectAdd}
            className="movie-search-form__add-btn"
            disabled={!inputValue.trim()}
          >
            直接新增
          </button>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="movie-search-form__hint">
        <span>提示：按 Enter 搜尋，Shift + Enter 直接新增</span>
      </div>

      {/* 搜尋結果 */}
      {searchResults.length > 0 && (
        <div className="movie-search-form__results">
          <div className="movie-search-form__results-header">
            <h3>搜尋結果 ({searchResults.length})</h3>
            <button
              onClick={() => setSearchResults([])}
              className="movie-search-form__clear-results"
            >
              清除結果
            </button>
          </div>
          <div className="movie-search-form__grid">
            {searchResults.map((movie) => (
              <div key={movie.id} className="movie-search-form__result-item">
                <TMDBMovieCard movie={movie} onClick={handleMovieClick} />
                <button
                  onClick={() => handleAddFromSearch(movie)}
                  className="movie-search-form__add-result-btn"
                >
                  新增到清單
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 電影詳情模態框 */}
      <MovieModal
        movieId={selectedMovieId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default MovieSearchForm;
