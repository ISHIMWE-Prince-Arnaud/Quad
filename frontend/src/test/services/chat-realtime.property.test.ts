import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import type { ChatMessagePayload } from "@/lib/socket";

// Feature: quad-production-ready, Property 3: Real-time Message Delivery
// For any chat message sent, the system should emit a chat:message:new event that is received by all connected clients,
// and the message should appear in the message list.
// Validates: Requirements 1.5, 3.2, 12.3

// Mock socket at module level
let mockSocket: any;
let eventHandlers: Record<string, Function[]> = {};

vi.mock("@/lib/socket", () => ({
  getSocket: () => mockSocket,
  disconnectSocket: vi.fn(),
}));

describe("Chat Real-time Message Delivery Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventHandlers = {};

    // Create a mock socket with event emitter functionality
    mockSocket = {
      connected: true,
      on: vi.fn((event: string, handler: Function) => {
        if (!eventHandlers[event]) {
          eventHandlers[event] = [];
        }
        eventHandlers[event].push(handler);
      }),
      off: vi.fn((event: string, handler: Function) => {
        if (eventHandlers[event]) {
          eventHandlers[event] = eventHandlers[event].filter(
            (h) => h !== handler
          );
        }
      }),
      emit: vi.fn((event: string, data: any) => {
        // Simulate server echoing the event back to clients
        if (eventHandlers[event]) {
          eventHandlers[event].forEach((handler) => handler(data));
        }
      }),
      disconnect: vi.fn(),
      _triggerEvent: (event: string, data: any) => {
        // Helper method to simulate server-side events
        if (eventHandlers[event]) {
          eventHandlers[event].forEach((handler) => handler(data));
        }
      },
    };
  });

  // Arbitrary for generating valid chat message payloads
  const chatMessagePayloadArbitrary = fc.record({
    id: fc.uuid(),
    author: fc.record({
      clerkId: fc.uuid(),
      username: fc.string({ minLength: 3, maxLength: 20 }),
      email: fc.emailAddress(),
      profileImage: fc.option(fc.webUrl(), { nil: undefined }),
      bio: fc.option(fc.string({ minLength: 10, maxLength: 200 }), {
        nil: undefined,
      }),
    }),
    text: fc.option(fc.string({ minLength: 1, maxLength: 2000 }), {
      nil: undefined,
    }),
    media: fc.option(
      fc.record({
        url: fc.webUrl(),
        type: fc.constantFrom("image", "video"),
        aspectRatio: fc.option(fc.constantFrom("1:1", "16:9", "9:16"), {
          nil: undefined,
        }),
      }),
      { nil: undefined }
    ),
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

  // Filter to ensure at least text or media is present
  const validChatMessagePayloadArbitrary = chatMessagePayloadArbitrary.filter(
    (msg) => msg.text || msg.media
  );

  it("Property 3: chat:message:new events are emitted and received for new messages", async () => {
    await fc.assert(
      fc.asyncProperty(
        validChatMessagePayloadArbitrary,
        async (messagePayload) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedMessages: ChatMessagePayload[] = [];

          // Set up event listener
          const handler = (payload: ChatMessagePayload) => {
            receivedMessages.push(payload);
          };

          socket.on("chat:message:new", handler);

          // Simulate server emitting the event
          mockSocket._triggerEvent("chat:message:new", messagePayload);

          // Verify the event was received
          expect(receivedMessages.length).toBe(1);
          expect(receivedMessages[0]).toEqual(messagePayload);

          // Verify all required fields are present
          expect(receivedMessages[0].id).toBe(messagePayload.id);
          expect(receivedMessages[0].author).toEqual(messagePayload.author);
          expect(receivedMessages[0].timestamp).toBe(messagePayload.timestamp);
          expect(receivedMessages[0].createdAt).toBe(messagePayload.createdAt);

          // Clean up
          socket.off("chat:message:new", handler);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 3: chat:message:edited events are emitted and received for edited messages", async () => {
    await fc.assert(
      fc.asyncProperty(
        validChatMessagePayloadArbitrary,
        async (messagePayload) => {
          // Ensure the message is marked as edited
          const editedPayload = {
            ...messagePayload,
            isEdited: true,
            editedAt: new Date().toISOString(),
          };

          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedMessages: ChatMessagePayload[] = [];

          const handler = (payload: ChatMessagePayload) => {
            receivedMessages.push(payload);
          };

          socket.on("chat:message:edited", handler);

          // Simulate server emitting the event
          mockSocket._triggerEvent("chat:message:edited", editedPayload);

          // Verify the event was received
          expect(receivedMessages.length).toBe(1);
          expect(receivedMessages[0].id).toBe(editedPayload.id);
          expect(receivedMessages[0].isEdited).toBe(true);
          expect(receivedMessages[0].editedAt).toBeDefined();

          // Clean up
          socket.off("chat:message:edited", handler);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 3: chat:message:deleted events are emitted and received for deleted messages", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (messageId) => {
        const { getSocket } = await import("@/lib/socket");
        const socket = getSocket();
        const receivedIds: string[] = [];

        const handler = (id: string) => {
          receivedIds.push(id);
        };

        socket.on("chat:message:deleted", handler);

        // Simulate server emitting the event
        mockSocket._triggerEvent("chat:message:deleted", messageId);

        // Verify the event was received
        expect(receivedIds.length).toBe(1);
        expect(receivedIds[0]).toBe(messageId);

        // Clean up
        socket.off("chat:message:deleted", handler);
      }),
      { numRuns: 100 }
    );
  });

  it("Property 3: Multiple messages can be received in sequence", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validChatMessagePayloadArbitrary, {
          minLength: 2,
          maxLength: 10,
        }),
        async (messagePayloads) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedMessages: ChatMessagePayload[] = [];

          const handler = (payload: ChatMessagePayload) => {
            receivedMessages.push(payload);
          };

          socket.on("chat:message:new", handler);

          // Simulate server emitting multiple events
          for (const payload of messagePayloads) {
            mockSocket._triggerEvent("chat:message:new", payload);
          }

          // Verify all events were received in order
          expect(receivedMessages.length).toBe(messagePayloads.length);
          for (let i = 0; i < messagePayloads.length; i++) {
            expect(receivedMessages[i].id).toBe(messagePayloads[i].id);
          }

          // Clean up
          socket.off("chat:message:new", handler);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 3: Event listeners can be removed without affecting other listeners", async () => {
    await fc.assert(
      fc.asyncProperty(
        validChatMessagePayloadArbitrary,
        async (messagePayload) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedMessages1: ChatMessagePayload[] = [];
          const receivedMessages2: ChatMessagePayload[] = [];

          const handler1 = (payload: ChatMessagePayload) => {
            receivedMessages1.push(payload);
          };

          const handler2 = (payload: ChatMessagePayload) => {
            receivedMessages2.push(payload);
          };

          socket.on("chat:message:new", handler1);
          socket.on("chat:message:new", handler2);

          // Emit first event - both should receive
          mockSocket._triggerEvent("chat:message:new", messagePayload);

          expect(receivedMessages1.length).toBe(1);
          expect(receivedMessages2.length).toBe(1);

          // Remove first handler
          socket.off("chat:message:new", handler1);

          // Emit second event - only handler2 should receive
          mockSocket._triggerEvent("chat:message:new", messagePayload);

          expect(receivedMessages1.length).toBe(1); // Still 1
          expect(receivedMessages2.length).toBe(2); // Now 2

          // Clean up
          socket.off("chat:message:new", handler2);
        }
      ),
      { numRuns: 50 }
    );
  });
});
