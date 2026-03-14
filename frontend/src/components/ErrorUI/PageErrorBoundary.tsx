import { ErrorBoundary } from "./ErrorBoundary";
import type { ErrorType } from "./ErrorFallback";

/**
 * PageErrorBoundary Component
 * 
 * A specialized error boundary variant for page-level errors.
 * Wraps the ErrorBoundary component with page-specific configuration including:
 * - Full-height container (min-h-[400px])
 * - Error logging to error reporting service
 * - Both action buttons ("Try Again" and "Go to Home")
 * 
 * Use this component to wrap entire page content to catch and display
 * page-level errors with consistent styling and behavior.
 * 
 * @example
 * ```tsx
 * <PageErrorBoundary errorType="network">
 *   <HomePage />
 * </PageErrorBoundary>
 * ```
 * 
 * @example With custom error type
 * ```tsx
 * <PageErrorBoundary errorType="data-load">
 *   <ProfilePage />
 * </PageErrorBoundary>
 * ```
 */

export interface PageErrorBoundaryProps {
  /** Child components to render (typically page content) */
  children: React.ReactNode;
  /** Type of error for appropriate messaging (defaults to "unknown") */
  errorType?: ErrorType;
}

/**
 * Logs error to error reporting service
 * In production, this would send to a service like Sentry, LogRocket, etc.
 */
function logErrorToService(error: Error, errorInfo: React.ErrorInfo): void {
  // In development, just log to console
  if (import.meta.env.DEV) {
    console.error("Page Error:", {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // In production, send to error reporting service
  try {
    // TODO: Integrate with actual error reporting service (e.g., Sentry)
    // Example:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
    
    console.error("Page Error (would be sent to error service):", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  } catch (loggingError) {
    // Fail silently if logging fails
    console.error("Failed to log error to service:", loggingError);
  }
}

export function PageErrorBoundary({
  children,
  errorType = "unknown",
}: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      errorType={errorType}
      onError={logErrorToService}>
      {children}
    </ErrorBoundary>
  );
}
