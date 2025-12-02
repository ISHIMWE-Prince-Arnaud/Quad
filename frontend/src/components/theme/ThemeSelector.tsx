import { Moon, Sun, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { name: "Light", icon: Sun, value: "light" as const },
    { name: "Dark", icon: Moon, value: "dark" as const },
    { name: "System", icon: Monitor, value: "system" as const },
  ];

  return (
    <motion.div
      role="group"
      aria-label="Theme selector"
      className="flex items-center gap-1 p-1 rounded-xl bg-accent/70 backdrop-blur-sm border border-border/40 shadow-sm"
      initial={false}
      animate={{ opacity: 1 }}
    >
      {themes.map(({ name, icon: Icon, value }) => {
        const isActive = theme === value;

        return (
          <motion.button
            key={value}
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            aria-label={`Switch to ${name.toLowerCase()} theme`}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors text-xs font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            {/* Improved selection indicator */}
            {isActive && (
              <motion.div
                layoutId="theme-selector-indicator"
                className="absolute inset-0 rounded-md bg-background/90 shadow-md border border-border/40"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                }}
              />
            )}

            {/* Icon animation */}
            <motion.div
              className="relative z-10"
              animate={{
                rotate: isActive ? [0, 360] : 0,
                scale: isActive ? [1, 1.15, 1] : 1,
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </motion.div>

            {/* Optional icon label */}
            <span className="relative z-10">{name}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
