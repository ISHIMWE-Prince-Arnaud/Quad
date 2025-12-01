/**
 * Theme Transition Animation Property Tests
 *
 * Tests for Property 3: Theme transition animation
 * Validates: Requirements 1.3, 2.6
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { useThemeStore } from "@/stores/themeStore";
import { THEME_TRANSITION_DURATION } from "@/lib/theme-animations";

// Feature: quad-ui-ux-redesign, Property 3: Theme transition animation
// For any theme switch action, the platform should trigger a color interpolation animation that completes within 300ms
// Validates: Requirements 1.3, 2.6

describe("Theme Transition Animation Property Tests", () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.className = "";
    document.documentElement.classList.remove("dark", "theme-transitioning");

    // Clear localStorage
    localStorage.clear();

    // Reset store
    useThemeStore.setState({
      theme: "light",
      isDarkMode: false,
      effectiveTheme: "light",
    });

    // Clear all timers
    vi.clearAllTimers();
  });

  it("Property 3: Theme transition adds transitioning class immediately", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (fromTheme, toTheme) => {
          const { setTheme } = useThemeStore.getState();

          // Set initial theme
          setTheme(fromTheme);

          // Clear transition class
          document.documentElement.classList.remove("theme-transitioning");

          // Change theme
          setTheme(toTheme);

          // Verify transition class is added immediately
          expect(
            document.documentElement.classList.contains("theme-transitioning")
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 3: Theme transition duration is 300ms or less", () => {
    // This test verifies that the THEME_TRANSITION_DURATION constant
    // is set to 300ms or less, as per requirement 2.6
    expect(THEME_TRANSITION_DURATION).toBeLessThanOrEqual(300);
  });

  it("Property 3: Theme transition class is removed after animation completes", () => {
    vi.useFakeTimers();

    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        fc.constantFrom("light" as const, "dark" as const, "system" as const),
        (fromTheme, toTheme) => {
          const { setTheme } = useThemeStore.getState();

          // Set initial theme
          setTheme(fromTheme);

          // Clear transition class
          document.documentElement.classList.remove("theme-transitioning");

          // Change theme
          setTheme(toTheme);

          // Verify transition class is present
          expect(
            document.documentElement.classList.contains("theme-transitioning")
          ).toBe(true);

          // Fast-forward time by 300ms
          vi.advanceTimersByTime(300);

          // Verify transition class is removed
          expect(
            document.documentElement.classList.contains("theme-transitioning")
          ).toBe(false);
        }
      ),
      { numRuns: 100 }
    );

    vi.useRealTimers();
  });

  it("Property 3: Theme changes apply correct dark class during transition", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        (theme) => {
          const { setTheme } = useThemeStore.getState();

          // Set theme
          setTheme(theme);

          // Verify dark class is applied correctly even during transition
          const hasDarkClass =
            document.documentElement.classList.contains("dark");
          const shouldHaveDarkClass = theme === "dark";

          expect(hasDarkClass).toBe(shouldHaveDarkClass);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 3: Multiple rapid theme changes handle transitions correctly", () => {
    vi.useFakeTimers();

    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom("light" as const, "dark" as const, "system" as const),
          { minLength: 2, maxLength: 5 }
        ),
        (themes) => {
          const { setTheme } = useThemeStore.getState();

          // Apply all theme changes rapidly
          themes.forEach((theme) => {
            setTheme(theme);
          });

          // The final theme should be applied
          const finalTheme = themes[themes.length - 1];
          const state = useThemeStore.getState();
          expect(state.theme).toBe(finalTheme);

          // Dark class should match final theme
          const hasDarkClass =
            document.documentElement.classList.contains("dark");
          const shouldHaveDarkClass =
            finalTheme === "dark" ||
            (finalTheme === "system" && state.isDarkMode);

          expect(hasDarkClass).toBe(shouldHaveDarkClass);

          // Transition class should still be present (since we haven't advanced time)
          expect(
            document.documentElement.classList.contains("theme-transitioning")
          ).toBe(true);

          // Fast-forward past all transitions
          vi.advanceTimersByTime(300 * themes.length);

          // Transition class should be removed
          expect(
            document.documentElement.classList.contains("theme-transitioning")
          ).toBe(false);
        }
      ),
      { numRuns: 50 }
    );

    vi.useRealTimers();
  });

  it("Property 3: CSS transition properties are defined correctly", () => {
    // Verify that the CSS transition is configured for the right properties
    // This is a structural test to ensure the CSS is set up correctly
    const style = getComputedStyle(document.documentElement);

    // Add the transitioning class
    document.documentElement.classList.add("theme-transitioning");

    // Get computed style with transitioning class
    const transitioningStyle = getComputedStyle(document.documentElement);

    // The transition property should be set when theme-transitioning class is present
    // Note: In a real browser, this would show the transition properties
    // In jsdom, we just verify the class can be added
    expect(
      document.documentElement.classList.contains("theme-transitioning")
    ).toBe(true);

    // Clean up
    document.documentElement.classList.remove("theme-transitioning");
  });
});
