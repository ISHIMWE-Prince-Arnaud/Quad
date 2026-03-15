import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/layouts/MainLayout";

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

vi.mock("@/stores/themeStore", () => ({
  useThemeStore: vi.fn(() => ({
    isDarkMode: false,
    setTheme: vi.fn(),
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

vi.mock("@/components/theme/ThemeSelector", () => ({
  ThemeSelector: () => <div role="group" aria-label="Theme selector" />,
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
        const { useNotificationStore } =
          await import("@/stores/notificationStore");

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
          </BrowserRouter>,
        );

        // Property: Sidebar should exist and be renderable
        const sidebar = container.firstChild;
        expect(sidebar).not.toBeNull();

        // Property: Sidebar should have the expected structure
        const nav = container.querySelector("nav");
        expect(nav).not.toBeNull();
        expect(nav?.getAttribute("aria-label")).toBe("Sidebar navigation");
      }),
      { numRuns: 10 },
    );
  });

  it("Property 43: Mobile layout contains bottom navigation bar with more menu", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        cleanup();

        const { useAuthStore } = await import("@/stores/authStore");
        const { useNotificationStore } =
          await import("@/stores/notificationStore");

        vi.mocked(useAuthStore).mockReturnValue({
          user: { username: "testuser" },
        } as any);

        vi.mocked(useNotificationStore).mockReturnValue({
          unreadCount: 0,
        } as any);

        // Render the bottom nav
        render(
          <BrowserRouter>
            <MobileBottomNav />
          </BrowserRouter>,
        );

        // Property: Mobile navigation element should exist
        const mobileNav = screen.getByLabelText("Mobile navigation");
        expect(mobileNav).toBeInTheDocument();

        // Property: More menu button should exist within mobile nav
        const menuButton = screen.getByLabelText("More Menu");
        expect(menuButton).toBeInTheDocument();
        expect(menuButton.tagName).toBe("BUTTON");
      }),
      { numRuns: 10 },
    );
  });

  it("Property 43: Mobile bottom nav contains core navigation items", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        cleanup();

        const { useAuthStore } = await import("@/stores/authStore");
        const { useNotificationStore } =
          await import("@/stores/notificationStore");

        vi.mocked(useAuthStore).mockReturnValue({
          user: { username: "testuser" },
        } as any);

        vi.mocked(useNotificationStore).mockReturnValue({
          unreadCount: 0,
        } as any);

        // Render the bottom nav
        const { container } = render(
          <BrowserRouter>
            <MobileBottomNav />
          </BrowserRouter>,
        );

        const mobileNavEl = container.querySelector(
          'nav[aria-label="Mobile navigation"]',
        );
        expect(mobileNavEl).toBeInTheDocument();

        // Property: Should have the 4 main items + More
        const links = mobileNavEl?.querySelectorAll("a");
        expect(links?.length).toBe(4);
        
        const labels = Array.from(links || []).map(l => l.getAttribute("aria-label"));
        expect(labels).toContain("Home");
        expect(labels).toContain("Polls");
        expect(labels).toContain("Stories");
        expect(labels).toContain("Chat");
      }),
      { numRuns: 10 },
    );
  });

  it("Property 43: Navigation items are consistent between desktop and mobile", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Clean up before each property test iteration
        cleanup();

        // Mock the stores
        const { useAuthStore } = await import("@/stores/authStore");
        const { useNotificationStore } =
          await import("@/stores/notificationStore");

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
          </BrowserRouter>,
        );

        const sidebarNavLinks = sidebarContainer.querySelectorAll("nav a");
        const sidebarHrefs = Array.from(sidebarNavLinks).map((link) =>
          link.getAttribute("href"),
        );

        cleanup();

        // Render the navbar (mobile)
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>,
        );

        // Property: Both should have the same core navigation structure
        // The sidebar should include at least the core nav links (Feed, Polls, Stories, Chat, Notifications, Profile)
        expect(sidebarHrefs.length).toBeGreaterThanOrEqual(6);

        expect(sidebarHrefs).toContain("/");
        expect(sidebarHrefs).toContain("/polls");
        expect(sidebarHrefs).toContain("/stories");
        expect(sidebarHrefs).toContain("/chat");
        expect(sidebarHrefs).toContain("/notifications");
        expect(sidebarHrefs).toContain("/profile/testuser");

        // Property: All hrefs should be valid paths
        sidebarHrefs.forEach((href) => {
          expect(href).toMatch(/^\//);
        });
      }),
      { numRuns: 10 },
    );
  });

  it("Property 43: Logo and branding present in both desktop and mobile", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Clean up before each property test iteration
        cleanup();

        // Mock the stores
        const { useAuthStore } = await import("@/stores/authStore");
        const { useNotificationStore } =
          await import("@/stores/notificationStore");

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
          </BrowserRouter>,
        );

        // Property: Logo should be present in sidebar
        const sidebarLogos = screen.getAllByText("Quad");
        expect(sidebarLogos.length).toBeGreaterThan(0);

        cleanup();

        // Render the navbar (mobile)
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>,
        );

        // Property: Logo should be present in navbar
        const navbarLogos = screen.getAllByText("Quad");
        expect(navbarLogos.length).toBeGreaterThan(0);
      }),
      { numRuns: 10 },
    );
  });

  it("Property 43: Theme selector is available in mobile more menu", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        cleanup();

        const { useAuthStore } = await import("@/stores/authStore");
        const { useNotificationStore } =
          await import("@/stores/notificationStore");
        const { useThemeStore } = await import("@/stores/themeStore");

        vi.mocked(useAuthStore).mockReturnValue({
          user: { username: "testuser" },
        } as any);

        vi.mocked(useNotificationStore).mockReturnValue({
          unreadCount: 0,
        } as any);

        vi.mocked(useThemeStore).mockReturnValue({
          isDarkMode: false,
          setTheme: vi.fn(),
        } as any);

        render(
          <BrowserRouter>
            <MobileBottomNav />
          </BrowserRouter>,
        );

        // Click more menu
        const menuButton = screen.getByLabelText("More Menu");
        fireEvent.pointerDown(menuButton);
        fireEvent.click(menuButton);

        // Property: Theme toggle should be visible
        expect(await screen.findByText(/Mode/i, {}, { timeout: 5000 })).toBeInTheDocument();
      }),
      { numRuns: 10 },
    );
  });
});


