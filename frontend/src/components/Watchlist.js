import React, { useState, useEffect } from "react";

const Watchlist = () => {
  const [movies, setMovies] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  const LOCAL_STORAGE_KEY = "movieWatchlist";

  // 載入電影清單
  useEffect(() => {
    try {
      const savedMovies = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedMovies) {
        setMovies(JSON.parse(savedMovies));
      }
    } catch (error) {
      console.error("載入電影清單失敗:", error);
      showMessage("載入資料失敗，已重置清單。", "error");
    }
  }, []);

  // 儲存電影清單
  const saveMovies = (movieList) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(movieList));
      setMovies(movieList);
    } catch (error) {
      console.error("儲存電影清單失敗:", error);
      showMessage("儲存失敗，請檢查瀏覽器設定。", "error");
    }
  };

  // 顯示提示訊息
  const showMessage = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", show: false });
    }, 2000);
  };

  // 新增電影
  const handleAddMovie = () => {
    const movieTitle = inputValue.trim();

    if (movieTitle) {
      if (!movies.includes(movieTitle)) {
        const updatedMovies = [...movies, movieTitle];
        saveMovies(updatedMovies);
        setInputValue("");
        showMessage("新增成功！", "success");
      } else {
        showMessage("電影已存在！", "warning");
      }
    } else {
      showMessage("請輸入電影名稱！", "error");
    }
  };

  // 移除電影
  const handleRemoveMovie = (movieToRemove) => {
    const updatedMovies = movies.filter((movie) => movie !== movieToRemove);
    saveMovies(updatedMovies);
    showMessage("移除成功！", "success");
  };

  // 處理 Enter 鍵
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddMovie();
    }
  };

  return (
    <section id="watchlist" className="watchlist">
      <div className="watchlist__container">
        <div className="watchlist__card">
          {/* 標題部分 */}
          <h1 className="watchlist__title">我的電影待看清單</h1>

          {/* 提示訊息區域 */}
          {notification.show && (
            <div
              className={`watchlist__notification watchlist__notification--${notification.type}`}
            >
              {notification.message}
            </div>
          )}

          {/* 新增電影表單 */}
          <div className="watchlist__form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入電影名稱..."
              className="watchlist__input"
            />
            <button onClick={handleAddMovie} className="watchlist__add-btn">
              新增電影
            </button>
          </div>

          {/* 電影列表區域 */}
          <div className="watchlist__list">
            {movies.length === 0 ? (
              <p className="watchlist__empty">目前沒有電影，請新增。</p>
            ) : (
              movies.map((movie, index) => (
                <div key={index} className="watchlist__item">
                  <span className="watchlist__movie-title">{movie}</span>
                  <button
                    onClick={() => handleRemoveMovie(movie)}
                    className="watchlist__remove-btn"
                  >
                    移除
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Watchlist;
