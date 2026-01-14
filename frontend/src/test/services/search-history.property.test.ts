import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { SearchService } from "@/services/searchService";
import { endpoints } from "@/lib/api";

// Feature: quad-production-ready, Property 34: Search History Persistence
// For any search performed, it should be saved to search history and retrievable via the history endpoint.
// Validates: Requirements 10.4

describe("Search History Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 34: Search history is retrievable after searches", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 2, maxLength: 50 }), {
          minLength: 1,
          maxLength: 20,
        }),
        fc.integer({ min: 1, max: 50 }),
        async (queries, limit) => {
          // Mock search history response with the queries
          const mockHistory = queries.map((query, index) => ({
            _id: `history-${index}`,
            query,
            createdAt: new Date(Date.now() - index * 1000).toISOString(),
          }));

          vi.spyOn(endpoints.search, "history").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                history: mockHistory.slice(0, limit),
              },
            },
          } as any);

          // Get search history
          const history = await SearchService.getSearchHistory(limit);

          // Property 1: History should be retrievable
          expect(history).toBeDefined();
          expect(Array.isArray(history)).toBe(true);

          // Property 2: API should be called with correct limit
          expect(endpoints.search.history).toHaveBeenCalledWith({ limit });

          // Property 3: Returned history should not exceed limit
          expect(history.length).toBeLessThanOrEqual(limit);

          // Property 4: Each history item should have required fields
          history.forEach((item) => {
            expect(item).toHaveProperty("_id");
            expect(item).toHaveProperty("query");
            expect(typeof item.query).toBe("string");
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 34: Individual history items can be deleted", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 30 }),
        async (historyId) => {
          // Mock delete response
          vi.spyOn(endpoints.search, "deleteHistory").mockResolvedValueOnce({
            data: {
              success: true,
              data: {},
            },
          } as any);

          // Delete history item
          await SearchService.deleteSearchHistoryItem(historyId);

          // Property: API should be called with correct history ID
          expect(endpoints.search.deleteHistory).toHaveBeenCalledWith(historyId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 34: All search history can be cleared", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Mock clear response
        vi.spyOn(endpoints.search, "deleteHistory").mockResolvedValueOnce({
          data: {
            success: true,
            data: {},
          },
        } as any);

        // Clear all history
        await SearchService.clearSearchHistory();

        // Property: API should be called to clear all history
        expect(endpoints.search.deleteHistory).toHaveBeenCalledWith();
      }),
      { numRuns: 100 }
    );
  });

  it("Property 34: Empty history returns empty array", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (limit) => {
        // Mock empty history response
        vi.spyOn(endpoints.search, "history").mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              history: [],
            },
          },
        } as any);

        // Get search history
        const history = await SearchService.getSearchHistory(limit);

        // Property: Empty history should return empty array
        expect(Array.isArray(history)).toBe(true);
        expect(history.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("Property 34: History items are ordered by recency", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 2, maxLength: 50 }), {
          minLength: 2,
          maxLength: 10,
        }),
        async (queries) => {
          // Mock search history with timestamps in descending order
          const mockHistory = queries.map((query, index) => ({
            _id: `history-${index}`,
            query,
            createdAt: new Date(Date.now() - index * 60000).toISOString(), // Each 1 minute apart
          }));

          vi.spyOn(endpoints.search, "history").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                history: mockHistory,
              },
            },
          } as any);

          // Get search history
          const history = await SearchService.getSearchHistory(20);

          // Property: History items should be ordered (most recent first)
          if (history.length > 1) {
            for (let i = 0; i < history.length - 1; i++) {
              if (history[i].createdAt && history[i + 1].createdAt) {
                const date1 = new Date(history[i].createdAt!).getTime();
                const date2 = new Date(history[i + 1].createdAt!).getTime();
                // Most recent should come first (higher timestamp)
                expect(date1).toBeGreaterThanOrEqual(date2);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 34: API errors are handled gracefully", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (limit) => {
        // Mock API error
        vi.spyOn(endpoints.search, "history").mockRejectedValueOnce(
          new Error("Network error")
        );

        // Property: Service should handle errors without crashing
        await expect(SearchService.getSearchHistory(limit)).rejects.toThrow();
      }),
      { numRuns: 100 }
    );
  });
});
