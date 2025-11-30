/**
 * Request deduplication and caching utility
 * Prevents duplicate simultaneous requests and caches responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, PendingRequest<unknown>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const actualTTL = ttl ?? this.defaultTTL;
    const now = Date.now();

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + actualTTL,
    });
  }

  /**
   * Invalidate cached data
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Deduplicate requests - if same request is in flight, return existing promise
   */
  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>,
    options?: {
      ttl?: number;
      skipCache?: boolean;
    }
  ): Promise<T> {
    // Check cache first (unless skipCache is true)
    if (!options?.skipCache) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Check if request is already in flight
    const pending = this.pendingRequests.get(key) as
      | PendingRequest<T>
      | undefined;
    if (pending) {
      // Return existing promise
      return pending.promise;
    }

    // Create new request
    const promise = requestFn()
      .then((data) => {
        // Cache the result
        if (!options?.skipCache) {
          this.set(key, data, options?.ttl);
        }
        // Remove from pending
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        // Remove from pending on error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store as pending
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));

    // Clean up stale pending requests (older than 30 seconds)
    const staleThreshold = now - 30000;
    const pendingToDelete: string[] = [];

    for (const [key, pending] of this.pendingRequests.entries()) {
      if (pending.timestamp < staleThreshold) {
        pendingToDelete.push(key);
      }
    }

    pendingToDelete.forEach((key) => this.pendingRequests.delete(key));
  }
}

// Export singleton instance
export const requestCache = new RequestCache();

// Run cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    requestCache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Generate cache key from URL and params
 */
export function generateCacheKey(
  url: string,
  params?: Record<string, unknown>
): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join("&");

  return `${url}?${sortedParams}`;
}
