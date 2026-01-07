import type { AppError } from "./types";
import { createAppError } from "./appError";
import { logError } from "./logging";
import { showErrorToast } from "./toasts";

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
