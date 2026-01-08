import { createAppError } from "./appError";

declare global {
  interface GlobalThis {
    __quadErrorLog?: unknown[];
  }
}

export function logError(
  error: unknown,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    metadata?: unknown;
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
    const globalWithErrorLog = globalThis as typeof globalThis & {
      __quadErrorLog?: unknown[];
    };

    globalWithErrorLog.__quadErrorLog = globalWithErrorLog.__quadErrorLog ?? [];
    globalWithErrorLog.__quadErrorLog.push(logData);
  }
}
