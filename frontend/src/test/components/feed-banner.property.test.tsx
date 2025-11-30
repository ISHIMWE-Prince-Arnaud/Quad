import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { FeedService } from "@/services/feedService";
import type { FeedType } from "@/types/feed";
import { api } from "@/lib/api";

// Feature: quad-production-ready, Property 22: Feed New Content Indicator
// For any new content available in the feed, the "X new posts" banner should display
// the correct count from the `/feed/new-count` endpoint.
// Validates: Requirements 7.3

describe("New Content Banner Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 22: New content indicator returns correct count from API", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<FeedType>("following", "foryou"),
        fc.integer({ min: 0, max: 100 }),
        fc.string({ minLength: 10, maxLength: 30 }),
        async (feedType, expectedCount, lastSeenId) => {
          // Mock the API call
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: { count: expectedCount },
            },
          });

          // Call the service method
          const response = await FeedService.getNewContentCount({
            feedType,
            tab: "home",
            since: lastSeenId,
          });

          // Property 1: API should be called with correct parameters
          expect(api.get).toHaveBeenCalledWith("/feed/new-count", {
            params: {
              feedType,
              tab: "home",
              since: lastSeenId,
            },
          });

          // Property 2: Response should be successful
          expect(response.success).toBe(true);

          // Property 3: Response should contain the correct count
          expect(response.data?.count).toBe(expectedCount);

          // Property 4: Count should be non-negative
          expect(response.data?.count).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
