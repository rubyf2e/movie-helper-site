import React, { useState, useCallback } from "react";
import { MovieIcon } from "./Icons";
import TMDBMovieCard from "./TMDBMovieCard";
import MovieModal from "./MovieModal";
import LineLoginButton from "./LineLoginButton";
import { aiMovieService, LOCAL_STORAGE_KEY } from "../services/globalServices";
import { NOTIFICATION_TYPES } from "../utils/constants";

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

  // 顯示提示訊息
  const showMessage = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", show: false });
    }, 2000);
  };

  const handleAnalyzeAndRecommend = async () => {
    const query = inputValue.trim();
    if (!query) {
      showMessage("請描述您想看的電影類型或心情！", NOTIFICATION_TYPES.ERROR);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult("");
    setRecommendedMovies([]);

    try {
      // 使用 AI 服務進行分析和推薦
      const result = await aiMovieService.analyzeAndRecommend(query);

      if (result.success) {
        setAnalysisResult(result.analysis);
        setRecommendedMovies(result.movies);

        if (result.totalCount === 0) {
          showMessage(
            "根據您的喜好找不到相關電影，請嘗試不同的描述",
            NOTIFICATION_TYPES.WARNING
          );
        } else {
          const message = result.isFallback
            ? `使用關鍵字搜尋為您推薦了 ${result.totalCount} 部電影`
            : `AI 為您推薦了 ${result.totalCount} 部電影！`;
          showMessage(
            message,
            result.isFallback
              ? NOTIFICATION_TYPES.WARNING
              : NOTIFICATION_TYPES.SUCCESS
          );
        }
      } else {
        showMessage(
          result.error || "推薦失敗，請稍後再試",
          NOTIFICATION_TYPES.ERROR
        );
      }
    } catch (error) {
      console.error("AI 分析推薦失敗:", error);
      showMessage("推薦失敗，請稍後再試", NOTIFICATION_TYPES.ERROR);
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
      showMessage("請輸入電影名稱！", NOTIFICATION_TYPES.ERROR);
    }
  };

  // 從推薦結果添加電影
  const handleAddFromRecommendation = async (movie) => {
    if (onMovieAdd) {
      onMovieAdd(movie.title, movie);

      try {
        // 使用 AI 服務儲存電影
        const formattedMovie = aiMovieService.formatMovieForStorage(
          movie,
          analysisResult
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formattedMovie));

        showMessage(
          `已新增「${movie.title}」到清單並發送到 LINE`,
          NOTIFICATION_TYPES.SUCCESS
        );
      } catch (error) {
        showMessage(
          `已新增「${movie.title}」到清單`,
          NOTIFICATION_TYPES.SUCCESS
        );
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
              <>
                <MovieIcon /> AI 推薦電影
              </>
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

      {/* LINE 登入區域 */}
      <div className="movie-search-form__line-login">
        <div className="movie-search-form__line-login-header">
          <span>連結 LINE 帳號可將電影清單發送到 LINE</span>
        </div>
        <LineLoginButton
          onLoginSuccess={(user) => {
            if (user) {
              showMessage(
                `歡迎，${user.displayName}！`,
                NOTIFICATION_TYPES.SUCCESS
              );
            } else {
              showMessage("已登出 LINE 帳號", NOTIFICATION_TYPES.SUCCESS);
            }
          }}
          onLoginError={(error) => {
            showMessage(
              `LINE 登入失敗：${error.message}`,
              NOTIFICATION_TYPES.ERROR
            );
          }}
          className="movie-search-form__line-login-btn"
        />
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
