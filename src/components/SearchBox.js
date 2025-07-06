import React, { useState } from "react";
import MovieTags from "./MovieTags";
import { SearchIcon } from "./Icons";

const TAGS = ["動作", "喜劇", "科幻", "恐怖"];

function SearchBox() {
  const [activeTag, setActiveTag] = useState(1);

  return (
    <div className="search-box">
      <div className="search-input-wrap">
        <span className="search-icon">
          <SearchIcon className="h-5 w-5" />
        </span>
        <input type="text" placeholder="輸入電影名稱、演員或導演..." />
      </div>
      <div className="tags" id="search-tags">
        <MovieTags tags={TAGS} active={activeTag} setActive={setActiveTag} />
      </div>
      <button className="search-btn">搜尋電影</button>
    </div>
  );
}

export default SearchBox;
