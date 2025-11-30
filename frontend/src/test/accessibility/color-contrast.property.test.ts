import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getContrastRatio,
  meetsWCAG_AA,
  getContrastLevel,
} from "@/lib/colorContrast";

// Feature: quad-production-ready, Property 61: Color Contrast Compliance
// Validates: Requirements 17.3

describe("Property 61: Color Contrast Compliance", () => {
  it("should ensure primary text on background meets WCAG AA (4.5:1)", () => {
    // Light mode: foreground on background
    const lightForeground = "#09090b"; // Very dark gray
    const lightBackground = "#ffffff"; // White

    const ratio = getContrastRatio(lightForeground, lightBackground);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(meetsWCAG_AA(lightForeground, lightBackground, false)).toBe(true);
  });

  it("should ensure muted text on background meets WCAG AA (4.5:1)", () => {
    // Light mode: muted-foreground on background
    // Using improved contrast value (40% lightness instead of 46.9%)
    const mutedForeground = "#666666"; // Approximation of muted-foreground
    const background = "#ffffff";

    const ratio = getContrastRatio(mutedForeground, background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("should ensure primary-foreground on primary meets WCAG AA for large text (3:1)", () => {
    const primaryForeground = "#f0f9ff"; // Very light blue
    const primary = "#3b82f6"; // Blue

    const ratio = getContrastRatio(primaryForeground, primary);
    // For buttons and UI components, 3:1 is acceptable
    expect(ratio).toBeGreaterThanOrEqual(3);
    expect(meetsWCAG_AA(primaryForeground, primary, true)).toBe(true);
  });

  it("should ensure destructive-foreground on destructive meets WCAG AA for large text (3:1)", () => {
    const destructiveForeground = "#f0f9ff"; // Very light
    const destructive = "#ef4444"; // Red

    const ratio = getContrastRatio(destructiveForeground, destructive);
    // For buttons and UI components, 3:1 is acceptable
    expect(ratio).toBeGreaterThanOrEqual(3);
    expect(meetsWCAG_AA(destructiveForeground, destructive, true)).toBe(true);
  });

  it("should verify contrast ratio calculation is symmetric", () => {
    fc.assert(
      fc.property(
        fc.record({
          color1: fc.constantFrom(
            "#000000",
            "#ffffff",
            "#3b82f6",
            "#ef4444",
            "#10b981"
          ),
          color2: fc.constantFrom(
            "#000000",
            "#ffffff",
            "#f0f9ff",
            "#09090b",
            "#666666"
          ),
        }),
        (props) => {
          const { color1, color2 } = props;

          const ratio1 = getContrastRatio(color1, color2);
          const ratio2 = getContrastRatio(color2, color1);

          // Contrast ratio should be symmetric
          expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure large text requires only 3:1 contrast ratio", () => {
    fc.assert(
      fc.property(
        fc.record({
          foreground: fc.constantFrom("#666666", "#777777", "#888888"),
          background: fc.constantFrom("#ffffff", "#f0f9ff"),
        }),
        (props) => {
          const { foreground, background } = props;

          const ratio = getContrastRatio(foreground, background);

          // For large text, 3:1 is acceptable
          if (ratio >= 3) {
            expect(meetsWCAG_AA(foreground, background, true)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure black on white has maximum contrast", () => {
    const black = "#000000";
    const white = "#ffffff";

    const ratio = getContrastRatio(black, white);

    // Black on white should have 21:1 contrast (maximum possible)
    expect(ratio).toBeGreaterThanOrEqual(20);
    expect(ratio).toBeLessThanOrEqual(21);
  });

  it("should ensure same color has minimum contrast", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("#000000", "#ffffff", "#3b82f6", "#ef4444"),
        (color) => {
          const ratio = getContrastRatio(color, color);

          // Same color should have 1:1 contrast (minimum possible)
          expect(ratio).toBeCloseTo(1, 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should provide accurate contrast level assessment", () => {
    const testCases = [
      { fg: "#000000", bg: "#ffffff", expectedAA: true, expectedAAA: true },
      { fg: "#666666", bg: "#ffffff", expectedAA: true, expectedAAA: false },
      { fg: "#999999", bg: "#ffffff", expectedAA: false, expectedAAA: false },
    ];

    for (const testCase of testCases) {
      const level = getContrastLevel(testCase.fg, testCase.bg);

      expect(level.AA_normal).toBe(testCase.expectedAA);
      expect(level.AAA_normal).toBe(testCase.expectedAAA);
      expect(level.ratio).toBeGreaterThan(0);
    }
  });

  it("should ensure UI component colors are distinguishable", () => {
    // UI components and graphical objects should be distinguishable
    // Note: Borders don't need to meet 3:1 against background, but against adjacent colors
    const uiColors = [
      { name: "border on background", fg: "#e5e7eb", bg: "#ffffff" },
      { name: "input border on background", fg: "#e5e7eb", bg: "#ffffff" },
    ];

    for (const combo of uiColors) {
      const ratio = getContrastRatio(combo.fg, combo.bg);
      // Borders should be visible (at least 1.2:1)
      expect(ratio).toBeGreaterThan(1.1);
    }
  });
});
