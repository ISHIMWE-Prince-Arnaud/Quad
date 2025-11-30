/**
 * Error Tracking Integration
 * Integrates with Sentry or similar error tracking service
 */

import { env, isProduction } from "./envValidation";

interface ErrorTrackingConfig {
  dsn?: string;
  environment?: string;
  enabled: boolean;
}

interface UserContext {
  id: string;
  username?: string;
  email?: string;
}

interface ErrorContext {
  [key: string]: unknown;
}

class ErrorTracker {
  private config: ErrorTrackingConfig;
  private initialized = false;

  constructor() {
    this.config = {
      dsn: env.sentryDsn,
      environment: env.sentryEnvironment || env.nodeEnv,
      enabled: isProduction && !!env.sentryDsn,
    };
  }

  /**
   * Initialize error tracking
   * Call this once at app startup
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled || this.initialized) {
      console.log(
        "[ErrorTracking] Skipping initialization (disabled or already initialized)"
      );
      return;
    }

    try {
      // Dynamically import Sentry only in production
      const Sentry = await import("@sentry/react");

      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        // Performance Monitoring
        tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev
        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
        // Release tracking
        release: import.meta.env.VITE_APP_VERSION,
        // Ignore common errors
        ignoreErrors: [
          "ResizeObserver loop limit exceeded",
          "Non-Error promise rejection captured",
          "Network request failed",
        ],
        // Filter sensitive data
        beforeSend(event) {
          // Remove sensitive data from event
          if (event.request?.cookies) {
            delete event.request.cookies;
          }
          if (event.request?.headers) {
            delete event.request.headers["Authorization"];
            delete event.request.headers["Cookie"];
          }
          return event;
        },
      });

      this.initialized = true;
      console.log("[ErrorTracking] Initialized successfully");
    } catch (error) {
      console.error("[ErrorTracking] Failed to initialize:", error);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: UserContext | null): void {
    if (!this.config.enabled) return;

    import("@sentry/react")
      .then((Sentry) => {
        if (user) {
          Sentry.setUser({
            id: user.id,
            username: user.username,
            email: user.email,
          });
        } else {
          Sentry.setUser(null);
        }
      })
      .catch(console.error);
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.config.enabled) {
      console.error("[ErrorTracking] Exception:", error, context);
      return;
    }

    import("@sentry/react")
      .then((Sentry) => {
        Sentry.captureException(error, {
          extra: context,
        });
      })
      .catch(console.error);
  }

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: ErrorContext
  ): void {
    if (!this.config.enabled) {
      console.log(`[ErrorTracking] ${level.toUpperCase()}:`, message, context);
      return;
    }

    import("@sentry/react")
      .then((Sentry) => {
        Sentry.captureMessage(message, {
          level,
          extra: context,
        });
      })
      .catch(console.error);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: ErrorContext): void {
    if (!this.config.enabled) return;

    import("@sentry/react")
      .then((Sentry) => {
        Sentry.addBreadcrumb({
          message,
          category,
          data,
          level: "info",
        });
      })
      .catch(console.error);
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: ErrorContext): void {
    if (!this.config.enabled) return;

    import("@sentry/react")
      .then((Sentry) => {
        Sentry.setContext(name, context);
      })
      .catch(console.error);
  }

  /**
   * Check if error tracking is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Export Sentry for advanced usage (e.g., ErrorBoundary)
export const getSentry = async () => {
  if (!errorTracker.isEnabled()) {
    return null;
  }
  try {
    return await import("@sentry/react");
  } catch {
    return null;
  }
};
