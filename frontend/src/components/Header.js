import React, { useEffect, useRef, useState } from "react";
import { MovieIcon, HamburgerIcon } from "./Icons";
import { APP_CONFIG } from "../utils/constants";
import { handleLinkClick } from "../utils/scrollUtils";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(0);
  const headerRef = useRef(null);
  const appTitle = APP_CONFIG.REACT_APP_TITLE;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    // 滾動監聽器，自動更新活躍連結
    const handleScroll = () => {
      const sections = [
        "home",
        "popular",
        "coming-soon",
        "search",
        "watchlist",
        "chat",
        "about",
      ];
      const headerHeight = APP_CONFIG.HEADER_HEIGHT;
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
            <MovieIcon 
              width="36px"
              height="36px"
              className="logo-movie-icon"
            />
          </span>
          <span className="logo-text">{appTitle}</span>
        </div>
        <nav>
          <ul className={menuOpen ? "show" : ""}>
            <li>
              <a
                href="#home"
                className={activeLink === 0 ? "active" : ""}
                onClick={(e) =>
                  handleLinkClick(
                    0,
                    e,
                    "home",
                    setActiveLink,
                    setMenuOpen,
                    APP_CONFIG.HEADER_HEIGHT
                  )
                }
              >
                首頁
              </a>
            </li>
            <li>
              <a
                href="#popular"
                className={activeLink === 1 ? "active" : ""}
                onClick={(e) =>
                  handleLinkClick(
                    1,
                    e,
                    "popular",
                    setActiveLink,
                    setMenuOpen,
                    APP_CONFIG.HEADER_HEIGHT
                  )
                }
              >
                熱門電影
              </a>
            </li>
            <li>
              <a
                href="#coming-soon"
                className={activeLink === 2 ? "active" : ""}
                onClick={(e) =>
                  handleLinkClick(
                    2,
                    e,
                    "coming-soon",
                    setActiveLink,
                    setMenuOpen,
                    APP_CONFIG.HEADER_HEIGHT
                  )
                }
              >
                即將上映
              </a>
            </li>
            <li>
              <a
                href="#search"
                className={activeLink === 3 ? "active" : ""}
                onClick={(e) =>
                  handleLinkClick(
                    3,
                    e,
                    "search",
                    setActiveLink,
                    setMenuOpen,
                    APP_CONFIG.HEADER_HEIGHT
                  )
                }
              >
                電影搜尋
              </a>
            </li>
            <li>
              <a
                href="#watchlist"
                className={activeLink === 4 ? "active" : ""}
                onClick={(e) =>
                  handleLinkClick(
                    4,
                    e,
                    "watchlist",
                    setActiveLink,
                    setMenuOpen,
                    APP_CONFIG.HEADER_HEIGHT
                  )
                }
              >
                待看清單
              </a>
            </li>
            <li>
              <a
                href="#chat"
                className={activeLink === 5 ? "active" : ""}
                onClick={(e) =>
                  handleLinkClick(
                    5,
                    e,
                    "chat",
                    setActiveLink,
                    setMenuOpen,
                    APP_CONFIG.HEADER_HEIGHT
                  )
                }
              >
                聊天室
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={activeLink === 6 ? "active" : ""}
                onClick={(e) =>
                  handleLinkClick(
                    6,
                    e,
                    "about",
                    setActiveLink,
                    setMenuOpen,
                    APP_CONFIG.HEADER_HEIGHT
                  )
                }
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
          <HamburgerIcon isOpen={menuOpen} />
        </button>
      </div>
    </header>
  );
}

export default Header;
