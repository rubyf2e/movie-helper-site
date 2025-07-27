import React, { useMemo } from "react";
import { useGenres } from "../contexts/GenreContext";

function MovieGenres({ genres, type }) {
  const genresAPIData = useGenres();

  const genreMap = useMemo(() => {
    const map = new Map();
    genresAPIData.forEach((g) => map.set(g.id, g.name));
    return map;
  }, [genresAPIData]);

  let genreList = [];
  if (!genres || genres.length === 0) {
    genreList = [];
  } else if (typeof genres[0] === "object" && genres[0].id) {
    genreList = genres.map((g) => ({
      id: g.id,
      name: g.name || genreMap.get(g.id) || "未知類型",
    }));
  } else {
    genreList = genres.map((id) => ({
      id,
      name: genreMap.get(id) || "未知類型",
    }));
  }

  if (genreList.length === 0) {
    return type === "render" ? <span>無類型</span> : null;
  }

  const Wrapper = type === "map" ? "div" : "span";

  return (
    <Wrapper className="movie-genres">
      {genreList.map((genre) => (
        <span key={genre.id} className="genre-tag">
          {genre.name}
        </span>
      ))}
    </Wrapper>
  );
}

export default MovieGenres;
