import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { SearchService } from "@/services/searchService";
import { api } from "@/lib/api";

// Feature: quad-production-ready, Property 33: Search Filter Application
// For any search filter applied (date range, content type, sort), the results should be filtered accordingly.
// Validates: Requirements 10.3

describe("Search Filters Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 33: Sort filter is applied to search requests", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 50 }),
        fc.constantFrom("relevance", "date", "popularity"),
        async (query, sortBy) => {
          // Mock API response
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                posts: [],
                total: 0,
                hasMore: false,
              },
            },
          });

          // Call search with sort filter
          await SearchService.searchPosts({
            q: query,
            sortBy: sortBy as any,
            limit: 20,
            offset: 0,
          });

          // Property: API should be called with the correct sortBy parameter
          expect(api.get).toHaveBeenCalledWith("/search/posts", {
            params: expect.objectContaining({
              q: query,
              sortBy,
            }),
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 33: Date range filters are applied to search requests", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 50 }),
        fc
          .date({ min: new Date("2020-01-01"), max: new Date("2024-12-31") })
          .filter((d) => !isNaN(d.getTime())),
        fc
          .date({ min: new Date("2020-01-01"), max: new Date("2024-12-31") })
          .filter((d) => !isNaN(d.getTime())),
        async (query, date1, date2) => {
          // Ensure dateFrom is before dateTo
          const dateFrom =
            date1 < date2
              ? date1.toISOString().split("T")[0]
              : date2.toISOString().split("T")[0];
          const dateTo =
            date1 < date2
              ? date2.toISOString().split("T")[0]
              : date1.toISOString().split("T")[0];

          // Mock API response
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                users: [],
                total: 0,
                hasMore: false,
              },
            },
          });

          // Call search with date filters
          await SearchService.searchUsers({
            q: query,
            dateFrom,
            dateTo,
            limit: 20,
            offset: 0,
          });

          // Property: API should be called with the correct date range parameters
          expect(api.get).toHaveBeenCalledWith("/search/users", {
            params: expect.objectContaining({
              q: query,
              dateFrom,
              dateTo,
            }),
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 33: Multiple filters are applied together", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 50 }),
        fc.constantFrom("relevance", "date", "popularity"),
        fc
          .date({ min: new Date("2020-01-01"), max: new Date("2024-12-31") })
          .filter((d) => !isNaN(d.getTime())),
        fc
          .date({ min: new Date("2020-01-01"), max: new Date("2024-12-31") })
          .filter((d) => !isNaN(d.getTime())),
        async (query, sortBy, date1, date2) => {
          // Ensure dateFrom is before dateTo
          const dateFrom =
            date1 < date2
              ? date1.toISOString().split("T")[0]
              : date2.toISOString().split("T")[0];
          const dateTo =
            date1 < date2
              ? date2.toISOString().split("T")[0]
              : date1.toISOString().split("T")[0];

          // Mock API response
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                stories: [],
                total: 0,
                hasMore: false,
              },
            },
          });

          // Call search with multiple filters
          await SearchService.searchStories({
            q: query,
            sortBy: sortBy as any,
            dateFrom,
            dateTo,
            limit: 20,
            offset: 0,
          });

          // Property: API should be called with all filter parameters
          expect(api.get).toHaveBeenCalledWith("/search/stories", {
            params: expect.objectContaining({
              q: query,
              sortBy,
              dateFrom,
              dateTo,
            }),
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 33: Filters work with global search", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 50 }),
        fc.constantFrom("relevance", "date", "popularity"),
        async (query, sortBy) => {
          // Mock API response
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                users: [],
                posts: [],
                stories: [],
                polls: [],
                total: 0,
              },
            },
          });

          // Call global search with filters
          await SearchService.globalSearch({
            q: query,
            sortBy: sortBy as any,
            limit: 10,
            offset: 0,
          });

          // Property: API should be called with filter parameters
          expect(api.get).toHaveBeenCalledWith("/search/global", {
            params: expect.objectContaining({
              q: query,
              sortBy,
            }),
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 33: Filters are optional and search works without them", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 50 }),
        async (query) => {
          // Mock API response
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                polls: [],
                total: 0,
                hasMore: false,
              },
            },
          });

          // Call search without filters
          await SearchService.searchPolls({
            q: query,
            limit: 20,
            offset: 0,
          });

          // Property: API should be called successfully even without filters
          expect(api.get).toHaveBeenCalledWith("/search/polls", {
            params: expect.objectContaining({
              q: query,
            }),
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 33: Invalid date ranges are handled gracefully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 50 }),
        async (query) => {
          // Mock API response
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                posts: [],
                total: 0,
                hasMore: false,
              },
            },
          });

          // Call search with dateFrom after dateTo (invalid range)
          const dateFrom = "2024-12-31";
          const dateTo = "2024-01-01";

          await SearchService.searchPosts({
            q: query,
            dateFrom,
            dateTo,
            limit: 20,
            offset: 0,
          });

          // Property: API should still be called (backend handles validation)
          expect(api.get).toHaveBeenCalledWith("/search/posts", {
            params: expect.objectContaining({
              q: query,
              dateFrom,
              dateTo,
            }),
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
