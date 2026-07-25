/**
 * Type definitions for logger module
 * Ensures type-safe logging with proper sanitization
 */

/**
 * Log level types supported by the logger
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

/**
 * Component identifiers for contextual logging
 */
export type LogComponent = "server" | "database" | "socket" | "default";

/**
 * Safe log object structure after sanitization
 * All sensitive data has been redacted
 */
export interface SafeLogObject {
  [key: string]: unknown;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

/**
 * Redacted field indicator
 */
export const REDACTED_MARKER = "[REDACTED]";

/**
 * Set of sensitive field names that should be redacted
 */
export const SENSITIVE_FIELDS = new Set([
  // Authentication tokens
  "password",
  "token",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "apikey",
  "secret",
  "secretkey",
  "privatekey",
  // Headers
  "authorization",
  "cookie",
  "setcookie",
  "xapikey",
  // Personal data
  "ssn",
  "socialsecurity",
  "creditcard",
  "cvv",
  "pin",
  // Session data
  "sessionid",
  "sessiontoken",
  "csrftoken",
  "xsrftoken",
]);

/**
 * Maximum string length before truncation
 */
export const MAX_STRING_LENGTH = 1000;

/**
 * Maximum array length before truncation
 */
export const MAX_ARRAY_LENGTH = 100;

/**
 * Maximum object keys before truncation
 */
export const MAX_OBJECT_KEYS = 50;
