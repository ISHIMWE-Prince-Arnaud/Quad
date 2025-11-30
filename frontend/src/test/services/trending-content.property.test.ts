import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { SearchService } from "@/services/searchService";
import { api } from "@/lib/api";

// Feature: quad-production-ready, Property 35: Trending Content Display
// For any trending content request, data should be fetched from the analytics endpoints and displayed.
// Validates: Requirements 10.5

describe("Trending Content Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 35: Trending searches are fetched from analytics endpoint", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("users", "posts", "stories", "polls"),
        fc.integer({ min: 1, max: 20 }),
        async (searchType, limit) => {
          // Mock trending searches response
          const mockTrending = Array.from(
            { length: Math.min(limit, 10) },
            (_, i) => `trending-${searchType}-${i}`
          );

          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                searches: mockTrending,
              },
            },
          });

          // Get trending searches
          const trending = await SearchService.getTrendingSearches(
            searchType,
            limit
          );

          // Property 1: Trending data should be fetched
          expect(trending).toBeDefined();
          expect(Array.isArray(trending)).toBe(true);

          // Property 2: API should be called with correct parameters
          expect(api.get).toHaveBeenCalledWith("/search/analytics/trending", {
            params: { searchType, limit },
          });

          // Property 3: Returned data should not exceed limit
          expect(trending.length).toBeLessThanOrEqual(limit);

          // Property 4: Each item should be a string
          trending.forEach((item) => {
            expect(typeof item).toBe("string");
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 35: Popular searches are fetched from analytics endpoint", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("users", "posts", "stories", "polls"),
        fc.integer({ min: 1, max: 20 }),
        async (searchType, limit) => {
          // Mock popular searches response
          const mockPopular = Array.from(
            { length: Math.min(limit, 10) },
            (_, i) => `popular-${searchType}-${i}`
          );

          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                searches: mockPopular,
              },
            },
          });

          // Get popular searches
          const popular = await SearchService.getPopularSearches(
            searchType,
            limit
          );

          // Property 1: Popular data should be fetched
          expect(popular).toBeDefined();
          expect(Array.isArray(popular)).toBe(true);

          // Property 2: API should be called with correct parameters
          expect(api.get).toHaveBeenCalledWith("/search/analytics/popular", {
            params: { searchType, limit },
          });

          // Property 3: Returned data should not exceed limit
          expect(popular.length).toBeLessThanOrEqual(limit);

          // Property 4: Each item should be a string
          popular.forEach((item) => {
            expect(typeof item).toBe("string");
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 35: Empty trending data returns empty array", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("users", "posts", "stories", "polls"),
        fc.integer({ min: 1, max: 20 }),
        async (searchType, limit) => {
          // Mock empty trending response
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                searches: [],
              },
            },
          });

          // Get trending searches
          const trending = await SearchService.getTrendingSearches(
            searchType,
            limit
          );

          // Property: Empty trending should return empty array
          expect(Array.isArray(trending)).toBe(true);
          expect(trending.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 35: Trending and popular can be fetched independently", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("users", "posts", "stories", "polls"),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        async (searchType, trendingLimit, popularLimit) => {
          // Mock both responses
          const mockTrending = Array.from(
            { length: trendingLimit },
            (_, i) => `trending-${i}`
          );
          const mockPopular = Array.from(
            { length: popularLimit },
            (_, i) => `popular-${i}`
          );

          vi.spyOn(api, "get")
            .mockResolvedValueOnce({
              data: {
                success: true,
                data: { searches: mockTrending },
              },
            })
            .mockResolvedValueOnce({
              data: {
                success: true,
                data: { searches: mockPopular },
              },
            });

          // Fetch both
          const trending = await SearchService.getTrendingSearches(
            searchType,
            trendingLimit
          );
          const popular = await SearchService.getPopularSearches(
            searchType,
            popularLimit
          );

          // Property: Both should be fetched independently
          expect(trending.length).toBe(trendingLimit);
          expect(popular.length).toBe(popularLimit);

          // Property: API should be called twice with different endpoints
          expect(api.get).toHaveBeenCalledTimes(2);
          expect(api.get).toHaveBeenNthCalledWith(
            1,
            "/search/analytics/trending",
            { params: { searchType, limit: trendingLimit } }
          );
          expect(api.get).toHaveBeenNthCalledWith(
            2,
            "/search/analytics/popular",
            { params: { searchType, limit: popularLimit } }
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 35: Different search types can have different trending content", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("users", "posts", "stories", "polls"),
        fc.constantFrom("users", "posts", "stories", "polls"),
        fc.integer({ min: 1, max: 10 }),
        async (searchType1, searchType2, limit) => {
          // Mock different responses for different types
          const mockTrending1 = Array.from(
            { length: limit },
            (_, i) => `${searchType1}-trending-${i}`
          );
          const mockTrending2 = Array.from(
            { length: limit },
            (_, i) => `${searchType2}-trending-${i}`
          );

          vi.spyOn(api, "get")
            .mockResolvedValueOnce({
              data: {
                success: true,
                data: { searches: mockTrending1 },
              },
            })
            .mockResolvedValueOnce({
              data: {
                success: true,
                data: { searches: mockTrending2 },
              },
            });

          // Fetch for both types
          const trending1 = await SearchService.getTrendingSearches(
            searchType1,
            limit
          );
          const trending2 = await SearchService.getTrendingSearches(
            searchType2,
            limit
          );

          // Property: Each search type should get its own trending data
          expect(trending1).toBeDefined();
          expect(trending2).toBeDefined();

          // If types are different, content should be different
          if (searchType1 !== searchType2) {
            expect(trending1).not.toEqual(trending2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 35: API errors are handled gracefully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("users", "posts", "stories", "polls"),
        fc.integer({ min: 1, max: 20 }),
        async (searchType, limit) => {
          // Mock API error
          vi.spyOn(api, "get").mockRejectedValueOnce(
            new Error("Network error")
          );

          // Property: Service should handle errors without crashing
          await expect(
            SearchService.getTrendingSearches(searchType, limit)
          ).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
