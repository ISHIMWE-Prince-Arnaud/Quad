import { ErrorMessage } from "@/components/ui/error-message";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = "Something went wrong",
  description = "We're sorry, but something unexpected happened. Please try again.",
  showDetails = false,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="w-full max-w-md">
        <ErrorMessage
          title={title}
          description={description}
          onRetry={resetErrorBoundary}
          showRetry={!!resetErrorBoundary}
        />
        
        {showDetails && error && (
          <details className="mt-4 p-4 bg-muted rounded-md">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Error Details
            </summary>
            <div className="mt-2">
              <pre className="text-xs overflow-auto">{error.message}</pre>
              {import.meta.env.DEV && error.stack && (
                <pre className="text-xs mt-2 opacity-70 overflow-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

// Specialized error fallback for network errors
export function NetworkErrorFallback({
  resetErrorBoundary,
}: {
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="w-full max-w-md">
        <ErrorMessage
          variant="network"
          description=""
          onRetry={resetErrorBoundary}
          showRetry={!!resetErrorBoundary}
        />
      </div>
    </div>
  );
}

// Specialized error fallback for not found errors
export function NotFoundFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="w-full max-w-md">
        <ErrorMessage
          variant="not-found"
          description=""
          showRetry={false}
        />
      </div>
    </div>
  );
}


