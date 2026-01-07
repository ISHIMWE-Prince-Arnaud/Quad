import { AxiosError } from "axios";

import type { AppError } from "./types";
import { categorizeError, formatErrorMessage } from "./formatters";

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
