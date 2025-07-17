// import MovieCard from "./MovieCard";
import React, { useState } from "react";
import TMDBMovieCard from "./TMDBMovieCard";
import MovieModal from "./MovieModal";

function MovieList({ movies = [], upcoming }) {
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 開啟電影詳情模態框
  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovieId(null);
  };

  return (
    <div id={upcoming ? "coming-soon-movies" : "popular-movies"}>
      {Array.isArray(movies) &&
        movies.map((movie, index) => (
          // <MovieCard
          //   key={movie.title || index}
          //   onClick={handleMovieClick}
          //   movie={movie}
          //   upcoming={upcoming}
          //   index={index}
          // />
          <TMDBMovieCard
            key={movie.id || index}
            onClick={handleMovieClick}
            movie={movie}
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
