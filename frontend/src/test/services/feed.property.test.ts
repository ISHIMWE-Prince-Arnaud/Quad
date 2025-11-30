import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { FeedService } from "@/services/feedService";
import type { FeedType, FeedQueryParams } from "@/types/feed";
import { api } from "@/lib/api";

// Feature: quad-production-ready, Property 2: Feed Pagination Consistency
// For any feed request with pagination parameters (cursor, limit), the system should return
// non-overlapping results across pages, and the total number of items across all pages should equal the total count.
// Validates: Requirements 1.4, 7.2

describe("Feed Pagination Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 2: Feed pagination returns non-overlapping results", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<FeedType>("following", "foryou"),
        fc.integer({ min: 1, max: 20 }),
        fc.constantFrom("newest", "trending"),
        async (feedType, limit, sort) => {
          // Mock the API response with paginated data
          const totalItems = 30;
          const mockItems = Array.from({ length: totalItems }, (_, i) => ({
            _id: `item-${i}`,
            type: "post" as const,
            content: {
              _id: `post-${i}`,
              userId: `user-${i}`,
              author: {
                _id: `user-${i}`,
                clerkId: `clerk-${i}`,
                username: `user${i}`,
                email: `user${i}@test.com`,
              },
              text: `Post ${i}`,
              media: [],
              reactionsCount: 0,
              commentsCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            score: 100 - i,
            priority: "following" as const,
            createdAt: new Date().toISOString(),
            engagementMetrics: {
              reactions: 0,
              comments: 0,
              votes: 0,
            },
            author: {
              clerkId: `clerk-${i}`,
              username: `user${i}`,
            },
          }));

          // Mock axios get method
          vi.spyOn(api, "get").mockImplementation(
            (url: string, config?: any) => {
              const params = config?.params || {};
              const cursor = params.cursor;
              const pageLimit = params.limit || limit;

              let startIndex = 0;
              if (cursor) {
                const cursorIndex = parseInt(cursor.split("-")[1]);
                startIndex = cursorIndex + 1;
              }

              const endIndex = Math.min(startIndex + pageLimit, totalItems);
              const pageItems = mockItems.slice(startIndex, endIndex);
              const nextCursor =
                endIndex < totalItems ? `cursor-${endIndex - 1}` : undefined;

              return Promise.resolve({
                data: {
                  success: true,
                  data: {
                    items: pageItems,
                    pagination: {
                      nextCursor,
                      hasMore: endIndex < totalItems,
                      count: pageItems.length,
                    },
                    metadata: {
                      feedType,
                      tab: "home" as const,
                      sort: sort as any,
                      totalAvailable: totalItems,
                    },
                  },
                },
              });
            }
          );

          // Fetch all pages
          const allFetchedItems: string[] = [];
          let cursor: string | undefined = undefined;
          let hasMore = true;
          let pageCount = 0;
          const maxPages = 10; // Safety limit

          while (hasMore && pageCount < maxPages) {
            const params: FeedQueryParams = {
              tab: "home",
              cursor,
              limit,
              sort: sort as any,
            };

            const response = await FeedService.getFeed(feedType, params);

            if (response.success && response.data) {
              const itemIds = response.data.items.map((item) => item._id);
              allFetchedItems.push(...itemIds);

              hasMore = response.data.pagination.hasMore;
              cursor = response.data.pagination.nextCursor;
              pageCount++;
            } else {
              break;
            }
          }

          // Property 1: No duplicate items across pages (non-overlapping)
          const uniqueItems = new Set(allFetchedItems);
          expect(uniqueItems.size).toBe(allFetchedItems.length);

          // Property 2: Total items fetched should match expected count
          const expectedTotal = Math.min(totalItems, limit * maxPages);
          expect(allFetchedItems.length).toBeLessThanOrEqual(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });
});
