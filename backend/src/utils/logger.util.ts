/**
 * Centralized logging utility for the Quad application
 * Provides different log levels and production-safe logging
 */

import pino from "pino";
import {
  isObject,
  isString,
  isArray,
  isNil,
} from "../guards/typeGuards.js";
import {
  SENSITIVE_FIELDS,
  REDACTED_MARKER,
  MAX_STRING_LENGTH,
  MAX_ARRAY_LENGTH,
  MAX_OBJECT_KEYS,
  type SafeLogObject,
} from "../types/logger.types.js";

class Logger {
  private isProduction: boolean;
  private baseLogger: pino.Logger;
  private serverLogger: pino.Logger;
  private databaseLogger: pino.Logger;
  private socketLogger: pino.Logger;

  /**
   * Recursively sanitizes data for safe logging
   * - Redacts sensitive fields
   * - Truncates long strings
   * - Limits array and object sizes
   * - Handles nested objects safely
   */
  private sanitizeForLogging(data: unknown, depth: number = 0): SafeLogObject | unknown {
    // Prevent excessive recursion
    if (depth > 5) {
      return "[Max depth reached]";
    }

    // Handle null/undefined
    if (isNil(data)) {
      return data;
    }

    // Handle Error objects specially
    if (data instanceof Error) {
      return {
        name: data.name,
        message: this.truncateString(data.message, MAX_STRING_LENGTH),
        ...(this.isProduction ? {} : { stack: data.stack }),
      };
    }

    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Handle RegExp
    if (data instanceof RegExp) {
      return data.toString();
    }

    // Handle strings
    if (isString(data)) {
      return this.truncateString(data, MAX_STRING_LENGTH);
    }

    // Handle numbers, booleans, symbols - return as-is
    if (typeof data !== "object") {
      return data;
    }

    // Handle arrays
    if (isArray(data)) {
      const truncated = data.length > MAX_ARRAY_LENGTH
        ? data.slice(0, MAX_ARRAY_LENGTH)
        : data;
      return {
        data: truncated.map((item) => this.sanitizeForLogging(item, depth + 1)),
        ...(data.length > MAX_ARRAY_LENGTH && { truncated: data.length - MAX_ARRAY_LENGTH }),
      };
    }

    // Handle objects
    if (isObject(data)) {
      return this.sanitizeObject(data, depth);
    }

    // Fallback for any other type
    return { data: String(data) };
  }

  /**
   * Sanitize an object, redacting sensitive fields
   */
  private sanitizeObject(
    obj: Record<string, unknown>,
    depth: number,
  ): SafeLogObject {
    const sanitized: SafeLogObject = {};
    const keys = Object.keys(obj);
    const hasMoreKeys = keys.length > MAX_OBJECT_KEYS;
    const keysToProcess = hasMoreKeys ? keys.slice(0, MAX_OBJECT_KEYS) : keys;

    for (const key of keysToProcess) {
      const normalizedKey = key.toLowerCase().replace(/[_-]/g, "");

      // Check if this is a sensitive field
      const isSensitive = SENSITIVE_FIELDS.has(normalizedKey);

      if (isSensitive) {
        sanitized[key] = REDACTED_MARKER;
      } else {
        const value = obj[key];
        sanitized[key] = this.sanitizeForLogging(value, depth + 1);
      }
    }

    if (hasMoreKeys) {
      sanitized._truncated = keys.length - MAX_OBJECT_KEYS;
    }

    return sanitized;
  }

  /**
   * Truncate a string if it exceeds maximum length
   */
  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "...[truncated]";
  }

  /**
   * Convert data to a safe log object
   */
  private toLogObject(data: unknown): Record<string, unknown> {
    if (isNil(data)) {
      return {};
    }

    const sanitized = this.sanitizeForLogging(data);

    if (isObject(sanitized)) {
      return sanitized;
    }

    return { data: sanitized };
  }

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";

    const level =
      (process.env.LOG_LEVEL as pino.LevelWithSilent | undefined) ||
      (this.isProduction ? "info" : "debug");

    const transport =
      this.isProduction || process.env.NODE_ENV === "test"
        ? undefined
        : pino.transport({
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          });

    this.baseLogger = pino(
      {
        level,
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.headers.set-cookie",
            "headers.authorization",
            "headers.cookie",
            "headers.set-cookie",
            "authorization",
            "cookie",
            "set-cookie",
            "password",
            "currentPassword",
            "newPassword",
            "token",
            "accessToken",
            "refreshToken",
            "idToken",
            "apiKey",
          ],
          censor: "[REDACTED]",
        },
      },
      transport
    );

    this.serverLogger = this.baseLogger.child({ component: "server" });
    this.databaseLogger = this.baseLogger.child({ component: "database" });
    this.socketLogger = this.baseLogger.child({ component: "socket" });
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, data?: unknown): void {
    if (this.isProduction) return;
    this.baseLogger.debug(this.toLogObject(data), message);
  }

  /**
   * Log info messages
   */
  info(message: string, data?: unknown): void {
    this.baseLogger.info(this.toLogObject(data), message);
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: unknown): void {
    this.baseLogger.warn(this.toLogObject(data), message);
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: unknown): void {
    this.baseLogger.error(this.toLogObject(error), message);
  }

  /**
   * Log successful operations (production safe)
   */
  success(message: string, data?: unknown): void {
    if (this.isProduction) return;
    this.baseLogger.info({ ...this.toLogObject(data), event: "success" }, message);
  }

  /**
   * Log server startup messages
   */
  server(message: string): void {
    this.serverLogger.info(message);
  }

  /**
   * Log database operations
   */
  database(message: string, data?: unknown): void {
    if (this.isProduction) return;
    this.databaseLogger.debug(this.toLogObject(data), message);
  }

  /**
   * Log socket events (development only)
   */
  socket(message: string, data?: unknown): void {
    if (this.isProduction) return;
    this.socketLogger.debug(this.toLogObject(data), message);
  }
}

// Export singleton instance
export const logger = new Logger();
