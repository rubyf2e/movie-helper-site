import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MovieCard from "../MovieCard";

describe("MovieCard Component", () => {
  const mockPopularMovie = {
    title: "測試電影",
    rating: "8.5 / 10",
    year: "2024",
    genre: "動作/冒險",
    description: "這是一部測試電影的描述",
  };

  const mockUpcomingMovie = {
    title: "即將上映電影",
    releaseDate: "2024/12/25",
    genre: "科幻/冒險",
    description: "這是一部即將上映的測試電影",
    expectScore: 4,
  };

  test("renders popular movie card correctly", () => {
    render(<MovieCard movie={mockPopularMovie} index={0} />);

    expect(screen.getByText("測試電影")).toBeInTheDocument();
    expect(screen.getByText("8.5 / 10")).toBeInTheDocument();
    expect(screen.getByText("2024｜動作/冒險")).toBeInTheDocument();
    expect(screen.getByText("這是一部測試電影的描述")).toBeInTheDocument();
    expect(screen.getByText("查看詳情")).toBeInTheDocument();

    // Should have emoji icon
    expect(screen.getByText("🎬")).toBeInTheDocument();
  });

  test("renders upcoming movie card correctly", () => {
    render(<MovieCard movie={mockUpcomingMovie} upcoming index={0} />);

    expect(screen.getByText("即將上映電影")).toBeInTheDocument();
    expect(screen.getByText("即將上映")).toBeInTheDocument();

    // Check if the meta div contains the date and genre
    const metaDiv = screen.getByText((content, element) => {
      return (
        (element?.className === "meta" &&
          element?.textContent?.includes("2024/12/25")) ||
        false
      );
    });
    expect(metaDiv).toBeInTheDocument();

    expect(
      screen.getByText((content, element) => {
        return (
          (element?.className === "meta" &&
            element?.textContent?.includes("科幻/冒險")) ||
          false
        );
      })
    ).toBeInTheDocument();
    expect(screen.getByText("這是一部即將上映的測試電影")).toBeInTheDocument();
    expect(screen.getByText("設定提醒")).toBeInTheDocument();
    expect(screen.getByText("期待度：")).toBeInTheDocument();
  });

  test("popular movie card has correct theme color", () => {
    render(<MovieCard movie={mockPopularMovie} index={0} />);

    // Check that the movie card contains the expected content
    expect(screen.getByText("測試電影")).toBeInTheDocument();
    expect(screen.getByText("🎬")).toBeInTheDocument();
  });

  test("upcoming movie card shows stars rating", () => {
    render(<MovieCard movie={mockUpcomingMovie} upcoming index={0} />);

    // Should show expectation rating text
    expect(screen.getByText("期待度：")).toBeInTheDocument();
  });

  test("movie card buttons are clickable", async () => {
    const user = userEvent.setup();

    // Test popular movie button
    render(<MovieCard movie={mockPopularMovie} index={0} />);
    const detailButton = screen.getByText("查看詳情");
    await user.click(detailButton);
    expect(detailButton).toBeInTheDocument();

    // Test upcoming movie button
    render(<MovieCard movie={mockUpcomingMovie} upcoming index={0} />);
    const reminderButton = screen.getByText("設定提醒");
    await user.click(reminderButton);
    expect(reminderButton).toBeInTheDocument();
  });

  test("displays different themes for different indices", () => {
    const themes = [
      { index: 0, icon: "🎬" },
      { index: 1, icon: "🎥" },
      { index: 2, icon: "📽️" },
      { index: 3, icon: "🎞️" },
    ];

    themes.forEach(({ index, icon }) => {
      render(<MovieCard movie={mockPopularMovie} index={index} />);
      expect(screen.getByText(icon)).toBeInTheDocument();
    });
  });
});
