import type { ErrorType } from "./types";
import { categorizeError } from "./formatters";
import { ErrorType as ErrorTypeConst } from "./types";

export function isErrorType(error: unknown, type: ErrorType): boolean {
  return categorizeError(error) === type;
}

export function isRetryableError(error: unknown): boolean {
  const type = categorizeError(error);
  return (
    type === ErrorTypeConst.NETWORK ||
    type === ErrorTypeConst.SERVER ||
    type === ErrorTypeConst.RATE_LIMIT
  );
}
