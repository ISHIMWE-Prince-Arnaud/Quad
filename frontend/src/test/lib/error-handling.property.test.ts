import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  formatErrorMessage,
  categorizeError,
  createAppError,
  handleApiError,
  retryWithBackoff,
  isRetryableError,
  ErrorType,
} from "@/lib/errorHandling";
import { AxiosError } from "axios";

/**
 * Feature: quad-production-ready, Property 9: Error Handling Graceful Degradation
 * Validates: Requirements 2.4
 *
 * For any API error response (4xx or 5xx), the frontend should catch the error,
 * display a user-friendly message, and not crash the application.
 */

describe("Error Handling Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Property 9: Error Handling Graceful Degradation", () => {
    it("should format any error into a user-friendly message without throwing", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // String errors
            fc.string(),
            // Error objects
            fc.record({
              message: fc.string(),
              name: fc.string(),
            }),
            // Axios-like errors with status codes
            fc.record({
              isAxiosError: fc.constant(true),
              message: fc.string(),
              response: fc.record({
                status: fc.integer({ min: 400, max: 599 }),
                data: fc.record({
                  message: fc.option(fc.string()),
                  error: fc.option(fc.string()),
                }),
              }),
            }),
            // Network errors
            fc.record({
              isAxiosError: fc.constant(true),
              message: fc.constant("Network Error"),
            }),
            // Null/undefined
            fc.constant(null),
            fc.constant(undefined)
          ),
          (error) => {
            // Should not throw
            expect(() => formatErrorMessage(error)).not.toThrow();

            // Should return a string
            const message = formatErrorMessage(error);
            expect(typeof message).toBe("string");

            // Should not be empty
            expect(message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should categorize any error without throwing", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.record({
              isAxiosError: fc.constant(true),
              response: fc.record({
                status: fc.integer({ min: 100, max: 599 }),
              }),
            }),
            fc.constant(new Error("test")),
            fc.constant(null)
          ),
          (error) => {
            // Should not throw
            expect(() => categorizeError(error)).not.toThrow();

            // Should return a valid ErrorType
            const type = categorizeError(error);
            expect(Object.values(ErrorType)).toContain(type);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should create AppError from any error without throwing", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.record({ message: fc.string() }),
            fc.record({
              isAxiosError: fc.constant(true),
              response: fc.record({
                status: fc.integer({ min: 400, max: 599 }),
                data: fc.anything(),
              }),
            }),
            fc.constant(null)
          ),
          (error) => {
            // Should not throw
            expect(() => createAppError(error)).not.toThrow();

            // Should return valid AppError structure
            const appError = createAppError(error);
            expect(appError).toHaveProperty("type");
            expect(appError).toHaveProperty("message");
            expect(typeof appError.message).toBe("string");
            expect(Object.values(ErrorType)).toContain(appError.type);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle API errors without crashing", () => {
      fc.assert(
        fc.property(
          fc.record({
            isAxiosError: fc.constant(true),
            message: fc.string(),
            response: fc.record({
              status: fc.integer({ min: 400, max: 599 }),
              data: fc.record({
                message: fc.option(fc.string()),
              }),
            }),
          }),
          (error) => {
            // Should not throw
            expect(() =>
              handleApiError(error, { showToast: false, logError: false })
            ).not.toThrow();

            // Should return AppError
            const result = handleApiError(error, {
              showToast: false,
              logError: false,
            });
            expect(result).toHaveProperty("type");
            expect(result).toHaveProperty("message");
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Error Type Categorization", () => {
    it("should correctly categorize 401 errors as AUTHENTICATION", () => {
      fc.assert(
        fc.property(fc.string(), (message) => {
          const error = {
            isAxiosError: true,
            message,
            response: { status: 401, data: {} },
          };

          expect(categorizeError(error)).toBe(ErrorType.AUTHENTICATION);
        }),
        { numRuns: 50 }
      );
    });

    it("should correctly categorize 403 errors as AUTHORIZATION", () => {
      fc.assert(
        fc.property(fc.string(), (message) => {
          const error = {
            isAxiosError: true,
            message,
            response: { status: 403, data: {} },
          };

          expect(categorizeError(error)).toBe(ErrorType.AUTHORIZATION);
        }),
        { numRuns: 50 }
      );
    });

    it("should correctly categorize 404 errors as NOT_FOUND", () => {
      fc.assert(
        fc.property(fc.string(), (message) => {
          const error = {
            isAxiosError: true,
            message,
            response: { status: 404, data: {} },
          };

          expect(categorizeError(error)).toBe(ErrorType.NOT_FOUND);
        }),
        { numRuns: 50 }
      );
    });

    it("should correctly categorize 5xx errors as SERVER", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 500, max: 599 }),
          fc.string(),
          (status, message) => {
            const error = {
              isAxiosError: true,
              message,
              response: { status, data: {} },
            };

            expect(categorizeError(error)).toBe(ErrorType.SERVER);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should correctly categorize network errors", () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          const error = {
            isAxiosError: true,
            message: "Network Error",
          };

          expect(categorizeError(error)).toBe(ErrorType.NETWORK);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe("Retry Logic", () => {
    it("should retry retryable errors and eventually succeed or fail gracefully", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          fc.boolean(),
          async (failCount, shouldSucceed) => {
            let attempts = 0;
            const mockFn = vi.fn(async () => {
              attempts++;
              if (attempts <= failCount) {
                throw {
                  isAxiosError: true,
                  message: "Network Error",
                };
              }
              return "success";
            });

            if (shouldSucceed && failCount <= 3) {
              // Should eventually succeed
              const result = await retryWithBackoff(mockFn, {
                maxRetries: 3,
                initialDelay: 10,
                maxDelay: 50,
              });
              expect(result).toBe("success");
            } else if (failCount > 3) {
              // Should fail after max retries
              await expect(
                retryWithBackoff(mockFn, {
                  maxRetries: 3,
                  initialDelay: 10,
                  maxDelay: 50,
                })
              ).rejects.toThrow();
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it("should identify retryable errors correctly", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Network error - retryable
            fc.record({
              isAxiosError: fc.constant(true),
              message: fc.constant("Network Error"),
            }),
            // 5xx error - retryable
            fc.record({
              isAxiosError: fc.constant(true),
              response: fc.record({
                status: fc.integer({ min: 500, max: 599 }),
              }),
            }),
            // 4xx error - not retryable
            fc.record({
              isAxiosError: fc.constant(true),
              response: fc.record({
                status: fc.integer({ min: 400, max: 499 }),
              }),
            })
          ),
          (error) => {
            const isRetryable = isRetryableError(error);
            const type = categorizeError(error);

            // Network and server errors should be retryable
            if (
              type === ErrorType.NETWORK ||
              type === ErrorType.SERVER ||
              type === ErrorType.RATE_LIMIT
            ) {
              expect(isRetryable).toBe(true);
            } else {
              expect(isRetryable).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Error Message Formatting", () => {
    it("should prefer backend error messages when available", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 400, max: 599 }),
          (backendMessage, status) => {
            const error = {
              isAxiosError: true,
              message: "Generic error",
              response: {
                status,
                data: { message: backendMessage },
              },
            };

            const formatted = formatErrorMessage(error);
            expect(formatted).toBe(backendMessage);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should provide status-specific messages when backend message is missing", () => {
      fc.assert(
        fc.property(fc.integer({ min: 400, max: 599 }), (status) => {
          const error = {
            isAxiosError: true,
            message: "Error",
            response: {
              status,
              data: {},
            },
          };

          const formatted = formatErrorMessage(error);
          expect(typeof formatted).toBe("string");
          expect(formatted.length).toBeGreaterThan(0);
          // Should not be the generic axios message
          expect(formatted).not.toBe("Error");
        }),
        { numRuns: 50 }
      );
    });
  });
});
