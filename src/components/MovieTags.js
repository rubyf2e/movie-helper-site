import React from "react";

function MovieTags({ tags, active, setActive }) {
  return (
    <>
      {tags.map((tag, idx) => (
        <span
          key={tag}
          className={active === idx ? "active" : ""}
          onClick={() => setActive(idx)}
          data-idx={idx}
        >
          {tag}
        </span>
      ))}
    </>
  );
}

export default MovieTags;
