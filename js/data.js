fetch('data/content.json')
  .then(res => res.json())
  .then(data => {
    const popularEl = document.getElementById('popular-movies');
    const comingEl = document.getElementById('coming-soon-movies');

    data.popular.forEach(movie => {
      popularEl.innerHTML += `
        <div class="movie">
          <h3>${movie.title} <span>${movie.rating}</span></h3>
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
