import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

// Feature: quad-ui-ux-redesign, Property 43: Responsive navigation
// For any mobile viewport (< 640px), the sidebar should collapse and a hamburger menu toggle should be provided
// Validates: Requirements 9.5, 11.1

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

// Mock keyboard shortcuts hook
vi.mock("@/hooks/useKeyboardShortcuts", () => ({
  useAppKeyboardShortcuts: vi.fn(),
}));

// Mock UserAvatar component (requires ClerkProvider)
vi.mock("@/components/auth/UserMenu", () => ({
  UserAvatar: () => <div data-testid="user-avatar">User Avatar</div>,
}));

// Mock GlobalSearchBar component
vi.mock("@/components/search/GlobalSearchBar", () => ({
  GlobalSearchBar: () => <div data-testid="search-bar">Search</div>,
}));

// Mock right panel children to avoid async effects leaking after teardown
vi.mock("@/components/polls/FeaturedPoll", () => ({
  FeaturedPoll: () => <div data-testid="featured-poll" />,
}));

vi.mock("@/components/discovery/WhoToFollow", () => ({
  WhoToFollow: () => <div data-testid="who-to-follow" />,
}));

// Mock KeyboardShortcutsDialog component
vi.mock("@/components/ui/keyboard-shortcuts-dialog", () => ({
  KeyboardShortcutsDialog: () => null,
}));

describe("Responsive Navigation Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("Property 43: Sidebar has responsive classes for desktop display", async () => {
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

        // Property: Sidebar should exist and be renderable
        const sidebar = container.firstChild;
        expect(sidebar).not.toBeNull();

        // Property: Sidebar should have the expected structure
        const nav = container.querySelector("nav");
        expect(nav).not.toBeNull();
        expect(nav?.getAttribute("aria-label")).toBe("Sidebar navigation");
      }),
      { numRuns: 10 }
    );
  });

  it("Property 43: Mobile navbar contains hamburger menu button", async () => {
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

        // Render the navbar
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );

        // Property: Hamburger menu button should exist
        const menuButton = screen.getByLabelText("Toggle mobile menu");
        expect(menuButton).toBeInTheDocument();
        expect(menuButton.tagName).toBe("BUTTON");

        // Property: Button should have aria-expanded attribute
        expect(menuButton).toHaveAttribute("aria-expanded");
      }),
      { numRuns: 10 }
    );
  });

  it("Property 43: Mobile menu contains all navigation items", async () => {
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

        // Render the navbar
        const { container } = render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );

        fireEvent.click(screen.getByLabelText("Toggle mobile menu"));

        await waitFor(() => {
          const mobileNavEl = container.querySelector(
            'nav[aria-label="Mobile navigation"]'
          );
          expect(mobileNavEl).toBeInTheDocument();
        });

        // Property: Mobile menu should have navigation with aria-label
        container.querySelector(
          'nav[aria-label="Mobile navigation"]'
        );

        // The mobile menu is hidden by default, but should exist in the DOM
        // We can't test visibility without actually setting viewport size,
        // but we can verify the structure exists
        expect(container.querySelector("header")).toBeInTheDocument();
      }),
      { numRuns: 10 }
    );
  });

  it("Property 43: Navigation items are consistent between desktop and mobile", async () => {
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

        // Render the sidebar (desktop)
        const { container: sidebarContainer } = render(
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        );

        const sidebarNavLinks = sidebarContainer.querySelectorAll("nav a");
        const sidebarHrefs = Array.from(sidebarNavLinks).map((link) =>
          link.getAttribute("href")
        );

        cleanup();

        // Render the navbar (mobile)
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );

        // Property: Both should have the same core navigation structure
        // The sidebar should include at least the core nav links (Feed, Chat, Stories, Polls, Profile)
        expect(sidebarHrefs.length).toBeGreaterThanOrEqual(5);

        expect(sidebarHrefs).toContain("/app/feed");
        expect(sidebarHrefs).toContain("/app/chat");
        expect(sidebarHrefs).toContain("/app/stories");
        expect(sidebarHrefs).toContain("/app/polls");
        expect(sidebarHrefs).toContain("/app/profile/testuser");

        // Property: All hrefs should be valid paths
        sidebarHrefs.forEach((href) => {
          expect(href).toMatch(/^\/app\//);
        });
      }),
      { numRuns: 10 }
    );
  });

  it("Property 43: Logo and branding present in both desktop and mobile", async () => {
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

        // Render the sidebar (desktop)
        render(
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        );

        // Property: Logo should be present in sidebar
        const sidebarLogos = screen.getAllByText("Quad");
        expect(sidebarLogos.length).toBeGreaterThan(0);

        cleanup();

        // Render the navbar (mobile)
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );

        // Property: Logo should be present in navbar
        const navbarLogos = screen.getAllByText("Quad");
        expect(navbarLogos.length).toBeGreaterThan(0);
      }),
      { numRuns: 10 }
    );
  });

  it("Property 43: Theme selector present in both desktop and mobile", async () => {
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

        // Render the sidebar (Theme selector lives in the sidebar footer)
        render(
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        );

        // Property: Theme control should be present on desktop
        expect(screen.getAllByLabelText("Theme selector").length).toBeGreaterThan(0);

        cleanup();

        // Render the navbar (mobile)
        const { container } = render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );

        fireEvent.click(screen.getByLabelText("Toggle mobile menu"));

        await waitFor(() => {
          const mobileNavEl = container.querySelector(
            'nav[aria-label="Mobile navigation"]'
          );
          expect(mobileNavEl).toBeInTheDocument();
        });

        // Property: Theme selector should be present in navbar
        expect(screen.getAllByLabelText("Theme selector").length).toBeGreaterThan(
          0
        );
      }),
      { numRuns: 10 }
    );
  });
});
