import React from "react";
import { CheckIcon } from "./Icons";

function About() {
  const features = [
    "全面的電影資料庫，包含超過10,000部電影",
    "即時更新的熱門電影和即將上映資訊",
    "多維度的電影搜尋功能，可按名稱、演員、導演或類型篩選",
    "個性化的電影推薦系統，根據您的喜好提供建議",
    "電影評分和評論功能，幫助您做出觀影決策",
  ];

  return (
    <section id="about">
      <h2>關於我們</h2>
      <div className="about-box">
        <div className="about-card">
          <h3>電影小幫手是什麼？</h3>
          <p>
            電影小幫手是您的個人觀影決策專家，我們整合了來自 TMDB API
            的豐富電影資料，為您提供全面且即時的電影資訊。
          </p>
          <p>
            無論您是在尋找最新上映的電影、查詢經典作品的詳細資料，還是想要根據自己的喜好獲得個性化的電影推薦，電影小幫手都能滿足您的需求。
          </p>
        </div>
        <div className="about-card">
          <h3>我們的功能</h3>
          <ul className="about-list">
            {features.map((feature, index) => (
              <li key={index}>
                <span className="li-icon">
                  <CheckIcon />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default About;
