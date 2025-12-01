/**
 * Theme Store for Quad Platform
 *
 * Manages theme state with support for light, dark, and system preferences.
 * Provides smooth theme transitions with color interpolation animations.
 * Persists theme preference to localStorage and syncs across tabs.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 19.5
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  isDarkMode: boolean;
  effectiveTheme: "light" | "dark";

  // Actions
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  applyTheme: () => void;
  initializeTheme: () => void;
}

// Helper function to detect system preference
const getSystemTheme = (): boolean => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

// Helper function to calculate effective dark mode
const calculateDarkMode = (theme: Theme): boolean => {
  switch (theme) {
    case "dark":
      return true;
    case "light":
      return false;
    case "system":
      return getSystemTheme();
    default:
      return false;
  }
};

// Helper function to apply theme with smooth transition
// Validates: Requirements 1.3, 2.6
const applyThemeToDOM = (isDarkMode: boolean) => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;

  // Add transition class for smooth theme changes with color interpolation
  root.classList.add("theme-transitioning");

  // Apply or remove dark class
  if (isDarkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Remove transition class after animation completes (300ms as per requirement 2.6)
  setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, 300);
};

// Store system theme listener reference for cleanup
let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      isDarkMode: getSystemTheme(),
      effectiveTheme: getSystemTheme() ? "dark" : "light",

      setTheme: (theme: Theme) => {
        const isDarkMode = calculateDarkMode(theme);
        const effectiveTheme = isDarkMode ? "dark" : "light";
        set({ theme, isDarkMode, effectiveTheme });

        // Apply theme to DOM with smooth transition
        applyThemeToDOM(isDarkMode);

        // Broadcast theme change to other tabs
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "quad-theme-change",
            Date.now().toString()
          );
        }
      },

      toggleDarkMode: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },

      applyTheme: () => {
        const { theme } = get();
        const isDarkMode = calculateDarkMode(theme);
        const effectiveTheme = isDarkMode ? "dark" : "light";
        set({ isDarkMode, effectiveTheme });

        // Apply theme to DOM with smooth transition
        applyThemeToDOM(isDarkMode);
      },

      initializeTheme: () => {
        if (typeof window === "undefined") return;

        // Apply initial theme
        get().applyTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        // Remove old listener if exists
        if (systemThemeListener) {
          mediaQuery.removeEventListener("change", systemThemeListener);
        }

        // Create new listener
        systemThemeListener = () => {
          const { theme } = get();
          if (theme === "system") {
            get().applyTheme();
          }
        };

        mediaQuery.addEventListener("change", systemThemeListener);

        // Listen for theme changes from other tabs
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === "quad-theme-storage") {
            // Theme was changed in another tab, rehydrate
            get().applyTheme();
          }
        };

        window.addEventListener("storage", handleStorageChange);
      },
    }),
    {
      name: "quad-theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.applyTheme();
        }
      },
    }
  )
);
