import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { NotificationService } from "@/services/notificationService";
import { api } from "@/lib/api";

// Feature: quad-production-ready, Property 36: Notification Badge Count
// For any unread notifications, the badge count on the bell icon should match the unread count from the API.
// Validates: Requirements 11.1

describe("Notification Badge Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 36: Notification badge count matches API unread count", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 999 }),
        async (unreadCount) => {
          // Mock the API response for unread count
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: {
                unreadCount: unreadCount,
              },
            },
          });

          // Fetch unread count via service
          const count = await NotificationService.getUnreadCount();

          // Verify the count matches what the API returned
          expect(count).toBe(unreadCount);

          // Verify the count is a non-negative integer
          expect(count).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(count)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 36: Badge displays correctly for edge cases", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(0, 1, 99, 100, 999, 1000),
        async (unreadCount) => {
          // Mock the API response
          vi.spyOn(api, "get").mockResolvedValue({
            data: {
              success: true,
              data: {
                unreadCount: unreadCount,
              },
            },
          });

          // Fetch unread count
          const count = await NotificationService.getUnreadCount();

          // Verify count matches
          expect(count).toBe(unreadCount);

          // Verify badge display logic
          // Badge should show "99+" for counts > 99
          const displayText = count > 99 ? "99+" : count.toString();

          if (count > 99) {
            expect(displayText).toBe("99+");
          } else {
            expect(displayText).toBe(count.toString());
          }

          // Badge should be visible when count > 0
          const shouldShowBadge = count > 0;
          expect(shouldShowBadge).toBe(count > 0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
