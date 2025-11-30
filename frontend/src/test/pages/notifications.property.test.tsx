import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { NotificationService } from "@/services/notificationService";
import { api } from "@/lib/api";
import type { ApiNotification } from "@/types/api";

// Feature: quad-production-ready, Property 37: Notification Display Completeness
// For any notification, all required fields (actor, message, timestamp) should be displayed.
// Validates: Requirements 11.2

describe("Notification Display Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arbitrary for generating valid notifications
  const notificationArbitrary = fc.record({
    id: fc.uuid(),
    userId: fc.uuid(),
    type: fc.constantFrom(
      "follow",
      "reaction",
      "comment",
      "mention",
      "poll_vote"
    ),
    actorId: fc.uuid(),
    contentId: fc.option(fc.uuid(), { nil: undefined }),
    contentType: fc.option(
      fc.constantFrom("post", "story", "poll", "comment"),
      { nil: undefined }
    ),
    message: fc.string({ minLength: 10, maxLength: 200 }),
    isRead: fc.boolean(),
    createdAt: fc
      .integer({ min: new Date("2020-01-01").getTime(), max: Date.now() })
      .map((timestamp) => new Date(timestamp).toISOString()),
    actor: fc.record({
      clerkId: fc.uuid(),
      username: fc.string({ minLength: 3, maxLength: 20 }),
      email: fc.emailAddress(),
      displayName: fc.option(fc.string({ minLength: 3, maxLength: 50 }), {
        nil: undefined,
      }),
      profileImage: fc.option(fc.webUrl(), { nil: undefined }),
    }),
  });

  it("Property 37: All notifications contain required fields (actor, message, timestamp)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(notificationArbitrary, { minLength: 1, maxLength: 20 }),
        async (notifications) => {
          // Mock the API response
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: notifications as ApiNotification[],
              pagination: {
                page: 1,
                limit: 20,
                total: notifications.length,
                pages: 1,
                hasMore: false,
              },
            },
          });

          // Fetch notifications via service
          const response = await NotificationService.getNotifications({
            page: 1,
            limit: 20,
          });

          // Verify response structure
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();
          expect(Array.isArray(response.data)).toBe(true);

          // Verify each notification has required fields
          for (const notification of response.data) {
            // Required field: actor (with username or displayName)
            expect(notification.actor).toBeDefined();
            expect(
              notification.actor?.username || notification.actor?.displayName
            ).toBeDefined();

            // Required field: message
            expect(notification.message).toBeDefined();
            expect(typeof notification.message).toBe("string");
            expect(notification.message.length).toBeGreaterThan(0);

            // Required field: timestamp (createdAt)
            expect(notification.createdAt).toBeDefined();
            expect(typeof notification.createdAt).toBe("string");
            // Verify it's a valid ISO date string
            expect(() => new Date(notification.createdAt)).not.toThrow();
            expect(new Date(notification.createdAt).toString()).not.toBe(
              "Invalid Date"
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
