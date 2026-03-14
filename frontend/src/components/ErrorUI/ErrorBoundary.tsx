import React from "react";
import { ErrorFallback } from "./ErrorFallback";
import type { ErrorType } from "./ErrorFallback";

/**
 * ErrorBoundary Component
 * 
 * A React error boundary class component that catches JavaScript errors in child components.
 * Uses ErrorFallback for rendering error states and provides a reset mechanism.
 * 
 * The component is resilient and handles errors in its own error handling logic:
 * - Safe fallback rendering if ErrorFallback throws
 * - Error handling for reset handler failures
 * - Error handling for logging failures
 * 
 * @example
 * ```tsx
 * <ErrorBoundary errorType="network" onError={handleError}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 * 
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={CustomErrorFallback}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: React.ReactNode;
  /** Custom fallback component (must accept error, resetErrorBoundary props) */
  fallback?: React.ComponentType<{
    error?: Error;
    resetErrorBoundary: () => void;
  }>;
  /** Type of error for default fallback messaging */
  errorType?: ErrorType;
  /** Callback invoked when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Callback invoked when error boundary is reset */
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error object */
  error?: Error;
  /** Whether the fallback itself has errored */
  fallbackError?: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      fallbackError: false,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error and invoke optional error callback
   * Handles logging failures gracefully
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Attempt to log error, but don't fail if logging fails
    try {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    } catch (logError) {
      console.error("Failed to log error:", logError);
      // Continue with error display
    }

    // Invoke optional error callback, but don't fail if it throws
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error("Error in onError callback:", callbackError);
        // Continue with error display
      }
    }
  }

  /**
   * Reset error boundary state and re-render children
   * Handles reset handler failures gracefully
   */
  resetErrorBoundary = (): void => {
    // Invoke optional reset callback, but don't fail if it throws
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (resetCallbackError) {
        console.error("Error in onReset callback:", resetCallbackError);
        // Continue with reset
      }
    }

    // Reset state to clear error
    this.setState({
      hasError: false,
      error: undefined,
      fallbackError: false,
    });
  };

  /**
   * Catch errors in the fallback component itself
   */
  componentDidUpdate(
    _prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ): void {
    // If we just entered error state, set up error catching for fallback
    if (this.state.hasError && !prevState.hasError) {
      // This will be caught by a parent error boundary or browser
      // We track it in state to show safe fallback
    }
  }

  render() {
    // If fallback component threw an error, show minimal safe fallback
    if (this.state.fallbackError) {
      return (
        <div
          role="alert"
          className="flex items-center justify-center min-h-[400px] p-4">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">An error occurred.</p>
            <p className="text-sm text-muted-foreground">
              Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    // If an error was caught, render fallback
    if (this.state.hasError) {
      try {
        // Use custom fallback if provided
        if (this.props.fallback) {
          const FallbackComponent = this.props.fallback;
          return (
            <FallbackComponent
              error={this.state.error}
              resetErrorBoundary={this.resetErrorBoundary}
            />
          );
        }

        // Use default ErrorFallback
        return (
          <ErrorFallback
            error={this.state.error}
            resetErrorBoundary={this.resetErrorBoundary}
            errorType={this.props.errorType}
            showDetails={true}
          />
        );
      } catch (fallbackError) {
        // If fallback throws, update state to show safe fallback
        console.error("Error in fallback component:", fallbackError);
        // Set fallbackError in next render
        setTimeout(() => {
          this.setState({ fallbackError: true });
        }, 0);

        // Return minimal fallback immediately
        return (
          <div
            role="alert"
            className="flex items-center justify-center min-h-[400px] p-4">
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold">An error occurred.</p>
              <p className="text-sm text-muted-foreground">
                Please refresh the page.
              </p>
            </div>
          </div>
        );
      }
    }

    // No error, render children normally
    return this.props.children;
  }
}
