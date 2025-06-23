fetch('data/content.json')
  .then(res => res.json())
  .then(data => {
    const popularEl = document.getElementById('popular-movies');
    const comingEl = document.getElementById('coming-soon-movies');

    // 主題色與 icon 對應
    const cardThemes = [
      { color: 'yellow', icon: '🎬' },
      { color: 'blue', icon: '🎥' },
      { color: 'red', icon: '📽️' },
      { color: 'green', icon: '🎞️' }
    ];

    data.popular.forEach((movie, idx) => {
      const theme = cardThemes[idx % cardThemes.length];
      popularEl.innerHTML += `
        <div class="movie ${theme.color}">
          <div class="icon">${theme.icon}</div>
          <span class="rating-badge">${movie.rating}</span>
          <h3>${movie.title}</h3>
          <p>${movie.year}｜${movie.genre}</p>
          <p>${movie.description}</p>
          <button>查看詳情</button>
        </div>
      `;
    });

    data.comingSoon.forEach(movie => {
      comingEl.innerHTML += `
        <div class="movie upcoming">
          <span class="badge">即將上映</span>
          <h3>${movie.title}</h3>
          <p>上映日期: ${movie.releaseDate}｜${movie.genre}</p>
          <p>${movie.description}</p>
          <div class="stars">★★★★★</div>
          <button>設定提醒</button>
        </div>
      `;
    });
  });