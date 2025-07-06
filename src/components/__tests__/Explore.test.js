import { render, screen } from "@testing-library/react";
import Explore from "../Explore";

describe("Explore Component", () => {
  test("renders all explore data correctly", () => {
    render(<Explore />);

    // 檢查數字是否存在
    expect(screen.getByText("10,000+")).toBeInTheDocument();
    expect(screen.getByText("24/7")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();

    // 檢查標籤是否存在
    expect(screen.getByText("電影資料庫")).toBeInTheDocument();
    expect(screen.getByText("即時更新")).toBeInTheDocument();
    expect(screen.getByText("用戶滿意度")).toBeInTheDocument();
  });

  test("renders explore section as section element", () => {
    render(<Explore />);
    const exploreSection = screen.getByRole("region");
    expect(exploreSection).toBeInTheDocument();
    expect(exploreSection.tagName).toBe("SECTION");
  });
});
