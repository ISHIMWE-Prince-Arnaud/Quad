import React from "react";
import {
  PiWarningCircleBold,
  PiArrowsClockwiseBold,
  PiHouseBold,
} from "react-icons/pi";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { logError, showErrorToast } from "@/lib/errorHandling";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    resetErrorBoundary: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      component: "ErrorBoundary",
      action: "componentDidCatch",
      metadata: { componentStack: errorInfo.componentStack },
    });

    showErrorToast(error);
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary: () => void;
}

export function DefaultErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <PiWarningCircleBold className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            We encountered an unexpected error. Please try refreshing the page
            or contact support if the problem persists.
          </p>

          {import.meta.env.DEV && error && (
            <details className="p-4 bg-muted rounded-lg text-sm">
              <summary className="cursor-pointer font-medium">
                Error Details
              </summary>
              <pre className="mt-2 overflow-auto text-xs">
                {error.message}
                {error.stack && (
                  <>
                    <br />
                    <br />
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={resetErrorBoundary} className="w-full">
              <PiArrowsClockwiseBold className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="w-full">
              <PiHouseBold className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specialized error boundaries for different contexts

export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={PageErrorFallback}
      onError={(error, errorInfo) => {
        // Log to error reporting service
        logError(error, {
          component: "PageErrorBoundary",
          action: "onError",
          metadata: { componentStack: errorInfo.componentStack },
        });
      }}>
      {children}
    </ErrorBoundary>
  );
}

function PageErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <PiWarningCircleBold className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Page Error</h1>
          <p className="text-muted-foreground">
            This page encountered an error and couldn't be displayed properly.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={resetErrorBoundary} size="lg" className="w-full">
            <PiArrowsClockwiseBold className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full">
            Go Back
          </Button>
        </div>

        {import.meta.env.DEV && (
          <details className="mt-6 p-4 bg-muted rounded-lg text-left text-sm">
            <summary className="cursor-pointer">Development Info</summary>
            <pre className="mt-2 overflow-auto text-xs">
              {error?.message}
              {error?.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export function ComponentErrorBoundary({
  children,
  componentName,
}: {
  children: React.ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={(props) => (
        <ComponentErrorFallback {...props} componentName={componentName} />
      )}>
      {children}
    </ErrorBoundary>
  );
}

function ComponentErrorFallback({
  resetErrorBoundary,
  componentName,
}: Omit<ErrorFallbackProps, "error"> & { componentName?: string }) {
  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <div className="text-center">
        <PiWarningCircleBold className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="font-medium mb-2">
          {componentName ? `${componentName} Error` : "Component Error"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          This component failed to load properly.
        </p>
        <Button size="sm" onClick={resetErrorBoundary}>
          <PiArrowsClockwiseBold className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    </div>
  );
}
