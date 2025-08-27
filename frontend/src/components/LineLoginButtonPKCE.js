import React, { useState, useEffect } from "react";
import LineAuthService from "../services/lineAuthServicePKCE";

const lineAuthService = new LineAuthService();

const LineLoginButtonPKCE = ({
  onLoginSuccess,
  onLoginError,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  useEffect(() => {
    if (isInitialized) return; // 防止重複初始化

    // 檢查 URL 中是否有 LINE 回調參數
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    // 如果有回調參數，設置處理狀態
    if (code && state) {
      setIsProcessingCallback(true);
    }

    // 頁面載入時，檢查 URL 參數並初始化登入狀態
    const init = async () => {
      try {
        const isAuthenticated = lineAuthService.isAuthenticated();
        console.log("isAuthenticated:", isAuthenticated);

        if (isAuthenticated) {
          const userData = lineAuthService.getStoredUser();
          setUser(userData);
          console.log("Already authenticated user:", userData);
        } else {
          // 檢查是否從 LINE 回調
          const userData = await lineAuthService.initFromUrlParams();
          if (userData && userData.success) {
            setUser(userData.data || userData.message);

            // 如果是回調處理，顯示成功訊息然後重新整理
            if (code && state) {
              // 暫時顯示成功狀態
              setIsProcessingCallback("success");

              setTimeout(() => {
                if (onLoginSuccess) {
                  onLoginSuccess(userData.data || userData.message);
                }
                // 重新整理頁面以清除 URL 參數並顯示正常狀態
                window.location.href = window.location.pathname;
              }, 2000); // 2秒後重新整理
            } else {
              if (onLoginSuccess) {
                onLoginSuccess(userData.data || userData.message);
              }
            }
          } else if (userData && !userData.success) {
            console.error("Login failed:", userData.message);
            if (onLoginError) {
              onLoginError(userData.message);
            }
            setIsProcessingCallback(false); // 重置處理狀態
          }
        }
      } catch (error) {
        console.error("Init error:", error);
        if (onLoginError) {
          onLoginError(error.message);
        }
        setIsProcessingCallback(false); // 重置處理狀態
      } finally {
        setIsInitialized(true); // 標記初始化完成
      }
    };
    init();
  }, [onLoginSuccess, onLoginError, isInitialized]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const isAuthenticated = lineAuthService.isAuthenticated();
      console.log("isAuthenticated:", isAuthenticated);

      if (!isAuthenticated) {
        console.log("Starting PKCE login flow...");
        await lineAuthService.login();
      } else {
        const userData = lineAuthService.getStoredUser();
        setUser(userData);
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
      }
    } catch (error) {
      console.error("登入失敗:", error);
      setIsLoading(false);
      if (onLoginError) {
        onLoginError(error);
      }
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await lineAuthService.logout();
      setUser(null);
      if (onLoginSuccess) {
        onLoginSuccess(null);
      }
    } catch (error) {
      console.error("登出失敗:", error);
      if (onLoginError) {
        onLoginError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className={`line-login-status ${className}`}>
        <div className="line-user-info">
          <img
            src={user.pictureUrl}
            alt={user.displayName}
            className="line-user-avatar"
          />
          <div className="line-user-details">
            <span className="line-user-name">{user.displayName}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="line-logout-btn"
        >
          {isLoading ? "登出中..." : "登出"}
        </button>
      </div>
    );
  }

  // 如果正在處理回調，顯示 loading 或成功畫面
  if (isProcessingCallback) {
    return (
      <div className={`line-callback-container ${className}`}>
        <div className="line-callback-card">
          <div className="line-callback-header">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="line-logo"
              style={{
                background: "linear-gradient(135deg, #06c755 0%, #00b900 100%)",
                borderRadius: "50%",
                padding: "15px",
                fill: "white",
              }}
            >
              <path
                d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771z"
                fill="currentColor"
              />
              <path
                d="M12.233 20.055c-.061.042-.123.084-.185.125-.185.125-.369.186-.555.186-.061 0-.123-.021-.184-.021C5.57 19.681 1.115 15.092 1.115 9.863c0-5.229 4.455-9.863 9.933-9.863s9.933 4.634 9.933 9.863c0 5.229-4.455 9.863-9.933 9.863-.061 0-.123 0-.184.021-.185 0-.369-.061-.555-.186-.061-.041-.123-.083-.185-.125l-5.696-3.863L12.233 20.055z"
                fill="currentColor"
              />
            </svg>
            <h2>
              {isProcessingCallback === "success"
                ? "登入成功！"
                : "LINE 登入處理中"}
            </h2>
          </div>
          <div className="line-callback-content">
            {isProcessingCallback === "success" ? (
              <div className="line-callback-success">
                <div className="success-icon">✓</div>
                <p>歡迎回來！正在為您跳轉...</p>
              </div>
            ) : (
              <div className="line-callback-loading">
                <div className="spinner"></div>
                <p>正在驗證您的身份並獲取用戶資料...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`line-login-btn ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="line-icon"
      >
        <path
          d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771z"
          fill="currentColor"
        />
        <path
          d="M12.233 20.055c-.061.042-.123.084-.185.125-.185.125-.369.186-.555.186-.061 0-.123-.021-.184-.021C5.57 19.681 1.115 15.092 1.115 9.863c0-5.229 4.455-9.863 9.933-9.863s9.933 4.634 9.933 9.863c0 5.229-4.455 9.863-9.933 9.863-.061 0-.123 0-.184.021-.185 0-.369-.061-.555-.186-.061-.041-.123-.083-.185-.125l-5.696-3.863L12.233 20.055z"
          fill="currentColor"
        />
      </svg>
      {isLoading ? "登入中..." : "使用 LINE 登入"}
    </button>
  );
};

export default LineLoginButtonPKCE;
