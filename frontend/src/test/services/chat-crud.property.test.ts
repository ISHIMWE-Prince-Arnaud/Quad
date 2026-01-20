import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { ChatService } from "@/services/chatService";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";

// Feature: quad-production-ready, Property 44: Message Edit and Delete
// For any message owned by the current user, edit and delete operations should be available and functional.
// Validates: Requirements 12.6

describe("Chat Message CRUD Property Tests", () => {
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
    text: fc.option(fc.string({ minLength: 1, maxLength: 2000 }), {
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
    timestamp: fc.string({ minLength: 5, maxLength: 20 }),
    createdAt: fc
      .integer({ min: new Date("2020-01-01").getTime(), max: Date.now() })
      .map((timestamp) => new Date(timestamp).toISOString()),
    updatedAt: fc
      .integer({ min: new Date("2020-01-01").getTime(), max: Date.now() })
      .map((timestamp) => new Date(timestamp).toISOString()),
    userReaction: fc.option(
      fc.constantFrom("👍", "❤️", "😂", "😮", "😢", "😡"),
      { nil: null }
    ),
  });

  // Filter to ensure text is present
  const validChatMessageArbitrary = chatMessageArbitrary.filter(
    (msg): msg is typeof msg & { text: string } =>
      typeof msg.text === "string" && msg.text.length > 0
  );

  it("Property 44: Messages can be edited and the edited version is returned", async () => {
    await fc.assert(
      fc.asyncProperty(
        validChatMessageArbitrary,
        fc.string({ minLength: 1, maxLength: 2000 }),
        async (originalMessage, newText) => {
          // Create the edited message
          const editedMessage: ChatMessage = {
            ...originalMessage,
            text: newText,
            isEdited: true,
            editedAt: new Date().toISOString(),
          };

          // Mock the API response for edit
          vi.spyOn(api, "put").mockResolvedValue({
            data: {
              success: true,
              data: editedMessage,
              message: "Message edited successfully",
            },
          });

          // Edit message via service
          const response = await ChatService.editMessage(originalMessage.id, {
            text: newText,
          });

          // Verify response structure
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();

          // Verify the message was edited
          expect(response.data!.id).toBe(originalMessage.id);
          expect(response.data!.text).toBe(newText);
          expect(response.data!.isEdited).toBe(true);
          expect(response.data!.editedAt).toBeDefined();

          // Verify the API was called with correct data
          expect(api.put).toHaveBeenCalledWith(
            expect.stringContaining(`/chat/messages/${originalMessage.id}`),
            { text: newText }
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 44: Messages can be deleted successfully", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (messageId) => {
        // Mock the API response for delete
        vi.spyOn(api, "delete").mockResolvedValue({
          data: {
            success: true,
            message: "Message deleted successfully",
          },
        });

        // Delete message via service
        const response = await ChatService.deleteMessage(messageId);

        // Verify response structure
        expect(response.success).toBe(true);

        // Verify the API was called with correct message ID
        expect(api.delete).toHaveBeenCalledWith(
          expect.stringContaining(`/chat/messages/${messageId}`)
        );
      }),
      { numRuns: 100 }
    );
  });

  it("Property 44: Editing a message preserves its ID and author", async () => {
    await fc.assert(
      fc.asyncProperty(
        validChatMessageArbitrary,
        fc.string({ minLength: 1, maxLength: 2000 }),
        async (originalMessage, newText) => {
          const editedMessage: ChatMessage = {
            ...originalMessage,
            text: newText,
            isEdited: true,
            editedAt: new Date().toISOString(),
          };

          vi.spyOn(api, "put").mockResolvedValue({
            data: {
              success: true,
              data: editedMessage,
            },
          });

          const response = await ChatService.editMessage(originalMessage.id, {
            text: newText,
          });

          expect(response.success).toBe(true);
          expect(response.data!.id).toBe(originalMessage.id);
          expect(response.data!.author).toEqual(originalMessage.author);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 44: Multiple edits can be performed on the same message", async () => {
    await fc.assert(
      fc.asyncProperty(
        validChatMessageArbitrary,
        fc.array(fc.string({ minLength: 1, maxLength: 2000 }), {
          minLength: 2,
          maxLength: 5,
        }),
        async (originalMessage, editTexts) => {
          let currentMessage = originalMessage;

          for (const newText of editTexts) {
            const editedMessage: ChatMessage = {
              ...currentMessage,
              text: newText,
              isEdited: true,
              editedAt: new Date().toISOString(),
            };

            vi.spyOn(api, "put").mockResolvedValue({
              data: {
                success: true,
                data: editedMessage,
              },
            });

            const response = await ChatService.editMessage(currentMessage.id, {
              text: newText,
            });

            expect(response.success).toBe(true);
            expect(response.data!.text).toBe(newText);
            expect(response.data!.isEdited).toBe(true);

            currentMessage = editedMessage;
          }

          // Verify final state has the last edit
          expect(currentMessage.text).toBe(editTexts[editTexts.length - 1]);
          expect(currentMessage.isEdited).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 44: Deleting a non-existent message returns an error", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (messageId) => {
        // Mock the API response for delete failure
        vi.spyOn(api, "delete").mockResolvedValue({
          data: {
            success: false,
            message: "Message not found",
          },
        });

        const response = await ChatService.deleteMessage(messageId);

        expect(response.success).toBe(false);
        expect(response.message).toBeDefined();
      }),
      { numRuns: 50 }
    );
  });

  it("Property 44: Editing with empty text should fail validation", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (messageId) => {
        // Mock the API response for edit failure
        vi.spyOn(api, "put").mockResolvedValue({
          data: {
            success: false,
            message: "Message text cannot be empty",
          },
        });

        const response = await ChatService.editMessage(messageId, {
          text: "",
        });

        expect(response.success).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  it("Property 44: Edit and delete operations maintain message integrity", async () => {
    await fc.assert(
      fc.asyncProperty(
        validChatMessageArbitrary,
        fc.string({ minLength: 1, maxLength: 2000 }),
        async (originalMessage, newText) => {
          // First, edit the message
          const editedMessage: ChatMessage = {
            ...originalMessage,
            text: newText,
            isEdited: true,
            editedAt: new Date().toISOString(),
          };

          vi.spyOn(api, "put").mockResolvedValue({
            data: {
              success: true,
              data: editedMessage,
            },
          });

          const editResponse = await ChatService.editMessage(
            originalMessage.id,
            { text: newText }
          );

          expect(editResponse.success).toBe(true);
          expect(editResponse.data!.id).toBe(originalMessage.id);

          // Then, delete the message
          vi.spyOn(api, "delete").mockResolvedValue({
            data: {
              success: true,
              message: "Message deleted successfully",
            },
          });

          const deleteResponse = await ChatService.deleteMessage(
            originalMessage.id
          );

          expect(deleteResponse.success).toBe(true);

          // Verify both operations used the same message ID
          expect(api.put).toHaveBeenCalledWith(
            expect.stringContaining(`/chat/messages/${originalMessage.id}`),
            expect.anything()
          );
          expect(api.delete).toHaveBeenCalledWith(
            expect.stringContaining(`/chat/messages/${originalMessage.id}`)
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});
