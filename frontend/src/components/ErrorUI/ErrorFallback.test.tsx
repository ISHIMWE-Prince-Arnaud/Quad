/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ErrorFallback } from "./ErrorFallback";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Wrapper component for tests that need Router context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe("ErrorFallback Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe("Error Type Mapping", () => {
    it("displays network error message", () => {
      render(
        <TestWrapper>
          <ErrorFallback errorType="network" />
        </TestWrapper>
      );

      expect(screen.getByText("Connection Problem")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Unable to connect to our servers/i
        )
      ).toBeInTheDocument();
    });

    it("displays auth error message", () => {
      render(
        <TestWrapper>
          <ErrorFallback errorType="auth" />
        </TestWrapper>
      );

      expect(screen.getByText("Authentication Required")).toBeInTheDocument();
      expect(
        screen.getByText(/Your session has expired/i)
      ).toBeInTheDocument();
    });

    it("displays permission error message", () => {
      render(
        <TestWrapper>
          <ErrorFallback errorType="permission" />
        </TestWrapper>
      );

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(
        screen.getByText(/You don't have permission/i)
      ).toBeInTheDocument();
    });

    it("displays not-found error message", () => {
      render(
        <TestWrapper>
          <ErrorFallback errorType="not-found" />
        </TestWrapper>
      );

      expect(screen.getByText("Not Found")).toBeInTheDocument();
      expect(
        screen.getByText(/The content you're looking for doesn't exist/i)
      ).toBeInTheDocument();
    });

    it("displays data-load error message", () => {
      render(
        <TestWrapper>
          <ErrorFallback errorType="data-load" />
        </TestWrapper>
      );

      expect(screen.getByText("Failed to Load Data")).toBeInTheDocument();
      expect(
        screen.getByText(/We couldn't load the requested data/i)
      ).toBeInTheDocument();
    });

    it("displays unknown error message by default", () => {
      render(
        <TestWrapper>
          <ErrorFallback />
        </TestWrapper>
      );

      expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
      expect(
        screen.getByText(/We encountered an unexpected error/i)
      ).toBeInTheDocument();
    });

    it("displays unknown error message when errorType is unknown", () => {
      render(
        <TestWrapper>
          <ErrorFallback errorType="unknown" />
        </TestWrapper>
      );

      expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
      expect(
        screen.getByText(/We encountered an unexpected error/i)
      ).toBeInTheDocument();
    });
  });

  describe("Custom Message Override", () => {
    it("overrides heading with custom heading", () => {
      render(
        <TestWrapper>
          <ErrorFallback
            errorType="network"
            customHeading="Custom Error Title"
          />
        </TestWrapper>
      );

      expect(screen.getByText("Custom Error Title")).toBeInTheDocument();
      expect(screen.queryByText("Connection Problem")).not.toBeInTheDocument();
    });

    it("overrides description with custom description", () => {
      render(
        <TestWrapper>
          <ErrorFallback
            errorType="network"
            customDescription="This is a custom error description."
          />
        </TestWrapper>
      );

      expect(
        screen.getByText("This is a custom error description.")
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Unable to connect to our servers/i)
      ).not.toBeInTheDocument();
    });

    it("overrides both heading and description", () => {
      render(
        <TestWrapper>
          <ErrorFallback
            errorType="auth"
            customHeading="Custom Title"
            customDescription="Custom description text."
          />
        </TestWrapper>
      );

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Custom description text.")).toBeInTheDocument();
      expect(
        screen.queryByText("Authentication Required")
      ).not.toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("renders Try Again button when resetErrorBoundary is provided", () => {
      const mockReset = vi.fn();
      render(
        <TestWrapper>
          <ErrorFallback resetErrorBoundary={mockReset} />
        </TestWrapper>
      );

      const tryAgainButton = screen.getByRole("button", { name: "Try Again" });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it("does not render Try Again button when resetErrorBoundary is not provided", () => {
      render(
        <TestWrapper>
          <ErrorFallback />
        </TestWrapper>
      );

      expect(
        screen.queryByRole("button", { name: "Try Again" })
      ).not.toBeInTheDocument();
    });

    it("always renders Go to Home button", () => {
      render(
        <TestWrapper>
          <ErrorFallback />
        </TestWrapper>
      );

      const goHomeButton = screen.getByRole("button", { name: "Go to Home" });
      expect(goHomeButton).toBeInTheDocument();
    });

    it("calls resetErrorBoundary when Try Again is clicked", () => {
      const mockReset = vi.fn();
      render(
        <TestWrapper>
          <ErrorFallback resetErrorBoundary={mockReset} />
        </TestWrapper>
      );

      const tryAgainButton = screen.getByRole("button", { name: "Try Again" });
      fireEvent.click(tryAgainButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("navigates to home when Go to Home is clicked", () => {
      render(
        <TestWrapper>
          <ErrorFallback />
        </TestWrapper>
      );

      const goHomeButton = screen.getByRole("button", { name: "Go to Home" });
      fireEvent.click(goHomeButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("handles resetErrorBoundary errors gracefully", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockReset = vi.fn(() => {
        throw new Error("Reset failed");
      });

      render(
        <TestWrapper>
          <ErrorFallback resetErrorBoundary={mockReset} />
        </TestWrapper>
      );

      const tryAgainButton = screen.getByRole("button", { name: "Try Again" });
      
      // Should not throw
      expect(() => fireEvent.click(tryAgainButton)).not.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error during boundary reset:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("uses window.location fallback when navigation fails", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const originalLocation = window.location;
      
      // Mock navigate to throw error
      mockNavigate.mockImplementation(() => {
        throw new Error("Navigation failed");
      });

      // Mock window.location
      delete (window as any).location;
      window.location = { ...originalLocation, href: "" } as Location;

      render(
        <TestWrapper>
          <ErrorFallback />
        </TestWrapper>
      );

      const goHomeButton = screen.getByRole("button", { name: "Go to Home" });
      fireEvent.click(goHomeButton);

      expect(window.location.href).toBe("/");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Navigation error, using fallback:",
        expect.any(Error)
      );

      // Restore
      window.location = originalLocation;
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Error Information Extraction", () => {
    it("does not display error details by default", () => {
      const error = new Error("Test error message");
      render(
        <TestWrapper>
          <ErrorFallback error={error} />
        </TestWrapper>
      );

      expect(screen.queryByText("Error Details")).not.toBeInTheDocument();
    });

    it("displays error details in development mode when showDetails is true", () => {
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const error = new Error("Test error message");
      render(
        <TestWrapper>
          <ErrorFallback error={error} showDetails={true} />
        </TestWrapper>
      );

      expect(
        screen.getByText("Error Details (Development Only)")
      ).toBeInTheDocument();

      (import.meta.env as any).DEV = originalEnv;
    });

    it("sanitizes error messages to prevent XSS", () => {
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const error = new Error("<script>alert('xss')</script>");
      const { container } = render(
        <TestWrapper>
          <ErrorFallback error={error} showDetails={true} />
        </TestWrapper>
      );

      // Should not contain actual script tag
      expect(container.innerHTML).not.toContain("<script>");
      // Should contain sanitized version
      expect(container.innerHTML).toContain("&lt;script&gt;");

      (import.meta.env as any).DEV = originalEnv;
    });

    it("limits error message length to 500 characters", () => {
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const longMessage = "a".repeat(600);
      const error = new Error(longMessage);
      
      render(
        <TestWrapper>
          <ErrorFallback error={error} showDetails={true} />
        </TestWrapper>
      );

      const details = screen.getByText(/^a+$/);
      expect(details.textContent?.length).toBeLessThanOrEqual(500);

      (import.meta.env as any).DEV = originalEnv;
    });

    it("handles error without message", () => {
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const error = new Error();
      render(
        <TestWrapper>
          <ErrorFallback error={error} showDetails={true} />
        </TestWrapper>
      );

      // Should not crash and should show details section
      expect(
        screen.getByText("Error Details (Development Only)")
      ).toBeInTheDocument();

      (import.meta.env as any).DEV = originalEnv;
    });

    it("handles undefined error", () => {
      render(
        <TestWrapper>
          <ErrorFallback error={undefined} showDetails={true} />
        </TestWrapper>
      );

      // Should not crash
      expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
    });
  });

  describe("Layout and Structure", () => {
    it("renders with proper container structure", () => {
      const { container } = render(
        <TestWrapper>
          <ErrorFallback />
        </TestWrapper>
      );

      const wrapper = container.querySelector(".min-h-\\[400px\\]");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
    });

    it("renders with max-width constraint", () => {
      const { container } = render(
        <TestWrapper>
          <ErrorFallback />
        </TestWrapper>
      );

      const contentWrapper = container.querySelector(".max-w-md");
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe("Integration with ErrorUI", () => {
    it("passes correct props to ErrorUI component", () => {
      render(
        <TestWrapper>
          <ErrorFallback
            errorType="network"
            resetErrorBoundary={vi.fn()}
          />
        </TestWrapper>
      );

      // Verify ErrorUI is rendered with correct content
      expect(screen.getByText("Connection Problem")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to Home" })).toBeInTheDocument();
    });
  });
});
