import React, { useState } from "react";

function Explore() {
  const [imageLoaded, setImageLoaded] = useState(false);

  const exploreData = [
    {
      number: "10,000+",
      label: "電影資料庫",
    },
    {
      number: "24/7",
      label: "即時更新",
    },
    {
      number: "100%",
      label: "用戶滿意度",
    },
  ];

  return (
    <section id="explore" aria-label="探索數據統計">
      <div className="explore-content">
        <div className="explore-cards">
          {exploreData.map((item, index) => (
            <div key={index} className="explore-card">
              <div className="explore-number">{item.number}</div>
              <div className="explore-label">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="explore-robot">
          <img
            src={`${
              process.env.PUBLIC_URL || ""
            }/images/ai_robot_chair_png_optimized.png`}
            alt="AI 機器人客服助手"
            className={`robot-image ${imageLoaded ? "loaded" : ""}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

export default Explore;
