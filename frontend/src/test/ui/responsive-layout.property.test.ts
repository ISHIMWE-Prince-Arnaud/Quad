import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getCurrentBreakpoint,
  isBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  getResponsiveValue,
  getResponsiveColumns,
  getResponsivePadding,
  getResponsiveTextSize,
  BREAKPOINTS,
  type Breakpoint,
} from "@/lib/responsiveUtils";

// Feature: quad-production-ready, Property 14: Responsive Layout Adaptation
// For any viewport width, the layout should adapt appropriately (mobile nav below 1024px, desktop sidebar above 1024px, right panel above 1280px).
// Validates: Requirements 4.5

describe("Responsive Layout Adaptation Property Tests", () => {
  // Helper to mock window.innerWidth
  const mockWindowWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it("Property 14.1: Breakpoint detection is consistent across all viewport widths", () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 2560 }), (width) => {
        mockWindowWidth(width);

        const breakpoint = getCurrentBreakpoint();

        // Property: Breakpoint should match expected value based on width
        if (width >= BREAKPOINTS["2xl"]) {
          expect(breakpoint).toBe("2xl");
        } else if (width >= BREAKPOINTS.xl) {
          expect(breakpoint).toBe("xl");
        } else if (width >= BREAKPOINTS.lg) {
          expect(breakpoint).toBe("lg");
        } else if (width >= BREAKPOINTS.md) {
          expect(breakpoint).toBe("md");
        } else if (width >= BREAKPOINTS.sm) {
          expect(breakpoint).toBe("sm");
        } else {
          expect(breakpoint).toBe("xs");
        }
      }),
      { numRuns: 100 }
    );
  });

  it("Property 14.2: Mobile detection is accurate for widths below lg breakpoint", () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 2560 }), (width) => {
        mockWindowWidth(width);

        const mobile = isMobile();
        const expectedMobile = width < BREAKPOINTS.lg;

        // Property: isMobile should return true for widths < 1024px
        expect(mobile).toBe(expectedMobile);
      }),
      { numRuns: 100 }
    );
  });

  it("Property 14.3: Tablet detection is accurate for widths between md and lg", () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 2560 }), (width) => {
        mockWindowWidth(width);

        const tablet = isTablet();
        const expectedTablet =
          width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;

        // Property: isTablet should return true for widths between 768px and 1024px
        expect(tablet).toBe(expectedTablet);
      }),
      { numRuns: 100 }
    );
  });

  it("Property 14.4: Desktop detection is accurate for widths at or above lg breakpoint", () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 2560 }), (width) => {
        mockWindowWidth(width);

        const desktop = isDesktop();
        const expectedDesktop = width >= BREAKPOINTS.lg;

        // Property: isDesktop should return true for widths >= 1024px
        expect(desktop).toBe(expectedDesktop);
      }),
      { numRuns: 100 }
    );
  });

  it("Property 14.5: Breakpoint checking is consistent with current breakpoint", () => {
    fc.assert(
      fc.property(fc.integer({ min: 320, max: 2560 }), (width) => {
        mockWindowWidth(width);

        const currentBp = getCurrentBreakpoint();

        // Property: isBreakpoint should return true for current and smaller breakpoints
        if (currentBp === "2xl") {
          expect(isBreakpoint("2xl")).toBe(true);
          expect(isBreakpoint("xl")).toBe(true);
          expect(isBreakpoint("lg")).toBe(true);
          expect(isBreakpoint("md")).toBe(true);
          expect(isBreakpoint("sm")).toBe(true);
        } else if (currentBp === "xl") {
          expect(isBreakpoint("2xl")).toBe(false);
          expect(isBreakpoint("xl")).toBe(true);
          expect(isBreakpoint("lg")).toBe(true);
          expect(isBreakpoint("md")).toBe(true);
          expect(isBreakpoint("sm")).toBe(true);
        } else if (currentBp === "lg") {
          expect(isBreakpoint("2xl")).toBe(false);
          expect(isBreakpoint("xl")).toBe(false);
          expect(isBreakpoint("lg")).toBe(true);
          expect(isBreakpoint("md")).toBe(true);
          expect(isBreakpoint("sm")).toBe(true);
        } else if (currentBp === "md") {
          expect(isBreakpoint("2xl")).toBe(false);
          expect(isBreakpoint("xl")).toBe(false);
          expect(isBreakpoint("lg")).toBe(false);
          expect(isBreakpoint("md")).toBe(true);
          expect(isBreakpoint("sm")).toBe(true);
        } else if (currentBp === "sm") {
          expect(isBreakpoint("2xl")).toBe(false);
          expect(isBreakpoint("xl")).toBe(false);
          expect(isBreakpoint("lg")).toBe(false);
          expect(isBreakpoint("md")).toBe(false);
          expect(isBreakpoint("sm")).toBe(true);
        } else {
          // xs
          expect(isBreakpoint("2xl")).toBe(false);
          expect(isBreakpoint("xl")).toBe(false);
          expect(isBreakpoint("lg")).toBe(false);
          expect(isBreakpoint("md")).toBe(false);
          expect(isBreakpoint("sm")).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("Property 14.6: Responsive values cascade correctly from larger to smaller breakpoints", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        fc.record({
          xs: fc.option(fc.integer()),
          sm: fc.option(fc.integer()),
          md: fc.option(fc.integer()),
          lg: fc.option(fc.integer()),
          xl: fc.option(fc.integer()),
          "2xl": fc.option(fc.integer()),
        }),
        (width, values) => {
          mockWindowWidth(width);

          const result = getResponsiveValue(values);
          const breakpoint = getCurrentBreakpoint();

          // Property: Should return the value for current breakpoint or fallback to smaller
          if (breakpoint === "2xl") {
            if (values["2xl"] !== null && values["2xl"] !== undefined) {
              expect(result).toBe(values["2xl"]);
            } else if (values.xl !== null && values.xl !== undefined) {
              expect(result).toBe(values.xl);
            } else if (values.lg !== null && values.lg !== undefined) {
              expect(result).toBe(values.lg);
            } else if (values.md !== null && values.md !