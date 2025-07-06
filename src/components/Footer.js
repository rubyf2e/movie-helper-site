import React from "react";
import { MovieIcon } from "./Icons";

function Footer() {
  return (
    <footer>
      <div className="logo">
        <span className="logo-icon">
          <MovieIcon />
        </span>
        <span className="logo-text">電影小幫手</span>
      </div>

      <div className="footer-right">
        <small>© 2024 電影小幫手</small>
      </div>
    </footer>
  );
}

export default Footer;
