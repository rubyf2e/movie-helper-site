import React, { useState, useEffect } from "react";
import { MovieAPI } from "../services/movieAPI";

function GenreFilter({ onGenreChange, activeGenre }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genreList = await MovieAPI.fetchGenres();
        setGenres(genreList);
      } catch (error) {
        console.error("載入類型失敗:", error);
      }
    };

    loadGenres();
  }, []);

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
