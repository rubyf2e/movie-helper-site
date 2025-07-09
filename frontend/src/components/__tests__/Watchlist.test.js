import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Watchlist from "../Watchlist";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe("Watchlist Component", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("renders watchlist component correctly", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<Watchlist />);

    expect(screen.getByText("我的電影待看清單")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("輸入電影名稱...")).toBeInTheDocument();
    expect(screen.getByText("新增電影")).toBeInTheDocument();
    expect(screen.getByText("目前沒有電影，請新增。")).toBeInTheDocument();
  });

  test("loads movies from localStorage on mount", () => {
    const savedMovies = ["電影A", "電影B"];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedMovies));

    render(<Watchlist />);

    expect(screen.getByText("電影A")).toBeInTheDocument();
    expect(screen.getByText("電影B")).toBeInTheDocument();
  });

  test("adds a new movie successfully", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<Watchlist />);

    const input = screen.getByPlaceholderText("輸入電影名稱...");
    const addButton = screen.getByText("新增電影");

    fireEvent.change(input, { target: { value: "新電影" } });
    fireEvent.click(addButton);

    expect(screen.getByText("新電影")).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "movieWatchlist",
      JSON.stringify(["新電影"])
    );
  });

  test("prevents adding duplicate movies", async () => {
    const existingMovies = ["電影A"];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingMovies));
    render(<Watchlist />);

    const input = screen.getByPlaceholderText("輸入電影名稱...");
    const addButton = screen.getByText("新增電影");

    fireEvent.change(input, { target: { value: "電影A" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("電影已存在！")).toBeInTheDocument();
    });
  });

  test("removes a movie successfully", async () => {
    const existingMovies = ["電影A", "電影B"];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingMovies));
    render(<Watchlist />);

    const removeButtons = screen.getAllByText("移除");
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText("電影A")).not.toBeInTheDocument();
    expect(screen.getByText("電影B")).toBeInTheDocument();
  });

  test("handles Enter key press to add movie", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<Watchlist />);

    const input = screen.getByPlaceholderText("輸入電影名稱...");

    fireEvent.change(input, { target: { value: "新電影" } });
    fireEvent.keyPress(input, { key: "Enter" });

    expect(screen.getByText("新電影")).toBeInTheDocument();
  });

  test("shows error message for empty input", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<Watchlist />);

    const addButton = screen.getByText("新增電影");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("請輸入電影名稱！")).toBeInTheDocument();
    });
  });

  test("handles localStorage errors gracefully", () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("localStorage error");
    });

    render(<Watchlist />);

    expect(screen.getByText("我的電影待看清單")).toBeInTheDocument();
    expect(screen.getByText("目前沒有電影，請新增。")).toBeInTheDocument();
  });
});
