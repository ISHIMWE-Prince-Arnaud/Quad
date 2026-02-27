import {
  PiWarningCircleBold,
  PiHouseBold,
  PiArrowsClockwiseBold,
} from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <PiWarningCircleBold className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{description}</p>

          {showDetails && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Error Details
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <pre className="text-xs overflow-auto">{error.message}</pre>
                {import.meta.env.DEV && error.stack && (
                  <pre className="text-xs mt-2 opacity-70 overflow-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            {resetErrorBoundary && (
              <Button onClick={resetErrorBoundary} className="flex-1 gap-2">
                <PiArrowsClockwiseBold className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/app/feed")}
              className="flex-1 gap-2">
              <PiHouseBold className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
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
    <ErrorFallback
      title="Connection Problem"
      description="Unable to connect to our servers. Please check your internet connection and try again."
      resetErrorBoundary={resetErrorBoundary}
    />
  );
}

// Specialized error fallback for not found errors
export function NotFoundFallback() {
  return (
    <ErrorFallback
      title="Page Not Found"
      description="The page you're looking for doesn't exist or may have been moved."
    />
  );
}
