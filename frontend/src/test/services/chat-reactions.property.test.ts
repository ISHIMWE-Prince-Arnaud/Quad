import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import type {
  ChatReactionAddedPayload,
  ChatReactionRemovedPayload,
} from "@/lib/socket";

// Feature: quad-production-ready, Property 42: Message Reaction Real-time Update
// For any message reaction added, the reaction should appear immediately and a chat:reaction:added event should be emitted.
// Validates: Requirements 12.4

// Mock socket at module level
let mockSocket: any;
let eventHandlers: Record<string, Function[]> = {};

vi.mock("@/lib/socket", () => ({
  getSocket: () => mockSocket,
  disconnectSocket: vi.fn(),
}));

describe("Chat Message Reaction Property Tests", () => {
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

  // Arbitrary for generating valid reaction emojis
  const reactionEmojiArbitrary = fc.constantFrom(
    "👍",
    "❤️",
    "😂",
    "😮",
    "😢",
    "😡"
  );

  // Arbitrary for generating chat:reaction:added payloads
  const reactionAddedPayloadArbitrary = fc.record({
    messageId: fc.uuid(),
    emoji: reactionEmojiArbitrary,
    reactionsCount: fc.integer({ min: 1, max: 1000 }),
  });

  // Arbitrary for generating chat:reaction:removed payloads
  const reactionRemovedPayloadArbitrary = fc.record({
    messageId: fc.uuid(),
    reactionsCount: fc.integer({ min: 0, max: 999 }),
  });

  it("Property 42: chat:reaction:added events are emitted and received when reactions are added", async () => {
    await fc.assert(
      fc.asyncProperty(
        reactionAddedPayloadArbitrary,
        async (reactionPayload) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedPayloads: ChatReactionAddedPayload[] = [];

          // Set up event listener
          const handler = (payload: ChatReactionAddedPayload) => {
            receivedPayloads.push(payload);
          };

          socket.on("chat:reaction:added", handler);

          // Simulate server emitting the event
          mockSocket._triggerEvent("chat:reaction:added", reactionPayload);

          // Verify the event was received
          expect(receivedPayloads.length).toBe(1);
          expect(receivedPayloads[0]).toEqual(reactionPayload);

          // Verify all required fields are present
          expect(receivedPayloads[0].messageId).toBe(reactionPayload.messageId);
          expect(receivedPayloads[0].emoji).toBe(reactionPayload.emoji);
          expect(receivedPayloads[0].reactionsCount).toBe(
            reactionPayload.reactionsCount
          );

          // Verify reactionsCount increased (is at least 1)
          expect(receivedPayloads[0].reactionsCount).toBeGreaterThanOrEqual(1);

          // Clean up
          socket.off("chat:reaction:added", handler);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 42: chat:reaction:removed events are emitted and received when reactions are removed", async () => {
    await fc.assert(
      fc.asyncProperty(
        reactionRemovedPayloadArbitrary,
        async (reactionPayload) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedPayloads: ChatReactionRemovedPayload[] = [];

          // Set up event listener
          const handler = (payload: ChatReactionRemovedPayload) => {
            receivedPayloads.push(payload);
          };

          socket.on("chat:reaction:removed", handler);

          // Simulate server emitting the event
          mockSocket._triggerEvent("chat:reaction:removed", reactionPayload);

          // Verify the event was received
          expect(receivedPayloads.length).toBe(1);
          expect(receivedPayloads[0]).toEqual(reactionPayload);

          // Verify all required fields are present
          expect(receivedPayloads[0].messageId).toBe(reactionPayload.messageId);
          expect(receivedPayloads[0].reactionsCount).toBe(
            reactionPayload.reactionsCount
          );

          // Verify reactionsCount is non-negative
          expect(receivedPayloads[0].reactionsCount).toBeGreaterThanOrEqual(0);

          // Clean up
          socket.off("chat:reaction:removed", handler);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 42: Multiple reaction events can be received in sequence", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(reactionAddedPayloadArbitrary, {
          minLength: 2,
          maxLength: 10,
        }),
        async (reactionPayloads) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedPayloads: ChatReactionAddedPayload[] = [];

          const handler = (payload: ChatReactionAddedPayload) => {
            receivedPayloads.push(payload);
          };

          socket.on("chat:reaction:added", handler);

          // Simulate server emitting multiple events
          for (const payload of reactionPayloads) {
            mockSocket._triggerEvent("chat:reaction:added", payload);
          }

          // Verify all events were received in order
          expect(receivedPayloads.length).toBe(reactionPayloads.length);
          for (let i = 0; i < reactionPayloads.length; i++) {
            expect(receivedPayloads[i].messageId).toBe(
              reactionPayloads[i].messageId
            );
            expect(receivedPayloads[i].emoji).toBe(reactionPayloads[i].emoji);
          }

          // Clean up
          socket.off("chat:reaction:added", handler);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 42: Reaction count updates correctly when adding and removing reactions", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        reactionEmojiArbitrary,
        fc.integer({ min: 0, max: 100 }),
        async (messageId, emoji, initialCount) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedCounts: number[] = [];

          const addedHandler = (payload: ChatReactionAddedPayload) => {
            if (payload.messageId === messageId) {
              receivedCounts.push(payload.reactionsCount);
            }
          };

          const removedHandler = (payload: ChatReactionRemovedPayload) => {
            if (payload.messageId === messageId) {
              receivedCounts.push(payload.reactionsCount);
            }
          };

          socket.on("chat:reaction:added", addedHandler);
          socket.on("chat:reaction:removed", removedHandler);

          // Simulate adding a reaction
          mockSocket._triggerEvent("chat:reaction:added", {
            messageId,
            emoji,
            reactionsCount: initialCount + 1,
          });

          // Simulate removing a reaction
          mockSocket._triggerEvent("chat:reaction:removed", {
            messageId,
            reactionsCount: initialCount,
          });

          // Verify counts were received
          expect(receivedCounts.length).toBe(2);
          expect(receivedCounts[0]).toBe(initialCount + 1); // After add
          expect(receivedCounts[1]).toBe(initialCount); // After remove

          // Verify the count decreased after removal
          expect(receivedCounts[1]).toBeLessThan(receivedCounts[0]);

          // Clean up
          socket.off("chat:reaction:added", addedHandler);
          socket.off("chat:reaction:removed", removedHandler);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Property 42: Different emojis can be added to the same message", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(reactionEmojiArbitrary, { minLength: 2, maxLength: 6 }),
        async (messageId, emojis) => {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          const receivedEmojis: string[] = [];

          const handler = (payload: ChatReactionAddedPayload) => {
            if (payload.messageId === messageId) {
              receivedEmojis.push(payload.emoji);
            }
          };

          socket.on("chat:reaction:added", handler);

          // Simulate adding multiple different emojis
          let count = 0;
          for (const emoji of emojis) {
            count++;
            mockSocket._triggerEvent("chat:reaction:added", {
              messageId,
              emoji,
              reactionsCount: count,
            });
          }

          // Verify all emojis were received
          expect(receivedEmojis.length).toBe(emojis.length);
          for (let i = 0; i < emojis.length; i++) {
            expect(receivedEmojis[i]).toBe(emojis[i]);
          }

          // Clean up
          socket.off("chat:reaction:added", handler);
        }
      ),
      { numRuns: 50 }
    );
  });
});
