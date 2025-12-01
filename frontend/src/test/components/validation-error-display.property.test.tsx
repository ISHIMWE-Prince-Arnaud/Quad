import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { Input } from "@/components/ui/input";

// Feature: quad-ui-ux-redesign, Property 20: Form validation error display
// For any invalid form input, an inline error message should appear below the field
// Validates: Requirements 4.5, 15.2

describe("Form Validation Error Display Property Tests", () => {
  it("Property 20: Form validation error display - all inputs with errors show error message and icon", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate non-whitespace-only strings for error messages
          errorMessage: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
          label: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
          placeholder: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        }),
        (inputProps) => {
          const { container, unmount } = render(
            <Input
              error={inputProps.errorMessage}
              label={inputProps.label ?? undefined}
              placeholder={inputProps.placeholder ?? undefined}
            />
          );

          try {
            // Property 1: Error message should be displayed in the error div
            const errorDiv = container.querySelector("#input-error");
            expect(errorDiv).not.toBeNull();
            // Use textContent to get exact text including whitespace
            const errorSpan = errorDiv!.querySelector("span");
            expect(errorSpan).not.toBeNull();
            expect(errorSpan!.textContent).toBe(inputProps.errorMessage);

            // Property 2: Error icon should be present
            const errorIcon = errorDiv!.querySelector("svg");
            expect(errorIcon).not.toBeNull();

            // Property 3: Input should have error styling
            const input = container.querySelector("input");
            expect(input).toHaveClass("border-destructive");
            expect(input).toHaveClass("focus-visible:ring-destructive");

            // Property 4: Error message should have proper ARIA attributes
            expect(input).toHaveAttribute("aria-invalid", "true");
            expect(input).toHaveAttribute("aria-describedby", "input-error");
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 20: Inputs without errors should not show error styling", () => {
    fc.assert(
      fc.property(
        fc.record({
          label: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
          placeholder: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        }),
        (inputProps) => {
          const { container } = render(
            <Input
              label={inputProps.label ?? undefined}
              placeholder={inputProps.placeholder ?? undefined}
            />
          );

          const input = container.querySelector("input");

          // Property: Input without error should not have error styling
          expect(input).not.toHaveClass("border-destructive");
          expect(input).toHaveAttribute("aria-invalid", "false");
          expect(input).not.toHaveAttribute("aria-describedby");
        }
      ),
      { numRuns: 100 }
    );
  });
});
