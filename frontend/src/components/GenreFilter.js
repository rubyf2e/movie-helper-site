import React from "react";
import { useGenres } from "../contexts/GenreContext";

function GenreFilter({ onGenreChange, activeGenre }) {
  const genres = useGenres();

  const handleGenreClick = (genreId, genreName) => {
    onGenreChange(genreId, genreName);
  };

  return (
    <div className="genre-filters">
      <button
        className={`genre-btn ${activeGenre === null ? "active" : ""}`}
        onClick={() => handleGenreClick(null, "全部熱門")}
      >
        全部熱門
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          className={`genre-btn ${activeGenre === genre.id ? "active" : ""}`}
          onClick={() => handleGenreClick(genre.id, genre.name)}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}

export default GenreFilter;
