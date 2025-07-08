import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TMDBMovieCard from "../TMDBMovieCard";

// Mock the MovieAPI
jest.mock("../../services/movieAPI", () => ({
  MovieAPI: {
    getImageURL: jest.fn((path) =>
      path ? `https://image.tmdb.org/t/p/w500${path}` : "fallback.jpg"
    ),
    getRatingColor: jest.fn(() => "text-green-400"),
  },
}));

const mockMovie = {
  id: 1,
  title: "Test Movie",
  poster_path: "/test.jpg",
  vote_average: 8.5,
};

const mockOnClick = jest.fn();

describe("TMDBMovieCard", () => {
  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test("renders movie card with correct information", () => {
    render(<TMDBMovieCard movie={mockMovie} onClick={mockOnClick} />);

    // 檢查電影標題
    expect(screen.getByText("Test Movie")).toBeInTheDocument();

    // 檢查評分
    expect(screen.getByText("8.5 ⭐")).toBeInTheDocument();

    // 檢查圖片
    const image = screen.getByAltText("Test Movie");
    expect(image).toBeInTheDocument();
  });

  test("handles missing poster path", () => {
    const movieWithoutPoster = { ...mockMovie, poster_path: null };
    render(<TMDBMovieCard movie={movieWithoutPoster} onClick={mockOnClick} />);

    const image = screen.getByAltText("Test Movie");
    expect(image).toBeInTheDocument();
  });
});
