import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PageErrorBoundary } from "./PageErrorBoundary";

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("PageErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("renders children when no error occurs", () => {
    render(
      <BrowserRouter>
        <PageErrorBoundary>
          <div>Test content</div>
        </PageErrorBoundary>
      </BrowserRouter>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("catches errors and displays ErrorFallback", () => {
    render(
      <BrowserRouter>
        <PageErrorBoundary errorType="network">
          <ThrowError shouldThrow={true} />
        </PageErrorBoundary>
      </BrowserRouter>
    );

    // Should display error UI with network error message
    expect(screen.getByText("Connection Problem")).toBeInTheDocument();
    expect(
      screen.getByText(/Unable to connect to our servers/i)
    ).toBeInTheDocument();
  });

  it("displays both action buttons", () => {
    render(
      <BrowserRouter>
        <PageErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PageErrorBoundary>
      </BrowserRouter>
    );

    // Both buttons should be present
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Go to Home")).toBeInTheDocument();
  });

  it("supports different error types", () => {
    render(
      <BrowserRouter>
        <PageErrorBoundary errorType="auth">
          <ThrowError shouldThrow={true} />
        </PageErrorBoundary>
      </BrowserRouter>
    );

    // Should display auth error message
    expect(screen.getByText("Authentication Required")).toBeInTheDocument();
    expect(
      screen.getByText(/Your session has expired/i)
    ).toBeInTheDocument();
  });

  it("logs errors when caught", () => {
    const consoleErrorSpy = vi.spyOn(console, "error");

    render(
      <BrowserRouter>
        <PageErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PageErrorBoundary>
      </BrowserRouter>
    );

    // Should have logged the error
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("renders with full-height container", () => {
    const { container } = render(
      <BrowserRouter>
        <PageErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PageErrorBoundary>
      </BrowserRouter>
    );

    // ErrorFallback should have min-h-[400px] class on outer container
    const errorContainer = container.querySelector(".min-h-\\[400px\\]");
    expect(errorContainer).toBeInTheDocument();
  });
});
