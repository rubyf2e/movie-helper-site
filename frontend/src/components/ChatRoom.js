import React, { useState, useRef, useEffect } from "react";
import { MovieIcon } from "./Icons";
import { ChatAPI } from "../services/chatAPI";

const ChatRoom = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `嗨！我是您的AI 電影小幫手，我可以幫您：<div class="chat-content"><div class="chat-options">
                <button class="chat-option">🎬 推薦電影</button>
                <button class="chat-option">⭐ 分析電影評價</button> 
                <button class="chat-option">📅 查詢上映資訊</button>
                <button class="chat-option">💬 討論電影情節</button>
                <button class="chat-option">🎭 介紹演員導演</button> 
                </div></div>請選擇您想使用的 AI 模型，然後開始聊天吧！`,
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const aiModels = [
    {
      id: "gemini",
      name: "Gemini",
      description: "",
      icon: "✨",
    },
    {
      id: "azure",
      name: "Azure",
      description: "",
      icon: "🧠",
    },
    {
      id: "ollama",
      name: "Ollama",
      description: "",
      icon: "⚡",
    },
  ];

  // 自動滾動到最新消息
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector(".chat-room-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 組件載入後聚焦輸入框
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 500);
    }
  }, []);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
      // 防止頁面滾動
      e.stopPropagation();
    }
  };

  const getCurrentModel = () => {
    return aiModels.find((model) => model.id === selectedModel);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = newMessage.trim();
    setNewMessage("");

    // 延遲滾動，確保消息已更新
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    // 創建一個即時更新的 AI 訊息
    const aiMessageId = Date.now() + 1;
    const aiMessage = {
      id: aiMessageId,
      text: "",
      sender: "assistant",
      timestamp: new Date(),
      model: selectedModel,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      // 將前端模型 ID 轉換為後端格式
      const backendModel = ChatAPI.mapModelToBackend(selectedModel);

      // 調用流式 chat API
      await ChatAPI.sendMessageStream(
        currentMessage,
        backendModel,
        // onChunk - 每次收到新內容時調用
        (chunk, fullResponse) => {
          console.log("收到 chunk:", chunk, "完整回應:", fullResponse);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, text: fullResponse, isStreaming: true }
                : msg
            )
          );

          // 每次更新後滾動到底部
          setTimeout(scrollToBottom, 50);
        },
        // onComplete - 完成時調用
        (fullResponse) => {
          console.log("流式完成，最終回應:", fullResponse);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, text: fullResponse, isStreaming: false }
                : msg
            )
          );
          setTimeout(scrollToBottom, 50);
        },
        // onError - 錯誤時調用
        (error) => {
          console.error("流式處理錯誤:", error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    text: `抱歉，${
                      error.message || "系統發生錯誤，請稍後再試。"
                    }`,
                    isError: true,
                    isStreaming: false,
                  }
                : msg
            )
          );
        }
      );
    } catch (error) {
      console.error("發送訊息失敗:", error);

      // 錯誤處理：更新 AI 訊息為錯誤狀態
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: `抱歉，${error.message || "系統發生錯誤，請稍後再試。"}`,
                isError: true,
                isStreaming: false,
              }
            : msg
        )
      );
    }
  };

  return (
    <section id="chat" className="chat-room-section">
      <div className="chat-room-container">
        {/* 聊天室標題 */}
        <div className="chat-room-header">
          <div className="header-content">
            <div className="header-title">
              <h2>
                <span className="chat-logo-icon">
                  <MovieIcon />
                </span>
                AI 電影小幫手
              </h2>
              <p className="chat-room-subtitle">與 AI 討論電影，獲得專業見解</p>
            </div>
          </div>

          {/* 模型選擇器 */}
          <div className="model-selector">
            <button
              className="model-toggle"
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
            >
              <span className="model-icon">{getCurrentModel().icon}</span>
              <span className="model-name">{getCurrentModel().name}</span>
              <svg
                className={`dropdown-arrow ${isModelMenuOpen ? "open" : ""}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>

            {isModelMenuOpen && (
              <div className="model-menu">
                {aiModels.map((model) => (
                  <button
                    key={model.id}
                    className={`model-option ${
                      selectedModel === model.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsModelMenuOpen(false);
                    }}
                  >
                    <span className="model-icon">{model.icon}</span>
                    <div className="model-info">
                      <span className="model-name">{model.name}</span>
                      <span className="model-description">
                        {model.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 聊天區域 */}
        <div className="chat-room-content">
          {/* 消息列表 */}
          <div className="chat-room-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender}-message`}
              >
                <div className="message-content">
                  <div className="message-header">
                    {message.sender === "assistant" && (
                      <div className="ai-info">
                        <span className="ai-icon">
                          <MovieIcon />
                        </span>
                        <span className="ai-name">AI 電影小幫手</span>
                        {message.model && (
                          <span
                            className={`model-badge  ${
                              message.isStreaming ? "active" : ""
                            }`}
                          >
                            {message.model.toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                    {message.sender === "user" && (
                      <div className="user-info">
                        <span className="user-icon">👤</span>
                        <span className="user-name">您</span>
                      </div>
                    )}
                  </div>

                  {/* 如果是 AI 且 isStreaming 且 text 為空，顯示輸入中指示器 */}
                  {message.sender === "assistant" &&
                  message.isStreaming &&
                  !message.text ? (
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  ) : (
                    /* 否則顯示訊息內容 */
                    message.text && (
                      <div
                        className="message-text"
                        dangerouslySetInnerHTML={{ __html: message.text }}
                      />
                    )
                  )}

                  {message.isStreaming && message.text && (
                    <div className="streaming-indicator">
                      <span className="streaming-dot"></span>
                    </div>
                  )}
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* 輸入區域 */}
          <form className="chat-room-input" onSubmit={handleSendMessage}>
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`使用 ${getCurrentModel().name} 與 AI 討論電影...`}
                rows="1"
                className="message-input"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="send-button"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChatRoom;
