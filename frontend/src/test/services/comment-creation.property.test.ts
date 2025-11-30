import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { CommentService } from "@/services/commentService";
import type { Comment } from "@/types/comment";
import { endpoints } from "@/lib/api";

/**
 * Feature: quad-production-ready, Property 30: Comment Creation with Parent
 *
 * For any comment reply, the `parentId` should be set to the parent comment's ID,
 * and the reply should appear under the parent.
 *
 * Validates: Requirements 9.4
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  endpoints: {
    comments: {
      create: vi.fn(),
      getByContent: vi.fn(),
      getById: vi.fn(),
      getReplies: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      toggleLike: vi.fn(),
      getLikes: vi.fn(),
    },
  },
}));

describe("Property 30: Comment Creation with Parent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create root comments without parentId", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random content type
        fc.constantFrom<"post" | "story" | "poll">("post", "story", "poll"),
        // Generate random content ID
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        // Generate random comment text
        fc.string({ minLength: 1, maxLength: 500 }),
        async (contentType, contentId, text) => {
          const mockComment: Comment = {
            _id: "comment-id",
            userId: "user-id",
            author: {
              _id: "user-id",
              clerkId: "clerk-id",
              username: "testuser",
              email: "test@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            contentType,
            contentId,
            text,
            // No parentId for root comment
            likesCount: 0,
            repliesCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.comments.create).mockResolvedValue({
            data: {
              success: true,
              data: mockComment,
            },
          } as any);

          const result = await CommentService.create({
            contentType,
            contentId,
            text,
            // No parentId provided
          });

          expect(result.success).toBe(true);
          expect(result.data._id).toBe(mockComment._id);
          expect(result.data.text).toBe(text);
          expect(result.data.parentId).toBeUndefined();

          // Verify the API was called without parentId
          expect(endpoints.comments.create).toHaveBeenCalledWith({
            contentType,
            contentId,
            text,
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should create replies with correct parentId", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<"post" | "story" | "poll">("post", "story", "poll"),
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.string({ minLength: 1, maxLength: 500 }),
        async (contentType, contentId, parentId, text) => {
          const mockReply: Comment = {
            _id: "reply-id",
            userId: "user-id",
            author: {
              _id: "user-id",
              clerkId: "clerk-id",
              username: "testuser",
              email: "test@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            contentType,
            contentId,
            text,
            parentId, // This is the key property
            likesCount: 0,
            repliesCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.comments.create).mockResolvedValue({
            data: {
              success: true,
              data: mockReply,
            },
          } as any);

          const result = await CommentService.create({
            contentType,
            contentId,
            text,
            parentId,
          });

          expect(result.success).toBe(true);
          expect(result.data._id).toBe(mockReply._id);
          expect(result.data.text).toBe(text);
          expect(result.data.parentId).toBe(parentId);

          // Verify the API was called with parentId
          expect(endpoints.comments.create).toHaveBeenCalledWith({
            contentType,
            contentId,
            text,
            parentId,
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should maintain parent-child relationship after creation", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<"post" | "story" | "poll">("post", "story", "poll"),
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        async (contentType, contentId, parentText, replyText) => {
          // Create parent comment
          const parentComment: Comment = {
            _id: "parent-id",
            userId: "user-1",
            author: {
              _id: "user-1",
              clerkId: "clerk-1",
              username: "user1",
              email: "user1@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            contentType,
            contentId,
            text: parentText,
            likesCount: 0,
            repliesCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.comments.create).mockResolvedValueOnce({
            data: {
              success: true,
              data: parentComment,
            },
          } as any);

          const parentResult = await CommentService.create({
            contentType,
            contentId,
            text: parentText,
          });

          expect(parentResult.success).toBe(true);

          // Create reply
          const replyComment: Comment = {
            _id: "reply-id",
            userId: "user-2",
            author: {
              _id: "user-2",
              clerkId: "clerk-2",
              username: "user2",
              email: "user2@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            contentType,
            contentId,
            text: replyText,
            parentId: parentComment._id,
            likesCount: 0,
            repliesCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.comments.create).mockResolvedValueOnce({
            data: {
              success: true,
              data: replyComment,
            },
          } as any);

          const replyResult = await CommentService.create({
            contentType,
            contentId,
            text: replyText,
            parentId: parentComment._id,
          });

          expect(replyResult.success).toBe(true);
          expect(replyResult.data.parentId).toBe(parentComment._id);

          // Mock getReplies to verify the reply appears under parent
          vi.mocked(endpoints.comments.getReplies).mockResolvedValue({
            data: {
              success: true,
              data: [replyComment],
              pagination: {
                total: 1,
                limit: 10,
                skip: 0,
                hasMore: false,
              },
            },
          } as any);

          const repliesResult = await CommentService.getReplies(
            parentComment._id
          );

          expect(repliesResult.success).toBe(true);
          expect(repliesResult.data.length).toBe(1);
          expect(repliesResult.data[0]._id).toBe(replyComment._id);
          expect(repliesResult.data[0].parentId).toBe(parentComment._id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should validate that parentId is a valid comment ID", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<"post" | "story" | "poll">("post", "story", "poll"),
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.string({ minLength: 1, maxLength: 500 }),
        async (contentType, contentId, parentId, text) => {
          // The service should pass the parentId to the API
          // The API will validate if the parentId exists
          const mockReply: Comment = {
            _id: "reply-id",
            userId: "user-id",
            author: {
              _id: "user-id",
              clerkId: "clerk-id",
              username: "testuser",
              email: "test@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            contentType,
            contentId,
            text,
            parentId,
            likesCount: 0,
            repliesCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.comments.create).mockResolvedValue({
            data: {
              success: true,
              data: mockReply,
            },
          } as any);

          const result = await CommentService.create({
            contentType,
            contentId,
            text,
            parentId,
          });

          // Verify the service correctly passes parentId to the API
          expect(endpoints.comments.create).toHaveBeenCalledWith(
            expect.objectContaining({
              parentId,
            })
          );

          expect(result.success).toBe(true);
          expect(result.data.parentId).toBe(parentId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
