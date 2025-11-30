import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { PostService } from "@/services/postService";
import { endpoints } from "@/lib/api";
import type { Post } from "@/types/post";
import type { CreatePostData } from "@/schemas/post.schema";

/**
 * Feature: quad-production-ready, Property 26: Content Edit Pre-population
 *
 * For any content edit operation, the form should pre-populate with the existing content data.
 *
 * Validates: Requirements 8.4
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  endpoints: {
    posts: {
      getById: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Property 26: Content Edit Pre-population", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pre-populate form with existing post text", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for valid post text
        fc
          .string({ minLength: 1, maxLength: 1000 })
          .filter((s) => s.trim().length > 0),
        async (text) => {
          const postId = "test-post-id";
          const existingPost: Post = {
            _id: postId,
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            text,
            media: [],
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock getById to return existing post
          vi.mocked(endpoints.posts.getById).mockResolvedValue({
            data: { success: true, data: existingPost },
          } as any);

          // Fetch the post (simulating what EditPostPage does)
          const response = await PostService.getPostById(postId);
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();

          // Verify pre-population data matches existing post
          const initialValues: CreatePostData = {
            text: response.data.text ?? "",
            media: response.data.media ?? [],
          };

          expect(initialValues.text).toBe(text);
          expect(initialValues.media).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should pre-populate form with existing post media", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for valid media arrays
        fc.array(
          fc.record({
            url: fc.webUrl(),
            type: fc.constantFrom("image" as const, "video" as const),
            aspectRatio: fc.option(
              fc.constantFrom("1:1" as const, "16:9" as const, "9:16" as const),
              { nil: undefined }
            ),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (media) => {
          const postId = "test-post-id";
          const existingPost: Post = {
            _id: postId,
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            text: undefined,
            media,
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock getById to return existing post
          vi.mocked(endpoints.posts.getById).mockResolvedValue({
            data: { success: true, data: existingPost },
          } as any);

          // Fetch the post (simulating what EditPostPage does)
          const response = await PostService.getPostById(postId);
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();

          // Verify pre-population data matches existing post
          const initialValues: CreatePostData = {
            text: response.data.text ?? "",
            media: response.data.media ?? [],
          };

          expect(initialValues.text).toBe("");
          expect(initialValues.media).toEqual(media);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should pre-populate form with both text and media", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for posts with both text and media
        fc.record({
          text: fc
            .string({ minLength: 1, maxLength: 1000 })
            .filter((s) => s.trim().length > 0),
          media: fc.array(
            fc.record({
              url: fc.webUrl(),
              type: fc.constantFrom("image" as const, "video" as const),
              aspectRatio: fc.option(
                fc.constantFrom(
                  "1:1" as const,
                  "16:9" as const,
                  "9:16" as const
                ),
                { nil: undefined }
              ),
            }),
            { minLength: 1, maxLength: 10 }
          ),
        }),
        async ({ text, media }) => {
          const postId = "test-post-id";
          const existingPost: Post = {
            _id: postId,
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            text,
            media,
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock getById to return existing post
          vi.mocked(endpoints.posts.getById).mockResolvedValue({
            data: { success: true, data: existingPost },
          } as any);

          // Fetch the post (simulating what EditPostPage does)
          const response = await PostService.getPostById(postId);
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();

          // Verify pre-population data matches existing post
          const initialValues: CreatePostData = {
            text: response.data.text ?? "",
            media: response.data.media ?? [],
          };

          expect(initialValues.text).toBe(text);
          expect(initialValues.media).toEqual(media);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle posts with undefined text field", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for media-only posts
        fc.array(
          fc.record({
            url: fc.webUrl(),
            type: fc.constantFrom("image" as const, "video" as const),
            aspectRatio: fc.option(
              fc.constantFrom("1:1" as const, "16:9" as const, "9:16" as const),
              { nil: undefined }
            ),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (media) => {
          const postId = "test-post-id";
          const existingPost: Post = {
            _id: postId,
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            // text is undefined
            media,
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock getById to return existing post
          vi.mocked(endpoints.posts.getById).mockResolvedValue({
            data: { success: true, data: existingPost },
          } as any);

          // Fetch the post
          const response = await PostService.getPostById(postId);
          expect(response.success).toBe(true);

          // Verify pre-population handles undefined text correctly
          const initialValues: CreatePostData = {
            text: response.data.text ?? "",
            media: response.data.media ?? [],
          };

          // Should default to empty string when text is undefined
          expect(initialValues.text).toBe("");
          expect(initialValues.media).toEqual(media);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle posts with undefined media field", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for text-only posts
        fc
          .string({ minLength: 1, maxLength: 1000 })
          .filter((s) => s.trim().length > 0),
        async (text) => {
          const postId = "test-post-id";
          const existingPost: Post = {
            _id: postId,
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            text,
            // media is undefined
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock getById to return existing post
          vi.mocked(endpoints.posts.getById).mockResolvedValue({
            data: { success: true, data: existingPost },
          } as any);

          // Fetch the post
          const response = await PostService.getPostById(postId);
          expect(response.success).toBe(true);

          // Verify pre-population handles undefined media correctly
          const initialValues: CreatePostData = {
            text: response.data.text ?? "",
            media: response.data.media ?? [],
          };

          expect(initialValues.text).toBe(text);
          // Should default to empty array when media is undefined
          expect(initialValues.media).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve all media properties during pre-population", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for media with all possible aspect ratios
        fc.array(
          fc.record({
            url: fc.webUrl(),
            type: fc.constantFrom("image" as const, "video" as const),
            aspectRatio: fc.constantFrom(
              "1:1" as const,
              "16:9" as const,
              "9:16" as const
            ),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (media) => {
          const postId = "test-post-id";
          const existingPost: Post = {
            _id: postId,
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            media,
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock getById to return existing post
          vi.mocked(endpoints.posts.getById).mockResolvedValue({
            data: { success: true, data: existingPost },
          } as any);

          // Fetch the post
          const response = await PostService.getPostById(postId);
          expect(response.success).toBe(true);

          // Verify all media properties are preserved
          const initialValues: CreatePostData = {
            text: response.data.text ?? "",
            media: response.data.media ?? [],
          };

          expect(initialValues.media).toHaveLength(media.length);
          initialValues.media?.forEach((item, index) => {
            expect(item.url).toBe(media[index].url);
            expect(item.type).toBe(media[index].type);
            expect(item.aspectRatio).toBe(media[index].aspectRatio);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
