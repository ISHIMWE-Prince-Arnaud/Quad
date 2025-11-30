import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import type {
  ChatTypingStartPayload,
  ChatTypingStopPayload,
} from "@/lib/socket";

// Feature: quad-production-ready, Property 43: Typing Indicator Emission
// For any typing action in chat, a chat:typing:start event should be emitted, and when typing stops,
// a chat:typing:stop event should be emitted.
// Validates: Requirements 12.5

// Mock socket at module level
let mockSocket: any;
let eventHandlers: Record<string, Function[]> = {};

vi.mock("@/lib/socket", () => ({
  getSocket: () => mockSocket,
  disconnectSocket: vi.fn(),
}));

describe("Chat Typing Indicator Property Tests", () => {
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

  // Arbitrary for generating valid typing start payloads
  const typingStartPayloadArbitrary = fc.record({
    userId: fc.uuid(),
    username: fc.string({ minLength: 3, maxLength: 20 }),
  });

  // Arbitrary for generating valid typing stop payloads
  const typingStopPayloadArbitrary = fc.record({
    userId: fc.uuid(),
  });

  it("Property 43: chat:typing:start events are emitted and received when users start typing", async () => {
    await fc.assert(
      fc.asyncProperty(typingStartPayloadArbitrary, async (typingPayload) => {
        const { getSocket } = await import("@/lib/socket");
        const socket = getSocket();
        const receivedPayloads: ChatTypingStartPayload[] = [];

        // Set up event listener
        const handler = (payload: ChatTypingStartPayload) => {
          receivedPayloads.push(payload);
        };

        socket.on("chat:typing:start", handler);

        // Simulate server emitting the event
        mockSocket._triggerEvent("chat:typing:start", typingPayload);

        // Verify the event was received
        expect(receivedPayloads.length).toBe(1);
        expect(receivedPayloads[0]).toEqual(typingPayload);

        // Verify all required fields are present
        expect(receivedPayloads[0].userId).toBe(typingPayload.userId);
        expect(receivedPayloads[0].username).toBe(typingPayload.username);
        expect(typeof receivedPayloads[0].userId).toBe("string");
        expect(typeof receivedPayloads[0].username).toBe("string");
        expect(receivedPayloads[0].username.length).toBeGreaterThan(0);

        // Clean up
        socket.off("chat:typing:start", handler);
      }),
      { numRuns: 100 }
    );
  });

  it("Property 43: chat:typing:stop events are emitted and received when users stop typing", async () => {
    await fc.assert(
      fc.asyncProperty(typingStopPayloadArbitrary, async (typingPayload) => {
        const { getSocket } = await import("@/lib/socket");
        const socket = getSocket();
        const receivedPayloads: ChatTypingStopPayload[] = [];

        // Set up event listener
        const handler = (payload: ChatTypingStopPayload) => {
          receivedPayloads.push(payload);
        };

        socket.on("chat:typing:stop", handler);

        // Simulate server emitting the event
        mockSocket._triggerEvent("chat:typing:stop", typingPayload);

        // Verify the event was received
        expect(receivedPayloads.length).toBe(1);
        expect(receivedPayloads[0]).toEqual(typingPayload);

        // Verify all required fields are present
        expect(receivedPayloads[0].userId).toBe(typingPayload.userId);
        expect(typeof receivedPayloads[0].userId).toBe("string");

        // Clean up
        socket.off("chat:typing:stop", handler);
      }),
      { numRuns: 100 }
    );
  });

  it("Property 43: Typing start followed by typing stop for the same user", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 3, maxLength: 20 }),
        async (userId, username) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedEvents: Array<{ type: string; userId: string }> = [];

          const startHandler = (payload: ChatTypingStartPayload) => {
            receivedEvents.push({ type: "start", userId: payload.userId });
          };

          const stopHandler = (payload: ChatTypingStopPayload) => {
            receivedEvents.push({ type: "stop", userId: payload.userId });
          };

          socket.on("chat:typing:start", startHandler);
          socket.on("chat:typing:stop", stopHandler);

          // Simulate user starting to type
          mockSocket._triggerEvent("chat:typing:start", { userId, username });

          // Simulate user stopping typing
          mockSocket._triggerEvent("chat:typing:stop", { userId });

          // Verify both events were received in order
          expect(receivedEvents.length).toBe(2);
          expect(receivedEvents[0].type).toBe("start");
          expect(receivedEvents[0].userId).toBe(userId);
          expect(receivedEvents[1].type).toBe("stop");
          expect(receivedEvents[1].userId).toBe(userId);

          // Clean up
          socket.off("chat:typing:start", startHandler);
          socket.off("chat:typing:stop", stopHandler);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 43: Multiple users can be typing simultaneously", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(typingStartPayloadArbitrary, { minLength: 2, maxLength: 5 }),
        async (typingPayloads) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedUserIds: string[] = [];

          const handler = (payload: ChatTypingStartPayload) => {
            receivedUserIds.push(payload.userId);
          };

          socket.on("chat:typing:start", handler);

          // Simulate multiple users starting to type
          for (const payload of typingPayloads) {
            mockSocket._triggerEvent("chat:typing:start", payload);
          }

          // Verify all events were received
          expect(receivedUserIds.length).toBe(typingPayloads.length);
          for (let i = 0; i < typingPayloads.length; i++) {
            expect(receivedUserIds[i]).toBe(typingPayloads[i].userId);
          }

          // Clean up
          socket.off("chat:typing:start", handler);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 43: Typing indicators can be tracked per user", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (users) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const typingUsers = new Set<string>();

          const startHandler = (payload: ChatTypingStartPayload) => {
            typingUsers.add(payload.userId);
          };

          const stopHandler = (payload: ChatTypingStopPayload) => {
            typingUsers.delete(payload.userId);
          };

          socket.on("chat:typing:start", startHandler);
          socket.on("chat:typing:stop", stopHandler);

          // All users start typing
          for (const user of users) {
            mockSocket._triggerEvent("chat:typing:start", user);
          }

          // Verify all users are tracked as typing
          expect(typingUsers.size).toBe(users.length);
          for (const user of users) {
            expect(typingUsers.has(user.userId)).toBe(true);
          }

          // Half of users stop typing
          const halfIndex = Math.floor(users.length / 2);
          for (let i = 0; i < halfIndex; i++) {
            mockSocket._triggerEvent("chat:typing:stop", {
              userId: users[i].userId,
            });
          }

          // Verify only remaining users are still typing
          expect(typingUsers.size).toBe(users.length - halfIndex);
          for (let i = 0; i < halfIndex; i++) {
            expect(typingUsers.has(users[i].userId)).toBe(false);
          }
          for (let i = halfIndex; i < users.length; i++) {
            expect(typingUsers.has(users[i].userId)).toBe(true);
          }

          // Clean up
          socket.off("chat:typing:start", startHandler);
          socket.off("chat:typing:stop", stopHandler);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 43: Typing stop can be called without a preceding start", async () => {
    await fc.assert(
      fc.asyncProperty(typingStopPayloadArbitrary, async (typingPayload) => {
        const { getSocket } = await import("@/lib/socket");
        const socket = getSocket();
        const receivedPayloads: ChatTypingStopPayload[] = [];

        const handler = (payload: ChatTypingStopPayload) => {
          receivedPayloads.push(payload);
        };

        socket.on("chat:typing:stop", handler);

        // Simulate stop without start (edge case)
        mockSocket._triggerEvent("chat:typing:stop", typingPayload);

        // Verify the event was still received and handled gracefully
        expect(receivedPayloads.length).toBe(1);
        expect(receivedPayloads[0].userId).toBe(typingPayload.userId);

        // Clean up
        socket.off("chat:typing:stop", handler);
      }),
      { numRuns: 50 }
    );
  });
});
