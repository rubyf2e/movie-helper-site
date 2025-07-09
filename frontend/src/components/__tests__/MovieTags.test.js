import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MovieTags from "../MovieTags";

describe("MovieTags Component", () => {
  const mockTags = ["動作", "喜劇", "科幻", "恐怖"];
  const mockSetActive = jest.fn();

  beforeEach(() => {
    mockSetActive.mockClear();
  });

  test("renders all tags", () => {
    render(<MovieTags tags={mockTags} active={1} setActive={mockSetActive} />);

    expect(screen.getByText("動作")).toBeInTheDocument();
    expect(screen.getByText("喜劇")).toBeInTheDocument();
    expect(screen.getByText("科幻")).toBeInTheDocument();
    expect(screen.getByText("恐怖")).toBeInTheDocument();
  });

  test("shows active tag correctly", () => {
    render(<MovieTags tags={mockTags} active={1} setActive={mockSetActive} />);

    const comedyTag = screen.getByText("喜劇");
    expect(comedyTag).toHaveClass("active");
  });

  test("calls setActive when tag is clicked", async () => {
    const user = userEvent.setup();
    render(<MovieTags tags={mockTags} active={1} setActive={mockSetActive} />);

    const actionTag = screen.getByText("動作");
    await user.click(actionTag);

    expect(mockSetActive).toHaveBeenCalledWith(0);
  });

  test("each tag has correct data-idx attribute", () => {
    render(<MovieTags tags={mockTags} active={1} setActive={mockSetActive} />);

    const actionTag = screen.getByText("動作");
    const comedyTag = screen.getByText("喜劇");
    const scifiTag = screen.getByText("科幻");
    const horrorTag = screen.getByText("恐怖");

    expect(actionTag).toHaveAttribute("data-idx", "0");
    expect(comedyTag).toHaveAttribute("data-idx", "1");
    expect(scifiTag).toHaveAttribute("data-idx", "2");
    expect(horrorTag).toHaveAttribute("data-idx", "3");
  });

  test("multiple tags can be clicked", async () => {
    const user = userEvent.setup();
    render(<MovieTags tags={mockTags} active={1} setActive={mockSetActive} />);

    const actionTag = screen.getByText("動作");
    const scifiTag = screen.getByText("科幻");

    await user.click(actionTag);
    await user.click(scifiTag);

    expect(mockSetActive).toHaveBeenCalledTimes(2);
    expect(mockSetActive).toHaveBeenNthCalledWith(1, 0);
    expect(mockSetActive).toHaveBeenNthCalledWith(2, 2);
  });
});
