import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as fc from "fast-check";
import { Sidebar } from "@/components/layout/Sidebar";

// Feature: quad-ui-ux-redesign, Property 41: Active navigation highlighting
// For any selected navigation item, it should be highlighted with background color and icon color changes
// Validates: Requirements 9.2

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

describe("Active Navigation Highlighting Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("Property 41: Active navigation item has distinct background styling", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          "/app/feed",
          "/app/chat",
          "/app/stories",
          "/app/polls",
          "/app/profile/testuser"
        ),
        async (activePath) => {
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

          // Render the sidebar with the active path
          const { container } = render(
            <MemoryRouter initialEntries={[activePath]}>
              <Sidebar />
            </MemoryRouter>
          );

          // Property 1: Active link should have primary background class
          const navLinks = container.querySelectorAll<HTMLAnchorElement>("nav a");
          let activeLink: HTMLAnchorElement | null = null;

          navLinks.forEach((link) => {
            if (link.getAttribute("href") === activePath) {
              activeLink = link;
            }
          });

          expect(activeLink).not.toBeNull();
          if (!activeLink) {
            throw new Error("Active navigation link not found");
          }
          const activeLinkEl: HTMLAnchorElement = activeLink;
          const activeLinkClasses = activeLinkEl.className ?? "";
          expect(activeLinkClasses).toContain("bg-primary");
          expect(
            activeLinkClasses.includes("text-primary-foreground") ||
              activeLinkClasses.includes("text-white")
          ).toBe(true);

          // Property 2: Active link should have aria-current attribute
          expect(activeLinkEl.getAttribute("aria-current")).toBe("page");

          // Property 3: Inactive links should NOT have primary background
          navLinks.forEach((link) => {
            if (link.getAttribute("href") !== activePath) {
              expect(link.className).not.toContain("bg-primary");
              expect(
                link.className.includes("text-muted-foreground") ||
                  link.className.includes("text-foreground/80")
              ).toBe(true);
            }
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  it("Property 41: Active navigation icon has correct color styling", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          "/app/feed",
          "/app/chat",
          "/app/stories",
          "/app/polls",
          "/app/profile/testuser"
        ),
        async (activePath) => {
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

          // Render the sidebar with the active path
          const { container } = render(
            <MemoryRouter initialEntries={[activePath]}>
              <Sidebar />
            </MemoryRouter>
          );

          // Property: Active link's icon should have primary foreground color class or inherit from parent
          const navLinks = container.querySelectorAll<HTMLAnchorElement>("nav a");
          let activeLink: HTMLAnchorElement | null = null;

          navLinks.forEach((link) => {
            if (link.getAttribute("href") === activePath) {
              activeLink = link;
            }
          });

          expect(activeLink).not.toBeNull();
          if (!activeLink) {
            throw new Error("Active navigation link not found");
          }
          const activeLinkEl: HTMLAnchorElement = activeLink;

          // Check that the icon within the active link exists
          const icon = activeLinkEl.querySelector<SVGElement>("svg");
          expect(icon).not.toBeNull();

          // The icon should either have text-primary-foreground class directly
          // or inherit it from the parent link which has text-primary-foreground
          const iconClasses = icon?.getAttribute("class") || "";
          const linkClasses = activeLinkEl.getAttribute("class") || "";

          const hasCorrectColor =
            iconClasses.includes("text-primary-foreground") ||
            iconClasses.includes("text-white") ||
            linkClasses.includes("text-primary-foreground") ||
            linkClasses.includes("text-white");

          expect(hasCorrectColor).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  it("Property 41: Only one navigation item is active at a time", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          "/app/feed",
          "/app/chat",
          "/app/stories",
          "/app/polls",
          "/app/profile/testuser"
        ),
        async (activePath) => {
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

          // Render the sidebar with the active path
          const { container } = render(
            <MemoryRouter initialEntries={[activePath]}>
              <Sidebar />
            </MemoryRouter>
          );

          // Property: Exactly one link should have aria-current="page"
          const navLinks = container.querySelectorAll<HTMLAnchorElement>("nav a");
          let activeCount = 0;

          navLinks.forEach((link) => {
            if (link.getAttribute("aria-current") === "page") {
              activeCount++;
            }
          });

          expect(activeCount).toBe(1);
        }
      ),
      { numRuns: 10 }
    );
  });

  it("Property 41: Active state persists across different routes", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom(
            "/app/feed",
            "/app/chat",
            "/app/stories",
            "/app/polls",
            "/app/profile/testuser"
          ),
          fc.constantFrom(
            "/app/feed",
            "/app/chat",
            "/app/stories",
            "/app/polls",
            "/app/profile/testuser"
          )
        ),
        async ([firstPath, secondPath]) => {
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

          // Render with first path
          const { container: container1 } = render(
            <MemoryRouter initialEntries={[firstPath]}>
              <Sidebar />
            </MemoryRouter>
          );

          const navLinks1 = container1.querySelectorAll<HTMLAnchorElement>("nav a");
          let activeLink1: HTMLAnchorElement | null = null;

          navLinks1.forEach((link) => {
            if (link.getAttribute("href") === firstPath) {
              activeLink1 = link;
            }
          });

          expect(activeLink1).not.toBeNull();
          if (!activeLink1) {
            throw new Error("Active navigation link not found");
          }
          const activeLink1El: HTMLAnchorElement = activeLink1;
          expect(activeLink1El.className).toContain("bg-primary");

          cleanup();

          // Render with second path
          const { container: container2 } = render(
            <MemoryRouter initialEntries={[secondPath]}>
              <Sidebar />
            </MemoryRouter>
          );

          const navLinks2 = container2.querySelectorAll<HTMLAnchorElement>("nav a");
          let activeLink2: HTMLAnchorElement | null = null;

          navLinks2.forEach((link) => {
            if (link.getAttribute("href") === secondPath) {
              activeLink2 = link;
            }
          });

          expect(activeLink2).not.toBeNull();
          if (!activeLink2) {
            throw new Error("Active navigation link not found");
          }
          const activeLink2El: HTMLAnchorElement = activeLink2;
          expect(activeLink2El.className).toContain("bg-primary");

          // Property: Different paths should highlight different links
          if (firstPath !== secondPath) {
            const firstHref = activeLink1El.getAttribute("href");
            const secondHref = activeLink2El.getAttribute("href");
            expect(firstHref).not.toBe(secondHref);
          }
        }
      ),
      { numRuns: 5 }
    );
  });
});
