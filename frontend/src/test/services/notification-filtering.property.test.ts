import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { NotificationService } from "@/services/notificationService";
import { api } from "@/lib/api";
import type { ApiNotification } from "@/types/api";

// Feature: quad-production-ready, Property 39: Notification Filter Correctness
// For any notification filter applied (all vs unread), only notifications matching the filter should be displayed.
// Validates: Requirements 11.5

describe("Notification Filtering Property Tests", () => {
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

  it("Property 39: Unread filter returns only unread notifications", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(notificationArbitrary, { minLength: 5, maxLength: 20 }),
        async (allNotifications) => {
          // Separate notifications into read and unread
          const unreadNotifications = allNotifications.filter((n) => !n.isRead);

          // Mock API to return only unread notifications when filter is applied
          vi.spyOn(api, "get").mockImplementation(
            (url: string, config?: any) => {
              const params = config?.params || {};

              if (params.unreadOnly === true) {
                return Promise.resolve({
                  data: {
                    success: true,
                    data: unreadNotifications as ApiNotification[],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: unreadNotifications.length,
                      pages: 1,
                      hasMore: false,
                    },
                  },
                });
              } else {
                return Promise.resolve({
                  data: {
                    success: true,
                    data: allNotifications as ApiNotification[],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: allNotifications.length,
                      pages: 1,
                      hasMore: false,
                    },
                  },
                });
              }
            }
          );

          // Fetch with unread filter
          const unreadResponse = await NotificationService.getNotifications({
            unreadOnly: true,
          });

          expect(unreadResponse.success).toBe(true);
          expect(Array.isArray(unreadResponse.data)).toBe(true);

          // Verify all returned notifications are unread
          for (const notification of unreadResponse.data) {
            expect(notification.isRead).toBe(false);
          }

          // Verify count matches expected unread count
          expect(unreadResponse.data.length).toBe(unreadNotifications.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 39: All filter returns both read and unread notifications", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(notificationArbitrary, { minLength: 5, maxLength: 20 }),
        async (allNotifications) => {
          // Mock API to return all notifications
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: allNotifications as ApiNotification[],
              pagination: {
                page: 1,
                limit: 20,
                total: allNotifications.length,
                pages: 1,
                hasMore: false,
              },
            },
          });

          // Fetch without filter (all notifications)
          const allResponse = await NotificationService.getNotifications({
            unreadOnly: false,
          });

          expect(allResponse.success).toBe(true);
          expect(Array.isArray(allResponse.data)).toBe(true);

          // Verify count matches total notifications
          expect(allResponse.data.length).toBe(allNotifications.length);

          // Verify both read and unread notifications can be present
          const hasRead = allResponse.data.some((n) => n.isRead);
          const hasUnread = allResponse.data.some((n) => !n.isRead);

          // If we have both types in the input, both should be in the output
          const inputHasRead = allNotifications.some((n) => n.isRead);
          const inputHasUnread = allNotifications.some((n) => !n.isRead);

          if (inputHasRead) {
            expect(hasRead).toBe(true);
          }
          if (inputHasUnread) {
            expect(hasUnread).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 39: Filter parameter is correctly passed to API", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 5 }),
        async (unreadOnly, limit, page) => {
          let capturedParams: any = null;

          // Mock API and capture the params
          vi.spyOn(api, "get").mockImplementation(
            (url: string, config?: any) => {
              capturedParams = config?.params || {};
              return Promise.resolve({
                data: {
                  success: true,
                  data: [],
                  pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    pages: 1,
                    hasMore: false,
                  },
                },
              });
            }
          );

          // Fetch with specific parameters
          await NotificationService.getNotifications({
            unreadOnly,
            limit,
            page,
          });

          // Verify the parameters were passed correctly
          expect(capturedParams).toBeDefined();
          expect(capturedParams.unreadOnly).toBe(unreadOnly);
          expect(capturedParams.limit).toBe(limit);
          expect(capturedParams.page).toBe(page);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 39: Empty result set when no notifications match filter", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(notificationArbitrary, {
          minLength: 1,
          maxLength: 10,
        }),
        async (notifications) => {
          // Force all notifications to be read
          const allReadNotifications = notifications.map((n) => ({
            ...n,
            isRead: true,
          }));

          // Mock API to return empty array for unread filter
          vi.spyOn(api, "get").mockImplementation(
            (url: string, config?: any) => {
              const params = config?.params || {};

              if (params.unreadOnly === true) {
                return Promise.resolve({
                  data: {
                    success: true,
                    data: [],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: 0,
                      pages: 1,
                      hasMore: false,
                    },
                  },
                });
              } else {
                return Promise.resolve({
                  data: {
                    success: true,
                    data: allReadNotifications as ApiNotification[],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: allReadNotifications.length,
                      pages: 1,
                      hasMore: false,
                    },
                  },
                });
              }
            }
          );

          // Fetch with unread filter (should return empty)
          const unreadResponse = await NotificationService.getNotifications({
            unreadOnly: true,
          });

          expect(unreadResponse.success).toBe(true);
          expect(unreadResponse.data).toEqual([]);
          expect(unreadResponse.data.length).toBe(0);

          // Fetch all (should return all read notifications)
          const allResponse = await NotificationService.getNotifications({
            unreadOnly: false,
          });

          expect(allResponse.success).toBe(true);
          expect(allResponse.data.length).toBe(allReadNotifications.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
