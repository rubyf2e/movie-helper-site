import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "../Header";

describe("Header Component", () => {
  test("renders logo and navigation", () => {
    render(<Header />);

    // Check logo
    expect(screen.getByText("電影小幫手")).toBeInTheDocument();

    // Check navigation items
    expect(screen.getByText("首頁")).toBeInTheDocument();
    expect(screen.getByText("熱門電影")).toBeInTheDocument();
    expect(screen.getByText("即將上映")).toBeInTheDocument();
    expect(screen.getByText("電影搜尋")).toBeInTheDocument();
    expect(screen.getByText("關於我們")).toBeInTheDocument();
  });

  test("hamburger menu button exists", () => {
    render(<Header />);

    const menuButton = screen.getByLabelText("開啟選單");
    expect(menuButton).toBeInTheDocument();
  });

  test("navigation links are clickable", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const homeLink = screen.getByText("首頁");
    const popularLink = screen.getByText("熱門電影");

    await user.click(homeLink);
    await user.click(popularLink);

    // Links should be clickable without errors
    expect(homeLink).toBeInTheDocument();
    expect(popularLink).toBeInTheDocument();
  });

  test("hamburger menu can be clicked", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByLabelText("開啟選單");
    await user.click(menuButton);

    // Should not throw error when clicking
    expect(menuButton).toBeInTheDocument();
  });
});
