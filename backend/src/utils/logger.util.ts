/**
 * Centralized logging utility for the Quad application
 * Provides different log levels and production-safe logging
 */

import pino from "pino";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private isProduction: boolean;
  private baseLogger: pino.Logger;
  private serverLogger: pino.Logger;
  private databaseLogger: pino.Logger;
  private socketLogger: pino.Logger;

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
  debug(message: string, data?: any): void {
    if (this.isProduction) return;
    this.baseLogger.debug(data ?? {}, message);
  }

  /**
   * Log info messages 
   */
  info(message: string, data?: any): void {
    this.baseLogger.info(data ?? {}, message);
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    this.baseLogger.warn(data ?? {}, message);
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: any): void {
    if (error instanceof Error) {
      this.baseLogger.error({ err: error }, message);
      return;
    }

    this.baseLogger.error(error ?? {}, message);
  }

  /**
   * Log successful operations (production safe)
   */
  success(message: string, data?: any): void {
    if (this.isProduction) return;
    this.baseLogger.info({ ...(data ?? {}), event: "success" }, message);
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
  database(message: string, data?: any): void {
    if (this.isProduction) return;
    this.databaseLogger.debug(data ?? {}, message);
  }

  /**
   * Log socket events (development only)
   */
  socket(message: string, data?: any): void {
    if (this.isProduction) return;
    this.socketLogger.debug(data ?? {}, message);
  }
}

// Export singleton instance
export const logger = new Logger();
