import React, { createContext, useState, useEffect, useContext } from "react";
import { MovieAPI } from "../services/movieAPI";

const GenreContext = createContext([]);

export function GenreProvider({ children }) {
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

  return (
    <GenreContext.Provider value={genres}>{children}</GenreContext.Provider>
  );
}

export function useGenres() {
  return useContext(GenreContext);
}
