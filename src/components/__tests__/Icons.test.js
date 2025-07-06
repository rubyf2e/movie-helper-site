import { render } from "@testing-library/react";
import { CheckIcon, MovieIcon, SearchIcon, StarIcon } from "../Icons";

describe("Icons Components", () => {
  test("CheckIcon renders without crashing", () => {
    render(<CheckIcon />);
  });

  test("MovieIcon renders without crashing", () => {
    render(<MovieIcon />);
  });

  test("SearchIcon renders without crashing", () => {
    render(<SearchIcon />);
  });

  test("StarIcon renders without crashing", () => {
    render(<StarIcon />);
  });

  test("StarIcon renders with filled and unfilled states", () => {
    render(<StarIcon filled={true} />);
    render(<StarIcon filled={false} />);
  });

  test("Icons accept custom className", () => {
    render(<CheckIcon className="custom-check" />);
    render(<MovieIcon className="custom-movie" />);
    render(<SearchIcon className="custom-search" />);
    render(<StarIcon className="custom-star" />);
  });
});
