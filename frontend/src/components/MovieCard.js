import React, { useState } from "react";
import MovieGenres from "./MovieGenres";
import { StarIcon } from "./Icons";
import { MovieAPI } from "../services/movieAPI";
import { lineAuthService } from "../services/globalServices";

function MovieCard({ movie, video, onClick, upcoming, index }) {
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const { title, poster_path, id } = movie;

  // 處理設定提醒
  const handleSetReminder = async (e) => {
    e.stopPropagation(); // 防止觸發電影卡片點擊

    if (!lineAuthService.isAuthenticated()) {
      alert("請先登入 LINE 帳號以設定提醒");
      return;
    }

    setIsSettingReminder(true);

    try {
      // 計算提醒日期（上映前一天）
      const releaseDate = new Date(movie.release_date);
      const reminderDate = new Date(releaseDate);
      reminderDate.setDate(reminderDate.getDate() - 1);

      const result = await lineAuthService.sendMovieReminderToLine(
        movie,
        reminderDate.toISOString()
      );

      if (result.success) {
        setReminderSet(true);
        alert(`已設定「${movie.title}」的上映提醒！`);
      } else {
        alert(`提醒設定失敗：${result.message}`);
      }
    } catch (error) {
      console.error("設定提醒失敗:", error);
      alert("設定提醒失敗，請稍後再試");
    } finally {
      setIsSettingReminder(false);
    }
  };
  // 主題色與 icon 對應（用於熱門電影）
  const cardThemes = [
    { color: "yellow", icon: "" },
    { color: "blue", icon: "" },
    { color: "red", icon: "" },
    { color: "green", icon: "" },
  ];

  if (upcoming) {
    const expectScore =
      typeof movie.vote_average === "number" ? movie.vote_average / 2 : 0;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let starType = "empty";
      if (i <= Math.floor(expectScore)) {
        starType = "full";
      } else if (expectScore > i - 1 && expectScore < i) {
        starType = "half";
      }

      stars.push(
        <span className={`star ${starType}`} key={i}>
          <StarIcon type={starType} className={`h-5 w-5 ${starType}`} />
        </span>
      );
    }

    return (
      <div className="movie upcoming">
        <span className="badge">即將上映</span>
        <div className="tmdb-movie-card" onClick={() => onClick(id)}>
          <img
            src={MovieAPI.getImageURL(poster_path)}
            alt={title}
            loading="lazy"
          />
        </div>

        <div className="tmdb-movie-card-info-box">
          <div className="tmdb-movie-card-info">
            <h3>{movie.title}</h3>
            <div className="meta">
              上映日期: {movie.release_date || ""}
              <br />
              <div className="movie-genres-box">
                <div className="title">類型: </div>
                <MovieGenres genres={movie.genre_ids || []} type="render" />
              </div>
            </div>
            <p>{movie.overview}</p>
          </div>
        </div>

        <div className="tmdb-movie-card-button">
          <div className="remind-row">
            <button
              onClick={handleSetReminder}
              disabled={isSettingReminder || reminderSet}
              className={reminderSet ? "reminder-set" : ""}
            >
              {isSettingReminder
                ? "設定中..."
                : reminderSet
                ? "✓ 已設提醒"
                : "設定提醒"}
            </button>
            <span className="expect">
              期待度：<span className="stars">{stars}</span>
            </span>
          </div>
        </div>
      </div>
    );
  } else {
    // 熱門電影卡片
    const theme = cardThemes[index % cardThemes.length];

    return (
      <div className={`movie ${theme.color}`}>
        <div className="tmdb-movie-card">
          <span className="rating-badge">
            <span className="stars">
              <span className="rating">
                {typeof movie.vote_average === "number"
                  ? movie.vote_average.toFixed(1)
                  : ""}
              </span>
              <span className="star full">
                <StarIcon type="full" className={`h-5 w-5 full`} />
              </span>
            </span>
          </span>
          {video ? (
            <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden shadow-xl mb-6">
              <iframe
                src={video}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          ) : (
            <img
              src={MovieAPI.getImageURL(poster_path)}
              alt={title}
              loading="lazy"
            />
          )}
        </div>
        <div className="tmdb-movie-card-info-box">
          <div className="tmdb-movie-card-info">
            <h3>{movie.title}</h3>
            <div>
              <p>
                {movie.release_date ? movie.release_date.slice(0, 4) : ""}｜
                <MovieGenres genres={movie.genre_ids || []} type="render" />
              </p>
            </div>
            <p>{movie.overview}</p>
          </div>
        </div>
        <div className="tmdb-movie-card-button">
          <button onClick={() => onClick(id)}>查看詳情</button>
        </div>
      </div>
    );
  }
}

export default MovieCard;
