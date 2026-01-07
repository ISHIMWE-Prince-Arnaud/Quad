export interface RateLimitState {
  retryAfter: number | null;
  requestCount: number;
  windowStart: number;
}

export const rateLimitState: RateLimitState = {
  retryAfter: null,
  requestCount: 0,
  windowStart: Date.now(),
};
