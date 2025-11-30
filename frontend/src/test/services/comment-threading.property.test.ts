import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { CommentService } from "@/services/commentService";
import type { Comment } from "@/types/comment";
import { endpoints } from "@/lib/api";

/**
 * Feature: quad-production-ready, Property 29: Comment Thread Nesting
 *
 * For any comment with replies, the replies should be nested under the parent comment
 * with correct `parentId` references.
 *
 * Validates: Requirements 9.3
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

describe("Property 29: Comment Thread Nesting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should correctly nest replies under parent comments with parentId", async () => {
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
        // Generate number of replies (1-5)
        fc.integer({ min: 1, max: 5 }),
        async (contentType, contentId, commentText, numReplies) => {
          // Create parent comment
          const parentComment: Comment = {
            _id: "parent-comment-id",
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
            text: commentText,
            likesCount: 0,
            repliesCount: numReplies,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock parent comment creation
          vi.mocked(endpoints.comments.create).mockResolvedValueOnce({
            data: {
              success: true,
              data: parentComment,
            },
          } as any);

          const parentResult = await CommentService.create({
            contentType,
            contentId,
            text: commentText,
          });

          expect(parentResult.success).toBe(true);
          expect(parentResult.data._id).toBe(parentComment._id);

          // Create replies with parentId
          const replies: Comment[] = [];
          for (let i = 0; i < numReplies; i++) {
            const reply: Comment = {
              _id: `reply-${i}`,
              userId: `user-${i}`,
              author: {
                _id: `user-${i}`,
                clerkId: `clerk-${i}`,
                username: `user${i}`,
                email: `user${i}@example.com`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                joinedAt: new Date().toISOString(),
              },
              contentType,
              contentId,
              text: `Reply ${i}`,
              parentId: parentComment._id, // This is the key property
              likesCount: 0,
              repliesCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            replies.push(reply);

            // Mock reply creation
            vi.mocked(endpoints.comments.create).mockResolvedValueOnce({
              data: {
                success: true,
                data: reply,
              },
            } as any);

            const replyResult = await CommentService.create({
              contentType,
              contentId,
              text: reply.text,
              parentId: parentComment._id,
            });

            expect(replyResult.success).toBe(true);
            expect(replyResult.data.parentId).toBe(parentComment._id);
          }

          // Mock getReplies to return all replies
          vi.mocked(endpoints.comments.getReplies).mockResolvedValue({
            data: {
              success: true,
              data: replies,
              pagination: {
                total: replies.length,
                limit: 10,
                skip: 0,
                hasMore: false,
              },
            },
          } as any);

          // Fetch replies and verify nesting
          const repliesResult = await CommentService.getReplies(
            parentComment._id
          );

          expect(repliesResult.success).toBe(true);
          expect(repliesResult.data.length).toBe(numReplies);

          // Verify all replies have correct parentId
          for (const reply of repliesResult.data) {
            expect(reply.parentId).toBe(parentComment._id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle nested replies (replies to replies)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<"post" | "story" | "poll">("post", "story", "poll"),
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        async (contentType, contentId) => {
          // Create root comment
          const rootComment: Comment = {
            _id: "root-comment",
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
            text: "Root comment",
            likesCount: 0,
            repliesCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Create first-level reply
          const firstLevelReply: Comment = {
            _id: "first-level-reply",
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
            text: "First level reply",
            parentId: rootComment._id,
            likesCount: 0,
            repliesCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Create second-level reply (reply to reply)
          const secondLevelReply: Comment = {
            _id: "second-level-reply",
            userId: "user-3",
            author: {
              _id: "user-3",
              clerkId: "clerk-3",
              username: "user3",
              email: "user3@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            contentType,
            contentId,
            text: "Second level reply",
            parentId: firstLevelReply._id,
            likesCount: 0,
            repliesCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock getReplies for root comment
          vi.mocked(endpoints.comments.getReplies).mockResolvedValueOnce({
            data: {
              success: true,
              data: [firstLevelReply],
              pagination: {
                total: 1,
                limit: 10,
                skip: 0,
                hasMore: false,
              },
            },
          } as any);

          const rootReplies = await CommentService.getReplies(rootComment._id);
          expect(rootReplies.success).toBe(true);
          expect(rootReplies.data.length).toBe(1);
          expect(rootReplies.data[0].parentId).toBe(rootComment._id);

          // Mock getReplies for first-level reply
          vi.mocked(endpoints.comments.getReplies).mockResolvedValueOnce({
            data: {
              success: true,
              data: [secondLevelReply],
              pagination: {
                total: 1,
                limit: 10,
                skip: 0,
                hasMore: false,
              },
            },
          } as any);

          const firstLevelReplies = await CommentService.getReplies(
            firstLevelReply._id
          );
          expect(firstLevelReplies.success).toBe(true);
          expect(firstLevelReplies.data.length).toBe(1);
          expect(firstLevelReplies.data[0].parentId).toBe(firstLevelReply._id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should correctly filter root comments (no parentId)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<"post" | "story" | "poll">("post", "story", "poll"),
        fc.string({ minLength: 24, maxLength: 24 }).map((s) =>
          s
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).slice(-1))
            .join("")
        ),
        fc.integer({ min: 1, max: 5 }),
        async (contentType, contentId, numRootComments) => {
          const rootComments: Comment[] = [];

          for (let i = 0; i < numRootComments; i++) {
            rootComments.push({
              _id: `root-${i}`,
              userId: `user-${i}`,
              author: {
                _id: `user-${i}`,
                clerkId: `clerk-${i}`,
                username: `user${i}`,
                email: `user${i}@example.com`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                joinedAt: new Date().toISOString(),
              },
              contentType,
              contentId,
              text: `Root comment ${i}`,
              // No parentId - this is a root comment
              likesCount: 0,
              repliesCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          // Mock getByContent with parentId: null to get only root comments
          vi.mocked(endpoints.comments.getByContent).mockResolvedValue({
            data: {
              success: true,
              data: rootComments,
              pagination: {
                total: rootComments.length,
                limit: 20,
                skip: 0,
                hasMore: false,
              },
            },
          } as any);

          const result = await CommentService.getByContent(
            contentType,
            contentId,
            { parentId: null }
          );

          expect(result.success).toBe(true);
          expect(result.data.length).toBe(numRootComments);

          // Verify all returned comments have no parentId
          for (const comment of result.data) {
            expect(comment.parentId).toBeUndefined();
          }

          // Verify the API was called with parentId: null
          expect(endpoints.comments.getByContent).toHaveBeenCalledWith(
            contentType,
            contentId,
            expect.objectContaining({ parentId: null })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
