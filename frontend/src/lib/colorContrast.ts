/**
 * Color contrast utilities for WCAG 2.1 AA compliance
 * WCAG AA requires:
 * - 4.5:1 for normal text (< 18pt or < 14pt bold)
 * - 3:1 for large text (>= 18pt or >= 14pt bold)
 * - 3:1 for UI components and graphical objects
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error("Invalid color format. Use hex format (#RRGGBB)");
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAG_AA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAG_AAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 4.5 : 7;
  return ratio >= requiredRatio;
}

/**
 * Get contrast level description
 */
export function getContrastLevel(
  foreground: string,
  background: string
): {
  ratio: number;
  AA_normal: boolean;
  AA_large: boolean;
  AAA_normal: boolean;
  AAA_large: boolean;
} {
  const ratio = getContrastRatio(foreground, background);
  return {
    ratio,
    AA_normal: ratio >= 4.5,
    AA_large: ratio >= 3,
    AAA_normal: ratio >= 7,
    AAA_large: ratio >= 4.5,
  };
}

/**
 * Audit color combinations from CSS variables
 */
export function auditColorContrast(): {
  passed: Array<{ name: string; ratio: number; level: string }>;
  failed: Array<{ name: string; ratio: number; required: number }>;
} {
  const passed: Array<{ name: string; ratio: number; level: string }> = [];
  const failed: Array<{ name: string; ratio: number; required: number }> = [];

  // Common color combinations to check
  const combinations = [
    {
      name: "foreground on background",
      fg: "#09090b",
      bg: "#ffffff",
      required: 4.5,
    },
    {
      name: "primary-foreground on primary",
      fg: "#f0f9ff",
      bg: "#3b82f6",
      required: 4.5,
    },
    {
      name: "secondary-foreground on secondary",
      fg: "#09090b",
      bg: "#f0f9ff",
      required: 4.5,
    },
    {
      name: "muted-foreground on background",
      fg: "#71717a",
      bg: "#ffffff",
      required: 4.5,
    },
    {
      name: "destructive-foreground on destructive",
      fg: "#f0f9ff",
      bg: "#ef4444",
      required: 4.5,
    },
    {
      name: "accent-foreground on accent",
      fg: "#09090b",
      bg: "#f0f9ff",
      required: 4.5,
    },
  ];

  for (const combo of combinations) {
    try {
      const ratio = getContrastRatio(combo.fg, combo.bg);
      if (ratio >= combo.required) {
        let level = "AA";
        if (ratio >= 7) level = "AAA";
        passed.push({ name: combo.name, ratio, level });
      } else {
        failed.push({ name: combo.name, ratio, required: combo.required });
      }
    } catch (error) {
      console.error(`Error checking contrast for ${combo.name}:`, error);
    }
  }

  return { passed, failed };
}
