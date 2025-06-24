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
      // 星星評分（預設4顆黃1顆灰，可根據資料調整）
      let stars = '';
      const score = movie.expectScore || 4; // 若資料有 expectScore 屬性
      for (let i = 1; i <= 5; i++) {
        stars += `<span class="star${i > score ? ' gray' : ''}">★</span>`;
      }

      comingEl.innerHTML += `
        <div class="movie upcoming">
          <span class="badge">即將上映</span>
          <h3>${movie.title}</h3>
          <div class="meta">
            上映日期: ${movie.releaseDate || ''}<br>
            類型: ${movie.genre || ''}
          </div>
          <p>${movie.description}</p>
          <div class="remind-row">
            <button>設定提醒</button>
            <span class="expect">期待度：<span class="stars">${stars}</span></span>
          </div>
        </div>
      `;
    });
  });