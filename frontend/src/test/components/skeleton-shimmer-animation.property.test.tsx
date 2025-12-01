import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as fc from "fast-check";
import { Skeleton } from "@/components/ui/skeleton";

// Feature: quad-ui-ux-redesign, Property 57: Skeleton shimmer animation
// For any skeleton loading state, a shimmer effect should animate from left to right
// Validates: Requirements 14.2

describe("Skeleton Shimmer Animation Property Tests", () => {
  it("Property 57: Skeleton shimmer animation - all skeletons have shimmer effect", () => {
    fc.assert(
      fc.property(
        fc.record({
          variant: fc.constantFrom(
            "text" as const,
            "circular" as const,
            "rectangular" as const
          ),
          className: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        }),
        (skeletonProps) => {
          const { container } = render(
            <Skeleton
              variant={skeletonProps.variant}
              className={skeletonProps.className ?? undefined}
            />
          );

          const skeleton = container.firstChild as HTMLElement;
          expect(skeleton).toBeInTheDocument();

          // Property 1: Skeleton should have shimmer animation class
          expect(skeleton).toHaveClass("before:animate-shimmer");

          // Property 2: Skeleton should have gradient for shimmer effect
          expect(skeleton).toHaveClass(
            "before:bg-gradient-to-r",
            "before:from-transparent",
            "before:via-white/10",
            "before:to-transparent"
          );

          // Property 3: Skeleton should have pulse animation
          expect(skeleton).toHaveClass("animate-pulse");

          // Property 4: Skeleton should have proper positioning for shimmer
          expect(skeleton).toHaveClass("relative", "overflow-hidden");
          expect(skeleton).toHaveClass(
            "before:absolute",
            "before:inset-0",
            "before:-translate-x-full"
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 57: Skeleton variants have correct styling", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "text" as const,
          "circular" as const,
          "rectangular" as const
        ),
        (variant) => {
          const { container } = render(<Skeleton variant={variant} />);
          const skeleton = container.firstChild as HTMLElement;

          // Property: Each variant should have its specific styling
          if (variant === "text") {
            expect(skeleton).toHaveClass("h-4", "rounded");
          } else if (variant === "circular") {
            expect(skeleton).toHaveClass("rounded-full");
          } else if (variant === "rectangular") {
            expect(skeleton).toHaveClass("rounded-lg");
          }

          // All variants should have base muted background
          expect(skeleton).toHaveClass("bg-muted");
        }
      ),
      { numRuns: 100 }
    );
  });
});
