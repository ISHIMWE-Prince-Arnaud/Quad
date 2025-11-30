import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import { useThemeStore } from "@/stores/themeStore";

// Feature: quad-production-ready, Property 64: Theme Application
// For any theme selection (light, dark, system), the corresponding CSS variables should be applied to the document root.
// Validates: Requirements 18.1

describe("Theme Application Property Tests", () => {
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

  it("Property 64: Theme selection applies correct CSS class to document root", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (theme) => {
          const { setTheme } = useThemeStore.getState();

          // Apply theme
          setTheme(theme);

          // Get the state after theme is set
          const state = useThemeStore.getState();

          // Verify theme is set correctly
          expect(state.theme).toBe(theme);

          // Verify effectiveTheme is either 'light' or 'dark'
          expect(["light", "dark"]).toContain(state.effectiveTheme);

          // Verify DOM class application
          if (theme === "dark") {
            // Dark theme should add 'dark' class
            expect(document.documentElement.classList.contains("dark")).toBe(
              true
            );
            expect(state.effectiveTheme).toBe("dark");
          } else if (theme === "light") {
            // Light theme should remove 'dark' class
            expect(document.documentElement.classList.contains("dark")).toBe(
              false
            );
            expect(state.effectiveTheme).toBe("light");
          } else if (theme === "system") {
            // System theme should match system preference
            const systemPrefersDark = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches;
            expect(document.documentElement.classList.contains("dark")).toBe(
              systemPrefersDark
            );
            expect(state.effectiveTheme).toBe(
              systemPrefersDark ? "dark" : "light"
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 64: Theme transitions are applied smoothly", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        fc.constantFrom("light" as const, "dark" as const),
        (fromTheme, toTheme) => {
          const { setTheme } = useThemeStore.getState();

          // Set initial theme
          setTheme(fromTheme);

          // Clear transition class that might have been added
          document.documentElement.classList.remove("theme-transitioning");

          // Change to new theme
          setTheme(toTheme);

          // Verify final state
          const state = useThemeStore.getState();
          expect(state.theme).toBe(toTheme);

          // Verify correct dark class application
          if (toTheme === "dark") {
            expect(document.documentElement.classList.contains("dark")).toBe(
              true
            );
          } else {
            expect(document.documentElement.classList.contains("dark")).toBe(
              false
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 64: isDarkMode reflects effective theme correctly", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (theme) => {
          const { setTheme } = useThemeStore.getState();

          // Apply theme
          setTheme(theme);

          const state = useThemeStore.getState();

          // Verify isDarkMode matches effectiveTheme
          if (state.effectiveTheme === "dark") {
            expect(state.isDarkMode).toBe(true);
          } else {
            expect(state.isDarkMode).toBe(false);
          }

          // Verify isDarkMode matches DOM class
          expect(state.isDarkMode).toBe(
            document.documentElement.classList.contains("dark")
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 64: applyTheme correctly applies current theme setting", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (theme) => {
          const { setTheme, applyTheme } = useThemeStore.getState();

          // Set theme
          setTheme(theme);

          // Clear DOM to simulate page reload
          document.documentElement.classList.remove(
            "dark",
            "theme-transitioning"
          );

          // Reapply theme
          applyTheme();

          const state = useThemeStore.getState();

          // Verify theme setting is preserved
          expect(state.theme).toBe(theme);

          // Verify DOM reflects the theme
          if (theme === "dark") {
            expect(document.documentElement.classList.contains("dark")).toBe(
              true
            );
          } else if (theme === "light") {
            expect(document.documentElement.classList.contains("dark")).toBe(
              false
            );
          } else {
            // System theme
            const systemPrefersDark = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches;
            expect(document.documentElement.classList.contains("dark")).toBe(
              systemPrefersDark
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
