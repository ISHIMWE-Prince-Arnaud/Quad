import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as fc from "fast-check";
import { Input } from "@/components/ui/input";

// Feature: quad-ui-ux-redesign, Property 61: Input focus styling
// For any input field focus, the border should be highlighted with the accent color
// Validates: Requirements 15.1

describe("Input Focus Styling Property Tests", () => {
  it("Property 61: Input focus styling - all inputs have focus ring with primary color", () => {
    fc.assert(
      fc.property(
        fc.record({
          placeholder: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          label: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
          type: fc.constantFrom("text", "email", "password", "number", "tel"),
          disabled: fc.boolean(),
        }),
        (inputProps) => {
          const { container } = render(
            <Input
              placeholder={inputProps.placeholder ?? undefined}
              label={inputProps.label ?? undefined}
              type={inputProps.type}
              disabled={inputProps.disabled}
            />
          );

          const input = container.querySelector("input");
          expect(input).toBeInTheDocument();

          // Property: Input should have focus-visible:ring-primary class
          expect(input).toHaveClass("focus-visible:ring-primary");
          expect(input).toHaveClass("focus-visible:border-primary");
          expect(input).toHaveClass("focus-visible:ring-2");
        }
      ),
      { numRuns: 100 }
    );
  });
});
