/**
 * Cache Middleware
 * Adds cache headers to responses for better performance
 */

import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.config.js";

/**
 * Cache durations in seconds
 */
export const CacheDuration = {
  NONE: 0,
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  WEEK: 604800, // 7 days
  MONTH: 2592000, // 30 days
  YEAR: 31536000, // 1 year
} as const;

interface CacheOptions {
  maxAge: number;
  public?: boolean;
  private?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  immutable?: boolean;
  staleWhileRevalidate?: number;
  staleIfError?: number;
}

/**
 * Generate Cache-Control header value
 */
function generateCacheControl(options: CacheOptions): string {
  const directives: string[] = [];

  // Cache visibility
  if (options.public) {
    directives.push("public");
  } else if (options.private) {
    directives.push("private");
  }

  // Cache behavior
  if (options.noCache) {
    directives.push("no-cache");
  }
  if (options.noStore) {
    directives.push("no-store");
  }
  if (options.mustRevalidate) {
    directives.push("must-revalidate");
  }
  if (options.immutable) {
    directives.push("immutable");
  }

  // Max age
  if (options.maxAge > 0) {
    directives.push(`max-age=${options.maxAge}`);
  }

  // Stale strategies
  if (options.staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }
  if (options.staleIfError) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }

  return directives.join(", ");
}

/**
 * Middleware to set cache headers
 */
export function cacheControl(options: Partial<CacheOptions>) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const defaultOptions: CacheOptions = {
      maxAge: CacheDuration.NONE,
      public: false,
      private: false,
      noCache: false,
      noStore: false,
      mustRevalidate: false,
      immutable: false,
      ...options,
    };

    const cacheControlValue = generateCacheControl(defaultOptions);
    res.setHeader("Cache-Control", cacheControlValue);

    next();
  };
}

/**
 * No cache - always fetch fresh data
 */
export const noCache = cacheControl({
  noCache: true,
  noStore: true,
  mustRevalidate: true,
  maxAge: 0,
});

/**
 * Private cache - can be cached by browser but not CDN
 */
export const privateCache = (maxAge: number) =>
  cacheControl({
    private: true,
    maxAge,
    mustRevalidate: true,
  });

/**
 * Public cache - can be cached by browser and CDN
 */
export const publicCache = (maxAge: number, immutable = false) =>
  cacheControl({
    public: true,
    maxAge,
    immutable,
  });

/**
 * Stale-while-revalidate - serve stale content while fetching fresh
 */
export const staleWhileRevalidate = (maxAge: number, staleTime: number) =>
  cacheControl({
    public: true,
    maxAge,
    staleWhileRevalidate: staleTime,
  });

/**
 * Static assets cache - long-lived, immutable
 */
export const staticAssetCache = publicCache(CacheDuration.YEAR, true);

/**
 * API response cache - short-lived, public
 */
export const apiCache = (duration: number) => publicCache(duration);

/**
 * User-specific cache - private, medium duration
 */
export const userCache = privateCache(CacheDuration.MEDIUM);

/**
 * Conditional cache based on environment
 * In development: no cache
 * In production: use provided cache settings
 */
export function conditionalCache(productionOptions: Partial<CacheOptions>) {
  if (env.NODE_ENV === "development") {
    return noCache;
  }
  return cacheControl(productionOptions);
}

/**
 * ETag support middleware
 * Generates ETag based on response body
 */
export function etag(_req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;

  res.send = function (body: unknown): Response {
    if (body && typeof body === "object") {
      const etag = `"${Buffer.from(JSON.stringify(body))
        .toString("base64")
        .substring(0, 27)}"`;
      res.setHeader("ETag", etag);
    }
    return originalSend.call(this, body);
  };

  next();
}

/**
 * Vary header middleware
 * Tells caches to vary responses based on specific headers
 */
export function vary(...headers: string[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const existing = res.getHeader("Vary");
    const varyHeaders = existing
      ? `${existing}, ${headers.join(", ")}`
      : headers.join(", ");
    res.setHeader("Vary", varyHeaders);
    next();
  };
}

/**
 * Common vary patterns
 */
export const varyByAuth = vary("Authorization");
export const varyByAcceptEncoding = vary("Accept-Encoding");
export const varyByOrigin = vary("Origin");
