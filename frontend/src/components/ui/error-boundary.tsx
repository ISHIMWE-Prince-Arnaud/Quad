import React from "react";
import { ErrorMessage } from "@/components/ui/error-message";
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
      <div className="w-full max-w-md">
        <ErrorMessage
          description="We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists."
          onRetry={resetErrorBoundary}
        />
        
        {import.meta.env.DEV && error && (
          <details className="mt-6 p-4 bg-muted rounded-lg text-sm">
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
      </div>
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
      <div className="max-w-md mx-auto">
        <ErrorMessage
          title="Page Error"
          description="This page encountered an error and couldn't be displayed properly."
          onRetry={resetErrorBoundary}
          retryLabel="Reload Page"
          showGoHome={false}
        />

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
      <ErrorMessage
        title={componentName ? `${componentName} Error` : "Component Error"}
        description="This component failed to load properly."
        onRetry={resetErrorBoundary}
        retryLabel="Retry"
        showGoHome={false}
        className="min-h-0"
      />
    </div>
  );
}
