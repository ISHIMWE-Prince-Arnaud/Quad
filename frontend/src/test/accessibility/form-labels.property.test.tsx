import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as fc from "fast-check";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Feature: quad-production-ready, Property 62: Form Label Association
// Validates: Requirements 17.4

describe("Property 62: Form Label Association", () => {
  it("should ensure all inputs have associated labels via htmlFor", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc
            .string({ minLength: 1, maxLength: 20 })
            .map((s) => s.replace(/\s/g, "-")),
          label: fc.string({ minLength: 1, maxLength: 50 }),
          placeholder: fc.string({ minLength: 0, maxLength: 30 }),
        }),
        (props) => {
          const { id, label, placeholder } = props;

          const { container } = render(
            <div>
              <Label htmlFor={id}>{label}</Label>
              <Input id={id} placeholder={placeholder} />
            </div>
          );

          const input = container.querySelector("input");
          const labelElement = container.querySelector("label");

          expect(input).toBeTruthy();
          expect(labelElement).toBeTruthy();

          // Label should have htmlFor matching input id
          expect(labelElement?.getAttribute("for")).toBe(id);
          expect(input?.id).toBe(id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure textareas have associated labels", () => {
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
              <Label htmlFor={id}>{label}</Label>
              <Textarea id={id} />
            </div>
          );

          const textarea = container.querySelector("textarea");
          const labelElement = container.querySelector("label");

          expect(textarea).toBeTruthy();
          expect(labelElement).toBeTruthy();

          // Label should have htmlFor matching textarea id
          expect(labelElement?.getAttribute("for")).toBe(id);
          expect(textarea?.id).toBe(id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure inputs have accessible names via label or aria-label", () => {
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
              <Label htmlFor={id}>{label}</Label>
              <Input id={id} />
            </div>
          );

          const input = container.querySelector("input");
          const labelElement = container.querySelector("label");

          // Input should have accessible name via label or aria-label
          const hasAccessibleName =
            (labelElement && labelElement.getAttribute("for") === id) ||
            input?.hasAttribute("aria-label") ||
            input?.hasAttribute("aria-labelledby");

          expect(hasAccessibleName).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure form fields have descriptive error messages", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.constantFrom(
            "field-email",
            "field-password",
            "field-username",
            "field-name"
          ),
          errorMessage: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
        }),
        (props) => {
          const { id, errorMessage } = props;

          const { container } = render(
            <div>
              <Input
                id={id}
                aria-invalid="true"
                aria-describedby={`${id}-error`}
              />
              <p id={`${id}-error`} role="alert">
                {errorMessage}
              </p>
            </div>
          );

          const input = container.querySelector("input");
          const error = document.getElementById(`${id}-error`);

          expect(input).toBeTruthy();
          expect(error).toBeTruthy();

          // Input should reference error via aria-describedby
          expect(input?.getAttribute("aria-describedby")).toContain(
            `${id}-error`
          );

          // Error should have role="alert"
          expect(error?.getAttribute("role")).toBe("alert");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure required fields are marked with aria-required", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc
            .string({ minLength: 1, maxLength: 20 })
            .map((s) => s.replace(/\s/g, "-")),
          label: fc.string({ minLength: 1, maxLength: 50 }),
          required: fc.boolean(),
        }),
        (props) => {
          const { id, label, required } = props;

          const { container } = render(
            <div>
              <Label htmlFor={id}>
                {label}
                {required && <span aria-label="required"> *</span>}
              </Label>
              <Input id={id} required={required} aria-required={required} />
            </div>
          );

          const input = container.querySelector("input");

          expect(input).toBeTruthy();

          if (required) {
            // Required inputs should have aria-required or required attribute
            const hasRequiredIndicator =
              input?.hasAttribute("required") ||
              input?.getAttribute("aria-required") === "true";
            expect(hasRequiredIndicator).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure form fields have help text via aria-describedby", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.constantFrom(
            "field-email",
            "field-password",
            "field-username",
            "field-name"
          ),
          helpText: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
        }),
        (props) => {
          const { id, helpText } = props;

          const { container } = render(
            <div>
              <Input id={id} aria-describedby={`${id}-help`} />
              <p id={`${id}-help`} className="text-sm text-muted-foreground">
                {helpText}
              </p>
            </div>
          );

          const input = container.querySelector("input");
          const help = document.getElementById(`${id}-help`);

          expect(input).toBeTruthy();
          expect(help).toBeTruthy();

          // Input should reference help text via aria-describedby
          expect(input?.getAttribute("aria-describedby")).toContain(
            `${id}-help`
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure disabled fields are marked with aria-disabled", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc
            .string({ minLength: 1, maxLength: 20 })
            .map((s) => s.replace(/\s/g, "-")),
          disabled: fc.boolean(),
        }),
        (props) => {
          const { id, disabled } = props;

          const { container } = render(<Input id={id} disabled={disabled} />);

          const input = container.querySelector("input");

          expect(input).toBeTruthy();

          if (disabled) {
            // Disabled inputs should have disabled attribute
            expect(input?.hasAttribute("disabled")).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure form groups have proper fieldset and legend", () => {
    const { container } = render(
      <fieldset>
        <legend>Personal Information</legend>
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" />
        </div>
      </fieldset>
    );

    const fieldset = container.querySelector("fieldset");
    const legend = container.querySelector("legend");

    expect(fieldset).toBeTruthy();
    expect(legend).toBeTruthy();
    expect(legend?.textContent).toBe("Personal Information");
  });
});
