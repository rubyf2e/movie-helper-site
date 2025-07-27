import MovieCard from "./MovieCard";
import React, { useState, useEffect } from "react";
import MovieModal from "./MovieModal";
import { MovieAPI } from "../services/movieAPI";

function MovieList({ movies = [], upcoming }) {
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videos, setVideos] = useState([]);

  // 開啟電影詳情模態框
  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovieId(null);
  };

  useEffect(() => {
    if (!upcoming && Array.isArray(movies) && movies.length > 0) {
      const loadVideos = async () => {
        try {
          const movieIdList = movies.map((movie) => movie.id).join(",");
          const videos = await MovieAPI.getMovieVideos(movieIdList);
          setVideos(videos);
        } catch (error) {
          console.error("載入類型失敗:", error);
        }
      };

      loadVideos();
    }
  }, [movies, upcoming]);

  return (
    <div id={upcoming ? "coming-soon-movies" : "popular-movies"}>
      {Array.isArray(movies) &&
        movies.map((movie, index) => (
          <MovieCard
            key={movie.title || index}
            onClick={handleMovieClick}
            movie={movie}
            video={videos[movie.id] ? videos[movie.id] : null}
            upcoming={upcoming}
            index={index}
          />
        ))}
      {/* 電影詳情模態框 */}
      <MovieModal
        movieId={selectedMovieId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default MovieList;
