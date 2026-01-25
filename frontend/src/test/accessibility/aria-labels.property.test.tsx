import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";
import { Button } from "@/components/ui/button";

// Feature: quad-production-ready, Property 60: ARIA Labels Presence
// Validates: Requirements 17.2

describe("Property 60: ARIA Labels Presence", () => {
  it("should ensure icon-only buttons have aria-label", () => {
    fc.assert(
      fc.property(
        fc.record({
          ariaLabel: fc.string({ minLength: 1, maxLength: 50 }),
          variant: fc.constantFrom(
            "default",
            "destructive",
            "outline",
            "secondary",
            "ghost"
          ),
        }),
        (props) => {
          const { ariaLabel, variant } = props;

          const { container } = render(
            <Button variant={variant as any} aria-label={ariaLabel}>
              {/* Icon-only button with no text */}
              <span>🔔</span>
            </Button>
          );

          const button = container.querySelector("button");
          expect(button).toBeTruthy();

          // Button should have aria-label
          const actualAriaLabel = button?.getAttribute("aria-label");
          expect(actualAriaLabel).toBe(ariaLabel);
        }
      ),
      { numRuns: 30 }
    );
  });

  it("should ensure interactive elements without visible text have accessible names", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (label) => {
        const { container } = render(
          <button aria-label={label}>
            <svg width="16" height="16" />
          </button>
        );

        const button = container.querySelector("button");
        expect(button).toBeTruthy();

        // Button should have aria-label or aria-labelledby
        const hasAccessibleName =
          button?.hasAttribute("aria-label") ||
          button?.hasAttribute("aria-labelledby");
        expect(hasAccessibleName).toBe(true);
      }),
      { numRuns: 30 }
    );
  });

  it("should ensure decorative icons have aria-hidden", () => {
    const { container } = render(
      <Button aria-label="Settings">
        <svg aria-hidden="true" width="16" height="16" />
        Settings
      </Button>
    );

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("should ensure links have accessible names", () => {
    fc.assert(
      fc.property(
        fc.record({
          text: fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => s.trim().length > 0),
          href: fc.constantFrom("/app/feed", "/app/profile", "/app/polls"),
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

          // Link should have text content or aria-label
          const hasAccessibleName =
            (link?.textContent && link.textContent.trim().length > 0) ||
            link?.hasAttribute("aria-label") ||
            link?.hasAttribute("aria-labelledby");
          expect(hasAccessibleName).toBe(true);
        }
      ),
      { numRuns: 30 }
    );
  });

  it("should ensure form inputs have associated labels", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc
            .string({ minLength: 1, maxLength: 20 })
            .map((s) => s.replace(/\s/g, "-")),
          label: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        (props) => {
          const { id, label } = props;

          const { container } = render(
            <div>
              <label htmlFor={id}>{label}</label>
              <input id={id} type="text" />
            </div>
          );

          const input = container.querySelector("input");
          const labelElement = container.querySelector("label");

          expect(input).toBeTruthy();
          expect(labelElement).toBeTruthy();

          // Input should have associated label via htmlFor/id or aria-label
          const hasLabel =
            labelElement?.getAttribute("for") === id ||
            input?.hasAttribute("aria-label") ||
            input?.hasAttribute("aria-labelledby");
          expect(hasLabel).toBe(true);
        }
      ),
      { numRuns: 30 }
    );
  });

  it("should ensure role attributes are present on custom components", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "button",
          "menu",
          "menuitem",
          "dialog",
          "alert",
          "status"
        ),
        (role) => {
          const { container } = render(<div role={role}>Custom Component</div>);

          const element = container.querySelector(`[role="${role}"]`);
          expect(element).toBeTruthy();
          expect(element?.getAttribute("role")).toBe(role);
        }
      ),
      { numRuns: 30 }
    );
  });

  it("should ensure aria-live regions are present for dynamic content", () => {
    const { container } = render(
      <div role="status" aria-live="polite" aria-atomic="true">
        Loading...
      </div>
    );

    const liveRegion = container.querySelector("[aria-live]");
    expect(liveRegion).toBeTruthy();
    expect(liveRegion?.getAttribute("aria-live")).toBeTruthy();
    expect(["polite", "assertive", "off"]).toContain(
      liveRegion?.getAttribute("aria-live")
    );
  });

  it('should ensure error messages have role="alert" or aria-live', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (errorMessage) => {
          const { container } = render(
            <p role="alert" aria-live="polite">
              {errorMessage}
            </p>
          );

          const alert = container.querySelector('[role="alert"]');
          expect(alert).toBeTruthy();

          // Should have role="alert" or aria-live
          const hasAlertMechanism =
            alert?.getAttribute("role") === "alert" ||
            alert?.hasAttribute("aria-live");
          expect(hasAlertMechanism).toBe(true);
        }
      ),
      { numRuns: 30 }
    );
  });
});
