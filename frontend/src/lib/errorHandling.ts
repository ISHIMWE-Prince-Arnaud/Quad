/**
 * Error types for categorization
 */
export * from "./error-handling/types";

/**
 * Format error message from various error types
 */
export { formatErrorMessage, formatValidationErrors, categorizeError } from "./error-handling/formatters";

/**
 * Create structured error object
 */
export { createAppError } from "./error-handling/appError";

/**
 * Show error toast notification
 */
export { showErrorToast, showSuccessToast } from "./error-handling/toasts";

/**
 * Log error with context
 */
export { logError } from "./error-handling/logging";

/**
 * Handle API error with toast and logging
 */
export { handleApiError } from "./error-handling/handleApiError";

/**
 * Retry function with exponential backoff
 */
export { retryWithBackoff } from "./error-handling/retryWithBackoff";

/**
 * Check if error is a specific type
 */
export { isErrorType, isRetryableError } from "./error-handling/guards";
