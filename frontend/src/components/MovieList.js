import React from "react";
import MovieCard from "./MovieCard";

function MovieList({ movies, upcoming }) {
  return (
    <div id={upcoming ? "coming-soon-movies" : "popular-movies"}>
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.title || index}
          movie={movie}
          upcoming={upcoming}
          index={index}
        />
      ))}
    </div>
  );
}

export default MovieList;
