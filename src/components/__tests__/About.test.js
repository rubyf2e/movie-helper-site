import { render, screen } from "@testing-library/react";
import About from "../About";

describe("About Component", () => {
  test("renders about section title", () => {
    render(<About />);

    expect(screen.getByText("關於我們")).toBeInTheDocument();
  });

  test("renders main content sections", () => {
    render(<About />);

    expect(screen.getByText("電影小幫手是什麼？")).toBeInTheDocument();
    expect(screen.getByText("我們的功能")).toBeInTheDocument();
  });

  test("renders feature list", () => {
    render(<About />);

    expect(
      screen.getByText("全面的電影資料庫，包含超過10,000部電影")
    ).toBeInTheDocument();
    expect(
      screen.getByText("即時更新的熱門電影和即將上映資訊")
    ).toBeInTheDocument();
    expect(
      screen.getByText("多維度的電影搜尋功能，可按名稱、演員、導演或類型篩選")
    ).toBeInTheDocument();
    expect(
      screen.getByText("個性化的電影推薦系統，根據您的喜好提供建議")
    ).toBeInTheDocument();
    expect(
      screen.getByText("電影評分和評論功能，幫助您做出觀影決策")
    ).toBeInTheDocument();
  });

  test("renders description text", () => {
    render(<About />);

    expect(
      screen.getByText(/電影小幫手是您的個人觀影決策專家/)
    ).toBeInTheDocument();
    expect(screen.getByText(/我們整合了來自 OMDb API/)).toBeInTheDocument();
    expect(
      screen.getByText(/無論您是在尋找最新上映的電影/)
    ).toBeInTheDocument();
  });

  test("all feature items have check icons", () => {
    render(<About />);

    // All feature list items should be rendered
    const features = [
      "全面的電影資料庫，包含超過10,000部電影",
      "即時更新的熱門電影和即將上映資訊",
      "多維度的電影搜尋功能，可按名稱、演員、導演或類型篩選",
      "個性化的電影推薦系統，根據您的喜好提供建議",
      "電影評分和評論功能，幫助您做出觀影決策",
    ];

    features.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });
});
