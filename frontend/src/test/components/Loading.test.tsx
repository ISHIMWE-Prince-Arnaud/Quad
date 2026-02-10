import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  LoadingSpinner,
  LoadingPage,
  LoadingCard,
  LoadingButton,
  SkeletonLine,
  SkeletonAvatar,
  SkeletonPost,
  FeedSkeleton,
  ProfileSkeleton,
} from "@/components/ui/loading";

describe("Loading Components", () => {
  describe("LoadingSpinner", () => {
    it("should render with default size", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });

    it("should render with different sizes", () => {
      const { container, rerender } = render(<LoadingSpinner size="sm" />);
      let spinner = container.querySelector("svg");
      expect(spinner).toHaveClass("h-4", "w-4");

      rerender(<LoadingSpinner size="md" />);
      spinner = container.querySelector("svg");
      expect(spinner).toHaveClass("h-6", "w-6");

      rerender(<LoadingSpinner size="lg" />);
      spinner = container.querySelector("svg");
      expect(spinner).toHaveClass("h-8", "w-8");
    });

    it("should apply custom className", () => {
      const { container } = render(<LoadingSpinner className="custom-class" />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveClass("custom-class");
    });
  });

  describe("LoadingPage", () => {
    it("should render skeleton structure", () => {
      const { container } = render(<LoadingPage />);
      const skeletonContainer = container.firstElementChild;
      expect(skeletonContainer).toBeInTheDocument();
      expect(skeletonContainer).toHaveClass("animate-pulse");

      // Should have skeleton lines/blocks
      const skeletons = container.querySelectorAll(".bg-muted");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("LoadingCard", () => {
    it("should render loading card", () => {
      const { container } = render(<LoadingCard />);
      expect(container.querySelector(".border")).toBeInTheDocument();
    });

    it("should contain skeleton elements", () => {
      const { container } = render(<LoadingCard />);
      const skeletons = container.querySelectorAll(".bg-muted");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("LoadingButton", () => {
    it("should contain spinner", () => {
      const { container } = render(<LoadingButton />);
      const spinner = container.querySelector("svg");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });
  });

  describe("SkeletonLine", () => {
    it("should render skeleton line", () => {
      const { container } = render(<SkeletonLine />);
      const skeleton = container.querySelector(".bg-muted");
      expect(skeleton).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<SkeletonLine className="w-24" />);
      const skeleton = container.querySelector(".w-24");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("SkeletonAvatar", () => {
    it("should render skeleton avatar", () => {
      const { container } = render(<SkeletonAvatar />);
      const skeleton = container.querySelector(".rounded-full");
      expect(skeleton).toBeInTheDocument();
    });

    it("should have default size", () => {
      const { container } = render(<SkeletonAvatar />);
      const skeleton = container.querySelector(".h-10");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("SkeletonPost", () => {
    it("should render skeleton post structure", () => {
      const { container } = render(<SkeletonPost />);
      const post = container.querySelector(".border");
      expect(post).toBeInTheDocument();
    });

    it("should contain avatar and lines", () => {
      const { container } = render(<SkeletonPost />);
      const avatar = container.querySelector(".rounded-full");
      const lines = container.querySelectorAll(".bg-muted");
      expect(avatar).toBeInTheDocument();
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe("FeedSkeleton", () => {
    it("should render multiple skeleton posts", () => {
      const { container } = render(<FeedSkeleton />);
      const posts = container.querySelectorAll(".border");
      expect(posts.length).toBe(3);
    });
  });

  describe("ProfileSkeleton", () => {
    it("should render profile skeleton structure", () => {
      const { container } = render(<ProfileSkeleton />);
      const sections = container.querySelectorAll(".border");
      expect(sections.length).toBeGreaterThan(0);
    });

    it("should contain large avatar for profile", () => {
      const { container } = render(<ProfileSkeleton />);
      const largeAvatar = container.querySelector(".h-24");
      expect(largeAvatar).toBeInTheDocument();
    });
  });
});
