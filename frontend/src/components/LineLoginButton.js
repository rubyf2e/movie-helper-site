import React, { useState, useEffect } from "react";
import { lineAuthService } from "../services/globalServices";

const LineLoginButton = ({ onLoginSuccess, onLoginError, className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 頁面載入時，檢查 URL 參數並初始化登入狀態
    const init = async () => {
      const isAuthenticated = lineAuthService.isAuthenticated();
      console.log("isAuthenticated:", lineAuthService.isAuthenticated());
      if (isAuthenticated) {
        const userData = lineAuthService.getStoredProfile();
        setUser(userData);
      } else {
        const userData = await lineAuthService.initFromUrlParams();
        setUser(userData);
      }
    };
    init();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const isAuthenticated = lineAuthService.isAuthenticated();
      console.log("isAuthenticated:", isAuthenticated);
      if (!isAuthenticated) {
        const authUrl = lineAuthService.getAuthUrl();
        window.location.href = authUrl;
      } else {
        const userData = await lineAuthService.initFromUrlParams();
        setUser(userData);
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
      await lineAuthService.revokeToken();
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
        {/* <div className="line-user-info">
          <img
            src={user.pictureUrl}
            alt={user.displayName}
            className="line-user-avatar"
          />
          <div className="line-user-details">
            <span className="line-user-name">{user.displayName}</span>
            <span className="line-user-id">@{user.userId}</span>
          </div>
        </div> */}
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

export default LineLoginButton;
