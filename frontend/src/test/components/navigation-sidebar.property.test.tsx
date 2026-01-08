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
          username: fc.stringMatching(/^[a-zA-Z0-9_-]{3,20}$/),
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
          const requiredItems = [
            "Home",
            "Search",
            "Notifications",
            "Messages",
            "Stories",
            "Polls",
            "Analytics",
            "Profile",
          ];

          for (const itemName of requiredItems) {
            const navItems = screen.getAllByText(itemName);
            expect(navItems.length).toBeGreaterThan(0);
          }

          // Property 2: Each navigation item must have an icon (check for parent link)
          const navLinks = container.querySelectorAll("nav a");
          expect(navLinks.length).toBe(8); // Includes Profile when username exists

          navLinks.forEach((link) => {
            // Check that each link has an svg icon (lucide icons render as svg)
            const icon = link.querySelector("svg");
            expect(icon).toBeInTheDocument();
          });

          // Property 3: Logo must be present
          const logos = screen.getAllByText("Quad");
          expect(logos.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 10 }
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
            Home: "/app/feed",
            Search: "/app/search",
            Notifications: "/app/notifications",
            Messages: "/app/chat",
            Stories: "/app/stories",
            Polls: "/app/polls",
            Analytics: "/app/analytics",
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
      { numRuns: 10 }
    );
  });

  it("Property 40: Navigation renders with unread notifications present", async () => {
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

          // Property: Sidebar should still render and include Notifications navigation
          const navLinks = container.querySelectorAll("nav a");
          expect(navLinks.length).toBeGreaterThan(0);
          expect(screen.getAllByText("Notifications").length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 10 }
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
      { numRuns: 10 }
    );
  });
});
