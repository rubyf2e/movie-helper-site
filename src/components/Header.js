import React, { useEffect, useRef, useState } from "react";
import { MovieIcon } from "./Icons";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(0);
  const headerRef = useRef(null);

  // 從環境變數獲取應用標題
  const appTitle = process.env.REACT_APP_TITLE || "電影小幫手";

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = (index, event, targetId) => {
    event.preventDefault(); // 防止頁面跳轉
    setActiveLink(index);
    setMenuOpen(false); // 點擊連結後關閉選單

    // 平滑滾動到目標區塊
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = 72; // header 的高度
      const targetPosition = targetElement.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // 滾動監聽器，自動更新活躍連結
    const handleScroll = () => {
      const sections = ["home", "popular", "coming-soon", "search", "about"];
      const headerHeight = 72;
      const scrollPosition = window.scrollY + headerHeight + 100; // 增加一些偏移量

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveLink(i);
          break;
        }
      }
    };

    // 添加滾動事件監聽器
    window.addEventListener("scroll", handleScroll);

    // 初始檢查
    handleScroll();

    // 清理函數
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header ref={headerRef}>
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">
            <MovieIcon />
          </span>
          <span className="logo-text">{appTitle}</span>
        </div>
        <nav>
          <ul className={menuOpen ? "show" : ""}>
            <li>
              <a
                href="#home"
                className={activeLink === 0 ? "active" : ""}
                onClick={(e) => handleLinkClick(0, e, "home")}
              >
                首頁
              </a>
            </li>
            <li>
              <a
                href="#popular"
                className={activeLink === 1 ? "active" : ""}
                onClick={(e) => handleLinkClick(1, e, "popular")}
              >
                熱門電影
              </a>
            </li>
            <li>
              <a
                href="#coming-soon"
                className={activeLink === 2 ? "active" : ""}
                onClick={(e) => handleLinkClick(2, e, "coming-soon")}
              >
                即將上映
              </a>
            </li>
            <li>
              <a
                href="#search"
                className={activeLink === 3 ? "active" : ""}
                onClick={(e) => handleLinkClick(3, e, "search")}
              >
                電影搜尋
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={activeLink === 4 ? "active" : ""}
                onClick={(e) => handleLinkClick(4, e, "about")}
              >
                關於我們
              </a>
            </li>
          </ul>
        </nav>
        <button
          className="menu-toggle"
          aria-label="開啟選單"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
