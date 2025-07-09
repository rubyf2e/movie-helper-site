import React, { useState, useEffect } from "react";
import { MovieAPI } from "../services/movieAPI";

function MovieModal({ movieId, isOpen, onClose }) {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMovieDetails = async () => {
      setLoading(true);
      try {
        const data = await MovieAPI.getMovieDetails(movieId);
        setMovieData(data);
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="movie-modal">
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
              <div className="movie-genres">
                {movieData.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
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
    </div>
  );
}

export default MovieModal;
