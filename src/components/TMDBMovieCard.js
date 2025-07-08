import React from "react";
import { MovieAPI } from "../services/movieAPI";

function TMDBMovieCard({ movie, onClick }) {
  const { title, poster_path, vote_average, id } = movie;

  return (
    <div className="tmdb-movie-card" onClick={() => onClick(id)}>
      <img src={MovieAPI.getImageURL(poster_path)} alt={title} loading="lazy" />
      <div className="movie-info">
        <h3>{title}</h3>
        <span className={`rating ${MovieAPI.getRatingColor(vote_average)}`}>
          {vote_average.toFixed(1)} ⭐
        </span>
      </div>
    </div>
  );
}

export default TMDBMovieCard;
