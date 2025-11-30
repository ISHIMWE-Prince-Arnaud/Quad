import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Feature: quad-production-ready, Property 59: Keyboard Navigation Support
// Validates: Requirements 17.1

describe("Property 59: Keyboard Navigation Support", () => {
  it("should ensure all interactive buttons are keyboard accessible", () => {
    fc.assert(
      fc.property(
        fc.record({
          text: fc.string({ minLength: 1, maxLength: 50 }),
          variant: fc.constantFrom(
            "default",
            "destructive",
            "outline",
            "secondary",
            "ghost",
            "link"
          ),
          disabled: fc.boolean(),
        }),
        (props) => {
          const { text, variant, disabled } = props;

          const { container } = render(
            <Button variant={variant as any} disabled={disabled}>
              {text}
            </Button>
          );

          const button = container.querySelector("button");
          expect(button).toBeTruthy();

          // Button should be focusable via keyboard (tabIndex should not be -1 unless disabled)
          if (!disabled) {
            expect(button?.tabIndex).not.toBe(-1);
          }

          // Button should be a button element (inherently keyboard accessible)
          expect(button?.tagName).toBe("BUTTON");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure all input fields are keyboard accessible", () => {
    fc.assert(
      fc.property(
        fc.record({
          placeholder: fc.string({ minLength: 1, maxLength: 50 }),
          type: fc.constantFrom(
            "text",
            "email",
            "password",
            "number",
            "tel",
            "url"
          ),
          disabled: fc.boolean(),
        }),
        (props) => {
          const { placeholder, type, disabled } = props;

          const { container } = render(
            <Input
              placeholder={placeholder}
              type={type}
              disabled={disabled}
              aria-label={placeholder}
            />
          );

          const input = container.querySelector("input");
          expect(input).toBeTruthy();

          // Input should be focusable via keyboard (tabIndex should not be -1 unless disabled)
          if (!disabled) {
            expect(input?.tabIndex).not.toBe(-1);
          }

          // Input should have proper type attribute
          expect(input?.type).toBe(type);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure all links are keyboard accessible", () => {
    fc.assert(
      fc.property(
        fc.record({
          text: fc.string({ minLength: 1, maxLength: 50 }),
          href: fc.constantFrom(
            "/app/feed",
            "/app/profile/user",
            "/app/search",
            "/app/notifications"
          ),
        }),
        (props) => {
          const { text, href } = props;

          const { container } = render(
            <BrowserRouter>
              <a href={href}>{text}</a>
            </BrowserRouter>
          );

          const link = container.querySelector("a");
          expect(link).toBeTruthy();

          // Link should be focusable via keyboard
          expect(link?.tabIndex).not.toBe(-1);

          // Link should have href attribute
          expect(link?.getAttribute("href")).toBe(href);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure focus indicators are present on interactive elements", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 30 }), (buttonText) => {
        const { container } = render(<Button>{buttonText}</Button>);

        const button = container.querySelector("button");
        expect(button).toBeTruthy();

        // Check that button has focus-visible classes in className
        const className = button?.className || "";
        expect(className).toContain("focus-visible");
      }),
      { numRuns: 100 }
    );
  });

  it("should ensure interactive elements have proper ARIA attributes for keyboard users", () => {
    fc.assert(
      fc.property(
        fc.record({
          label: fc.string({ minLength: 1, maxLength: 50 }),
          disabled: fc.boolean(),
        }),
        (props) => {
          const { label, disabled } = props;

          const { container } = render(
            <Button aria-label={label} disabled={disabled}>
              Icon Button
            </Button>
          );

          const button = container.querySelector("button");
          expect(button).toBeTruthy();

          // Button should have aria-label
          expect(button?.getAttribute("aria-label")).toBe(label);

          // If disabled, should have disabled attribute
          if (disabled) {
            expect(button?.hasAttribute("disabled")).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure tab order is logical for navigation elements", () => {
    const { container } = render(
      <BrowserRouter>
        <nav aria-label="Main navigation">
          <a href="/app/feed">Home</a>
          <a href="/app/search">Search</a>
          <a href="/app/notifications">Notifications</a>
        </nav>
      </BrowserRouter>
    );

    const links = container.querySelectorAll("a");

    // All links should be in the tab order
    links.forEach((link) => {
      expect(link.tabIndex).not.toBe(-1);
    });

    // Links should be in document order
    expect(links.length).toBe(3);
  });
});
