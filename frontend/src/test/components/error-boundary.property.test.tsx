import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { render, screen, cleanup } from "@testing-library/react";
import {
  ErrorBoundary,
  PageErrorBoundary,
  ComponentErrorBoundary,
} from "@/components/ui/error-boundary";

/**
 * Feature: quad-production-ready, Property 67: Error Boundary Catch
 *
 * For any component error thrown during rendering, the error boundary should
 * catch it and display a fallback UI.
 *
 * Validates: Requirements 19.1
 */

// Component that throws an error
const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe("Property 67: Error Boundary Catch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    // Suppress console.error for these tests since we're intentionally throwing errors
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should catch any component error and display fallback UI", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 5, maxLength: 100 })
          .filter((s) => s.trim().length >= 5),
        async (errorMessage) => {
          // Render a component that throws an error inside an ErrorBoundary
          render(
            <ErrorBoundary>
              <ThrowError message={errorMessage} />
            </ErrorBoundary>
          );

          // Property: Error boundary should catch the error and display fallback
          expect(screen.getByText("Something went wrong")).toBeInTheDocument();

          // Property: Fallback UI should be visible
          expect(
            screen.getByRole("button", { name: /try again/i })
          ).toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should display error details in development mode", async () => {
    // Save original env
    const originalEnv = import.meta.env.DEV;

    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 5, maxLength: 100 })
          .filter((s) => s.trim().length >= 5),
        async (errorMessage) => {
          // Clean up before each render
          cleanup();

          // Set dev mode
          (import.meta.env as any).DEV = true;

          render(
            <ErrorBoundary>
              <ThrowError message={errorMessage} />
            </ErrorBoundary>
          );

          // Property: Error details should be available in dev mode
          const details = screen.getAllByText("Error Details")[0]; // Get first match
          expect(details).toBeInTheDocument();

          // Property: Error message should be displayed
          expect(
            screen.getByText(errorMessage, { exact: false })
          ).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );

    // Final cleanup
    cleanup();

    // Restore original env
    (import.meta.env as any).DEV = originalEnv;
  });

  it("should call onError callback when error is caught", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 5, maxLength: 100 })
          .filter((s) => s.trim().length >= 5),
        async (errorMessage) => {
          const onError = vi.fn();

          render(
            <ErrorBoundary onError={onError}>
              <ThrowError message={errorMessage} />
            </ErrorBoundary>
          );

          // Property: onError callback should be called when error is caught
          expect(onError).toHaveBeenCalledTimes(1);

          // Property: onError should receive the error object
          expect(onError).toHaveBeenCalledWith(
            expect.objectContaining({
              message: errorMessage,
            }),
            expect.any(Object)
          );

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should support custom fallback components", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          errorMessage: fc
            .string({ minLength: 5, maxLength: 100 })
            .filter((s) => s.trim().length >= 5),
          fallbackText: fc
            .string({ minLength: 5, maxLength: 50 })
            .filter((s) => s.trim().length >= 5 && /[a-zA-Z0-9]/.test(s)),
        }),
        async ({ errorMessage, fallbackText }) => {
          const CustomFallback = () => <div>{fallbackText}</div>;

          render(
            <ErrorBoundary fallback={CustomFallback}>
              <ThrowError message={errorMessage} />
            </ErrorBoundary>
          );

          // Property: Custom fallback should be displayed
          expect(
            screen.getByText(fallbackText, { normalizer: (text) => text })
          ).toBeInTheDocument();

          // Property: Default fallback should NOT be displayed
          expect(
            screen.queryByText("Something went wrong")
          ).not.toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should work with PageErrorBoundary variant", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 5, maxLength: 100 })
          .filter((s) => s.trim().length >= 5),
        async (errorMessage) => {
          render(
            <PageErrorBoundary>
              <ThrowError message={errorMessage} />
            </PageErrorBoundary>
          );

          // Property: PageErrorBoundary should catch errors
          expect(screen.getByText("Page Error")).toBeInTheDocument();

          // Property: Page-specific actions should be available
          expect(
            screen.getByRole("button", { name: /reload page/i })
          ).toBeInTheDocument();
          expect(
            screen.getByRole("button", { name: /go back/i })
          ).toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should work with ComponentErrorBoundary variant", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          errorMessage: fc
            .string({ minLength: 5, maxLength: 100 })
            .filter((s) => s.trim().length >= 5),
          componentName: fc
            .string({ minLength: 3, maxLength: 30 })
            .filter((s) => s.trim().length >= 3 && /[a-zA-Z0-9]/.test(s)),
        }),
        async ({ errorMessage, componentName }) => {
          render(
            <ComponentErrorBoundary componentName={componentName}>
              <ThrowError message={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Property: ComponentErrorBoundary should catch errors
          // Use a more flexible matcher that handles text normalization
          const elements = screen.getAllByText((content, element) => {
            return (
              (element?.textContent?.includes(componentName) &&
                element?.textContent?.includes("Error")) ||
              false
            );
          });
          expect(elements.length).toBeGreaterThanOrEqual(1);

          // Property: Retry button should be available
          expect(
            screen.getByRole("button", { name: /retry/i })
          ).toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not interfere with normal rendering when no error occurs", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 5, maxLength: 100 })
          .filter((s) => s.trim().length >= 5 && /[a-zA-Z0-9]/.test(s)),
        async (content) => {
          const NormalComponent = () => <div>{content}</div>;

          render(
            <ErrorBoundary>
              <NormalComponent />
            </ErrorBoundary>
          );

          // Property: Normal content should render without fallback
          // Use flexible matcher to handle text normalization
          const elements = screen.getAllByText((text, element) => {
            return element?.textContent?.includes(content.trim()) || false;
          });
          expect(elements.length).toBeGreaterThanOrEqual(1);

          // Property: Error fallback should NOT be displayed
          expect(
            screen.queryByText("Something went wrong")
          ).not.toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should catch errors from nested components", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          errorMessage: fc
            .string({ minLength: 5, maxLength: 100 })
            .filter((s) => s.trim().length >= 5),
          wrapperText: fc
            .string({ minLength: 3, maxLength: 50 })
            .filter((s) => s.trim().length >= 3),
        }),
        async ({ errorMessage, wrapperText }) => {
          const Wrapper = ({ children }: { children: React.ReactNode }) => (
            <div>
              <span>{wrapperText}</span>
              {children}
            </div>
          );

          render(
            <ErrorBoundary>
              <Wrapper>
                <ThrowError message={errorMessage} />
              </Wrapper>
            </ErrorBoundary>
          );

          // Property: Error boundary should catch errors from nested components
          expect(screen.getByText("Something went wrong")).toBeInTheDocument();

          // Property: Wrapper content should not be rendered after error
          expect(screen.queryByText(wrapperText)).not.toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle multiple error boundaries independently", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          error1: fc
            .string({ minLength: 5, maxLength: 100 })
            .filter((s) => s.trim().length >= 5),
          normalContent: fc
            .string({ minLength: 5, maxLength: 50 })
            .filter((s) => s.trim().length >= 5 && /[a-zA-Z0-9]/.test(s)),
        }),
        async ({ error1, normalContent }) => {
          const NormalComponent = () => (
            <div data-testid="normal-content">{normalContent}</div>
          );

          const { container } = render(
            <div>
              <ErrorBoundary>
                <ThrowError message={error1} />
              </ErrorBoundary>
              <ErrorBoundary>
                <NormalComponent />
              </ErrorBoundary>
            </div>
          );

          // Property: First boundary should catch its error
          const errorMessages = screen.getAllByText("Something went wrong");
          expect(errorMessages.length).toBeGreaterThanOrEqual(1);

          // Property: Second boundary should render normally
          expect(screen.getByTestId("normal-content")).toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
