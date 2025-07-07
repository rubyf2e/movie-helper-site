import React from "react";
import { MovieIcon } from "./Icons";

function Footer() {
  // 從環境變數獲取應用標題
  const appTitle = process.env.REACT_APP_TITLE || "電影小幫手";

  return (
    <footer>
      <div className="logo">
        <span className="logo-icon">
          <MovieIcon />
        </span>
        <span className="logo-text">{appTitle}</span>
      </div>

      <div className="footer-right">
        <small>© 2024 {appTitle}</small>
      </div>
    </footer>
  );
}

export default Footer;
