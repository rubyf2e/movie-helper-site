import React, { useState, useEffect, useRef } from "react";

const FloatingAIBot = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const lottieRef = useRef(null);

  // 載入 Lottie 動畫檔案
  useEffect(() => {
    const loadLottiePlayer = async () => {
      try {
        // 動態載入 lottie-player
        await import("@lottiefiles/lottie-player");
        setLottieLoaded(true);
      } catch (error) {
        console.log("Lottie Player 載入失敗，使用備用顯示方案");
      }
    };

    loadLottiePlayer();
  }, []);

  // 頁面滾動時顯示客服
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleChatClick = () => {
    // 這裡可以添加實際的客服聊天功能
    alert(
      "AI 客服功能開發中，敬請期待！\n\n您可以通過以下方式聯繫我們：\n- Email: contact@example.com\n- GitHub: https://github.com/rubyf2e/movie-helper-site"
    );
  };

  if (!isVisible) return null;

  return (
    <div className={`floating-ai-bot ${isExpanded ? "expanded" : ""}`}>
      <div className="ai-bot-container">
        {/* 主要客服按鈕 */}
        <div className="ai-bot-button" onClick={toggleExpanded}>
          {lottieLoaded ? (
            <lottie-player
              ref={lottieRef}
              src={`${process.env.PUBLIC_URL || ""}/images/AI_bot.json`}
              background="transparent"
              speed="1"
              style={{ width: "200px", height: "200px" }}
              loop
              autoplay
            />
          ) : (
            <div className="ai-bot-fallback">
              <div className="ai-bot-icon">🤖</div>
            </div>
          )}
        </div>
      </div>
      <div className="ai-bot-chat-container">
        {/* 擴展的聊天介面 */}
        {isExpanded && (
          <div className="ai-bot-chat">
            <div className="chat-header">
              <h4>AI 電影小幫手</h4>
              <button className="close-btn" onClick={toggleExpanded}>
                ×
              </button>
            </div>
            <div className="chat-content">
              <div className="chat-message bot-message">
                <p>👋 嗨！我是電影小幫手 AI，有什麼可以幫助您的嗎？</p>
              </div>
              <div className="chat-options">
                <button className="chat-option" onClick={handleChatClick}>
                  🎬 推薦電影
                </button>
                <button className="chat-option" onClick={handleChatClick}>
                  ⭐ 評分查詢
                </button>
                <button className="chat-option" onClick={handleChatClick}>
                  📅 上映時間
                </button>
                <button className="chat-option" onClick={handleChatClick}>
                  💬 其他問題
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingAIBot;
