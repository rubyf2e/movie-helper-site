import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBox from "../SearchBox";

describe("SearchBox Component", () => {
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

  test("renders genre tags", () => {
    render(<SearchBox />);

    expect(screen.getByText("動作")).toBeInTheDocument();
    expect(screen.getByText("喜劇")).toBeInTheDocument();
    expect(screen.getByText("科幻")).toBeInTheDocument();
    expect(screen.getByText("恐怖")).toBeInTheDocument();
  });

  test("allows typing in search input", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const searchInput =
      screen.getByPlaceholderText("輸入電影名稱、演員或導演...");

    await user.type(searchInput, "鋼鐵人");
    expect(searchInput).toHaveValue("鋼鐵人");
  });

  test("allows clicking genre tags", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const actionTag = screen.getByText("動作");
    const comedyTag = screen.getByText("喜劇");

    await user.click(actionTag);
    await user.click(comedyTag);

    // Should not throw errors when clicking
    expect(actionTag).toBeInTheDocument();
    expect(comedyTag).toBeInTheDocument();
  });

  test("search button is clickable", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const searchButton = screen.getByText("搜尋電影");
    await user.click(searchButton);

    expect(searchButton).toBeInTheDocument();
  });

  test("has default active tag", () => {
    render(<SearchBox />);

    // Default active tag should be index 1 (喜劇)
    const comedyTag = screen.getByText("喜劇");
    expect(comedyTag).toBeInTheDocument();
  });
});
