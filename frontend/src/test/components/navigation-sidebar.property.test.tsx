import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";
import { Sidebar } from "@/components/layout/Sidebar";

// Feature: quad-ui-ux-redesign, Property 40: Navigation sidebar completeness
// For any navigation sidebar view, it should display icons and labels for Feed, Chat, Stories, Polls, and Profile
// Validates: Requirements 9.1

// Mock stores
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      username: "testuser",
      firstName: "Test",
      lastName: "User",
    },
  })),
}));

vi.mock("@/stores/notificationStore", () => ({
  useNotificationStore: vi.fn(() => ({
    unreadCount: 0,
  })),
}));

describe("Navigation Sidebar Completeness Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("Property 40: Sidebar always contains all required navigation items", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc
            .string({ minLength: 3, maxLength: 20 })
            .filter((s) => s.trim().length >= 3),
          unreadCount: fc.integer({ min: 0, max: 999 }),
        }),
        async ({ username, unreadCount }) => {
          // Clean up before each property test iteration
          cleanup();

          // Mock the stores with generated values
          const { useAuthStore } = await import("@/stores/authStore");
          const { useNotificationStore } = await import(
            "@/stores/notificationStore"
          );

          vi.mocked(useAuthStore).mockReturnValue({
            user: {
              username,
              firstName: "Test",
              lastName: "User",
            },
          } as any);

          vi.mocked(useNotificationStore).mockReturnValue({
            unreadCount,
          } as any);

          // Render the sidebar
          const { container } = render(
            <BrowserRouter>
              <Sidebar />
            </BrowserRouter>
          );

          // Property 1: All required navigation items must be present
          const requiredItems = ["Feed", "Chat", "Stories", "Polls", "Profile"];

          for (const itemName of requiredItems) {
            const navItems = screen.getAllByText(itemName);
            expect(navItems.length).toBeGreaterThan(0);
          }

          // Property 2: Each navigation item must have an icon (check for parent link)
          const navLinks = container.querySelectorAll("nav a");
          expect(navLinks.length).toBe(5); // Should have exactly 5 nav links

          navLinks.forEach((link) => {
            // Check that each link has an svg icon (lucide icons render as svg)
            const icon = link.querySelector("svg");
            expect(icon).toBeInTheDocument();
          });

          // Property 3: Logo and tagline must be present
          const logos = screen.getAllByText("Quad");
          expect(logos.length).toBeGreaterThan(0);

          const tagline = screen.getByText("Connect. Create.");
          expect(tagline).toBeInTheDocument();

          // Property 4: Theme selector must be present
          // Theme selector contains buttons for Light, Dark, System
          const themeButtons = screen.getAllByRole("button");
          expect(themeButtons.length).toBeGreaterThanOrEqual(3); // At least 3 theme buttons
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 40: Navigation items have correct href attributes", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid usernames (alphanumeric, underscore, hyphen only)
        fc.stringMatching(/^[a-zA-Z0-9_-]{3,20}$/),
        async (username) => {
          // Clean up before each property test iteration
          cleanup();

          // Mock the stores
          const { useAuthStore } = await import("@/stores/authStore");
          const { useNotificationStore } = await import(
            "@/stores/notificationStore"
          );

          vi.mocked(useAuthStore).mockReturnValue({
            user: { username },
          } as any);

          vi.mocked(useNotificationStore).mockReturnValue({
            unreadCount: 0,
          } as any);

          // Render the sidebar
          const { container } = render(
            <BrowserRouter>
              <Sidebar />
            </BrowserRouter>
          );

          // Property: Each navigation item must have the correct href
          const expectedHrefs: Record<string, string> = {
            Feed: "/app/feed",
            Chat: "/app/chat",
            Stories: "/app/stories",
            Polls: "/app/polls",
            Profile: `/app/profile/${username}`,
          };

          const navLinks = container.querySelectorAll("nav a");
          const hrefs = Array.from(navLinks).map((link) =>
            link.getAttribute("href")
          );

          // Check that all expected hrefs are present
          for (const expectedHref of Object.values(expectedHrefs)) {
            expect(hrefs).toContain(expectedHref);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 40: Notification badge displays correctly when present", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999 }),
        async (unreadCount) => {
          // Clean up before each property test iteration
          cleanup();

          // Mock the stores with unread count
          const { useAuthStore } = await import("@/stores/authStore");
          const { useNotificationStore } = await import(
            "@/stores/notificationStore"
          );

          vi.mocked(useAuthStore).mockReturnValue({
            user: { username: "testuser" },
          } as any);

          vi.mocked(useNotificationStore).mockReturnValue({
            unreadCount,
          } as any);

          // Render the sidebar
          const { container } = render(
            <BrowserRouter>
              <Sidebar />
            </BrowserRouter>
          );

          // Property: Badge should display the correct count (or 99+ if > 99)
          const expectedBadgeText =
            unreadCount > 99 ? "99+" : unreadCount.toString();
          const badges = screen.getAllByText(expectedBadgeText);
          expect(badges.length).toBeGreaterThan(0);

          // Badge should be within a nav link
          const navLinks = container.querySelectorAll("nav a");
          let badgeFound = false;
          navLinks.forEach((link) => {
            if (link.textContent?.includes(expectedBadgeText)) {
              badgeFound = true;
            }
          });
          expect(badgeFound).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 40: All navigation items are keyboard accessible", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Clean up before each property test iteration
        cleanup();

        // Mock the stores
        const { useAuthStore } = await import("@/stores/authStore");
        const { useNotificationStore } = await import(
          "@/stores/notificationStore"
        );

        vi.mocked(useAuthStore).mockReturnValue({
          user: { username: "testuser" },
        } as any);

        vi.mocked(useNotificationStore).mockReturnValue({
          unreadCount: 0,
        } as any);

        // Render the sidebar
        const { container } = render(
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        );

        // Property: All navigation links must be focusable
        const navLinks = container.querySelectorAll("nav a");

        navLinks.forEach((link) => {
          // Links should be focusable (tabIndex should not be -1)
          const tabIndex = link.getAttribute("tabindex");
          expect(tabIndex).not.toBe("-1");
        });
      }),
      { numRuns: 100 }
    );
  });
});
