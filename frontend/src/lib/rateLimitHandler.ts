/**
 * Rate Limiting Handler
 *
 * Provides utilities for handling rate limit responses from the API
 * and implementing exponential backoff strategies.
 */

import { toast } from "@/hooks/use-toast";

interface RateLimitInfo {
  retryAfter: number; // milliseconds
  endpoint: string;
  timestamp: number;
}

class RateLimitManager {
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private toastShown: Set<string> = new Set();

  /**
   * Record a rate limit for an endpoint
   */
  recordRateLimit(endpoint: string, retryAfterSeconds: number): void {
    const retryAfter = Date.now() + retryAfterSeconds * 1000;

    this.rateLimits.set(endpoint, {
      retryAfter,
      endpoint,
      timestamp: Date.now(),
    });

    // Show toast notification if not already shown for this endpoint
    if (!this.toastShown.has(endpoint)) {
      this.showRateLimitToast(endpoint, retryAfterSeconds);
      this.toastShown.add(endpoint);

      // Clear toast flag after retry period
      setTimeout(() => {
        this.toastShown.delete(endpoint);
      }, retryAfterSeconds * 1000);
    }
  }

  /**
   * Check if an endpoint is currently rate limited
   */
  isRateLimited(endpoint: string): boolean {
    const limit = this.rateLimits.get(endpoint);

    if (!limit) {
      return false;
    }

    if (Date.now() >= limit.retryAfter) {
      // Rate limit has expired
      this.rateLimits.delete(endpoint);
      return false;
    }

    return true;
  }

  /**
   * Get remaining wait time for a rate limited endpoint
   */
  getWaitTime(endpoint: string): number {
    const limit = this.rateLimits.get(endpoint);

    if (!limit) {
      return 0;
    }

    const remaining = limit.retryAfter - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Show user-friendly toast notification for rate limit
   */
  private showRateLimitToast(
    endpoint: string,
    retryAfterSeconds: number
  ): void {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    const timeString =
      minutes > 1 ? `${minutes} minutes` : `${retryAfterSeconds} seconds`;

    toast({
      title: "Rate Limit Reached",
      description: `Too many requests. Please wait ${timeString} before trying again.`,
      variant: "destructive",
    });
  }

  /**
   * Clear all rate limits (useful for testing or manual reset)
   */
  clearAll(): void {
    this.rateLimits.clear();
    this.toastShown.clear();
  }

  /**
   * Get all active rate limits
   */
  getActiveRateLimits(): RateLimitInfo[] {
    const now = Date.now();
    const active: RateLimitInfo[] = [];

    this.rateLimits.forEach((limit) => {
      if (limit.retryAfter > now) {
        active.push(limit);
      }
    });

    return active;
  }
}

// Singleton instance
export const rateLimitManager = new RateLimitManager();

/**
 * Exponential backoff calculator
 */
export function calculateBackoff(
  attemptNumber: number,
  baseDelay = 1000
): number {
  // Exponential backoff: baseDelay * 2^attemptNumber
  // Capped at 32 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), 32000);

  // Add jitter (random 0-25% of delay) to prevent thundering herd
  const jitter = Math.random() * delay * 0.25;

  return delay + jitter;
}

/**
 * Wait for a specified duration
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt, baseDelay);

      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
      );

      await wait(delay);
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const err = error as { response?: { status?: number } };
    return err.response?.status === 429;
  }
  return false;
}

/**
 * Extract retry-after header from error response
 */
export function getRetryAfter(error: unknown): number {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: {
        headers?: {
          "retry-after"?: string | number;
        };
      };
    };

    const retryAfter = err.response?.headers?.["retry-after"];

    if (typeof retryAfter === "number") {
      return retryAfter;
    }

    if (typeof retryAfter === "string") {
      const parsed = parseInt(retryAfter, 10);
      return isNaN(parsed) ? 60 : parsed;
    }
  }

  return 60; // Default to 60 seconds
}
