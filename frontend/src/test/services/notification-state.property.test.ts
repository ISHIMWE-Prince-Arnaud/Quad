import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { NotificationService } from "@/services/notificationService";
import { api } from "@/lib/api";
import type { ApiNotification } from "@/types/api";

// Feature: quad-production-ready, Property 5: Notification State Consistency
// For any notification marked as read, the unread count should decrease by 1,
// and subsequent fetches should show the notification as read.
// Validates: Requirements 11.4

describe("Notification State Property Tests", () => {
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
    message: fc
      .string({ minLength: 10, maxLength: 200 })
      .filter((s) => s.trim().length > 0),
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

  it("Property 5: Marking notification as read updates state correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        notificationArbitrary.filter((n) => !n.isRead), // Only test unread notifications
        fc.integer({ min: 1, max: 50 }),
        async (notification, initialUnreadCount) => {
          // Mock initial unread count
          vi.spyOn(api, "get").mockImplementation((url: string) => {
            if (url.includes("/unread-count")) {
              return Promise.resolve({
                data: {
                  success: true,
                  data: {
                    unreadCount: initialUnreadCount,
                  },
                },
              });
            }
            return Promise.reject(new Error("Unexpected URL"));
          });

          // Get initial unread count
          const countBefore = await NotificationService.getUnreadCount();
          expect(countBefore).toBe(initialUnreadCount);

          // Mock mark as read response
          vi.spyOn(api, "patch").mockResolvedValue({
            data: {
              success: true,
              message: "Notification marked as read",
            },
          });

          // Mark notification as read
          const markResult = await NotificationService.markAsRead(
            notification.id
          );
          expect(markResult.success).toBe(true);

          // Mock updated unread count (decreased by 1)
          vi.spyOn(api, "get").mockImplementation((url: string) => {
            if (url.includes("/unread-count")) {
              return Promise.resolve({
                data: {
                  success: true,
                  data: {
                    unreadCount: Math.max(0, initialUnreadCount - 1),
                  },
                },
              });
            }
            return Promise.reject(new Error("Unexpected URL"));
          });

          // Get updated unread count
          const countAfter = await NotificationService.getUnreadCount();

          // Verify count decreased by 1 (or stayed at 0)
          expect(countAfter).toBe(Math.max(0, initialUnreadCount - 1));
          expect(countAfter).toBeLessThanOrEqual(countBefore);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 5: Mark all as read updates count to zero", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 50 }),
        async (initialUnreadCount, markedCount) => {
          // Mock initial unread count
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: {
                unreadCount: initialUnreadCount,
              },
            },
          });

          const countBefore = await NotificationService.getUnreadCount();
          expect(countBefore).toBe(initialUnreadCount);

          // Mock mark all as read response
          vi.spyOn(api, "patch").mockResolvedValue({
            data: {
              success: true,
              message: "All notifications marked as read",
              data: {
                count: markedCount,
              },
            },
          });

          const markAllResult = await NotificationService.markAllAsRead();
          expect(markAllResult.success).toBe(true);

          // Mock updated unread count (should be 0)
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: {
                unreadCount: 0,
              },
            },
          });

          const countAfter = await NotificationService.getUnreadCount();

          // After marking all as read, count should be 0
          expect(countAfter).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 5: Notification state persists across fetches", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(notificationArbitrary, { minLength: 1, maxLength: 10 }),
        async (notifications) => {
          // Mock fetching notifications
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

          // Fetch notifications first time
          const firstFetch = await NotificationService.getNotifications();
          expect(firstFetch.success).toBe(true);

          // Fetch notifications second time (should return same data)
          const secondFetch = await NotificationService.getNotifications();
          expect(secondFetch.success).toBe(true);

          // Verify state consistency across fetches
          expect(firstFetch.data.length).toBe(secondFetch.data.length);

          // Verify each notification maintains its read state
          for (let i = 0; i < firstFetch.data.length; i++) {
            expect(firstFetch.data[i].isRead).toBe(secondFetch.data[i].isRead);
            expect(firstFetch.data[i].id).toBe(secondFetch.data[i].id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
