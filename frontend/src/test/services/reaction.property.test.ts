import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ReactionService } from "@/services/reactionService";
import type {
  ReactionType,
  ReactableContentType,
} from "@/services/reactionService";
import { endpoints } from "@/lib/api";

/**
 * Feature: quad-production-ready, Property 28: Reaction API Consistency
 *
 * For any reaction added to content, the API call should use the correct endpoint
 * with `contentType` and `contentId` parameters.
 *
 * Validates: Requirements 9.2
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  endpoints: {
    reactions: {
      toggle: vi.fn(),
      getUserReactions: vi.fn(),
      getByContent: vi.fn(),
      remove: vi.fn(),
    },
  },
}));

describe("Property 28: Reaction API Consistency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use correct endpoint with contentType and contentId for all content types", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random content type
        fc.constantFrom<ReactableContentType>(
          "post",
          "story",
          "poll",
          "comment",
        ),
        // Generate random content ID (MongoDB ObjectId format - 24 hex characters)
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join(""),
        ),
        // Generate random reaction type
        fc.constantFrom<ReactionType>("love"),
        async (contentType, contentId, reactionType) => {
          // Mock successful reaction toggle
          const mockReaction = {
            _id: "reaction-id",
            contentType,
            contentId,
            userId: "user-id",
            username: "testuser",
            type: reactionType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.reactions.toggle).mockResolvedValue({
            data: {
              success: true,
              data: mockReaction,
              reactionCount: 1,
            },
          } as any);

          // Call the service
          const result = await ReactionService.toggle(
            contentType,
            contentId,
            reactionType,
          );

          // Verify the endpoint was called with correct parameters
          expect(endpoints.reactions.toggle).toHaveBeenCalledWith({
            contentType,
            contentId,
            type: reactionType,
          });

          // Verify the result contains the correct data
          expect(result.success).toBe(true);
          expect(result.data?.contentType).toBe(contentType);
          expect(result.data?.contentId).toBe(contentId);
          expect(result.data?.type).toBe(reactionType);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should correctly fetch reactions by content with contentType and contentId", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random content type
        fc.constantFrom<ReactableContentType>(
          "post",
          "story",
          "poll",
          "comment",
        ),
        // Generate random content ID
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join(""),
        ),
        async (contentType, contentId) => {
          // Mock successful fetch
          const mockResponse = {
            reactions: [],
            reactionCounts: [{ type: "love" as ReactionType, count: 8 }],
            userReaction: null,
            totalCount: 8,
          };

          vi.mocked(endpoints.reactions.getByContent).mockResolvedValue({
            data: {
              success: true,
              data: mockResponse,
            },
          } as any);

          // Call the service
          const result = await ReactionService.getByContent(
            contentType,
            contentId,
          );

          // Verify the endpoint was called with correct parameters
          expect(endpoints.reactions.getByContent).toHaveBeenCalledWith(
            contentType,
            contentId,
          );

          // Verify the result is successful
          expect(result.success).toBe(true);
          expect(result.data?.totalCount).toBe(8);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should correctly remove reactions with contentType and contentId", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random content type
        fc.constantFrom<ReactableContentType>(
          "post",
          "story",
          "poll",
          "comment",
        ),
        // Generate random content ID
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join(""),
        ),
        async (contentType, contentId) => {
          // Mock successful removal
          vi.mocked(endpoints.reactions.remove).mockResolvedValue({
            data: {
              success: true,
              reactionCount: 0,
            },
          } as any);

          // Call the service
          const result = await ReactionService.remove(contentType, contentId);

          // Verify the endpoint was called with correct parameters
          expect(endpoints.reactions.remove).toHaveBeenCalledWith(
            contentType,
            contentId,
          );

          // Verify the result is successful
          expect(result.success).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle toggling same reaction type (removal)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<ReactableContentType>(
          "post",
          "story",
          "poll",
          "comment",
        ),
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join(""),
        ),
        fc.constantFrom<ReactionType>("love"),
        async (contentType, contentId, reactionType) => {
          // Clear mocks for each property test run
          vi.clearAllMocks();

          // First toggle - add reaction
          vi.mocked(endpoints.reactions.toggle).mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                _id: "reaction-id",
                contentType,
                contentId,
                userId: "user-id",
                username: "testuser",
                type: reactionType,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              reactionCount: 1,
            },
          } as any);

          const addResult = await ReactionService.toggle(
            contentType,
            contentId,
            reactionType,
          );

          expect(addResult.success).toBe(true);
          expect(addResult.data).not.toBeNull();

          // Second toggle - remove reaction (same type)
          vi.mocked(endpoints.reactions.toggle).mockResolvedValueOnce({
            data: {
              success: true,
              data: null, // null indicates removal
              reactionCount: 0,
            },
          } as any);

          const removeResult = await ReactionService.toggle(
            contentType,
            contentId,
            reactionType,
          );

          expect(removeResult.success).toBe(true);
          expect(removeResult.data).toBeNull();

          // Verify both calls used correct parameters
          expect(endpoints.reactions.toggle).toHaveBeenCalledTimes(2);
          expect(endpoints.reactions.toggle).toHaveBeenNthCalledWith(1, {
            contentType,
            contentId,
            type: reactionType,
          });
          expect(endpoints.reactions.toggle).toHaveBeenNthCalledWith(2, {
            contentType,
            contentId,
            type: reactionType,
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});
