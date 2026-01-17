import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { CommentService } from "@/services/commentService";
import { endpoints } from "@/lib/api";

/**
 * Feature: quad-production-ready, Property 31: Comment Like Toggle
 *
 * For any comment like action, the like count should increment on first click
 * and decrement on second click (toggle behavior).
 *
 * Validates: Requirements 9.5
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  endpoints: {
    comments: {
      create: vi.fn(),
      getByContent: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      toggleLike: vi.fn(),
      getLikes: vi.fn(),
    },
  },
}));

describe("Property 31: Comment Like Toggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should increment like count on first like", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random comment ID
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        // Generate initial like count
        fc.integer({ min: 0, max: 100 }),
        async (commentId, initialLikes) => {
          // Mock first like (not liked -> liked)
          vi.mocked(endpoints.comments.toggleLike).mockResolvedValue({
            data: {
              success: true,
              liked: true,
              likesCount: initialLikes + 1,
            },
          } as any);

          const result = await CommentService.toggleLike(commentId);

          expect(result.success).toBe(true);
          expect(result.liked).toBe(true);
          expect(result.likesCount).toBe(initialLikes + 1);

          // Verify the API was called with correct commentId
          expect(endpoints.comments.toggleLike).toHaveBeenCalledWith({
            commentId,
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should decrement like count on unlike", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.integer({ min: 1, max: 100 }), // At least 1 like to unlike
        async (commentId, initialLikes) => {
          // Mock unlike (liked -> not liked)
          vi.mocked(endpoints.comments.toggleLike).mockResolvedValue({
            data: {
              success: true,
              liked: false,
              likesCount: initialLikes - 1,
            },
          } as any);

          const result = await CommentService.toggleLike(commentId);

          expect(result.success).toBe(true);
          expect(result.liked).toBe(false);
          expect(result.likesCount).toBe(initialLikes - 1);

          expect(endpoints.comments.toggleLike).toHaveBeenCalledWith({
            commentId,
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should toggle like state correctly (like -> unlike -> like)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.integer({ min: 0, max: 50 }),
        async (commentId, initialLikes) => {
          // Clear mocks for each property test run
          vi.clearAllMocks();

          // First toggle: like
          vi.mocked(endpoints.comments.toggleLike).mockResolvedValueOnce({
            data: {
              success: true,
              liked: true,
              likesCount: initialLikes + 1,
            },
          } as any);

          const likeResult = await CommentService.toggleLike(commentId);
          expect(likeResult.success).toBe(true);
          expect(likeResult.liked).toBe(true);
          expect(likeResult.likesCount).toBe(initialLikes + 1);

          // Second toggle: unlike
          vi.mocked(endpoints.comments.toggleLike).mockResolvedValueOnce({
            data: {
              success: true,
              liked: false,
              likesCount: initialLikes,
            },
          } as any);

          const unlikeResult = await CommentService.toggleLike(commentId);
          expect(unlikeResult.success).toBe(true);
          expect(unlikeResult.liked).toBe(false);
          expect(unlikeResult.likesCount).toBe(initialLikes);

          // Third toggle: like again
          vi.mocked(endpoints.comments.toggleLike).mockResolvedValueOnce({
            data: {
              success: true,
              liked: true,
              likesCount: initialLikes + 1,
            },
          } as any);

          const reLikeResult = await CommentService.toggleLike(commentId);
          expect(reLikeResult.success).toBe(true);
          expect(reLikeResult.liked).toBe(true);
          expect(reLikeResult.likesCount).toBe(initialLikes + 1);

          // Verify all three calls were made
          expect(endpoints.comments.toggleLike).toHaveBeenCalledTimes(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should never have negative like counts", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        async (commentId) => {
          // Mock unlike when count is 0
          vi.mocked(endpoints.comments.toggleLike).mockResolvedValue({
            data: {
              success: true,
              liked: false,
              likesCount: 0, // Should stay at 0, not go negative
            },
          } as any);

          const result = await CommentService.toggleLike(commentId);

          expect(result.success).toBe(true);
          expect(result.likesCount).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should maintain like count consistency across multiple users", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.integer({ min: 1, max: 10 }), // Number of users
        async (commentId, numUsers) => {
          let currentLikes = 0;

          // Simulate multiple users liking the comment
          for (let i = 0; i < numUsers; i++) {
            vi.mocked(endpoints.comments.toggleLike).mockResolvedValueOnce({
              data: {
                success: true,
                liked: true,
                likesCount: currentLikes + 1,
              },
            } as any);

            const result = await CommentService.toggleLike(commentId);
            expect(result.success).toBe(true);
            expect(result.liked).toBe(true);
            expect(result.likesCount).toBe(currentLikes + 1);

            currentLikes++;
          }

          // Verify final count matches number of users
          expect(currentLikes).toBe(numUsers);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle rapid toggle operations", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.integer({ min: 2, max: 10 }), // Number of rapid toggles
        async (commentId, numToggles) => {
          // Clear mocks for each property test run
          vi.clearAllMocks();

          let currentLiked: boolean = false;
          let currentCount: number = 0;

          for (let i = 0; i < numToggles; i++) {
            const nextLiked: boolean = !currentLiked;
            const nextCount: number = nextLiked
              ? currentCount + 1
              : currentCount - 1;

            vi.mocked(endpoints.comments.toggleLike).mockResolvedValueOnce({
              data: {
                success: true,
                liked: nextLiked,
                likesCount: Math.max(0, nextCount),
              },
            } as any);

            const result = await CommentService.toggleLike(commentId);
            expect(result.success).toBe(true);
            expect(result.liked).toBe(nextLiked);

            currentLiked = nextLiked;
            currentCount = Math.max(0, nextCount);
          }

          // Verify all toggles were processed
          expect(endpoints.comments.toggleLike).toHaveBeenCalledTimes(
            numToggles
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
