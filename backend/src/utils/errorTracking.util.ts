/**
 * Error Tracking Utility
 * Integrates with Sentry or similar error tracking service for backend
 */

import { env } from "../config/env.config.js";

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
  private Sentry: any = null;

  constructor() {
    const dsn = env.SENTRY_DSN;
    const environment = env.SENTRY_ENVIRONMENT || env.NODE_ENV;

    this.config = {
      ...(dsn ? { dsn } : {}),
      ...(environment ? { environment } : {}),
      enabled: env.NODE_ENV === "production" && !!dsn,
    };
  }

  /**
   * Initialize error tracking
   * Call this once at server startup
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
      this.Sentry = await import("@sentry/node");

      this.Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        integrations: [
          this.Sentry.httpIntegration(),
          this.Sentry.expressIntegration(),
          this.Sentry.mongooseIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 0.1, // 10% of transactions
        // Release tracking
        release: process.env.npm_package_version,
        // Filter sensitive data
        beforeSend(event: any) {
          // Remove sensitive data from event
          if (event.request?.cookies) {
            delete event.request.cookies;
          }
          if (event.request?.headers) {
            delete event.request.headers["authorization"];
            delete event.request.headers["cookie"];
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
   * Get Sentry request handler middleware
   */
  getRequestHandler() {
    if (!this.config.enabled || !this.Sentry) {
      return (_req: any, _res: any, next: any) => next();
    }
    return this.Sentry.Handlers.requestHandler();
  }

  /**
   * Get Sentry error handler middleware
   */
  getErrorHandler() {
    if (!this.config.enabled || !this.Sentry) {
      return (_err: any, _req: any, _res: any, next: any) => next();
    }
    return this.Sentry.Handlers.errorHandler();
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: UserContext | null): void {
    if (!this.config.enabled || !this.Sentry) return;

    if (user) {
      this.Sentry.setUser({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } else {
      this.Sentry.setUser(null);
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.config.enabled || !this.Sentry) {
      console.error("[ErrorTracking] Exception:", error, context);
      return;
    }

    this.Sentry.captureException(error, {
      extra: context,
    });
  }

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: ErrorContext
  ): void {
    if (!this.config.enabled || !this.Sentry) {
      console.log(`[ErrorTracking] ${level.toUpperCase()}:`, message, context);
      return;
    }

    this.Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: ErrorContext): void {
    if (!this.config.enabled || !this.Sentry) return;

    this.Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: "info",
    });
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: ErrorContext): void {
    if (!this.config.enabled || !this.Sentry) return;

    this.Sentry.setContext(name, context);
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
