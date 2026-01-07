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

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  statusCode?: number;
  details?: Record<string, unknown>;
}
