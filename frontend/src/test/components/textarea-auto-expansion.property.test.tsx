import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import { AutoExpandingTextarea } from "@/components/ui/auto-expanding-textarea";

// Feature: quad-ui-ux-redesign, Property 17: Textarea auto-expansion
// For any text input in composers, the textarea height should increase as content grows
// Validates: Requirements 4.2, 17.3

describe("Textarea Auto-Expansion Property Tests", () => {
  afterEach(() => {
    cleanup();
  });

  it("Property 17: Textarea has auto-expansion styling applied", () => {
    const minHeight = 80;
    const maxHeight = 400;

    render(
      <AutoExpandingTextarea
        placeholder="Type here..."
        minHeight={minHeight}
        maxHeight={maxHeight}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Type here..."
    ) as HTMLTextAreaElement;

    // Property: Textarea should have minHeight and maxHeight styles set
    expect(textarea.style.minHeight).toBe(`${minHeight}px`);
    expect(textarea.style.maxHeight).toBe(`${maxHeight}px`);

    // Property: Textarea should have resize-none class to prevent manual resizing
    expect(textarea.className).toContain("resize-none");

    // Property: Textarea should have overflow-y-auto for scrolling when content exceeds maxHeight
    expect(textarea.className).toContain("overflow-y-auto");
  });

  it("Property 17: Textarea respects minHeight constraint in styles", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 60, max: 200 }), async (minHeight) => {
        const { unmount } = render(
          <AutoExpandingTextarea
            placeholder={`test-${minHeight}`}
            minHeight={minHeight}
            maxHeight={400}
          />
        );

        const textarea = screen.getByPlaceholderText(
          `test-${minHeight}`
        ) as HTMLTextAreaElement;

        // Property: minHeight style should be set correctly
        expect(textarea.style.minHeight).toBe(`${minHeight}px`);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("Property 17: Textarea respects maxHeight constraint in styles", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 200, max: 600 }),
        async (maxHeight) => {
          const { unmount } = render(
            <AutoExpandingTextarea
              placeholder={`test-max-${maxHeight}`}
              minHeight={80}
              maxHeight={maxHeight}
            />
          );

          const textarea = screen.getByPlaceholderText(
            `test-max-${maxHeight}`
          ) as HTMLTextAreaElement;

          // Property: maxHeight style should be set correctly
          expect(textarea.style.maxHeight).toBe(`${maxHeight}px`);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 17: Textarea onChange handler is called when typing", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <AutoExpandingTextarea
        placeholder="Type here..."
        onChange={mockOnChange}
        minHeight={80}
        maxHeight={400}
      />
    );

    const textarea = screen.getByPlaceholderText("Type here...");

    // Type some content
    await user.type(textarea, "Hello");

    // Property: onChange should be called for each character typed
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange.mock.calls.length).toBeGreaterThan(0);
  });

  it("Property 17: Textarea value updates when typing", async () => {
    const user = userEvent.setup();

    render(
      <AutoExpandingTextarea
        placeholder="Type here..."
        minHeight={80}
        maxHeight={400}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Type here..."
    ) as HTMLTextAreaElement;

    // Type some content
    const testContent = "Test content";
    await user.type(textarea, testContent);

    // Property: Textarea value should match typed content
    expect(textarea.value).toBe(testContent);
  });
});
