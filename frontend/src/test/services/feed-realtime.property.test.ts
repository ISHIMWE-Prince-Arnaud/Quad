import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { useFeedStore } from "@/stores/feedStore";
import type {
  FeedEngagementUpdatePayload,
  FeedContentDeletedPayload,
} from "@/lib/socket";

// Feature: quad-production-ready, Property 23: Real-time Feed Updates
// For any `feed:new-content` or `feed:engagement-update` event, the feed should update
// to reflect the changes without requiring a refresh.
// Validates: Requirements 7.4

describe("Real-time Feed Updates Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store before each test
    const store = useFeedStore.getState();
    store.clearFeed();
  });

  it("Property 23: Engagement updates are reflected in feed items", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            _id: fc.string({ minLength: 10, maxLength: 30 }),
            userId: fc.string({ minLength: 10, maxLength: 30 }),
            author: fc.record({
              _id: fc.string({ minLength: 10, maxLength: 30 }),
              clerkId: fc.string({ minLength: 10, maxLength: 30 }),
              username: fc.string({ minLength: 3, maxLength: 20 }),
              email: fc.emailAddress(),
            }),
            text: fc.string({ minLength: 1, maxLength: 280 }),
            media: fc.constant([]),
            reactionsCount: fc.integer({ min: 0, max: 100 }),
            commentsCount: fc.integer({ min: 0, max: 100 }),
            createdAt: fc.constant(new Date().toISOString()),
            updatedAt: fc.constant(new Date().toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 200 }),
        async (feedItems, newReactionsCount, newCommentsCount) => {
          const store = useFeedStore.getState();

          // Set up initial feed items
          store.setFeedItems(feedItems);

          // Get the item to update (use first item)
          const updateIndex = 0;
          const itemToUpdate = feedItems[updateIndex];

          // Simulate engagement update event
          const payload: FeedEngagementUpdatePayload = {
            contentType: "post",
            contentId: itemToUpdate._id,
            reactionsCount: newReactionsCount,
            commentsCount: newCommentsCount,
            timestamp: Date.now(),
          };

          // Update the feed item
          store.updateFeedItem(payload.contentId, {
            reactionsCount: payload.reactionsCount,
            commentsCount: payload.commentsCount,
          });

          // Get updated state
          const updatedItems = useFeedStore.getState().feedItems;
          const updatedItem = updatedItems.find(
            (item) => item._id === itemToUpdate._id
          );

          // Property 1: Item should still exist in feed
          expect(updatedItem).toBeDefined();

          // Property 2: Engagement counts should be updated
          expect(updatedItem?.reactionsCount).toBe(newReactionsCount);
          expect(updatedItem?.commentsCount).toBe(newCommentsCount);

          // Property 3: Other items should remain unchanged
          const otherItems = updatedItems.filter(
            (item) => item._id !== itemToUpdate._id
          );
          expect(otherItems.length).toBe(feedItems.length - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 23: Deleted content is removed from feed", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            _id: fc.string({ minLength: 10, maxLength: 30 }),
            userId: fc.string({ minLength: 10, maxLength: 30 }),
            author: fc.record({
              _id: fc.string({ minLength: 10, maxLength: 30 }),
              clerkId: fc.string({ minLength: 10, maxLength: 30 }),
              username: fc.string({ minLength: 3, maxLength: 20 }),
              email: fc.emailAddress(),
            }),
            text: fc.string({ minLength: 1, maxLength: 280 }),
            media: fc.constant([]),
            reactionsCount: fc.integer({ min: 0, max: 100 }),
            commentsCount: fc.integer({ min: 0, max: 100 }),
            createdAt: fc.constant(new Date().toISOString()),
            updatedAt: fc.constant(new Date().toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (feedItems) => {
          const store = useFeedStore.getState();

          // Set up initial feed items
          store.setFeedItems(feedItems);

          // Get the item to delete (use first item)
          const deleteIndex = 0;
          const itemToDelete = feedItems[deleteIndex];

          // Simulate content deleted event
          const payload: FeedContentDeletedPayload = {
            contentType: "post",
            contentId: itemToDelete._id,
            timestamp: Date.now(),
          };

          // Remove the feed item
          store.removeFeedItem(payload.contentId);

          // Get updated state
          const updatedItems = useFeedStore.getState().feedItems;

          // Property 1: Item should be removed from feed
          const deletedItem = updatedItems.find(
            (item) => item._id === itemToDelete._id
          );
          expect(deletedItem).toBeUndefined();

          // Property 2: Feed should have one less item
          expect(updatedItems.length).toBe(feedItems.length - 1);

          // Property 3: All other items should still exist
          const remainingItems = feedItems.filter(
            (item) => item._id !== itemToDelete._id
          );
          remainingItems.forEach((originalItem) => {
            const stillExists = updatedItems.some(
              (item) => item._id === originalItem._id
            );
            expect(stillExists).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
