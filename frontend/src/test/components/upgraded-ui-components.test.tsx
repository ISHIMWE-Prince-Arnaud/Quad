import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

describe("Upgraded UI Components", () => {
  describe("Button with loading state", () => {
    it("should render loading spinner when loading prop is true", () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Check for spinner by looking for the svg element
      const spinner = button.querySelector("svg");
      expect(spinner).toBeInTheDocument();
    });

    it("should be disabled when loading", () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should not show spinner when loading is false", () => {
      render(<Button loading={false}>Submit</Button>);
      const button = screen.getByRole("button");
      const spinner = button.querySelector("svg");
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe("Card with hover effects", () => {
    it("should render card with hover class when hover prop is true", () => {
      const { container } = render(<Card hover>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("hover:shadow-md");
      expect(card).toHaveClass("hover:-translate-y-1");
    });

    it("should not have hover class when hover prop is false", () => {
      const { container } = render(<Card hover={false}>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass("hover:shadow-md");
    });

    it("should have rounded-xl class", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("rounded-xl");
    });
  });

  describe("Input with error and character count", () => {
    it("should display error message when error prop is provided", () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should display error icon when error prop is provided", () => {
      const { container } = render(<Input error="Error message" />);
      const errorIcon = container.querySelector("svg");
      expect(errorIcon).toBeInTheDocument();
    });

    it("should display label when label prop is provided", () => {
      render(<Input label="Email" />);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("should display character count when showCharacterCount is true", () => {
      render(<Input showCharacterCount maxLength={100} defaultValue="Hello" />);
      expect(screen.getByText("5 / 100")).toBeInTheDocument();
    });

    it("should update character count on input change", () => {
      render(<Input showCharacterCount maxLength={100} defaultValue="" />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "Test" } });
      expect(screen.getByText("4 / 100")).toBeInTheDocument();
    });

    it("should have focus ring with primary color", () => {
      const { container } = render(<Input />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("focus-visible:ring-primary");
    });
  });

  describe("Skeleton with shimmer animation", () => {
    it("should render with shimmer animation classes", () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("before:animate-shimmer");
    });

    it("should render with text variant", () => {
      const { container } = render(<Skeleton variant="text" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("h-4");
      expect(skeleton).toHaveClass("rounded");
    });

    it("should render with circular variant", () => {
      const { container } = render(<Skeleton variant="circular" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("rounded-full");
    });

    it("should render with rectangular variant", () => {
      const { container } = render(<Skeleton variant="rectangular" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("rounded-lg");
    });

    it("should have pulse animation", () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });
});
