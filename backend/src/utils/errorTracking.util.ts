/**
 * Error Tracking Utility
 * Integrates with Sentry or similar error tracking service for backend
 */

import { env } from "../config/env.config.js";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "./logger.util.js";

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
  private Sentry: unknown = null;

  private getSentry(): {
    init: (options: Record<string, unknown>) => void;
    httpIntegration: () => unknown;
    expressIntegration: () => unknown;
    mongooseIntegration: () => unknown;
    Handlers: {
      requestHandler: () => RequestHandler;
      errorHandler: () => ErrorRequestHandler;
    };
    setUser: (user: UserContext | null) => void;
    captureException: (error: Error, context?: { extra?: ErrorContext }) => void;
    captureMessage: (message: string, context?: { level: string; extra?: ErrorContext }) => void;
    addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
    setContext: (name: string, context: ErrorContext) => void;
  } | null {
    if (!this.Sentry) return null;
    return this.Sentry as {
      init: (options: Record<string, unknown>) => void;
      httpIntegration: () => unknown;
      expressIntegration: () => unknown;
      mongooseIntegration: () => unknown;
      Handlers: {
        requestHandler: () => RequestHandler;
        errorHandler: () => ErrorRequestHandler;
      };
      setUser: (user: UserContext | null) => void;
      captureException: (error: Error, context?: { extra?: ErrorContext }) => void;
      captureMessage: (
        message: string,
        context?: { level: string; extra?: ErrorContext }
      ) => void;
      addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
      setContext: (name: string, context: ErrorContext) => void;
    };
  }

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
      logger.info(
        "[ErrorTracking] Skipping initialization (disabled or already initialized)"
      );
      return;
    }

    try {
      // Dynamically import Sentry only in production
      this.Sentry = await import("@sentry/node");

      const sentry = this.getSentry();
      if (!sentry) {
        logger.warn("[ErrorTracking] Sentry import returned empty module");
        return;
      }

      sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        integrations: [
          sentry.httpIntegration(),
          sentry.expressIntegration(),
          sentry.mongooseIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 0.1, // 10% of transactions
        // Release tracking
        release: process.env.npm_package_version,
        // Filter sensitive data
        beforeSend(event: Record<string, unknown>) {
          // Remove sensitive data from event
          const request = event.request;
          if (request && typeof request === "object") {
            const requestObj = request as Record<string, unknown>;

            if ("cookies" in requestObj) {
              delete requestObj.cookies;
            }

            const headers = requestObj.headers;
            if (headers && typeof headers === "object") {
              const headersObj = headers as Record<string, unknown>;
              delete headersObj.authorization;
              delete headersObj.cookie;
            }
          }
          return event;
        },
      });

      this.initialized = true;
      logger.info("[ErrorTracking] Initialized successfully");
    } catch (error: unknown) {
      logger.error("[ErrorTracking] Failed to initialize:", error);
    }
  }

  /**
   * Get Sentry request handler middleware
   */
  getRequestHandler(): RequestHandler {
    const sentry = this.getSentry();
    if (!this.config.enabled || !sentry) {
      return (_req, _res, next) => next();
    }
    return sentry.Handlers.requestHandler();
  }

  /**
   * Get Sentry error handler middleware
   */
  getErrorHandler(): ErrorRequestHandler {
    const sentry = this.getSentry();
    if (!this.config.enabled || !sentry) {
      return (_err, _req, _res, next) => next();
    }
    return sentry.Handlers.errorHandler();
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: UserContext | null): void {
    const sentry = this.getSentry();
    if (!this.config.enabled || !sentry) return;

    sentry.setUser(user);
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    const sentry = this.getSentry();
    if (!this.config.enabled || !sentry) {
      logger.error("[ErrorTracking] Exception", { error, context });
      return;
    }

    sentry.captureException(error, context ? { extra: context } : {});
  }

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: ErrorContext
  ): void {
    const sentry = this.getSentry();
    if (!this.config.enabled || !sentry) {
      if (level === "error") {
        logger.error(`[ErrorTracking] ${level.toUpperCase()}: ${message}`, context);
      } else if (level === "warning") {
        logger.warn(`[ErrorTracking] ${level.toUpperCase()}: ${message}`, context);
      } else {
        logger.info(`[ErrorTracking] ${level.toUpperCase()}: ${message}`, context);
      }
      return;
    }

    sentry.captureMessage(message, context ? { level, extra: context } : { level });
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: ErrorContext): void {
    const sentry = this.getSentry();
    if (!this.config.enabled || !sentry) return;

    sentry.addBreadcrumb({
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
    const sentry = this.getSentry();
    if (!this.config.enabled || !sentry) return;

    sentry.setContext(name, context);
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
