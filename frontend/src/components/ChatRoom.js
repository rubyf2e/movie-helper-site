import React, { useState, useRef, useEffect } from "react";
import { MovieIcon } from "./Icons";

const ChatRoom = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "嗨！我是您的AI 電影小幫手，我可以幫您：\n\n🎬 推薦電影\n⭐ 分析電影評價\n📅 查詢上映資訊\n💭 討論電影情節\n🎭 介紹演員導演\n\n請選擇您想使用的 AI 模型，然後開始聊天吧！",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const aiModels = [
    {
      id: "gpt-4",
      name: "GPT-4",
      description: "最強大的模型，適合深度電影分析",
      icon: "🧠"
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      description: "快速回應，適合一般電影討論",
      icon: "⚡"
    },
    {
      id: "claude-3",
      name: "Claude 3",
      description: "創意豐富，適合電影評論",
      icon: "🎨"
    }
  ];

  // 自動滾動到最新消息
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.chat-room-messages');
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
    setNewMessage("");
    setIsTyping(true);
    
    // 延遲滾動，確保消息已更新
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    // 模擬 AI 回覆（實際應用中這裡會調用 ChatGPT API）
    setTimeout(() => {
      const aiReplies = [
        `我使用 ${selectedModel.toUpperCase()} 模型來回答您的問題。這部電影確實很精彩！您想了解更多關於劇情、演員還是導演的信息嗎？`,
        `根據 ${selectedModel.toUpperCase()} 的分析，這部電影在技術層面表現出色。您對哪個方面特別感興趣？`,
        `作為您的AI 電影小幫手，我推薦您也可以看看同類型的其他作品。需要我為您推薦一些嗎？`,
        `這個問題很有趣！讓我用 ${selectedModel.toUpperCase()} 的視角來分析一下這個電影情節。`,
        `我理解您對這部電影的感受。從 ${selectedModel.toUpperCase()} 的角度來看，這個觀點很有見地。`,
        `這部電影的配樂確實很棒！您想了解更多關於電影音樂的信息嗎？`,
        `根據 ${selectedModel.toUpperCase()} 的資料庫，這個演員的其他作品也很值得一看。`,
        `這個導演的作品風格很獨特。您想了解他的其他電影嗎？`,
        `從 ${selectedModel.toUpperCase()} 的角度分析，這個結局確實很有深意。`,
        `我推薦您也可以看看這個類型的其他經典作品。需要我列出一些嗎？`
      ];
      
      const randomReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];
      
      const aiMessage = {
        id: Date.now() + 1,
        text: randomReply,
        sender: "assistant",
        timestamp: new Date(),
        model: selectedModel
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

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
    return aiModels.find(model => model.id === selectedModel);
  };

  return (
    <section id="chat" className="chat-room-section">
      <div className="chat-room-container">
        {/* 聊天室標題 */}
        <div className="chat-room-header">
          <div className="header-content">
            <h2>
              <span className="chat-logo-icon">
                <MovieIcon />
              </span>
              AI 電影小幫手
            </h2>
            <p className="chat-room-subtitle">與 AI 討論電影，獲得專業見解</p>
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
                className={`dropdown-arrow ${isModelMenuOpen ? 'open' : ''}`}
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
                    className={`model-option ${selectedModel === model.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsModelMenuOpen(false);
                    }}
                  >
                    <span className="model-icon">{model.icon}</span>
                    <div className="model-info">
                      <span className="model-name">{model.name}</span>
                      <span className="model-description">{model.description}</span>
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
                        <span className="ai-icon"><MovieIcon /></span>
                        <span className="ai-name">AI 電影小幫手</span>
                        {message.model && (
                          <span className="model-badge">{message.model.toUpperCase()}</span>
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
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* 輸入中指示器 */}
            {isTyping && (
              <div className="chat-message assistant-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="ai-info">
                      <span className="ai-icon"><MovieIcon /></span>
                      <span className="ai-name">AI 電影小幫手</span>
                      <span className="model-badge">{selectedModel.toUpperCase()}</span>
                    </div>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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