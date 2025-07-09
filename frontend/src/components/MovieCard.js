import React from "react";
import { StarIcon } from "./Icons";

function MovieCard({ movie, upcoming, index }) {
  // 主題色與 icon 對應（用於熱門電影）
  const cardThemes = [
    { color: "yellow", icon: "🎬" },
    { color: "blue", icon: "🎥" },
    { color: "red", icon: "📽️" },
    { color: "green", icon: "🎞️" },
  ];

  if (upcoming) {
    // 即將上映電影卡片
    const expectScore = movie.expectScore || 4;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span className={`star${i > expectScore ? " gray" : ""}`} key={i}>
          <StarIcon
            className={`h-5 w-5 ${
              i > expectScore ? "text-slate-600" : "text-amber-500"
            }`}
            filled={i <= expectScore}
          />
        </span>
      );
    }

    return (
      <div className="movie upcoming">
        <span className="badge">即將上映</span>
        <h3>{movie.title}</h3>
        <div className="meta">
          上映日期: {movie.releaseDate || ""}
          <br />
          類型: {movie.genre || ""}
        </div>
        <p>{movie.description}</p>
        <div className="remind-row">
          <button>設定提醒</button>
          <span className="expect">
            期待度：<span className="stars">{stars}</span>
          </span>
        </div>
      </div>
    );
  } else {
    // 熱門電影卡片
    const theme = cardThemes[index % cardThemes.length];
    return (
      <div className={`movie ${theme.color}`}>
        <div className="icon">{theme.icon}</div>
        <span className="rating-badge">{movie.rating}</span>
        <h3>{movie.title}</h3>
        <p>
          {movie.year}｜{movie.genre}
        </p>
        <p>{movie.description}</p>
        <button>查看詳情</button>
      </div>
    );
  }
}

export default MovieCard;
