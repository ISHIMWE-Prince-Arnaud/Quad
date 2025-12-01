import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

/**
 * Error types for categorization
 */
export const ErrorType = {
  NETWORK: "NETWORK",
  AUTHENTICATION: "AUTHENTICATION",
  AUTHORIZATION: "AUTHORIZATION",
  VALIDATION: "VALIDATION",
  NOT_FOUND: "NOT_FOUND",
  SERVER: "SERVER",
  RATE_LIMIT: "RATE_LIMIT",
  UNKNOWN: "UNKNOWN",
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

/**
 * Structured error object
 */
export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  statusCode?: number;
  details?: Record<string, unknown>;
}

/**
 * Format error message from various error types
 */
export function formatErrorMessage(error: unknown): string {
  // Handle AxiosError
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    // Use backend error message if available
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }

    // Handle by status code
    if (axiosError.response?.status) {
      return getStatusCodeMessage(axiosError.response.status);
    }

    // Network error
    if (axiosError.message === "Network Error") {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    // Timeout
    if (axiosError.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }

    return axiosError.message || "An unexpected error occurred";
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || "An unexpected error occurred";
  }

  // Handle string errors
  if (typeof error === "string") {
    return error.trim() || "An unexpected error occurred";
  }

  // Fallback
  return "An unexpected error occurred";
}

/**
 * Get user-friendly message for HTTP status codes
 */
function getStatusCodeMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "You need to be logged in to perform this action.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This action conflicts with existing data.";
    case 422:
      return "The provided data is invalid.";
    case 429:
      return "Too many requests. Please slow down and try again later.";
    case 500:
      return "Server error. Please try again later.";
    case 502:
      return "Bad gateway. The server is temporarily unavailable.";
    case 503:
      return "Service unavailable. Please try again later.";
    case 504:
      return "Gateway timeout. The server took too long to respond.";
    default:
      if (statusCode >= 500) {
        return "Server error. Please try again later.";
      }
      if (statusCode >= 400) {
        return "Request failed. Please try again.";
      }
      return "An unexpected error occurred";
  }
}

/**
 * Categorize error by type
 */
export function categorizeError(error: unknown): ErrorType {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError;

    if (!axiosError.response) {
      return ErrorType.NETWORK;
    }

    const status = axiosError.response.status;

    if (status === 401) return ErrorType.AUTHENTICATION;
    if (status === 403) return ErrorType.AUTHORIZATION;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status === 422 || status === 400) return ErrorType.VALIDATION;
    if (status === 429) return ErrorType.RATE_LIMIT;
    if (status >= 500) return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Create structured error object
 */
export function createAppError(error: unknown): AppError {
  const type = categorizeError(error);
  const message = formatErrorMessage(error);

  let statusCode: number | undefined;
  let details: Record<string, unknown> | undefined;

  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError;
    statusCode = axiosError.response?.status;
    details = axiosError.response?.data as Record<string, unknown>;
  }

  return {
    type,
    message,
    originalError: error,
    statusCode,
    details,
  };
}

/**
 * Show error toast notification
 */
export function showErrorToast(error: unknown, customMessage?: string): void {
  const appError = createAppError(error);
  const message = customMessage || appError.message;

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}

/**
 * Show success toast notification
 */
export function showSuccessToast(message: string, description?: string): void {
  toast({
    title: message,
    description,
    variant: "default",
  });
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const appError = createAppError(error);

  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      type: appError.type,
      message: appError.message,
      statusCode: appError.statusCode,
      details: appError.details,
    },
    context,
    stack: error instanceof Error ? error.stack : undefined,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error("Error logged:", logData);
  }

  // In production, this would send to error tracking service (Sentry, etc.)
  // Example: Sentry.captureException(error, { contexts: { custom: context } });
}

/**
 * Handle API error with toast and logging
 */
export function handleApiError(
  error: unknown,
  options?: {
    customMessage?: string;
    showToast?: boolean;
    logError?: boolean;
    context?: Parameters<typeof logError>[1];
  }
): AppError {
  const {
    customMessage,
    showToast: shouldShowToast = true,
    logError: shouldLogError = true,
    context,
  } = options || {};

  const appError = createAppError(error);

  if (shouldShowToast) {
    showErrorToast(error, customMessage);
  }

  if (shouldLogError) {
    logError(error, context);
  }

  return appError;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: unknown) => boolean;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error: unknown) => {
      // Retry on network errors and 5xx errors
      const errorType = categorizeError(error);
      return errorType === ErrorType.NETWORK || errorType === ErrorType.SERVER;
    },
  } = options || {};

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts or if error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next attempt
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Validation error formatter
 */
export function formatValidationErrors(
  errors: Record<string, { message?: string }>
): string {
  const messages = Object.entries(errors)
    .map(([field, error]) => `${field}: ${error.message || "Invalid"}`)
    .join(", ");

  return messages || "Validation failed";
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: unknown, type: ErrorType): boolean {
  return categorizeError(error) === type;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const type = categorizeError(error);
  return (
    type === ErrorType.NETWORK ||
    type === ErrorType.SERVER ||
    type === ErrorType.RATE_LIMIT
  );
}
