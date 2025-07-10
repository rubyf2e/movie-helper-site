import React, { useState } from "react";
import { MovieAPI } from "../services/movieAPI";
import TMDBMovieCard from "./TMDBMovieCard";
import MovieModal from "./MovieModal";

const MovieSearchForm = ({
  onMovieAdd,
  placeholder = "描述您想看的電影類型或心情...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
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

  // AI 分析推薦電影
  const handleAnalyzeAndRecommend = async () => {
    const query = inputValue.trim();
    if (!query) {
      showMessage("請描述您想看的電影類型或心情！", "error");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult("");
    setRecommendedMovies([]);

    try {
      // 調用後端 AI 分析 API
      const response = await fetch(
        `${API_BASE_URL}/api/analyze-movie-preference`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userInput: query,
            language: "zh-TW",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.analysis);

        // 根據 AI 分析結果搜尋推薦電影
        const movieRecommendations = await MovieAPI.getRecommendedMovies(
          data.keywords
        );
        setRecommendedMovies(movieRecommendations);

        if (movieRecommendations.length === 0) {
          showMessage(
            "根據您的喜好找不到相關電影，請嘗試不同的描述",
            "warning"
          );
        } else {
          showMessage(
            `為您推薦了 ${movieRecommendations.length} 部電影！`,
            "success"
          );
        }
      } else {
        throw new Error(data.message || "分析失敗");
      }
    } catch (error) {
      console.error("AI 分析失敗:", error);

      // 降級處理：使用關鍵字搜尋
      try {
        const fallbackResults = await MovieAPI.searchMovies(query);
        setRecommendedMovies(fallbackResults || []);
        setAnalysisResult(`根據您的輸入「${query}」為您找到以下電影推薦：`);
        showMessage("使用關鍵字搜尋為您推薦電影", "warning");
      } catch (fallbackError) {
        showMessage("推薦失敗，請稍後再試", "error");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 直接添加電影（原有功能）
  const handleDirectAdd = () => {
    const movieTitle = inputValue.trim();
    if (movieTitle && onMovieAdd) {
      onMovieAdd(movieTitle);
      setInputValue("");
      setRecommendedMovies([]);
      setAnalysisResult("");
    } else {
      showMessage("請輸入電影名稱！", "error");
    }
  };

  const handleSendToLine = async () => {
    try {
      const movie = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

      const response = await MovieAPI.sendToLine(movie);

      if (response.success) {
        showMessage("成功發送到 LINE！", "success");
      } else {
        throw new Error(response.message || "發送失敗");
      }
    } catch (error) {
      console.error("發送到 LINE 失敗:", error);
      showMessage("發送到 LINE 失敗，請稍後再試", "error");
    }
  };

  // 從推薦結果添加電影
  const handleAddFromRecommendation = async (movie) => {
    if (onMovieAdd) {
      onMovieAdd(movie.title, movie);

      // 儲存到 localStorage 並發送到 LINE
      const movieData = {
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        analysis: analysisResult,
        addedAt: new Date().toISOString(),
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(movieData));

      try {
        await handleSendToLine();
        showMessage(`已新增「${movie.title}」到清單並發送到 LINE`, "success");
      } catch (error) {
        showMessage(`已新增「${movie.title}」到清單`, "success");
      }
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
        // Enter 開始分析推薦
        handleAnalyzeAndRecommend();
      }
    }
  };

  // 清除分析結果
  const clearAnalysis = () => {
    setInputValue("");
    setRecommendedMovies([]);
    setAnalysisResult("");
  };

  // 重新分析
  const handleReAnalyze = () => {
    handleAnalyzeAndRecommend();
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

      {/* 分析表單 */}
      <div className="movie-search-form__form">
        <div className="movie-search-form__input-group">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="movie-search-form__input movie-search-form__textarea"
            disabled={isAnalyzing}
            rows={3}
          />
          {inputValue && (
            <button
              onClick={clearAnalysis}
              className="movie-search-form__clear-btn"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <div className="movie-search-form__buttons">
          <button
            onClick={handleAnalyzeAndRecommend}
            className="movie-search-form__search-btn movie-search-form__analyze-btn"
            disabled={isAnalyzing || !inputValue.trim()}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                AI 分析中...
              </>
            ) : (
              <>🤖 AI 推薦電影</>
            )}
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
        <span>
          💡 提示：描述您的心情、喜好或想看的電影類型，AI 會為您推薦合適的電影
        </span>
        <br />
        <span>
          例如：「我想看輕鬆搞笑的電影」、「推薦一些科幻動作片」、「心情不好想看療癒的電影」
        </span>
      </div>

      {/* AI 分析結果 */}
      {analysisResult && (
        <div className="movie-search-form__analysis">
          <div className="movie-search-form__analysis-header">
            <h3>🎯 AI 分析結果</h3>
            <button
              onClick={handleReAnalyze}
              className="movie-search-form__reanalyze-btn"
              disabled={isAnalyzing}
            >
              重新分析
            </button>
          </div>
          <div className="movie-search-form__analysis-content">
            {analysisResult}
          </div>
        </div>
      )}

      {/* 推薦結果 */}
      {recommendedMovies.length > 0 && (
        <div className="movie-search-form__results">
          <div className="movie-search-form__results-header">
            <h3>🎬 為您推薦 ({recommendedMovies.length})</h3>
            <button
              onClick={() => setRecommendedMovies([])}
              className="movie-search-form__clear-results"
            >
              清除結果
            </button>
          </div>
          <div className="movie-search-form__grid">
            {recommendedMovies.map((movie) => (
              <div key={movie.id} className="movie-search-form__result-item">
                <TMDBMovieCard movie={movie} onClick={handleMovieClick} />
                <button
                  onClick={() => handleAddFromRecommendation(movie)}
                  className="movie-search-form__add-result-btn"
                >
                  ⭐ 新增到清單
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
