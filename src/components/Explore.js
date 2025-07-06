import React from "react";

function Explore() {
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
      <div className="explore-cards">
        {exploreData.map((item, index) => (
          <div key={index} className="explore-card">
            <div className="explore-number">{item.number}</div>
            <div className="explore-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Explore;
