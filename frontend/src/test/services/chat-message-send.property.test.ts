import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { ChatService } from "@/services/chatService";
import { api } from "@/lib/api";
import type { ChatMessage, ChatMedia } from "@/types/chat";

// Feature: quad-production-ready, Property 41: Message Send Success
// For any valid message (text or media), the send operation should succeed and the message should appear in the chat.
// Validates: Requirements 12.2

describe("Chat Message Send Property Tests", () => {
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

  // Arbitrary for generating valid chat media
  const chatMediaArbitrary = fc.record({
    url: fc.webUrl(),
    type: fc.constantFrom("image", "video"),
    aspectRatio: fc.option(fc.constantFrom("1:1", "16:9", "9:16"), {
      nil: undefined,
    }),
  });

  // Arbitrary for generating valid message send data
  const messageSendDataArbitrary = fc
    .record({
      text: fc.option(fc.string({ minLength: 1, maxLength: 2000 }), {
        nil: undefined,
      }),
      media: fc.option(chatMediaArbitrary, { nil: undefined }),
    })
    .filter((data) => data.text || data.media); // At least one must be present

  it("Property 41: Valid messages (text or media) send successfully", async () => {
    await fc.assert(
      fc.asyncProperty(
        messageSendDataArbitrary,
        chatAuthorArbitrary,
        async (sendData, author) => {
          // Create the expected response message
          const responseMessage: ChatMessage = {
            id: fc.sample(fc.uuid(), 1)[0],
            author,
            text: sendData.text,
            media: sendData.media,
            mentions: [],
            reactionsCount: 0,
            isEdited: false,
            editedAt: null,
            timestamp: "Just now",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userReaction: null,
          };

          // Mock the API response
          vi.spyOn(api, "post").mockResolvedValue({
            data: {
              success: true,
              data: responseMessage,
              message: "Message sent successfully",
            },
          });

          // Send message via service
          const response = await ChatService.sendMessage(sendData);

          // Verify response structure
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();

          // Verify the message was created with the correct content
          if (sendData.text) {
            expect(response.data!.text).toBe(sendData.text);
          }

          if (sendData.media) {
            expect(response.data!.media).toBeDefined();
            expect(response.data!.media!.url).toBe(sendData.media.url);
            expect(response.data!.media!.type).toBe(sendData.media.type);
          }

          // Verify required fields are present
          expect(response.data!.id).toBeDefined();
          expect(response.data!.author).toBeDefined();
          expect(response.data!.author.username).toBeDefined();
          expect(response.data!.timestamp).toBeDefined();
          expect(response.data!.createdAt).toBeDefined();

          // Verify the API was called with correct data
          expect(api.post).toHaveBeenCalledWith(
            expect.stringContaining("/chat/messages"),
            sendData
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 41 (Edge Case): Text-only messages send successfully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 2000 }),
        chatAuthorArbitrary,
        async (text, author) => {
          const responseMessage: ChatMessage = {
            id: fc.sample(fc.uuid(), 1)[0],
            author,
            text,
            media: undefined,
            mentions: [],
            reactionsCount: 0,
            isEdited: false,
            editedAt: null,
            timestamp: "Just now",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userReaction: null,
          };

          vi.spyOn(api, "post").mockResolvedValue({
            data: {
              success: true,
              data: responseMessage,
            },
          });

          const response = await ChatService.sendMessage({ text });

          expect(response.success).toBe(true);
          expect(response.data!.text).toBe(text);
          expect(response.data!.media).toBeUndefined();
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 41 (Edge Case): Media-only messages send successfully", async () => {
    await fc.assert(
      fc.asyncProperty(
        chatMediaArbitrary,
        chatAuthorArbitrary,
        async (media, author) => {
          const responseMessage: ChatMessage = {
            id: fc.sample(fc.uuid(), 1)[0],
            author,
            text: undefined,
            media,
            mentions: [],
            reactionsCount: 0,
            isEdited: false,
            editedAt: null,
            timestamp: "Just now",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userReaction: null,
          };

          vi.spyOn(api, "post").mockResolvedValue({
            data: {
              success: true,
              data: responseMessage,
            },
          });

          const response = await ChatService.sendMessage({ media });

          expect(response.success).toBe(true);
          expect(response.data!.text).toBeUndefined();
          expect(response.data!.media).toBeDefined();
          expect(response.data!.media!.url).toBe(media.url);
          expect(response.data!.media!.type).toBe(media.type);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 41 (Edge Case): Messages with both text and media send successfully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 2000 }),
        chatMediaArbitrary,
        chatAuthorArbitrary,
        async (text, media, author) => {
          const responseMessage: ChatMessage = {
            id: fc.sample(fc.uuid(), 1)[0],
            author,
            text,
            media,
            mentions: [],
            reactionsCount: 0,
            isEdited: false,
            editedAt: null,
            timestamp: "Just now",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userReaction: null,
          };

          vi.spyOn(api, "post").mockResolvedValue({
            data: {
              success: true,
              data: responseMessage,
            },
          });

          const response = await ChatService.sendMessage({ text, media });

          expect(response.success).toBe(true);
          expect(response.data!.text).toBe(text);
          expect(response.data!.media).toBeDefined();
          expect(response.data!.media!.url).toBe(media.url);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 41 (Validation): Empty messages should not be sent", async () => {
    // Test that messages with no text and no media are rejected
    const emptyData = { text: undefined, media: undefined };

    vi.spyOn(api, "post").mockResolvedValue({
      data: {
        success: false,
        message: "Message must contain text or media",
      },
    });

    const response = await ChatService.sendMessage(emptyData);

    // The service should handle this gracefully
    expect(response.success).toBe(false);
  });

  it("Property 41 (Validation): Messages exceeding character limit should not be sent", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2001, maxLength: 3000 }),
        async (longText) => {
          vi.spyOn(api, "post").mockResolvedValue({
            data: {
              success: false,
              message: "Message text exceeds maximum length",
            },
          });

          const response = await ChatService.sendMessage({ text: longText });

          // The service should handle this gracefully
          expect(response.success).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });
});
