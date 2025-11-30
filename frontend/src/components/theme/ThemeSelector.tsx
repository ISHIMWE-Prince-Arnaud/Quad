import { Moon, Sun, Monitor } from "lucide-react";
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
    <div
      className="flex items-center gap-1 p-1 bg-accent rounded-lg transition-all duration-300"
      role="group"
      aria-label="Theme selector">
      {themes.map(({ name, icon: Icon, value }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center justify-center p-2 rounded-md text-xs font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            theme === value
              ? "bg-background text-foreground shadow-sm scale-105"
              : "text-muted-foreground hover:text-foreground hover:scale-105"
          )}
          title={`Switch to ${name.toLowerCase()} theme`}
          aria-label={`Switch to ${name.toLowerCase()} theme`}
          aria-pressed={theme === value}
          aria-current={theme === value ? "true" : undefined}>
          <Icon
            className="h-4 w-4 transition-transform duration-300"
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

// Legacy simple theme toggle - kept for backward compatibility
export function SimpleThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-accent transition-all duration-300"
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
      {isDarkMode ? (
        <Sun className="h-5 w-5 transition-transform duration-300 rotate-0 hover:rotate-180" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
