import React, { useEffect, useState, useRef } from "react";
import { GenreProvider } from "./contexts/GenreContext";
import { MovieAPI } from "./services/movieAPI";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SearchBox from "./components/SearchBox";
import MovieList from "./components/MovieList";
import About from "./components/About";
import Explore from "./components/Explore";
import FloatingAIBot from "./components/FloatingAIBot";
import Watchlist from "./components/Watchlist";
import ChatRoom from "./components/ChatRoom";
import "./scss/style.scss";

function App() {
  const [popular, setPopular] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const botRef = useRef();

  useEffect(() => {
    document.title = process.env.REACT_APP_TITLE || "電影小幫手";
    loadPopularMovies();
  }, []);

  const loadPopularMovies = async () => {
    try {
      const popularMovies = await MovieAPI.getPopularMovies();
      const upcomingMovies = await MovieAPI.getComingSoonMovies();

      setPopular((popularMovies || []).slice(0, 4));
      setComingSoon((upcomingMovies || []).slice(0, 3));
    } catch (error) {
    } finally {
    }
  };
  return (
    <GenreProvider>
      <div>
        <Header />

        <div id="home" className="hero">
          <h1>電影小幫手</h1>
          <p className="subtitle">您的個人觀影決策專家</p>
          <div className="hero-mobile-robot">
            <button
              className="hero-btn"
              onClick={() => {
                const target = document.getElementById("search");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              探索電影世界
            </button>
            <img
              src={`${
                process.env.PUBLIC_URL || ""
              }/images/ai_robot_chair_png_optimized.png`}
              alt="AI 機器人客服助手"
              className={`mobile-robot-image ${imageLoaded ? "loaded" : ""}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
            {imageError && (
              <div className="robot-fallback">
                <span className="robot-emoji">🤖</span>
              </div>
            )}
          </div>
        </div>

        <Explore />

        <section id="popular">
          <h2>熱門電影</h2>
          <MovieList movies={popular} />
        </section>

        <section id="coming-soon">
          <h2>即將上映</h2>
          <MovieList movies={comingSoon} upcoming />
        </section>

        <section id="search">
          <h2>電影搜尋</h2>
          <SearchBox />
        </section>

        <Watchlist botRef={botRef} />

        {/* 聊天室組件 */}
        <ChatRoom />

        <About />
        <Footer />
        <FloatingAIBot ref={botRef} />
      </div>
    </GenreProvider>
  );
}

export default App;
