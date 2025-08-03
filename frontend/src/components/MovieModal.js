import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import MovieGenres from "./MovieGenres";
import { MovieAPI } from "../services/movieAPI";
import { DEFAULT_STORAGE_KEY, NOTIFICATION_TYPES } from "../utils/constants";
import { lineAuthService } from "../services/globalServices";

function MovieModal({ movieId, isOpen, onClose }) {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  const showMessage = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", show: false });
    }, 3000);
  };

  const checkIfInWatchlist = (movie) => {
    try {
      const savedMovies = localStorage.getItem(DEFAULT_STORAGE_KEY);
      if (!savedMovies) return false;

      const movies = JSON.parse(savedMovies);
      
      // 確保 movies 是陣列
      if (!Array.isArray(movies)) {
        console.warn("待看清單資料格式錯誤，重置為空陣列");
        localStorage.removeItem(DEFAULT_STORAGE_KEY);
        return false;
      }
      
      return movies.some(
        (savedMovie) =>
          savedMovie.id === movie.id || savedMovie.title === movie.title
      );
    } catch (error) {
      console.error("檢查待看清單時發生錯誤:", error);
      // 如果解析失敗，清除損壞的資料
      localStorage.removeItem(DEFAULT_STORAGE_KEY);
      return false;
    }
  };

  const addToWatchlist = async () => {
    try {
      const savedMovies = localStorage.getItem(DEFAULT_STORAGE_KEY);
      let movies = savedMovies ? JSON.parse(savedMovies) : [];
      
      // 確保 movies 是陣列
      if (!Array.isArray(movies)) {
        console.warn("待看清單資料格式錯誤，重置為空陣列");
        movies = [];
        localStorage.removeItem(DEFAULT_STORAGE_KEY);
      }

      const exists = movies.some(
        (movie) => movie.id === movieData.id || movie.title === movieData.title
      );

      if (exists) {
        showMessage("電影已在待看清單中！", NOTIFICATION_TYPES.WARNING);
        return;
      }

      const movieToAdd = {
        id: movieData.id,
        title: movieData.title,
        poster_path: movieData.poster_path,
        vote_average: movieData.vote_average,
        release_date: movieData.release_date,
        overview: movieData.overview,
        addedAt: new Date().toISOString(),
      };

      const updatedMovies = [...movies, movieToAdd];
      localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(updatedMovies));
      window.dispatchEvent(new Event("watchlistUpdated"));
      setIsInWatchlist(true);
      
      // 發送 LINE 通知（如果用戶已登入）
      if (lineAuthService.isAuthenticated()) {
        try {
          const lineResult = await lineAuthService.sendMovieListToLine([movieToAdd]);
          if (lineResult.success) {
            showMessage(
              `成功新增「${movieData.title}」到待看清單並發送到 LINE！`,
              NOTIFICATION_TYPES.SUCCESS
            );
          } else {
            showMessage(
              `已新增「${movieData.title}」到待看清單，但 LINE 發送失敗`,
              NOTIFICATION_TYPES.WARNING
            );
          }
        } catch (lineError) {
          console.error("LINE 通知發送失敗:", lineError);
          showMessage(
            `已新增「${movieData.title}」到待看清單，但 LINE 發送失敗`,
            NOTIFICATION_TYPES.WARNING
          );
        }
      } else {
        showMessage(
          `成功新增「${movieData.title}」到待看清單！`,
          NOTIFICATION_TYPES.SUCCESS
        );
      }
    } catch (error) {
      console.error("添加到待看清單失敗:", error);
      showMessage("添加失敗，請稍後再試。", NOTIFICATION_TYPES.ERROR);
    }
  };

  const removeFromWatchlist = () => {
    try {
      const savedMovies = localStorage.getItem(DEFAULT_STORAGE_KEY);
      if (!savedMovies) return;

      let movies = JSON.parse(savedMovies);
      
      // 確保 movies 是陣列
      if (!Array.isArray(movies)) {
        console.warn("待看清單資料格式錯誤，重置為空陣列");
        localStorage.removeItem(DEFAULT_STORAGE_KEY);
        setIsInWatchlist(false);
        return;
      }
      
      const updatedMovies = movies.filter(
        (movie) => movie.id !== movieData.id && movie.title !== movieData.title
      );

      localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(updatedMovies));

      window.dispatchEvent(new Event("watchlistUpdated"));

      setIsInWatchlist(false);
      showMessage(
        `已從待看清單移除「${movieData.title}」`,
        NOTIFICATION_TYPES.INFO
      );
    } catch (error) {
      console.error("從待看清單移除失敗:", error);
      showMessage("移除失敗，請稍後再試。", NOTIFICATION_TYPES.ERROR);
    }
  };

  useEffect(() => {
    const loadMovieDetails = async () => {
      setLoading(true);
      try {
        const data = await MovieAPI.getMovieDetails(movieId);
        setMovieData(data);

        setIsInWatchlist(checkIfInWatchlist(data));
      } catch (error) {
        console.error("載入電影詳情失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && movieId) {
      loadMovieDetails();
    }
  }, [isOpen, movieId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      const handleEscape = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "auto";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        {/* 通知訊息 */}
        {notification.show && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}

        {loading ? (
          <div className="modal-loading">載入中...</div>
        ) : movieData ? (
          <div className="modal-content">
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
            <div className="modal-poster">
              <img
                src={MovieAPI.getImageURL(movieData.poster_path)}
                alt={movieData.title}
              />
            </div>
            <div className="modal-info">
              <h2>{movieData.title}</h2>
              <div className="movie-meta">
                <div className="meta-details">
                  <span>{movieData.release_date}</span>
                  <span>•</span>
                  <span>
                    {movieData.runtime ? movieData.runtime + " 分鐘" : "N/A"}
                  </span>
                  <span>•</span>
                  <span
                    className={MovieAPI.getRatingColor(movieData.vote_average)}
                  >
                    {movieData.vote_average.toFixed(1)} ⭐
                  </span>
                </div>

                {/* 待看清單按鈕 */}
                <div className="watchlist-actions">
                  {isInWatchlist ? (
                    <button
                      className="btn btn-secondary btn-watchlist"
                      onClick={removeFromWatchlist}
                    >
                      ✓ 已在待看清單
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-watchlist"
                      onClick={addToWatchlist}
                    >
                      + 加入待看清單
                    </button>
                  )}
                </div>
              </div>
              <MovieGenres genres={movieData.genres} type="map" />

              <p className="movie-overview">
                {movieData.overview || "暫無劇情簡介。"}
              </p>
              <div className="movie-credits">
                <p>
                  <strong>導演:</strong>{" "}
                  {movieData.credits.crew
                    .filter((person) => person.job === "Director")
                    .map((d) => d.name)
                    .join(", ") || "N/A"}
                </p>
                <p>
                  <strong>主演:</strong>{" "}
                  {movieData.credits.cast
                    .slice(0, 5)
                    .map((c) => c.name)
                    .join(", ") || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-error">無法載入電影詳細資訊</div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default MovieModal;
