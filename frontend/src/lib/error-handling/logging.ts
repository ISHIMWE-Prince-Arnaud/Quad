import { createAppError } from "./appError";

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

  if (import.meta.env.DEV) {
    console.error("Error logged:", logData);
  }
}
