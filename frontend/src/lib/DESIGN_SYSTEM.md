# Quad Design System

This document provides an overview of the Quad design system implementation, including design tokens, animations, and usage guidelines.

## Overview

The Quad design system is built on:

- **shadcn/ui** component library
- **TailwindCSS** for utility-first styling
- **Framer Motion** for animations
- **CSS Custom Properties** for design tokens

## Design Tokens

All design tokens are defined as CSS variables in `src/index.css` and can be accessed type-safely through `src/lib/design-tokens.ts`.

### Colors

Colors follow the shadcn/ui convention and are defined in HSL format:

```typescript
import { colors } from "@/lib/design-tokens";

// Usage in TypeScript
const primaryColor = colors.primary; // "hsl(var(--primary))"

// Usage in CSS/Tailwind
className = "bg-primary text-primary-foreground";
```

Available color tokens:

- `background`, `foreground`
- `card`, `card-foreground`
- `primary`, `primary-foreground`
- `secondary`, `secondary-foreground`
- `muted`, `muted-foreground`
- `accent`, `accent-foreground`
- `destructive`, `destructive-foreground`
- `border`, `input`, `ring`
- `success`, `success-foreground`
- `warning`, `warning-foreground`

### Spacing

Spacing follows a consistent scale from 0.25rem to 6rem:

```typescript
import { spacing } from "@/lib/design-tokens";

// Usage in TypeScript
const padding = spacing[4]; // "1rem" (16px)

// Usage in Tailwind
className = "p-4 gap-6 space-y-8";
```

Scale: `1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`

### Border Radius

```typescript
import { borderRadius } from "@/lib/design-tokens";

// Usage
const radius = borderRadius.lg; // "0.75rem"

// Tailwind
className = "rounded-lg"; // or rounded-sm, rounded-md, rounded-xl, rounded-2xl, rounded-full
```

### Shadows

```typescript
import { shadows } from "@/lib/design-tokens";

// Usage
const shadow = shadows.md;

// Tailwind
className = "shadow-md hover:shadow-lg";
```

### Typography

```typescript
import { typography } from "@/lib/design-tokens";

// Font sizes
const size = typography.fontSize.lg; // "1.125rem"

// Tailwind
className = "text-lg font-semibold leading-relaxed";
```

## Animations

All animations are defined in `src/lib/animations.ts` using Framer Motion variants.

### Page Transitions

```tsx
import { motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/lib/animations";

<motion.div
  variants={pageTransition}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={pageTransitionConfig}>
  {/* Page content */}
</motion.div>;
```

### Card Hover Effects

```tsx
import { motion } from "framer-motion";
import { cardHover } from "@/lib/animations";

<motion.div
  variants={cardHover}
  initial="rest"
  whileHover="hover"
  className="card">
  {/* Card content */}
</motion.div>;
```

### Modal Animations

```tsx
import { motion } from "framer-motion";
import { modalOpen, modalTransitionConfig } from "@/lib/animations";

<motion.div
  variants={modalOpen}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={modalTransitionConfig}>
  {/* Modal content */}
</motion.div>;
```

### Available Animation Variants

- `pageTransition` - Page load/navigation animations
- `cardHover` - Card lift and shadow effects
- `modalOpen` - Modal/dialog open animations
- `reactionPop` - Reaction button animations
- `feedItemMount` - Feed item entrance animations
- `messageSlideIn` - Chat message animations
- `typingIndicator` - Typing indicator pulse
- `badgePulse` - Notification badge pulse
- `fadeIn` - Generic fade in/out
- `scaleIn` - Scale and fade for popovers
- `slideInFromLeft/Right/Top/Bottom` - Directional slides
- `pollBarGrow` - Poll percentage bar animations

### Animation Timing Constants

```typescript
import {
  MICROINTERACTION_MAX_DURATION,
  LOADING_SPINNER_DELAY,
  INTERACTION_FEEDBACK_MAX_DELAY,
} from "@/lib/animations";

// All microinteractions complete within 300ms
// Loading spinners appear after 500ms
// Interaction feedback within 100ms
```

## Theme System

The theme system supports light, dark, and system preference modes.

### Using the Theme Store

```tsx
import { useThemeStore } from "@/stores/themeStore";

function ThemeToggle() {
  const { theme, setTheme, toggleDarkMode } = useThemeStore();

  return <button onClick={toggleDarkMode}>Toggle Theme</button>;
}
```

### Theme Initialization

The theme is automatically initialized on app load and persists to localStorage. It also:

- Listens for system theme changes
- Syncs across browser tabs
- Animates transitions smoothly (300ms)

## Responsive Design

### Breakpoints

```typescript
import { breakpoints } from "@/lib/design-tokens";

// Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
```

### Tailwind Responsive Classes

```tsx
<div
  className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: half width
  lg:w-1/3         // Desktop: third width
">
  Content
</div>
```

### Touch Targets

All interactive elements on mobile must meet the minimum touch target size:

```typescript
import { touchTarget } from "@/lib/design-tokens";

// Minimum: 44x44 pixels
className = "min-h-[44px] min-w-[44px]";
```

## Accessibility

### Focus States

All interactive elements have visible focus indicators:

```css
*:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
}
```

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:

- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio

### Reduced Motion

The design system respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations reduced to near-instant */
}
```

## Best Practices

### Component Styling

1. Use Tailwind utility classes for styling
2. Use design tokens for custom values
3. Apply animations with Framer Motion variants
4. Ensure responsive behavior at all breakpoints
5. Test with keyboard navigation
6. Verify color contrast ratios

### Animation Guidelines

1. Keep animations under 300ms for microinteractions
2. Use appropriate easing functions (easeOut for entrances, easeIn for exits)
3. Provide loading feedback within 100ms
4. Show loading spinners after 500ms delay
5. Respect reduced motion preferences

### Theme Considerations

1. Test components in both light and dark modes
2. Use semantic color tokens (not hardcoded colors)
3. Ensure sufficient contrast in both themes
4. Test theme transitions for smoothness

## Examples

### Creating a New Component

```tsx
import { motion } from "framer-motion";
import { fadeIn, fadeInConfig } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function MyComponent({ title, children, className }: MyComponentProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={fadeInConfig}
      className={cn(
        "bg-card text-card-foreground",
        "rounded-lg shadow-md",
        "p-6 space-y-4",
        "hover:shadow-lg transition-shadow duration-200",
        className
      )}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground">{children}</div>
    </motion.div>
  );
}
```

### Using Custom Animations

```tsx
import { motion } from "framer-motion";

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
  className="btn-primary">
  Click me
</motion.button>;
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
