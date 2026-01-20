import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { ChatService } from "@/services/chatService";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";

// Feature: quad-production-ready, Property 40: Chat Message Display Completeness
// For any chat message, all required fields (author, text/media, timestamp) should be displayed.
// Validates: Requirements 12.1

describe("Chat Message Display Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arbitrary for generating valid chat authors
  const chatAuthorArbitrary = fc.record({
    clerkId: fc.uuid(),
    username: fc.string({ minLength: 3, maxLength: 20 }),
    email: fc.emailAddress(),
    profileImage: fc.option(fc.webUrl(), { nil: undefined }),
    bio: fc.option(fc.string({ minLength: 10, maxLength: 200 }), {
      nil: undefined,
    }),
  });

  // Arbitrary for generating valid chat messages
  const chatMessageArbitrary = fc.record({
    id: fc.uuid(),
    author: chatAuthorArbitrary,
    text: fc.option(fc.string({ minLength: 1, maxLength: 500 }), {
      nil: undefined,
    }),
    mentions: fc.array(fc.uuid(), { maxLength: 5 }),
    reactionsCount: fc.integer({ min: 0, max: 1000 }),
    isEdited: fc.boolean(),
    editedAt: fc.option(
      fc
        .integer({ min: new Date("2020-01-01").getTime(), max: Date.now() })
        .map((timestamp) => new Date(timestamp).toISOString()),
      { nil: null }
    ),
    timestamp: fc.string({ minLength: 5, maxLength: 20 }), // e.g., "Tue 2:13 PM"
    createdAt: fc
      .integer({ min: new Date("2020-01-01").getTime(), max: Date.now() })
      .map((timestamp) => new Date(timestamp).toISOString()),
    updatedAt: fc
      .integer({ min: new Date("2020-01-01").getTime(), max: Date.now() })
      .map((timestamp) => new Date(timestamp).toISOString()),
    userReaction: fc.option(
      fc.constantFrom("👍", "❤️", "😂", "😮", "😢", "😡"),
      {
        nil: null,
      }
    ),
  });

  // Filter to ensure text is present
  const validChatMessageArbitrary = chatMessageArbitrary.filter(
    (msg): msg is typeof msg & { text: string } =>
      typeof msg.text === "string" && msg.text.length > 0
  );

  it("Property 40: All chat messages contain required fields (author, text, timestamp)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validChatMessageArbitrary, { minLength: 1, maxLength: 30 }),
        async (messages) => {
          // Mock the API response
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: messages as ChatMessage[],
              pagination: {
                page: 1,
                limit: 30,
                total: messages.length,
                pages: 1,
                hasMore: false,
              },
            },
          });

          // Fetch messages via service
          const response = await ChatService.getMessages({
            page: 1,
            limit: 30,
          });

          // Verify response structure
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();
          expect(Array.isArray(response.data)).toBe(true);

          // Verify each message has required fields
          for (const message of response.data) {
            // Required field: author with username
            expect(message.author).toBeDefined();
            expect(message.author.clerkId).toBeDefined();
            expect(typeof message.author.clerkId).toBe("string");
            expect(message.author.username).toBeDefined();
            expect(typeof message.author.username).toBe("string");
            expect(message.author.username.length).toBeGreaterThan(0);

            // Required field: text must be present
            expect(message.text).toBeTruthy();

            // If text is present, verify it's a non-empty string
            if (message.text) {
              expect(typeof message.text).toBe("string");
              expect(message.text.length).toBeGreaterThan(0);
            }

            // Required field: timestamp
            expect(message.timestamp).toBeDefined();
            expect(typeof message.timestamp).toBe("string");
            expect(message.timestamp.length).toBeGreaterThan(0);

            // Required field: createdAt (ISO date string)
            expect(message.createdAt).toBeDefined();
            expect(typeof message.createdAt).toBe("string");
            // Verify it's a valid ISO date string
            expect(() => new Date(message.createdAt)).not.toThrow();
            expect(new Date(message.createdAt).toString()).not.toBe(
              "Invalid Date"
            );

            // Verify reactionsCount is a non-negative number
            expect(typeof message.reactionsCount).toBe("number");
            expect(message.reactionsCount).toBeGreaterThanOrEqual(0);

            // Verify isEdited is a boolean
            expect(typeof message.isEdited).toBe("boolean");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 40 (Edge Case): Messages with only text display correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            author: chatAuthorArbitrary,
            text: fc.string({ minLength: 1, maxLength: 500 }),
            mentions: fc.array(fc.uuid(), { maxLength: 5 }),
            reactionsCount: fc.integer({ min: 0, max: 1000 }),
            isEdited: fc.boolean(),
            editedAt: fc.constant(null),
            timestamp: fc.string({ minLength: 5, maxLength: 20 }),
            createdAt: fc
              .integer({
                min: new Date("2020-01-01").getTime(),
                max: Date.now(),
              })
              .map((timestamp) => new Date(timestamp).toISOString()),
            updatedAt: fc
              .integer({
                min: new Date("2020-01-01").getTime(),
                max: Date.now(),
              })
              .map((timestamp) => new Date(timestamp).toISOString()),
            userReaction: fc.constant(null),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (messages) => {
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: messages as ChatMessage[],
              pagination: {
                page: 1,
                limit: 30,
                total: messages.length,
                pages: 1,
                hasMore: false,
              },
            },
          });

          const response = await ChatService.getMessages({
            page: 1,
            limit: 30,
          });

          expect(response.success).toBe(true);
          for (const message of response.data) {
            expect(message.text).toBeDefined();
            expect(message.text!.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
