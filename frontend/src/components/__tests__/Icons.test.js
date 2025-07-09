import { render } from "@testing-library/react";
import {
  CheckIcon,
  MovieIcon,
  SearchIcon,
  StarIcon,
  HamburgerIcon,
} from "../Icons";

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

  test("HamburgerIcon renders without crashing", () => {
    render(<HamburgerIcon />);
  });

  test("HamburgerIcon renders with open and closed states", () => {
    render(<HamburgerIcon isOpen={true} />);
    render(<HamburgerIcon isOpen={false} />);
  });

  test("Icons accept custom className", () => {
    render(<CheckIcon className="custom-check" />);
    render(<MovieIcon className="custom-movie" />);
    render(<SearchIcon className="custom-search" />);
    render(<StarIcon className="custom-star" />);
    render(<HamburgerIcon className="custom-hamburger" />);
  });
});
