import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SearchBox from "./components/SearchBox";
import MovieList from "./components/MovieList";
import About from "./components/About";
import Explore from "./components/Explore";
import "./css/style.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);

  useEffect(() => {
    // 使用環境變數設定頁面標題
    document.title = process.env.REACT_APP_TITLE || "電影小幫手";

    // 使用環境變數中的 API URL
    const apiUrl = process.env.REACT_APP_API_URL || "/data/content.json";
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.popular || []);
        setComingSoon(data.comingSoon || []);
      })
      .catch((error) => {
        console.error("Failed to load movie data:", error);
        setMovies([]);
        setComingSoon([]);
      });
  }, []);

  return (
    <div>
      <Header />

      <div id="home" className="hero">
        <h1>電影小幫手</h1>
        <p className="subtitle">您的個人觀影決策專家</p>
        <button className="hero-btn">探索電影世界</button>
      </div>

      <Explore />

      <section id="popular">
        <h2>熱門電影</h2>
        <MovieList movies={movies} />
      </section>

      <section id="coming-soon">
        <h2>即將上映</h2>
        <MovieList movies={comingSoon} upcoming />
      </section>

      <section id="search">
        <h2>電影搜尋</h2>
        <SearchBox />
      </section>

      <About />
      <Footer />
    </div>
  );
}

export default App;
