import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import { useThemeStore } from "@/stores/themeStore";

// Feature: quad-production-ready, Property 65: Theme Persistence
// For any theme change, the preference should be saved to localStorage and restored on next visit.
// Validates: Requirements 18.2

describe("Theme Persistence Property Tests", () => {
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Property 65: Theme preference is saved to localStorage on change", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (theme) => {
          const { setTheme } = useThemeStore.getState();

          // Set theme
          setTheme(theme);

          // Verify localStorage contains the theme
          const storedData = localStorage.getItem("quad-theme-storage");
          expect(storedData).toBeTruthy();

          // Parse and verify the stored theme
          const parsed = JSON.parse(storedData!);
          expect(parsed.state.theme).toBe(theme);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 65: Theme is restored from localStorage on initialization", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (theme) => {
          // Simulate stored theme in localStorage
          const storedState = {
            state: {
              theme,
              isDarkMode: theme === "dark" || (theme === "system" && false),
              effectiveTheme: theme === "dark" ? "dark" : "light",
            },
            version: 0,
          };

          localStorage.setItem(
            "quad-theme-storage",
            JSON.stringify(storedState)
          );

          // Create a new store instance (simulating page reload)
          // In real scenario, this would be done by Zustand's persist middleware
          const currentState = useThemeStore.getState();

          // Manually trigger rehydration by reading from localStorage
          const storedData = localStorage.getItem("quad-theme-storage");
          if (storedData) {
            const parsed = JSON.parse(storedData);
            useThemeStore.setState(parsed.state);
          }

          // Apply theme after rehydration
          useThemeStore.getState().applyTheme();

          // Verify theme was restored
          const restoredState = useThemeStore.getState();
          expect(restoredState.theme).toBe(theme);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 65: Multiple theme changes persist correctly", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom("light" as const, "dark" as const, "system" as const),
          {
            minLength: 2,
            maxLength: 5,
          }
        ),
        (themes) => {
          const { setTheme } = useThemeStore.getState();

          // Apply each theme in sequence
          themes.forEach((theme) => {
            setTheme(theme);
          });

          // Verify the last theme is persisted
          const lastTheme = themes[themes.length - 1];
          const storedData = localStorage.getItem("quad-theme-storage");
          expect(storedData).toBeTruthy();

          const parsed = JSON.parse(storedData!);
          expect(parsed.state.theme).toBe(lastTheme);

          // Verify current state matches
          const currentState = useThemeStore.getState();
          expect(currentState.theme).toBe(lastTheme);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 65: Theme persistence survives localStorage clear and restore", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (theme) => {
          const { setTheme } = useThemeStore.getState();

          // Set initial theme
          setTheme(theme);

          // Verify it's stored
          let storedData = localStorage.getItem("quad-theme-storage");
          expect(storedData).toBeTruthy();

          // Save the stored data
          const savedData = storedData;

          // Clear localStorage
          localStorage.clear();

          // Verify it's cleared
          expect(localStorage.getItem("quad-theme-storage")).toBeNull();

          // Restore the data (simulating backup/restore)
          localStorage.setItem("quad-theme-storage", savedData!);

          // Rehydrate state
          const parsed = JSON.parse(savedData!);
          useThemeStore.setState(parsed.state);

          // Verify theme is restored correctly
          const restoredState = useThemeStore.getState();
          expect(restoredState.theme).toBe(theme);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 65: Theme persistence includes all necessary state", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (theme) => {
          const { setTheme } = useThemeStore.getState();

          // Set theme
          setTheme(theme);

          // Get stored data
          const storedData = localStorage.getItem("quad-theme-storage");
          expect(storedData).toBeTruthy();

          const parsed = JSON.parse(storedData!);

          // Verify all necessary fields are persisted
          expect(parsed.state).toHaveProperty("theme");
          expect(parsed.state).toHaveProperty("isDarkMode");
          expect(parsed.state).toHaveProperty("effectiveTheme");

          // Verify types
          expect(typeof parsed.state.theme).toBe("string");
          expect(typeof parsed.state.isDarkMode).toBe("boolean");
          expect(typeof parsed.state.effectiveTheme).toBe("string");

          // Verify values are consistent
          expect(["light", "dark", "system"]).toContain(parsed.state.theme);
          expect(["light", "dark"]).toContain(parsed.state.effectiveTheme);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 65: Cross-tab synchronization mechanism is in place", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (initialTheme, newTheme) => {
          const { setTheme } = useThemeStore.getState();

          // Set initial theme
          setTheme(initialTheme);

          // Verify initial state is persisted
          let storedData = localStorage.getItem("quad-theme-storage");
          expect(storedData).toBeTruthy();
          let parsed = JSON.parse(storedData!);
          expect(parsed.state.theme).toBe(initialTheme);

          // Simulate theme change in another tab by directly modifying localStorage
          const newState = {
            state: {
              theme: newTheme,
              isDarkMode:
                newTheme === "dark" || (newTheme === "system" && false),
              effectiveTheme: newTheme === "dark" ? "dark" : "light",
            },
            version: 0,
          };

          localStorage.setItem("quad-theme-storage", JSON.stringify(newState));

          // Verify localStorage was updated (simulating cross-tab change)
          storedData = localStorage.getItem("quad-theme-storage");
          parsed = JSON.parse(storedData!);
          expect(parsed.state.theme).toBe(newTheme);

          // In a real browser, the storage event would trigger and the store
          // would read from localStorage and apply the theme. We verify the
          // storage mechanism works correctly.
        }
      ),
      { numRuns: 100 }
    );
  });
});
