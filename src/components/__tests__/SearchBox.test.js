import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBox from "../SearchBox";
import { MovieAPI } from "../../services/movieAPI";

// Mock the entire MovieAPI module
jest.mock("../../services/movieAPI");

const mockMovies = [
  {
    id: 1,
    title: "測試電影 1",
    poster_path: "/test1.jpg",
    vote_average: 8.5,
    release_date: "2023-01-01",
  },
  {
    id: 2,
    title: "測試電影 2",
    poster_path: "/test2.jpg",
    vote_average: 7.2,
    release_date: "2023-02-01",
  },
];

const mockGenres = [
  { id: 28, name: "動作" },
  { id: 35, name: "喜劇" },
  { id: 878, name: "科幻" },
  { id: 27, name: "恐怖" },
];

describe("SearchBox Component", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up mock implementations
    MovieAPI.getPopularMovies = jest.fn().mockResolvedValue(mockMovies);
    MovieAPI.fetchGenres = jest.fn().mockResolvedValue(mockGenres);
    MovieAPI.searchMovies = jest.fn().mockResolvedValue(mockMovies);
    MovieAPI.getMoviesByGenre = jest.fn().mockResolvedValue(mockMovies);
    MovieAPI.getImageURL = jest.fn(
      (path) => `https://image.tmdb.org/t/p/w500${path}`
    );
    MovieAPI.getRatingColor = jest.fn((vote) => {
      if (vote >= 8) return "text-green-400 font-bold";
      if (vote >= 6) return "text-yellow-400";
      return "text-red-400";
    });
  });

  test("renders search input and button", () => {
    render(<SearchBox />);

    // Check search input
    expect(
      screen.getByPlaceholderText("輸入電影名稱、演員或導演...")
    ).toBeInTheDocument();

    // Check search button
    expect(screen.getByText("搜尋電影")).toBeInTheDocument();

    // Check search icon
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("renders genre filter buttons when genres are loaded", async () => {
    render(<SearchBox />);

    await waitFor(() => {
      expect(screen.getByText("全部熱門")).toBeInTheDocument();
    });

    // Wait for genres to load and be displayed
    await waitFor(() => {
      expect(MovieAPI.fetchGenres).toHaveBeenCalled();
    });

    // Should display genre buttons
    await waitFor(() => {
      expect(screen.getByText("動作")).toBeInTheDocument();
    });

    expect(screen.getByText("喜劇")).toBeInTheDocument();
    expect(screen.getByText("科幻")).toBeInTheDocument();
    expect(screen.getByText("恐怖")).toBeInTheDocument();
  });

  test("loads popular movies on mount", async () => {
    render(<SearchBox />);

    await waitFor(() => {
      expect(MovieAPI.getPopularMovies).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(MovieAPI.fetchGenres).toHaveBeenCalledTimes(1);
    });

    // Should display movie grid title
    expect(screen.getByText("熱門電影")).toBeInTheDocument();
  });

  test("allows typing in search input", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const searchInput =
      screen.getByPlaceholderText("輸入電影名稱、演員或導演...");

    await user.type(searchInput, "鋼鐵人");
    expect(searchInput).toHaveValue("鋼鐵人");
  });

  test("performs search when search button is clicked", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const searchInput =
      screen.getByPlaceholderText("輸入電影名稱、演員或導演...");
    const searchButton = screen.getByText("搜尋電影");

    await user.type(searchInput, "鋼鐵人");
    await user.click(searchButton);

    await waitFor(() => {
      expect(MovieAPI.searchMovies).toHaveBeenCalledWith("鋼鐵人");
    });
  });

  test("allows clicking genre filter buttons to filter movies", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    // Wait for initial load
    await waitFor(() => {
      expect(MovieAPI.getPopularMovies).toHaveBeenCalled();
    });

    // Wait for genres to load
    await waitFor(() => {
      expect(screen.getByText("動作")).toBeInTheDocument();
    });

    const actionButton = screen.getByText("動作");
    await user.click(actionButton);

    await waitFor(() => {
      expect(MovieAPI.getMoviesByGenre).toHaveBeenCalledWith(28);
    });
  });

  test("shows loading indicator during API calls", async () => {
    // Make API call take longer
    MovieAPI.getPopularMovies.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockMovies), 100))
    );

    render(<SearchBox />);

    // Should show loading indicator
    expect(screen.getByText("載入中...")).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("載入中...")).not.toBeInTheDocument();
    });
  });

  test("handles API errors gracefully", async () => {
    MovieAPI.getPopularMovies.mockRejectedValue(new Error("API Error"));

    render(<SearchBox />);

    await waitFor(() => {
      expect(
        screen.getByText("找不到相關電影，請嘗試其他關鍵字或類型。")
      ).toBeInTheDocument();
    });
  });

  test("has default active genre filter (全部熱門)", async () => {
    render(<SearchBox />);

    // Should show "全部熱門" button
    await waitFor(() => {
      expect(screen.getByText("全部熱門")).toBeInTheDocument();
    });
  });
});
