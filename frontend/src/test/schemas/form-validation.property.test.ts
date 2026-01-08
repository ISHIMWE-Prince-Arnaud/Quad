/**
 * Property-Based Tests for Form Validation
 * Feature: quad-production-ready, Property 7: Request Payload Schema Validation
 * Validates: Requirements 5.1
 *
 * Property: For any data sent to the backend, it should pass Zod schema validation
 * before the request is made, ensuring type safety and preventing invalid requests.
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  createPostSchema,
  createStorySchema,
  createPollSchema,
  updateProfileSchema,
  createCommentSchema,
  sendMessageSchema,
  searchQuerySchema,
} from "@/schemas";

describe("Property 7: Request Payload Schema Validation", () => {
  describe("Post Creation Schema", () => {
    it("should validate valid post data with text", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 1000 })
            .filter((s) => s.trim().length > 0),
          (text) => {
          const result = createPostSchema.safeParse({ text });
          expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should validate valid post data with media", () => {
      fc.assert(
        fc.property(
          fc.array(
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
          (media) => {
            const result = createPostSchema.safeParse({ media });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject post with neither text nor media", () => {
      const result = createPostSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject post with text exceeding 1000 characters", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1001, maxLength: 2000 }), (text) => {
          const result = createPostSchema.safeParse({ text });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should reject post with more than 10 media items", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              url: fc.webUrl(),
              type: fc.constantFrom("image" as const, "video" as const),
            }),
            { minLength: 11, maxLength: 20 }
          ),
          (media) => {
            const result = createPostSchema.safeParse({ media });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Story Creation Schema", () => {
    it("should validate valid story data", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 200 })
            .filter((s) => s.trim().length > 0),
          fc
            .string({ minLength: 1, maxLength: 5000 })
            .filter((s) => s.trim().length > 0),
          (title, content) => {
            const result = createStorySchema.safeParse({
              title,
              content,
              status: "draft",
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject story with empty title", () => {
      const result = createStorySchema.safeParse({
        title: "",
        content: "Some content",
      });
      expect(result.success).toBe(false);
    });

    it("should reject story with title exceeding 200 characters", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 201, maxLength: 300 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (title, content) => {
            const result = createStorySchema.safeParse({ title, content });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject story with more than 10 tags", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            minLength: 11,
            maxLength: 15,
          }),
          (title, content, tags) => {
            const result = createStorySchema.safeParse({
              title,
              content,
              tags,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Poll Creation Schema", () => {
    it("should validate valid poll data", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 10, maxLength: 500 })
            .filter((s) => s.trim().length >= 10),
          fc.array(
            fc.record({
              text: fc
                .string({ minLength: 1, maxLength: 200 })
                .filter((s) => s.trim().length > 0),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (question, options) => {
            const result = createPollSchema.safeParse({ question, options });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject poll with question less than 10 characters", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 9 }), (question) => {
          const result = createPollSchema.safeParse({
            question,
            options: [{ text: "Option 1" }, { text: "Option 2" }],
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should reject poll with less than 2 options", () => {
      const result = createPollSchema.safeParse({
        question: "What is your favorite color?",
        options: [{ text: "Red" }],
      });
      expect(result.success).toBe(false);
    });

    it("should reject poll with more than 5 options", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.array(
            fc.record({
              text: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 6, maxLength: 10 }
          ),
          (question, options) => {
            const result = createPollSchema.safeParse({ question, options });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Profile Update Schema", () => {
    it("should validate valid profile data", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc
            .string({ minLength: 3, maxLength: 30 })
            .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
          (firstName, lastName, username) => {
            const result = updateProfileSchema.safeParse({
              firstName,
              lastName,
              username,
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject profile with invalid username characters", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 3, maxLength: 30 })
            .filter((s) => /[^a-zA-Z0-9_]/.test(s)),
          (username) => {
            const result = updateProfileSchema.safeParse({
              firstName: "John",
              lastName: "Doe",
              username,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject profile with username less than 3 characters", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 2 }), (username) => {
          const result = updateProfileSchema.safeParse({
            firstName: "John",
            lastName: "Doe",
            username,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should reject profile with bio exceeding 500 characters", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 501, maxLength: 1000 }), (bio) => {
          const result = updateProfileSchema.safeParse({
            firstName: "John",
            lastName: "Doe",
            username: "johndoe",
            bio,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Comment Creation Schema", () => {
    it("should validate valid comment data", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("post" as const, "story" as const, "poll" as const),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc
            .string({ minLength: 1, maxLength: 2000 })
            .filter((s) => s.trim().length > 0),
          (contentType, contentId, text) => {
            const result = createCommentSchema.safeParse({
              contentType,
              contentId,
              text,
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject comment with empty text", () => {
      const result = createCommentSchema.safeParse({
        contentType: "post",
        contentId: "507f1f77bcf86cd799439011",
        text: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject comment with text exceeding 2000 characters", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 2001, maxLength: 3000 }), (text) => {
          const result = createCommentSchema.safeParse({
            contentType: "post",
            contentId: "507f1f77bcf86cd799439011",
            text,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Chat Message Schema", () => {
    it("should validate valid message with text", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 2000 })
            .filter((s) => s.trim().length > 0),
          (text) => {
            const result = sendMessageSchema.safeParse({ text });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should validate valid message with media", () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom("image" as const, "video" as const),
          (url, type) => {
            const result = sendMessageSchema.safeParse({
              media: { url, type },
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject message with neither text nor media", () => {
      const result = sendMessageSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject message with text exceeding 2000 characters", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 2001, maxLength: 3000 }), (text) => {
          const result = sendMessageSchema.safeParse({ text });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Search Query Schema", () => {
    it("should validate valid search query", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 200 }), (query) => {
          const result = searchQuerySchema.safeParse({ query });
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it("should reject search query exceeding 200 characters", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 201, maxLength: 300 }), (query) => {
          const result = searchQuerySchema.safeParse({ query });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should apply default values for optional fields", () => {
      const result = searchQuerySchema.safeParse({ query: "test" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("all");
        expect(result.data.sortBy).toBe("relevance");
        expect(result.data.limit).toBe(20);
        expect(result.data.page).toBe(1);
      }
    });
  });
});
