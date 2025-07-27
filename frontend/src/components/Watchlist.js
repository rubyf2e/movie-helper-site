import React, { useState, useEffect, useCallback, useMemo } from "react";
import MovieSearchForm from "./MovieSearchForm";
import {
  DEFAULT_STORAGE_KEY,
  APP_CONFIG,
  NOTIFICATION_TYPES,
} from "../utils/constants";

import { lineAuthService } from "../services/globalServices";

const Watchlist = ({ botRef }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  const LOCAL_STORAGE_KEY = DEFAULT_STORAGE_KEY;

  const showMessage = useCallback((message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", show: false });
    }, 3000);
  }, []);

  useEffect(() => {
    try {
      const savedMovies = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedMovies) {
        const parsedMovies = JSON.parse(savedMovies);

        if (Array.isArray(parsedMovies)) {
          setMovies(parsedMovies);
        } else {
          console.warn("載入的資料不是陣列格式，重置為空陣列");
          setMovies([]);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("載入電影清單失敗:", error);
      showMessage("載入資料失敗，已重置清單。", NOTIFICATION_TYPES.ERROR);

      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setMovies([]);
    }
  }, [showMessage, LOCAL_STORAGE_KEY]);

  const handleSendToLine = useCallback(
    async (movies = null) => {
      const response = await lineAuthService.sendMovieListToLine(movies);

      console.log(movies);

      if (response.success) {
        showMessage("電影清單已發送到 LINE", NOTIFICATION_TYPES.SUCCESS);
      } else {
        showMessage("發送失敗：" + response.message, NOTIFICATION_TYPES.ERROR);
      }
    },
    [showMessage]
  );

  const saveMovies = useCallback(
    async (movieList, movies) => {
      if (!Array.isArray(movieList) || !Array.isArray(movies)) {
        console.error("嘗試儲存非陣列資料:", movieList);
        return;
      }

      setLoading(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(movieList));
        setMovies(movieList);

        if (movies.length > 0) {
          handleSendToLine(movies);
        }
      } catch (error) {
        console.error("儲存電影清單失敗:", error);
        showMessage("儲存失敗，請檢查瀏覽器設定。", NOTIFICATION_TYPES.ERROR);
      } finally {
        setLoading(false);
      }
    },
    [showMessage, handleSendToLine, LOCAL_STORAGE_KEY]
  );

  const getMovieTitle = useCallback((movie) => {
    return typeof movie === "string" ? movie : movie?.title || "";
  }, []);

  const isMovieExists = useCallback(
    (newTitle) => {
      if (!Array.isArray(movies)) {
        console.error("movies 不是陣列:", movies);
        setMovies([]); // 重置為空陣列
        return false;
      }

      return movies.some((movie) => {
        const existingTitle = getMovieTitle(movie);
        return existingTitle.toLowerCase() === newTitle.toLowerCase();
      });
    },
    [movies, getMovieTitle]
  );

  const handleAddMovie = useCallback(
    (movieTitle, movieData = null) => {
      const title =
        typeof movieTitle === "string"
          ? movieTitle.trim()
          : movieTitle?.title?.trim();

      if (!title) {
        showMessage("請輸入電影名稱！", NOTIFICATION_TYPES.ERROR);
        return;
      }

      if (isMovieExists(title)) {
        showMessage("電影已存在清單中！", NOTIFICATION_TYPES.WARNING);
        return;
      }

      const movieToAdd = movieData
        ? {
            id: movieData.id,
            title: title,
            poster_path: movieData.poster_path,
            vote_average: movieData.vote_average,
            release_date: movieData.release_date,
            overview: movieData.overview,
            addedAt: new Date().toISOString(),
          }
        : {
            title: title,
            addedAt: new Date().toISOString(),
          };

      const updatedMovies = [...movies, movieToAdd];
      saveMovies(updatedMovies, [movieToAdd]);
      showMessage(`成功新增「${title}」！`, NOTIFICATION_TYPES.SUCCESS);
    },
    [movies, isMovieExists, saveMovies, showMessage]
  );

  const handleRemoveMovie = useCallback(
    (movieToRemove) => {
      if (!Array.isArray(movies)) {
        console.error("movies 不是陣列:", movies);
        setMovies([]);
        return;
      }

      const removeTitle = getMovieTitle(movieToRemove);
      const updatedMovies = movies.filter((movie) => {
        const movieTitle = getMovieTitle(movie);
        return movieTitle !== removeTitle;
      });

      const removeMovies = updatedMovies || [movies];

      saveMovies(updatedMovies, [removeMovies]);
      showMessage(`成功移除「${removeTitle}」！`, NOTIFICATION_TYPES.SUCCESS);
    },
    [movies, getMovieTitle, saveMovies, showMessage]
  );

  const handleClearAll = useCallback(() => {
    if (movies.length === 0) return;

    if (window.confirm("確定要清空所有電影嗎？此操作無法復原。")) {
      saveMovies([], []);
      showMessage("已清空所有電影！", NOTIFICATION_TYPES.SUCCESS);
    }
  }, [movies.length, saveMovies, showMessage]);

  const stats = useMemo(() => {
    if (!Array.isArray(movies)) {
      console.error("movies 不是陣列，無法計算統計:", movies);
      return {
        total: 0,
        withRating: 0,
        averageRating: null,
        recentAdditions: 0,
      };
    }

    const totalMovies = movies.length;
    const moviesWithRating = movies.filter(
      (movie) => typeof movie === "object" && movie.vote_average
    ).length;
    const averageRating =
      movies.reduce((sum, movie) => {
        if (typeof movie === "object" && movie.vote_average) {
          return sum + movie.vote_average;
        }
        return sum;
      }, 0) / (moviesWithRating || 1);

    const recentMovies = movies.filter((movie) => {
      if (typeof movie === "object" && movie.addedAt) {
        const addedDate = new Date(movie.addedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return addedDate > weekAgo;
      }
      return false;
    }).length;

    return {
      total: totalMovies,
      withRating: moviesWithRating,
      averageRating: moviesWithRating > 0 ? averageRating.toFixed(1) : null,
      recentAdditions: recentMovies,
    };
  }, [movies]);

  return (
    <section id="watchlist" className="watchlist">
      <div className="watchlist__container">
        <div className="watchlist__card">
          {/* 標題部分 */}
          <div className="watchlist__header">
            <h1 className="watchlist__title">我的電影待看清單</h1>
            {/* 統計資訊 */}
            {stats.total > 0 && (
              <div className="watchlist__stats">
                <span className="watchlist__count">
                  📁 共 {stats.total} 部電影
                </span>
                {stats.averageRating && (
                  <span className="watchlist__average-rating">
                    ⭐ 平均評分: {stats.averageRating}
                  </span>
                )}
                {stats.recentAdditions > 0 && (
                  <span className="watchlist__recent-additions">
                    🆕 本週新增 {stats.recentAdditions} 部
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 提示訊息區域 */}
          {notification.show && (
            <div
              className={`watchlist__notification watchlist__notification--${notification.type}`}
              role="alert"
            >
              {notification.message}
            </div>
          )}

          {/* 新增電影搜尋表單 */}
          <div className="watchlist__search">
            <div className="watchlist__form">
              <MovieSearchForm
                botRef={botRef}
                onMovieAdd={handleAddMovie}
                placeholder="搜尋或輸入電影名稱..."
              />
            </div>
          </div>

          {/* 電影列表區域 */}
          <div className="watchlist__content">
            {movies.length === 0 ? (
              <div className="watchlist__empty">
                <div className="watchlist__empty-icon">🎬</div>
                <p className="watchlist__empty-text">
                  目前沒有電影，請使用上方搜尋框新增電影到待看清單。
                </p>
              </div>
            ) : (
              <>
                {/* 清空按鈕 */}
                <div className="watchlist__actions">
                  <button
                    onClick={handleClearAll}
                    className="watchlist__clear-btn"
                    disabled={loading}
                  >
                    {loading ? "處理中..." : "清空清單"}
                  </button>
                </div>

                {/* 電影列表 */}
                <div className="watchlist__list">
                  {movies.map((movie, index) => {
                    const movieTitle = getMovieTitle(movie);
                    const movieData = typeof movie === "object" ? movie : null;

                    return (
                      <div
                        key={movieData?.id || index}
                        className={`watchlist__item ${
                          loading ? "watchlist__item--loading" : ""
                        }`}
                      >
                        {/* 電影海報（如果有的話） */}
                        {movieData?.poster_path && (
                          <div className="watchlist__poster">
                            <img
                              src={`${APP_CONFIG.TMDB_IMG_URL}${movieData.poster_path}`}
                              alt={`${movieTitle} 海報`}
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        {/* 電影資訊 */}
                        <div className="watchlist__movie-info">
                          <h3 className="watchlist__movie-title">
                            {movieTitle}
                          </h3>

                          {movieData && (
                            <div className="watchlist__movie-meta">
                              {movieData.release_date && (
                                <span className="watchlist__release-date">
                                  {new Date(
                                    movieData.release_date
                                  ).getFullYear()}
                                </span>
                              )}
                              {movieData.vote_average && (
                                <span className="watchlist__rating">
                                  <span className="watchlist__rating-stars">
                                    {Array.from({ length: 5 }, (_, index) => {
                                      const starValue =
                                        movieData.vote_average / 2;
                                      return (
                                        <span
                                          key={index}
                                          className={`watchlist__star ${
                                            index < Math.floor(starValue)
                                              ? "watchlist__star--filled"
                                              : index < starValue
                                              ? "watchlist__star--half"
                                              : "watchlist__star--empty"
                                          }`}
                                        >
                                          ⭐
                                        </span>
                                      );
                                    })}
                                  </span>
                                  <span className="watchlist__rating-number">
                                    {movieData.vote_average.toFixed(1)}
                                  </span>
                                </span>
                              )}
                            </div>
                          )}

                          {movieData?.overview && (
                            <p className="watchlist__overview">
                              {movieData.overview.length > 120
                                ? `${movieData.overview.substring(0, 120)}...`
                                : movieData.overview}
                            </p>
                          )}

                          {movieData?.addedAt && (
                            <small className="watchlist__added-date">
                              新增於:{" "}
                              {new Date(movieData.addedAt).toLocaleDateString()}
                            </small>
                          )}
                        </div>

                        {/* 操作按鈕 */}
                        <div className="watchlist__item-actions">
                          <button
                            onClick={() => handleRemoveMovie(movie)}
                            className="watchlist__remove-btn"
                            disabled={loading}
                            aria-label={`移除 ${movieTitle}`}
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Watchlist;
