/**
 * Theme Animation Configuration for Quad Platform
 *
 * This file contains animation configurations specifically for theme transitions
 * and theme-related UI elements. All animations are designed to complete within
 * 300ms to maintain perceived performance (Requirement 2.6).
 *
 * Validates: Requirements 1.3, 2.6, 19.5
 */

import type { Transition, Variants, TargetAndTransition } from "framer-motion";

/**
 * Theme transition duration in milliseconds
 * Must complete within 300ms as per requirement 2.6
 */
export const THEME_TRANSITION_DURATION = 300;

/**
 * Theme selector animation variants
 * Used for the theme selector component mount animation
 */
export const themeSelectorVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const themeSelectorTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

/**
 * Theme button hover animation
 * Used for individual theme option buttons
 */
export const themeButtonHover: TargetAndTransition = {
  scale: 1.05,
  transition: { duration: 0.2, ease: "easeOut" },
};

export const themeButtonTap: TargetAndTransition = {
  scale: 0.95,
  transition: { duration: 0.1, ease: "easeOut" },
};

/**
 * Theme indicator animation
 * Used for the sliding background indicator in theme selector
 * Uses layout animation for smooth morphing between positions
 */
export const themeIndicatorTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/**
 * Theme icon rotation animation
 * Used when a theme option is selected
 */
export const themeIconRotation: Variants = {
  inactive: { rotate: 0 },
  active: { rotate: [0, 360] },
};

export const themeIconRotationTransition: Transition = {
  duration: 0.5,
  ease: "easeInOut",
};

/**
 * Simple toggle icon animation
 * Used for the simple theme toggle component
 */
export const toggleIconVariants: Variants = {
  light: { rotate: 0, scale: 1 },
  dark: { rotate: 180, scale: 1 },
};

export const toggleIconTransition: Transition = {
  duration: 0.3,
  ease: "easeInOut",
};

/**
 * Theme preview animation
 * Used for live preview in theme selector
 * Validates: Requirements 19.5
 */
export const themePreviewVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const themePreviewTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

/**
 * CSS transition configuration for DOM theme changes
 * Applied via the .theme-transitioning class
 */
export const cssThemeTransition = {
  properties: ["background-color", "border-color", "color"],
  duration: `${THEME_TRANSITION_DURATION}ms`,
  timing: "ease-in-out",
};

/**
 * Helper function to trigger theme transition animation
 * Adds the theme-transitioning class and removes it after animation completes
 */
export const triggerThemeTransition = (callback: () => void): void => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  root.classList.add("theme-transitioning");

  // Execute callback immediately (CSS transitions handle the smoothness)
  callback();

  // Remove transition class after animation completes
  setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, THEME_TRANSITION_DURATION);
};

/**
 * Helper function to check if user prefers reduced motion
 * Returns true if user has requested reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get adjusted transition duration based on user preferences
 * Returns 0 if user prefers reduced motion, otherwise returns the specified duration
 */
export const getTransitionDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0 : duration;
};
