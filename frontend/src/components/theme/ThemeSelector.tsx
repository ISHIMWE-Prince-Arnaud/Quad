import { Moon, Sun, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";
import {
  themeSelectorVariants,
  themeSelectorTransition,
  themeIndicatorTransition,
  themeIconRotationTransition,
  toggleIconTransition,
} from "@/lib/theme-animations";

/**
 * ThemeSelector Component
 *
 * Provides a three-option theme selector with smooth animations.
 * Features:
 * - Animated background indicator that slides between options
 * - Icon rotation animation on selection
 * - Hover and tap feedback
 * - Full keyboard accessibility
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 19.5
 */
export function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { name: "Light", icon: Sun, value: "light" as const },
    { name: "Dark", icon: Moon, value: "dark" as const },
    { name: "System", icon: Monitor, value: "system" as const },
  ];

  return (
    <motion.div
      className="flex items-center gap-1 p-1 bg-accent rounded-lg"
      role="group"
      aria-label="Theme selector"
      variants={themeSelectorVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={themeSelectorTransition}>
      {themes.map(({ name, icon: Icon, value }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "relative flex items-center justify-center p-2 rounded-md text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            theme === value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={`Switch to ${name.toLowerCase()} theme`}
          aria-label={`Switch to ${name.toLowerCase()} theme`}
          aria-pressed={theme === value}
          aria-current={theme === value ? "true" : undefined}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}>
          {/* Animated background indicator with layout animation */}
          {theme === value && (
            <motion.div
              className="absolute inset-0 bg-background rounded-md shadow-sm"
              layoutId="theme-indicator"
              transition={themeIndicatorTransition}
            />
          )}

          {/* Icon with rotation animation on selection */}
          <motion.div
            className="relative z-10"
            animate={{
              rotate: theme === value ? [0, 360] : 0,
            }}
            transition={themeIconRotationTransition}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </motion.div>
        </motion.button>
      ))}
    </motion.div>
  );
}

/**
 * SimpleThemeToggle Component
 *
 * A simple two-state theme toggle with smooth animations.
 * Kept for backward compatibility and simpler use cases.
 * Features:
 * - Smooth rotation animation between sun and moon icons
 * - Scale animation on theme change
 * - Hover and tap feedback
 *
 * Validates: Requirements 1.1, 1.2, 1.3
 */
export function SimpleThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-accent"
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}>
      <motion.div
        initial={false}
        animate={{
          rotate: isDarkMode ? 180 : 0,
          scale: [1, 1.2, 1],
        }}
        transition={toggleIconTransition}>
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </motion.div>
    </motion.button>
  );
}
