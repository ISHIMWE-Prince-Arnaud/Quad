/**
 * Unit tests for design system tokens and utilities
 * Validates: Requirements 1.4, 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { describe, it, expect } from "vitest";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  zIndex,
  breakpoints,
  touchTarget,
  transitionDuration,
} from "@/lib/design-tokens";
import {
  pageTransition,
  cardHover,
  modalOpen,
  reactionPop,
  feedItemMount,
  MICROINTERACTION_MAX_DURATION,
  LOADING_SPINNER_DELAY,
  INTERACTION_FEEDBACK_MAX_DELAY,
} from "@/lib/animations";

describe("Design Tokens", () => {
  describe("Color Tokens", () => {
    it("should have all required color tokens", () => {
      expect(colors.background).toBeDefined();
      expect(colors.foreground).toBeDefined();
      expect(colors.primary).toBeDefined();
      expect(colors.primaryForeground).toBeDefined();
      expect(colors.secondary).toBeDefined();
      expect(colors.muted).toBeDefined();
      expect(colors.accent).toBeDefined();
      expect(colors.destructive).toBeDefined();
      expect(colors.border).toBeDefined();
      expect(colors.success).toBeDefined();
      expect(colors.warning).toBeDefined();
    });

    it("should format colors as HSL CSS variables", () => {
      expect(colors.primary).toMatch(/^hsl\(var\(--[a-z-]+\)\)$/);
      expect(colors.background).toMatch(/^hsl\(var\(--[a-z-]+\)\)$/);
    });
  });

  describe("Spacing Tokens", () => {
    it("should have consistent spacing scale", () => {
      expect(spacing[1]).toBe("0.25rem");
      expect(spacing[2]).toBe("0.5rem");
      expect(spacing[4]).toBe("1rem");
      expect(spacing[6]).toBe("1.5rem");
      expect(spacing[8]).toBe("2rem");
      expect(spacing[12]).toBe("3rem");
      expect(spacing[16]).toBe("4rem");
    });

    it("should have all required spacing values", () => {
      const requiredSpacing = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
      requiredSpacing.forEach((size) => {
        expect(spacing[size as keyof typeof spacing]).toBeDefined();
      });
    });
  });

  describe("Border Radius Tokens", () => {
    it("should have all radius sizes", () => {
      expect(borderRadius.sm).toBe("0.375rem");
      expect(borderRadius.md).toBe("0.5rem");
      expect(borderRadius.lg).toBe("0.75rem");
      expect(borderRadius.xl).toBe("1rem");
      expect(borderRadius["2xl"]).toBe("1.5rem");
      expect(borderRadius.full).toBe("9999px");
    });
  });

  describe("Shadow Tokens", () => {
    it("should have all shadow elevations", () => {
      expect(shadows.sm).toBeDefined();
      expect(shadows.md).toBeDefined();
      expect(shadows.lg).toBeDefined();
      expect(shadows.xl).toBeDefined();
      expect(shadows["2xl"]).toBeDefined();
      expect(shadows.inner).toBeDefined();
      expect(shadows.none).toBe("none");
    });

    it("should format shadows correctly", () => {
      expect(shadows.sm).toContain("rgb");
      expect(shadows.md).toContain("rgb");
    });
  });

  describe("Typography Tokens", () => {
    it("should have font family definitions", () => {
      expect(typography.fontFamily.sans).toContain("Inter");
      expect(typography.fontFamily.mono).toBeDefined();
    });

    it("should have font size scale", () => {
      expect(typography.fontSize.xs).toBe("0.75rem");
      expect(typography.fontSize.sm).toBe("0.875rem");
      expect(typography.fontSize.base).toBe("1rem");
      expect(typography.fontSize.lg).toBe("1.125rem");
      expect(typography.fontSize.xl).toBe("1.25rem");
    });

    it("should have font weights", () => {
      expect(typography.fontWeight.normal).toBe("400");
      expect(typography.fontWeight.medium).toBe("500");
      expect(typography.fontWeight.semibold).toBe("600");
      expect(typography.fontWeight.bold).toBe("700");
    });

    it("should have line heights", () => {
      expect(typography.lineHeight.tight).toBe("1.25");
      expect(typography.lineHeight.normal).toBe("1.5");
      expect(typography.lineHeight.relaxed).toBe("1.75");
    });
  });

  describe("Z-Index Tokens", () => {
    it("should have proper layering hierarchy", () => {
      expect(zIndex.base).toBe(0);
      expect(zIndex.dropdown).toBe(1000);
      expect(zIndex.sticky).toBe(1020);
      expect(zIndex.fixed).toBe(1030);
      expect(zIndex.modalBackdrop).toBe(1040);
      expect(zIndex.modal).toBe(1050);
      expect(zIndex.popover).toBe(1060);
      expect(zIndex.toast).toBe(1070);
      expect(zIndex.tooltip).toBe(1080);
    });

    it("should maintain proper stacking order", () => {
      expect(zIndex.modal).toBeGreaterThan(zIndex.modalBackdrop);
      expect(zIndex.popover).toBeGreaterThan(zIndex.modal);
      expect(zIndex.toast).toBeGreaterThan(zIndex.popover);
      expect(zIndex.tooltip).toBeGreaterThan(zIndex.toast);
    });
  });

  describe("Breakpoints", () => {
    it("should have all responsive breakpoints", () => {
      expect(breakpoints.sm).toBe("640px");
      expect(breakpoints.md).toBe("768px");
      expect(breakpoints.lg).toBe("1024px");
      expect(breakpoints.xl).toBe("1280px");
      expect(breakpoints["2xl"]).toBe("1536px");
    });
  });

  describe("Touch Target", () => {
    it("should meet minimum touch target size", () => {
      expect(touchTarget.minSize).toBe("44px");
      expect(touchTarget.minSizePx).toBe(44);
    });
  });

  describe("Transition Duration", () => {
    it("should have timing values", () => {
      expect(transitionDuration.fast).toBe(150);
      expect(transitionDuration.normal).toBe(200);
      expect(transitionDuration.slow).toBe(300);
      expect(transitionDuration.slower).toBe(500);
    });
  });
});

describe("Animation Variants", () => {
  describe("Page Transition", () => {
    it("should have initial, animate, and exit states", () => {
      expect(pageTransition.initial).toBeDefined();
      expect(pageTransition.animate).toBeDefined();
      expect(pageTransition.exit).toBeDefined();
    });

    it("should animate from below", () => {
      expect(pageTransition.initial).toHaveProperty("y", 20);
      expect(pageTransition.animate).toHaveProperty("y", 0);
    });
  });

  describe("Card Hover", () => {
    it("should have rest and hover states", () => {
      expect(cardHover.rest).toBeDefined();
      expect(cardHover.hover).toBeDefined();
    });

    it("should lift card on hover", () => {
      expect(cardHover.hover).toHaveProperty("y", -4);
      expect(cardHover.hover).toHaveProperty("scale", 1.02);
    });
  });

  describe("Modal Open", () => {
    it("should scale and fade in", () => {
      expect(modalOpen.initial).toEqual({ scale: 0.95, opacity: 0 });
      expect(modalOpen.animate).toEqual({ scale: 1, opacity: 1 });
      expect(modalOpen.exit).toEqual({ scale: 0.95, opacity: 0 });
    });
  });

  describe("Reaction Pop", () => {
    it("should have bounce animation", () => {
      expect(reactionPop.initial).toEqual({ scale: 0 });
      expect(reactionPop.animate).toHaveProperty("scale");
      expect(reactionPop.animate.scale).toEqual([0, 1.2, 1]);
    });
  });

  describe("Feed Item Mount", () => {
    it("should slide in from left", () => {
      expect(feedItemMount.initial).toEqual({ opacity: 0, x: -20 });
      expect(feedItemMount.animate).toEqual({ opacity: 1, x: 0 });
    });
  });
});

describe("Animation Timing Constants", () => {
  it("should enforce microinteraction duration limit", () => {
    expect(MICROINTERACTION_MAX_DURATION).toBe(300);
  });

  it("should define loading spinner delay", () => {
    expect(LOADING_SPINNER_DELAY).toBe(500);
  });

  it("should define interaction feedback max delay", () => {
    expect(INTERACTION_FEEDBACK_MAX_DELAY).toBe(100);
  });
});
