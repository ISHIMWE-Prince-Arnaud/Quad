/**
 * Responsive utility functions for the Quad platform
 * Provides helpers for responsive behavior and breakpoint detection
 */

/**
 * Tailwind breakpoints (in pixels)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Check if current viewport matches a breakpoint
 */
export function isBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint | "xs" {
  if (typeof window === "undefined") return "xs";

  const width = window.innerWidth;

  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

/**
 * Check if device is mobile (< lg breakpoint)
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if device is tablet (md to lg)
 */
export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth;
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * Check if device is desktop (>= lg)
 */
export function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Get responsive value based on current breakpoint
 */
export function getResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
}): T | undefined {
  const breakpoint = getCurrentBreakpoint();

  // Return the value for current breakpoint or fallback to smaller breakpoints
  // Use !== undefined && !== null to handle falsy values like 0, false, ""
  if (
    breakpoint === "2xl" &&
    values["2xl"] !== undefined &&
    values["2xl"] !== null
  )
    return values["2xl"];
  if (
    (breakpoint === "2xl" || breakpoint === "xl") &&
    values.xl !== undefined &&
    values.xl !== null
  )
    return values.xl;
  if (
    (breakpoint === "2xl" || breakpoint === "xl" || breakpoint === "lg") &&
    values.lg !== undefined &&
    values.lg !== null
  )
    return values.lg;
  if (
    breakpoint !== "xs" &&
    breakpoint !== "sm" &&
    values.md !== undefined &&
    values.md !== null
  )
    return values.md;
  if (breakpoint !== "xs" && values.sm !== undefined && values.sm !== null)
    return values.sm;
  return values.xs;
}

/**
 * Debounce function for resize handlers
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Hook-like function to listen for breakpoint changes
 * Returns a cleanup function
 */
export function onBreakpointChange(
  callback: (breakpoint: Breakpoint | "xs") => void
): () => void {
  if (typeof window === "undefined") return () => {};

  let currentBreakpoint = getCurrentBreakpoint();

  const handleResize = debounce(() => {
    const newBreakpoint = getCurrentBreakpoint();
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint;
      callback(newBreakpoint);
    }
  }, 150);

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}

/**
 * Get responsive grid columns based on items count
 */
export function getResponsiveColumns(itemCount: number): string {
  if (itemCount === 1) return "grid-cols-1";
  if (itemCount === 2) return "grid-cols-1 sm:grid-cols-2";
  if (itemCount === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  if (itemCount === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
}

/**
 * Get responsive padding classes
 */
export function getResponsivePadding(size: "sm" | "md" | "lg" = "md"): string {
  const paddingMap = {
    sm: "px-3 py-2 sm:px-4 sm:py-3",
    md: "px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8",
    lg: "px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-12",
  };

  return paddingMap[size];
}

/**
 * Get responsive text size classes
 */
export function getResponsiveTextSize(
  size: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" = "base"
): string {
  const textSizeMap = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl md:text-2xl",
    xl: "text-xl sm:text-2xl md:text-3xl",
    "2xl": "text-2xl sm:text-3xl md:text-4xl",
  };

  return textSizeMap[size];
}

/**
 * Check if touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (
    typeof window === "undefined" ||
    typeof getComputedStyle === "undefined"
  ) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue("env(safe-area-inset-top)") || "0"),
    right: parseInt(
      style.getPropertyValue("env(safe-area-inset-right)") || "0"
    ),
    bottom: parseInt(
      style.getPropertyValue("env(safe-area-inset-bottom)") || "0"
    ),
    left: parseInt(style.getPropertyValue("env(safe-area-inset-left)") || "0"),
  };
}

/**
 * Responsive container max-width helper
 */
export function getContainerMaxWidth(breakpoint?: Breakpoint | "xs"): string {
  const bp = breakpoint || getCurrentBreakpoint();

  const maxWidthMap = {
    xs: "max-w-full",
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
  };

  return maxWidthMap[bp];
}
