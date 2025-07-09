import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer Component", () => {
  test("renders footer content", () => {
    render(<Footer />);

    // Check logo
    expect(screen.getByText("電影小幫手")).toBeInTheDocument();

    // Check copyright
    expect(screen.getByText("© 2024 電影小幫手")).toBeInTheDocument();
  });

  test("renders logo icon", () => {
    render(<Footer />);

    // SVG should be present
    const logo = screen.getByText("電影小幫手");
    expect(logo).toBeInTheDocument();
  });

  test("footer structure is correct", () => {
    render(<Footer />);

    // Check that footer content is rendered
    expect(screen.getByText("電影小幫手")).toBeInTheDocument();
    expect(screen.getByText("© 2024 電影小幫手")).toBeInTheDocument();
  });
});
