import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { PostService } from "@/services/postService";
import { createPostSchema } from "@/schemas/post.schema";
import { endpoints } from "@/lib/api";

/**
 * Feature: quad-production-ready, Property 25: Content Creation Validation
 *
 * For any content creation (Post, Story, Poll) with valid data, the creation should
 * succeed and the content should be retrievable.
 *
 * Validates: Requirements 8.1
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  endpoints: {
    posts: {
      create: vi.fn(),
      getById: vi.fn(),
    },
  },
}));

describe("Property 25: Content Creation Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully create and retrieve posts with valid text-only data", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for valid text-only posts (non-whitespace)
        fc
          .string({ minLength: 1, maxLength: 1000 })
          .filter((s) => s.trim().length > 0),
        async (text) => {
          const postData = { text };

          // Validate against schema
          const validationResult = createPostSchema.safeParse(postData);
          expect(validationResult.success).toBe(true);

          const createdPost = {
            _id: "test-post-id",
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            text: postData.text,
            media: [],
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

          // Test creation
          const createResult = await PostService.createPost(postData);
          expect(createResult.success).toBe(true);
          expect(createResult.data).toBeDefined();
          expect(createResult.data._id).toBe(createdPost._id);

          // Test retrieval
          const retrieveResult = await PostService.getPostById(createdPost._id);
          expect(retrieveResult.success).toBe(true);
          expect(retrieveResult.data).toBeDefined();
          expect(retrieveResult.data._id).toBe(createdPost._id);
          expect(retrieveResult.data.text).toBe(text);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should successfully create and retrieve posts with valid media-only data", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for valid media-only posts
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
          const postData = { media };

          // Validate against schema
          const validationResult = createPostSchema.safeParse(postData);
          expect(validationResult.success).toBe(true);

          const createdPost = {
            _id: "test-post-id",
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
            },
            text: undefined,
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

          // Test creation
          const createResult = await PostService.createPost(postData);
          expect(createResult.success).toBe(true);
          expect(createResult.data).toBeDefined();
          expect(createResult.data._id).toBe(createdPost._id);

          // Test retrieval
          const retrieveResult = await PostService.getPostById(createdPost._id);
          expect(retrieveResult.success).toBe(true);
          expect(retrieveResult.data).toBeDefined();
          expect(retrieveResult.data._id).toBe(createdPost._id);
          expect(retrieveResult.data.media).toEqual(media);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should successfully create and retrieve posts with both text and media", async () => {
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
        async (postData) => {
          // Validate against schema
          const validationResult = createPostSchema.safeParse(postData);
          expect(validationResult.success).toBe(true);

          const createdPost = {
            _id: "test-post-id",
            userId: "test-user-id",
            author: {
              clerkId: "test-clerk-id",
              username: "testuser",
              email: "test@example.com",
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

          // Test creation
          const createResult = await PostService.createPost(postData);
          expect(createResult.success).toBe(true);
          expect(createResult.data).toBeDefined();
          expect(createResult.data._id).toBe(createdPost._id);

          // Test retrieval
          const retrieveResult = await PostService.getPostById(createdPost._id);
          expect(retrieveResult.success).toBe(true);
          expect(retrieveResult.data).toBeDefined();
          expect(retrieveResult.data._id).toBe(createdPost._id);
          expect(retrieveResult.data.text).toBe(postData.text);
          expect(retrieveResult.data.media).toEqual(postData.media);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject posts with text exceeding character limit", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for text exceeding 1000 characters (non-whitespace)
        fc
          .string({ minLength: 1001, maxLength: 2000 })
          .filter((s) => s.trim().length >= 1001),
        async (text) => {
          const postData = { text };

          // Validate against schema - should fail due to length
          const validationResult = createPostSchema.safeParse(postData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject posts with too many media items", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for more than 10 media items
        fc.array(
          fc.record({
            url: fc.webUrl(),
            type: fc.constantFrom("image" as const, "video" as const),
            aspectRatio: fc.option(
              fc.constantFrom("1:1" as const, "16:9" as const, "9:16" as const),
              { nil: undefined }
            ),
          }),
          { minLength: 11, maxLength: 15 }
        ),
        async (media) => {
          const postData = { media };

          // Validate against schema - should fail due to too many items
          const validationResult = createPostSchema.safeParse(postData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject posts with neither text nor media", async () => {
    const postData = {};

    // Validate against schema - should fail
    const validationResult = createPostSchema.safeParse(postData);
    expect(validationResult.success).toBe(false);
  });

  it("should reject posts with empty text and no media", async () => {
    const postData = { text: "" };

    // Validate against schema - should fail
    const validationResult = createPostSchema.safeParse(postData);
    expect(validationResult.success).toBe(false);
  });

  it("should reject posts with invalid media URLs", async () => {
    const invalidUrls = [
      "not-a-url",
      "just text",
      "http://",
      "://missing-protocol",
    ];

    for (const invalidUrl of invalidUrls) {
      const postData = {
        media: [
          {
            url: invalidUrl,
            type: "image" as const,
          },
        ],
      };

      // Validate against schema - should fail
      const validationResult = createPostSchema.safeParse(postData);
      expect(validationResult.success).toBe(false);
    }
  });
});
