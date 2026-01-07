import { AxiosError } from "axios";

import { ErrorType } from "./types";

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

export function formatErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }

    if (axiosError.response?.status) {
      return getStatusCodeMessage(axiosError.response.status);
    }

    if (axiosError.message === "Network Error") {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    if (axiosError.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }

    return axiosError.message || "An unexpected error occurred";
  }

  if (error instanceof Error) {
    return error.message || "An unexpected error occurred";
  }

  if (typeof error === "string") {
    return error.trim() || "An unexpected error occurred";
  }

  return "An unexpected error occurred";
}

export function formatValidationErrors(
  errors: Record<string, { message?: string }>
): string {
  const messages = Object.entries(errors)
    .map(([field, err]) => `${field}: ${err.message || "Invalid"}`)
    .join(", ");

  return messages || "Validation failed";
}

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
