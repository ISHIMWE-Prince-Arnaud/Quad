import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@/components/ui/error-message";
import { sanitizeInput } from "@/lib/security/sanitize";

/**
 * ErrorFallback Component
 * 
 * Integrates ErrorUI with React error boundaries. Maps error types to appropriate messages
 * and provides standard actions ("Try Again" and "Go to Home").
 * 
 * @example
 * ```tsx
 * <ErrorFallback
 *   error={error}
 *   resetErrorBoundary={reset}
 *   errorType="network"
 * />
 * ```
 */

export type ErrorType =
  | "network"
  | "auth"
  | "permission"
  | "not-found"
  | "data-load"
  | "unknown";

interface ErrorFallbackProps {
  /** The error object caught by the error boundary */
  error?: Error;
  /** Function to reset the error boundary and retry */
  resetErrorBoundary?: () => void;
  /** Type of error to display appropriate messaging */
  errorType?: ErrorType;
  /** Custom heading to override default error type heading */
  customHeading?: string;
  /** Custom description to override default error type description */
  customDescription?: string;
  /** Whether to show error details in development mode */
  showDetails?: boolean;
}

const ERROR_MESSAGES: Record<
  ErrorType,
  { heading: string; description: string }
> = {
  network: {
    heading: "Connection Problem",
    description:
      "Unable to connect to our servers. Please check your internet connection and try again.",
  },
  auth: {
    heading: "Authentication Required",
    description: "Your session has expired. Please sign in again to continue.",
  },
  permission: {
    heading: "Access Denied",
    description: "You don't have permission to access this resource.",
  },
  "not-found": {
    heading: "Not Found",
    description:
      "The content you're looking for doesn't exist or may have been removed.",
  },
  "data-load": {
    heading: "Failed to Load Data",
    description: "We couldn't load the requested data. Please try again.",
  },
  unknown: {
    heading: "Something Went Wrong",
    description:
      "We encountered an unexpected error. Please try again or contact support if the problem persists.",
  },
};

/**
 * Sanitizes error messages to prevent XSS attacks
 */
function sanitizeErrorMessage(message: string): string {
  if (!message) return "";
  
  // Remove HTML tags and dangerous characters
  const sanitized = sanitizeInput(message);
  
  // Limit length to prevent UI issues
  return sanitized.substring(0, 500);
}

/**
 * Extracts meaningful error message from Error object
 */
function extractErrorMessage(error?: Error): string {
  if (!error) return "";
  
  const message = error.message || "An unknown error occurred";
  return sanitizeErrorMessage(message);
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  errorType = "unknown",
  customHeading,
  customDescription,
  showDetails = false,
}: ErrorFallbackProps) {
  const navigate = useNavigate();

  // Get error messages from type or use custom overrides
  const errorConfig = ERROR_MESSAGES[errorType];
  const heading = customHeading || errorConfig.heading;
  const description = customDescription || errorConfig.description;

  // Handle "Try Again" action
  const handleTryAgain = () => {
    if (resetErrorBoundary) {
      try {
        resetErrorBoundary();
      } catch (resetError) {
        console.error("Error during boundary reset:", resetError);
        // Don't reset state, keep showing error
      }
    }
  };

  // Handle "Go to Home" action with navigation fallback
  const handleGoHome = () => {
    try {
      navigate("/");
    } catch (navError) {
      // Fallback to window.location if React Router fails
      console.error("Navigation error, using fallback:", navError);
      window.location.href = "/";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="w-full max-w-md">
        <ErrorMessage
          title={heading}
          description={description}
          onRetry={resetErrorBoundary ? handleTryAgain : undefined}
          onGoHome={handleGoHome}
          showRetry={!!resetErrorBoundary}
          showGoHome={true}
          variant="default"
        />

        {/* Development mode error details */}
        {import.meta.env.DEV && showDetails && error && (
          <details className="mt-6 p-4 bg-muted rounded-lg text-sm">
            <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
              Error Details (Development Only)
            </summary>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Message:
                </p>
                <pre className="text-xs overflow-auto bg-background p-2 rounded border border-border">
                  {extractErrorMessage(error)}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Stack Trace:
                  </p>
                  <pre className="text-xs overflow-auto bg-background p-2 rounded border border-border opacity-70 max-h-48">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
