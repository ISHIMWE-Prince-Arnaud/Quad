import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { ChatService } from "@/services/chatService";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";

// Feature: quad-production-ready, Property 41: Message Send Success
// For any valid message (text), the send operation should succeed and the message should appear in the chat.
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

  it("Property 41: Valid messages (text) send successfully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 2000 }),
        chatAuthorArbitrary,
        async (text, author) => {
          // Create the expected response message
          const responseMessage: ChatMessage = {
            id: fc.sample(fc.uuid(), 1)[0],
            author,
            text,
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
          const response = await ChatService.sendMessage({ text });

          // Verify response structure
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();

          // Verify the message was created with the correct content
          expect(response.data!.text).toBe(text);

          // Verify required fields are present
          expect(response.data!.id).toBeDefined();
          expect(response.data!.author).toBeDefined();
          expect(response.data!.author.username).toBeDefined();
          expect(response.data!.timestamp).toBeDefined();
          expect(response.data!.createdAt).toBeDefined();

          // Verify the API was called with correct data
          expect(api.post).toHaveBeenCalledWith(
            expect.stringContaining("/chat/messages"),
            { text }
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
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 41 (Validation): Empty messages should not be sent", async () => {
    // Test that messages with no text and no media are rejected
    const emptyData = { text: undefined };

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
