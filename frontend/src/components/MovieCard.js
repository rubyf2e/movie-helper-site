import React from "react";
import { StarIcon } from "./Icons";
import { MovieAPI } from "../services/movieAPI";

function MovieCard({ movie, video, onClick, upcoming, index }) {
  const { title, poster_path, id } = movie;
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
              類型: {movie.genre_ids || ""}
            </div>
            <p>{movie.overview}</p>
          </div>
        </div>

        <div className="tmdb-movie-card-button">
          <div className="remind-row">
            <button>設定提醒</button>
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
            {typeof movie.vote_average === "number"
              ? movie.vote_average.toFixed(1)
              : "N/A"}
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
            <p>
              {movie.release_date ? movie.release_date.slice(0, 4) : ""}｜
              {movie.genre_ids || ""}
            </p>
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
