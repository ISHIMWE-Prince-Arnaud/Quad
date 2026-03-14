import { ErrorBoundary } from "./ErrorBoundary";
import type { ErrorType } from "./ErrorFallback";
import { ErrorMessage } from "@/components/ui/error-message";
/**
 * ComponentErrorBoundary Component
 * 
 * A specialized error boundary variant for component-level errors.
 * Wraps individual components with a compact error display that adapts to the component's layout.
 * 
 * Unlike PageErrorBoundary, this uses a compact container with border and may hide
 * the "Go to Home" button for inline errors to maintain better visual integration.
 * 
 * @example
 * ```tsx
 * <ComponentErrorBoundary componentName="UserProfile" errorType="data-load">
 *   <UserProfileCard />
 * </ComponentErrorBoundary>
 * ```
 * 
 * @example Without "Go to Home" button
 * ```tsx
 * <ComponentErrorBoundary 
 *   componentName="CommentList" 
 *   errorType="network"
 *   showGoHome={false}
 * >
 *   <CommentList />
 * </ComponentErrorBoundary>
 * ```
 */

export interface ComponentErrorBoundaryProps {
  /** Child components to render (typically a single component) */
  children: React.ReactNode;
  /** Name of the component for contextual error messages */
  componentName?: string;
  /** Type of error for appropriate messaging (defaults to "unknown") */
  errorType?: ErrorType;
  /** Whether to show "Go to Home" button (defaults to true) */
  showGoHome?: boolean;
}

/**
 * Custom fallback component for component-level errors
 * Uses compact layout with border instead of full-page display
 */
function ComponentErrorFallback({
  resetErrorBoundary,
  componentName,
  errorType = "unknown",
  showGoHome = true,
}: {
  error?: Error;
  resetErrorBoundary: () => void;
  componentName?: string;
  errorType?: ErrorType;
  showGoHome?: boolean;
}) {
  // Error message mapping for component-level errors
  const ERROR_MESSAGES: Record<
    ErrorType,
    { heading: string; description: string }
  > = {
    network: {
      heading: "Connection Problem",
      description: "Unable to load this component. Please check your connection.",
    },
    auth: {
      heading: "Authentication Required",
      description: "Please sign in to view this content.",
    },
    permission: {
      heading: "Access Denied",
      description: "You don't have permission to view this component.",
    },
    "not-found": {
      heading: "Not Found",
      description: "This content doesn't exist or may have been removed.",
    },
    "data-load": {
      heading: "Failed to Load",
      description: "We couldn't load this component. Please try again.",
    },
    unknown: {
      heading: "Something Went Wrong",
      description: "This component encountered an error. Please try again.",
    },
  };

  const errorConfig = ERROR_MESSAGES[errorType];
  
  // Add component name to heading if provided
  const heading = componentName 
    ? `${errorConfig.heading} in ${componentName}`
    : errorConfig.heading;

  return (
    <div className="border border-border rounded-lg p-6 bg-background">
      <ErrorMessage
        title={heading}
        description={errorConfig.description}
        onRetry={resetErrorBoundary}
        onGoHome={showGoHome ? () => {
          try {
            window.location.href = "/";
          } catch (navError) {
            console.error("Navigation error:", navError);
          }
        } : undefined}
        showRetry={true}
        showGoHome={showGoHome}
        variant="default" // Using default, but network/not-found could be mapped based on errorType
      />
    </div>
  );
}

/**
 * Logs component-level errors
 * Less verbose than page-level errors since these are expected to be more common
 */
function logComponentError(
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName?: string
): void {
  if (import.meta.env.DEV) {
    console.error(`Component Error${componentName ? ` in ${componentName}` : ""}:`, {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
    });
  }
}

export function ComponentErrorBoundary({
  children,
  componentName,
  errorType = "unknown",
  showGoHome = true,
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      errorType={errorType}
      onError={(error, errorInfo) => logComponentError(error, errorInfo, componentName)}
      fallback={({ error, resetErrorBoundary }) => (
        <ComponentErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          componentName={componentName}
          errorType={errorType}
          showGoHome={showGoHome}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
