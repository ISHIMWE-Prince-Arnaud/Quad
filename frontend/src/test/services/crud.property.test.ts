import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { PostService } from "@/services/postService";
import { StoryService } from "@/services/storyService";
import { PollService } from "@/services/pollService";
import { endpoints } from "@/lib/api";

/**
 * Feature: quad-production-ready, Property 1: CRUD Operations Preserve Data Integrity
 *
 * For any valid content data (Post, Story, or Poll), when created via the API,
 * reading it back should return equivalent data, updating it should preserve the ID
 * while changing specified fields, and deleting it should make it no longer retrievable.
 *
 * Validates: Requirements 1.3
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  invalidateCache: vi.fn(),
  endpoints: {
    posts: {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    stories: {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    polls: {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Property 1: CRUD Operations Preserve Data Integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should preserve data integrity for Post CRUD operations", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for post data
        fc.record({
          text: fc.string({ minLength: 1, maxLength: 500 }),
          media: fc.array(
            fc.record({
              url: fc.webUrl(),
              type: fc.constantFrom("image" as const, "video" as const),
              aspectRatio: fc.constantFrom(
                "1:1" as const,
                "16:9" as const,
                "9:16" as const
              ),
            }),
            { maxLength: 4 }
          ),
        }),
        async (postData) => {
          const createdPost = {
            _id: "test-post-id",
            userId: "test-user-id",
            author: {
              _id: "test-user-id",
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            text: postData.text,
            media: postData.media,
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock create
          vi.mocked(endpoints.posts.create).mockResolvedValue({
            data: { success: true, data: createdPost },
          } as any);

          // Mock getById
          vi.mocked(endpoints.posts.getById).mockResolvedValue({
            data: { success: true, data: createdPost },
          } as any);

          // Test create and read
          const createResult = await PostService.createPost(postData);
          expect(createResult.success).toBe(true);
          expect(createResult.data._id).toBe(createdPost._id);

          const readResult = await PostService.getPostById(createdPost._id);
          expect(readResult.success).toBe(true);
          expect(readResult.data._id).toBe(createdPost._id);
          expect(readResult.data.text).toBe(postData.text);

          // Test update preserves ID
          const updatedText = "Updated text";
          const updatedPost = { ...createdPost, text: updatedText };
          vi.mocked(endpoints.posts.update).mockResolvedValue({
            data: { success: true, data: updatedPost },
          } as any);

          const updateResult = await PostService.updatePost(createdPost._id, {
            text: updatedText,
          });
          expect(updateResult.success).toBe(true);
          expect(updateResult.data._id).toBe(createdPost._id);
          expect(updateResult.data.text).toBe(updatedText);

          // Test delete makes it unretrievable
          vi.mocked(endpoints.posts.delete).mockResolvedValue({
            data: { success: true },
          } as any);

          vi.mocked(endpoints.posts.getById).mockRejectedValue({
            response: { status: 404 },
          });

          const deleteResult = await PostService.deletePost(createdPost._id);
          expect(deleteResult.success).toBe(true);

          // Verify it's no longer retrievable
          await expect(
            PostService.getPostById(createdPost._id)
          ).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve data integrity for Story CRUD operations", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for story data
        fc.record({
          title: fc
            .string({ minLength: 1, maxLength: 200 })
            .filter((s) => s.trim().length > 0),
          content: fc
            .string({ minLength: 10, maxLength: 5000 })
            .filter((s) => s.trim().length >= 10),
          coverImage: fc.option(fc.webUrl(), { nil: undefined }),
          status: fc.constantFrom("draft" as const, "published" as const),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 5,
          }),
        }),
        async (storyData) => {
          const createdStory = {
            _id: "test-story-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            title: storyData.title,
            content: storyData.content,
            coverImage: storyData.coverImage,
            status: storyData.status,
            tags: storyData.tags,
            readTime: 5,
            viewsCount: 0,
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock create
          vi.mocked(endpoints.stories.create).mockResolvedValue({
            data: { success: true, data: createdStory },
          } as any);

          // Mock getById
          vi.mocked(endpoints.stories.getById).mockResolvedValue({
            data: { success: true, data: createdStory },
          } as any);

          // Test create and read
          const createResult = await StoryService.create(storyData);
          expect(createResult.success).toBe(true);
          expect(createResult.data?._id).toBe(createdStory._id);

          const readResult = await StoryService.getById(createdStory._id);
          expect(readResult.success).toBe(true);
          expect(readResult.data?._id).toBe(createdStory._id);
          expect(readResult.data?.title).toBe(storyData.title);

          // Test update preserves ID
          const updatedTitle = "Updated Title";
          const updatedStory = { ...createdStory, title: updatedTitle };
          vi.mocked(endpoints.stories.update).mockResolvedValue({
            data: { success: true, data: updatedStory },
          } as any);

          const updateResult = await StoryService.update(createdStory._id, {
            title: updatedTitle,
          });
          expect(updateResult.success).toBe(true);
          expect(updateResult.data?._id).toBe(createdStory._id);
          expect(updateResult.data?.title).toBe(updatedTitle);

          // Test delete makes it unretrievable
          vi.mocked(endpoints.stories.delete).mockResolvedValue({
            data: { success: true },
          } as any);

          vi.mocked(endpoints.stories.getById).mockRejectedValue({
            response: { status: 404 },
          });

          const deleteResult = await StoryService.delete(createdStory._id);
          expect(deleteResult.success).toBe(true);

          // Verify it's no longer retrievable
          await expect(
            StoryService.getById(createdStory._id)
          ).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve data integrity for Poll CRUD operations", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for poll data
        fc.record({
          question: fc.string({ minLength: 5, maxLength: 300 }),
          options: fc.array(
            fc.record({
              text: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 6 }
          ),
          settings: fc.record({
            anonymousVoting: fc.boolean(),
          }),
        }),
        async (pollData) => {
          const createdPoll = {
            id: "test-poll-id",
            author: {
              _id: "test-user-id",
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            question: pollData.question,
            options: pollData.options.map((opt, index) => ({
              index,
              text: opt.text,
              votesCount: 0,
              percentage: 0,
            })),
            settings: pollData.settings,
            status: "active" as const,
            totalVotes: 0,
            reactionsCount: 0,
            commentsCount: 0,
            canViewResults: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock create
          vi.mocked(endpoints.polls.create).mockResolvedValue({
            data: { success: true, data: createdPoll },
          } as any);

          // Mock getById
          vi.mocked(endpoints.polls.getById).mockResolvedValue({
            data: { success: true, data: createdPoll },
          } as any);

          // Test create and read
          const createResult = await PollService.create(pollData);
          expect(createResult.success).toBe(true);
          expect(createResult.data?.id).toBe(createdPoll.id);

          const readResult = await PollService.getById(createdPoll.id);
          expect(readResult.success).toBe(true);
          expect(readResult.data?.id).toBe(createdPoll.id);
          expect(readResult.data?.question).toBe(pollData.question);

          // Test update preserves ID
          const updatedQuestion = "Updated Question?";
          const updatedPoll = { ...createdPoll, question: updatedQuestion };
          vi.mocked(endpoints.polls.update).mockResolvedValue({
            data: { success: true, data: updatedPoll },
          } as any);

          const updateResult = await PollService.update(createdPoll.id, {
            question: updatedQuestion,
          });
          expect(updateResult.success).toBe(true);
          expect(updateResult.data?.id).toBe(createdPoll.id);
          expect(updateResult.data?.question).toBe(updatedQuestion);

          // Test delete makes it unretrievable
          vi.mocked(endpoints.polls.delete).mockResolvedValue({
            data: { success: true },
          } as any);

          vi.mocked(endpoints.polls.getById).mockRejectedValue({
            response: { status: 404 },
          });

          const deleteResult = await PollService.delete(createdPoll.id);
          expect(deleteResult.success).toBe(true);

          // Verify it's no longer retrievable
          await expect(PollService.getById(createdPoll.id)).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
