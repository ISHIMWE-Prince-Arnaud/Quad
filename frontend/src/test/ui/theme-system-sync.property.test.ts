import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import { useThemeStore } from "@/stores/themeStore";

// Feature: quad-production-ready, Property 66: System Theme Synchronization
// For any system theme change (when theme is set to "system"), the application theme should update to match.
// Validates: Requirements 18.3

describe("System Theme Synchronization Property Tests", () => {
  let matchMediaMock: any;

  beforeEach(() => {
    // Reset DOM
    document.documentElement.className = "";
    document.documentElement.classList.remove("dark", "theme-transitioning");

    // Clear localStorage
    localStorage.clear();

    // Reset store
    useThemeStore.setState({
      theme: "system",
      isDarkMode: false,
      effectiveTheme: "light",
    });

    // Create a more sophisticated matchMedia mock
    matchMediaMock = {
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === "(prefers-color-scheme: dark)") {
        return matchMediaMock;
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Property 66: System theme changes are detected when theme is 'system'", () => {
    fc.assert(
      fc.property(fc.boolean(), (systemPrefersDark) => {
        // Set matchMedia to return the system preference
        matchMediaMock.matches = systemPrefersDark;

        const { setTheme, applyTheme } = useThemeStore.getState();

        // Set theme to system
        setTheme("system");

        // Apply theme (which reads from matchMedia)
        applyTheme();

        const state = useThemeStore.getState();

        // Verify theme is set to system
        expect(state.theme).toBe("system");

        // Verify effective theme matches system preference
        expect(state.isDarkMode).toBe(systemPrefersDark);
        expect(state.effectiveTheme).toBe(systemPrefersDark ? "dark" : "light");

        // Verify DOM reflects system preference
        expect(document.documentElement.classList.contains("dark")).toBe(
          systemPrefersDark
        );
      }),
      { numRuns: 100 }
    );
  });

  it("Property 66: System theme changes do NOT affect explicit light/dark themes", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        fc.boolean(),
        (explicitTheme, systemPrefersDark) => {
          // Set matchMedia to return a system preference
          matchMediaMock.matches = systemPrefersDark;

          const { setTheme, applyTheme } = useThemeStore.getState();

          // Set explicit theme (not system)
          setTheme(explicitTheme);

          // Apply theme
          applyTheme();

          const state = useThemeStore.getState();

          // Verify theme remains the explicit choice
          expect(state.theme).toBe(explicitTheme);

          // Verify effective theme matches explicit choice, NOT system preference
          const expectedDark = explicitTheme === "dark";
          expect(state.isDarkMode).toBe(expectedDark);
          expect(state.effectiveTheme).toBe(expectedDark ? "dark" : "light");

          // Verify DOM reflects explicit choice, NOT system preference
          expect(document.documentElement.classList.contains("dark")).toBe(
            expectedDark
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 66: Switching to system theme adopts current system preference", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        fc.boolean(),
        (initialTheme, systemPrefersDark) => {
          // Set matchMedia to return a system preference
          matchMediaMock.matches = systemPrefersDark;

          const { setTheme } = useThemeStore.getState();

          // Start with explicit theme
          setTheme(initialTheme);

          let state = useThemeStore.getState();
          expect(state.theme).toBe(initialTheme);

          // Switch to system theme
          setTheme("system");

          state = useThemeStore.getState();

          // Verify theme is now system
          expect(state.theme).toBe("system");

          // Verify effective theme matches system preference
          expect(state.isDarkMode).toBe(systemPrefersDark);
          expect(state.effectiveTheme).toBe(
            systemPrefersDark ? "dark" : "light"
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 66: System preference listener is set up on initialization", () => {
    fc.assert(
      fc.property(fc.boolean(), (systemPrefersDark) => {
        // Set matchMedia to return a system preference
        matchMediaMock.matches = systemPrefersDark;

        const { initializeTheme } = useThemeStore.getState();

        // Initialize theme (sets up listeners)
        initializeTheme();

        // Verify addEventListener was called for the matchMedia query
        expect(matchMediaMock.addEventListener).toHaveBeenCalled();

        // Verify it was called with 'change' event
        const calls = matchMediaMock.addEventListener.mock.calls;
        const hasChangeListener = calls.some(
          (call: any[]) => call[0] === "change"
        );
        expect(hasChangeListener).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("Property 66: System theme correctly calculates dark mode for all preferences", () => {
    fc.assert(
      fc.property(fc.boolean(), (systemPrefersDark) => {
        // Set matchMedia to return the system preference
        matchMediaMock.matches = systemPrefersDark;

        const { setTheme } = useThemeStore.getState();

        // Set theme to system
        setTheme("system");

        const state = useThemeStore.getState();

        // Verify isDarkMode matches system preference
        expect(state.isDarkMode).toBe(systemPrefersDark);

        // Verify effectiveTheme is consistent with isDarkMode
        if (state.isDarkMode) {
          expect(state.effectiveTheme).toBe("dark");
          expect(document.documentElement.classList.contains("dark")).toBe(
            true
          );
        } else {
          expect(state.effectiveTheme).toBe("light");
          expect(document.documentElement.classList.contains("dark")).toBe(
            false
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  it("Property 66: Theme persistence preserves system theme choice", () => {
    fc.assert(
      fc.property(fc.boolean(), (systemPrefersDark) => {
        // Set matchMedia to return a system preference
        matchMediaMock.matches = systemPrefersDark;

        const { setTheme } = useThemeStore.getState();

        // Set theme to system
        setTheme("system");

        // Verify it's persisted
        const storedData = localStorage.getItem("quad-theme-storage");
        expect(storedData).toBeTruthy();

        const parsed = JSON.parse(storedData!);

        // Verify theme is stored as "system"
        expect(parsed.state.theme).toBe("system");

        // Verify effective theme matches system preference at time of storage
        expect(parsed.state.isDarkMode).toBe(systemPrefersDark);
        expect(parsed.state.effectiveTheme).toBe(
          systemPrefersDark ? "dark" : "light"
        );
      }),
      { numRuns: 100 }
    );
  });
});
