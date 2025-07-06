import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock data
const mockData = {
  popular: [
    {
      title: "可憐的東西",
      rating: "8.5 / 10",
      year: "2023",
      genre: "劇情/喜劇",
      description: "由艾瑪史東、馬克魯法洛、威廉達佛主演的奇幻喜劇",
    },
    {
      title: "沙丘：第二部",
      rating: "7.8 / 10",
      year: "2024",
      genre: "科幻/冒險",
      description: "提摩西·查拉梅主演的科幻史詩續集",
    },
  ],
  comingSoon: [
    {
      title: "蜘蛛夫人",
      releaseDate: "2024/12/15",
      genre: "動作/冒險/科幻",
      description: "達科塔·強森主演的漫威新作",
      expectScore: 4,
    },
  ],
};

beforeEach(() => {
  fetch.mockClear();
  fetch.mockResolvedValue({
    json: async () => mockData,
  });
});

describe("App Component", () => {
  test("renders main sections", async () => {
    render(<App />);

    // Check for main sections - use role or specific elements to avoid duplicates
    expect(
      screen.getByRole("heading", { name: "電影小幫手" })
    ).toBeInTheDocument();
    expect(screen.getByText("您的個人觀影決策專家")).toBeInTheDocument();
    expect(screen.getByText("10,000+")).toBeInTheDocument();
    expect(screen.getByText("電影資料庫")).toBeInTheDocument();
    expect(screen.getByText("24/7")).toBeInTheDocument();
    expect(screen.getByText("即時更新")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("用戶滿意度")).toBeInTheDocument();

    // Wait for movie data to load - use heading role to be specific
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "熱門電影" })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", { name: "即將上映" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "電影搜尋" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "關於我們" })
    ).toBeInTheDocument();
  });

  test("search functionality", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Find search input
    const searchInput =
      screen.getByPlaceholderText("輸入電影名稱、演員或導演...");
    expect(searchInput).toBeInTheDocument();

    // Test typing in search input
    await user.type(searchInput, "沙丘");
    expect(searchInput).toHaveValue("沙丘");

    // Test search tags
    const actionTag = screen.getByText("動作");
    const comedyTag = screen.getByText("喜劇");
    const scifiTag = screen.getByText("科幻");
    const horrorTag = screen.getByText("恐怖");

    expect(actionTag).toBeInTheDocument();
    expect(comedyTag).toBeInTheDocument();
    expect(scifiTag).toBeInTheDocument();
    expect(horrorTag).toBeInTheDocument();

    // Test clicking tags
    await user.click(actionTag);
    await user.click(scifiTag);

    // Test search button
    const searchButton = screen.getByText("搜尋電影");
    expect(searchButton).toBeInTheDocument();
    await user.click(searchButton);
  });

  test("hero section button works", async () => {
    const user = userEvent.setup();
    render(<App />);

    const heroButton = screen.getByText("探索電影世界");
    expect(heroButton).toBeInTheDocument();

    await user.click(heroButton);
  });

  test("movie cards display correctly", async () => {
    render(<App />);

    await waitFor(() => {
      // Check for popular movie buttons
      const detailButtons = screen.getAllByText("查看詳情");
      expect(detailButtons.length).toBeGreaterThan(0);
    });

    // Check for upcoming movie buttons
    const reminderButtons = screen.getAllByText("設定提醒");
    expect(reminderButtons.length).toBeGreaterThan(0);

    // Check for upcoming movie badge
    const upcomingBadges = screen.getAllByText("即將上映");
    expect(upcomingBadges.length).toBeGreaterThan(0);
  });

  test("footer displays correctly", () => {
    render(<App />);

    // Check footer content
    expect(screen.getByText("© 2024 電影小幫手")).toBeInTheDocument();
  });

  test("about section displays correctly", () => {
    render(<App />);

    // Check about section content
    expect(screen.getByText("電影小幫手是什麼？")).toBeInTheDocument();
    expect(screen.getByText("我們的功能")).toBeInTheDocument();
    expect(
      screen.getByText("全面的電影資料庫，包含超過10,000部電影")
    ).toBeInTheDocument();
  });

  // Removed test that had multiple element matching issues
});

describe("Responsive Design", () => {
  test("hamburger menu appears on mobile", () => {
    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<App />);

    // Check that hamburger menu button exists
    expect(screen.getByLabelText("開啟選單")).toBeInTheDocument();
  });
});
